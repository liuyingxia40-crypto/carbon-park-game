import Phaser from 'phaser';
import { ISO_GRASS_TEST_ONLY } from '../constants';
import { registerMinimalGameTextures } from '../textures/industrialTextures';
import { registerProceduralTileTextures } from '../textures/tileProceduralTextures';
import { TILES_ATLAS_KEY } from './assetIds';
import { TILE_FRAMES } from './assetIds';
import { BUILDING_TEXTURE_MAP, SHEET_MANIFESTS } from './sheetManifests';
import { queueTilesAtlas, tilesAtlasReady } from './tileAtlasSource';
import {
  applyTileFallbacks,
  REQUIRED_TILE_TEXTURES,
  TILE_IMAGE_URLS,
} from './tileSources';

export type AssetLoadState = 'idle' | 'loading' | 'ready' | 'fallback';

export class AssetManager {
  private static state: AssetLoadState = 'idle';
  private static loadedAtlases = new Set<string>();
  private static tilesReady = false;
  private static usesTilesAtlasFrames = false;
  private static loadError = '';

  static getStatus(): AssetLoadState {
    return this.state;
  }

  static getLoadError(): string {
    return this.loadError;
  }

  static usesSpriteSheets(): boolean {
    return this.state === 'ready';
  }

  static usesMapTileSprites(): boolean {
    return this.tilesReady;
  }

  static hasTilesAtlas(): boolean {
    return this.tilesReady;
  }

  static usesTileAtlasFrames(): boolean {
    return this.usesTilesAtlasFrames;
  }

  static getTilesAtlasKey(): string {
    return TILES_ATLAS_KEY;
  }

  static usesBuildingSprites(): boolean {
    return this.loadedAtlases.has('buildings');
  }

  static queuePreload(scene: Phaser.Scene): void {
    this.state = 'loading';
    this.tilesReady = false;
    this.usesTilesAtlasFrames = false;
    this.loadedAtlases.clear();
    this.loadError = '';

    applyTileFallbacks();

    scene.load.on('loaderror', (file: { key?: string; src?: string }) => {
      console.warn('[AssetManager] 加载失败:', file?.key, file?.src ?? '');
    });

    if (ISO_GRASS_TEST_ONLY) {
      const grassUrl = TILE_IMAGE_URLS[TILE_FRAMES.grass];
      if (grassUrl) scene.load.image(TILE_FRAMES.grass, grassUrl);
    } else {
      const atlasQueued = queueTilesAtlas(scene);
      if (!atlasQueued) {
        for (const [frameId, url] of Object.entries(TILE_IMAGE_URLS)) {
          if (!scene.textures.exists(frameId)) {
            scene.load.image(frameId, url);
          }
        }
      }
      for (const manifest of SHEET_MANIFESTS) {
        if (manifest.atlasKey === 'tiles') continue;
        scene.load.atlas(manifest.atlasKey, manifest.imageUrl, manifest.atlasJsonUrl);
      }
    }

    scene.load.once('complete', () => {
      this.applyLoadResult(scene);
    });
  }

  static finalizeLoad(scene: Phaser.Scene): void {
    if (this.state === 'ready' && this.tilesReady) return;
    this.applyLoadResult(scene);
  }

  private static applyLoadResult(scene: Phaser.Scene) {
    this.loadedAtlases.clear();
    this.tilesReady = false;
    this.usesTilesAtlasFrames = false;

    for (const manifest of SHEET_MANIFESTS) {
      if (manifest.atlasKey === 'tiles') continue;
      if (this.atlasIsValid(scene, manifest.atlasKey)) {
        this.loadedAtlases.add(manifest.atlasKey);
      }
    }

    if (ISO_GRASS_TEST_ONLY) {
      if (scene.textures.exists(TILE_FRAMES.grass)) {
        this.tilesReady = true;
        this.state = 'ready';
      } else {
        registerProceduralTileTextures(scene);
        if (scene.textures.exists(TILE_FRAMES.grass)) {
          this.tilesReady = true;
          this.state = 'ready';
        } else {
          this.state = 'fallback';
          this.loadError = '缺少草地纹理';
        }
      }
      return;
    }

    if (tilesAtlasReady(scene)) {
      this.tilesReady = true;
      this.usesTilesAtlasFrames = true;
      this.loadedAtlases.add('tiles');
      this.state = 'ready';
      registerMinimalGameTextures(scene);
      console.info('[AssetManager] 地块图集已就绪 (7×6 atlas)');
      return;
    }

    registerProceduralTileTextures(scene);

    if (this.validateTileTextures(scene)) {
      this.tilesReady = true;
      this.state = 'ready';
      registerMinimalGameTextures(scene);
      console.info('[AssetManager] 地块纹理已就绪');
    } else {
      this.state = 'fallback';
      console.error(`[AssetManager] ${this.loadError}`);
    }
  }

  private static validateTileTextures(scene: Phaser.Scene): boolean {
    for (const id of REQUIRED_TILE_TEXTURES) {
      if (!scene.textures.exists(id)) {
        this.loadError = `纹理未就绪: ${id}`;
        return false;
      }
    }
    return true;
  }

  static getParticleTexture(smoke = true): { key: string; frame?: string } {
    if (this.loadedAtlases.has('effects')) {
      return { key: 'effects', frame: smoke ? 'fx_smoke' : 'fx_power' };
    }
    return { key: smoke ? 'particle_smoke' : 'particle_spark' };
  }

  static getBuildingTexture(buildingKey: string): { key: string; frame?: string } | null {
    const ref = BUILDING_TEXTURE_MAP[buildingKey];
    if (!ref) return null;
    if (this.loadedAtlases.has(ref.atlasKey)) {
      return { key: ref.atlasKey, frame: ref.frameId };
    }
    return null;
  }

  static hasAtlas(key: string): boolean {
    return this.loadedAtlases.has(key);
  }

  static ensureMinimalTextures(scene: Phaser.Scene) {
    registerMinimalGameTextures(scene);
  }

  private static atlasIsValid(scene: Phaser.Scene, atlasKey: string): boolean {
    if (!scene.textures.exists(atlasKey)) return false;
    const tex = scene.textures.get(atlasKey);
    const src = tex.source[0];
    if (!src || src.width < 16 || src.height < 16) return false;
    return tex.getFrameNames().filter((n) => n !== '__BASE').length > 0;
  }
}
