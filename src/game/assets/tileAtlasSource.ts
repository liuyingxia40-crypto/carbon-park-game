import Phaser from 'phaser';
import { TILES_ATLAS_KEY } from './assetIds';

const ATLAS_JSON_URL = '/assets/atlases/tiles_atlas.json';

const sheetModules = import.meta.glob<string>('../../assets/tiles/*.{jpg,JPG,jpeg,JPEG}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** 优先用 7×6 参考图集（735×1273 等），避免误用单张 grass.jpg */
export function resolveTilesSheetImageUrl(): string | undefined {
  const entries = Object.entries(sheetModules) as [string, string][];
  if (entries.length === 0) return undefined;

  const prefer = entries.find(([p]) => /34dc7052|tiles_sheet/i.test(p));
  if (prefer) return prefer[1];

  entries.sort((a, b) => b[1].length - a[1].length);
  return entries[0][1];
}

export const TILES_SHEET_IMAGE_URL = resolveTilesSheetImageUrl();

export function queueTilesAtlas(scene: Phaser.Scene): boolean {
  if (!TILES_SHEET_IMAGE_URL) return false;
  if (scene.textures.exists(TILES_ATLAS_KEY)) return true;
  scene.load.atlas(TILES_ATLAS_KEY, TILES_SHEET_IMAGE_URL, ATLAS_JSON_URL);
  return true;
}

export function tilesAtlasReady(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(TILES_ATLAS_KEY)) return false;
  const tex = scene.textures.get(TILES_ATLAS_KEY);
  return tex.getFrameNames().filter((n) => n !== '__BASE').includes('tile_grass');
}
