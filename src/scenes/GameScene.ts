import Phaser from 'phaser';
import { BuildableManager, type PlacementResult } from '../game/city/BuildableManager';
import { cityBridge } from '../game/cityBridge';
import {
  CITY_BACKGROUND_KEY,
  CITY_BACKGROUND_URL,
  CITY_BUILDABLE_LAYER_NAME,
  CITY_IMAGE_LAYER_NAME,
  CITY_MAP_JSON_URL,
  CITY_MAP_KEY,
  preloadBuildingSprites,
} from '../game/paths';

type ImageLayerData = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export class GameScene extends Phaser.Scene {
  private buildableManager!: BuildableManager;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.tilemapTiledJSON(CITY_MAP_KEY, CITY_MAP_JSON_URL);
    this.load.image(CITY_BACKGROUND_KEY, CITY_BACKGROUND_URL);
    preloadBuildingSprites(this);
  }

  create() {
    const map = this.make.tilemap({ key: CITY_MAP_KEY });
    const imageLayer = this.readImageLayer(map, CITY_IMAGE_LAYER_NAME);

    if (!this.textures.exists(CITY_BACKGROUND_KEY)) {
      this.showError(`缺少背景图 ${CITY_BACKGROUND_URL}`);
      return;
    }

    const bg = this.add.image(0, 0, CITY_BACKGROUND_KEY).setOrigin(0, 0).setDepth(0);

    if (imageLayer) {
      bg.setPosition(imageLayer.x + imageLayer.offsetX, imageLayer.y + imageLayer.offsetY);
      this.mapWidth = imageLayer.width;
      this.mapHeight = imageLayer.height;
    } else {
      this.mapWidth = bg.width;
      this.mapHeight = bg.height;
    }

    const buildableLayer = map.getObjectLayer(CITY_BUILDABLE_LAYER_NAME);
    if (!buildableLayer) {
      this.showError(`找不到对象层「${CITY_BUILDABLE_LAYER_NAME}」`);
      return;
    }

    this.buildableManager = new BuildableManager(this, buildableLayer);
    if (this.buildableManager.getPlotCount() === 0) {
      this.showError('Buildable 层中没有可放置地块');
      return;
    }

    this.setupCamera();
    this.setupInput();

    cityBridge.attachScene({
      setPlaceMode: (mode) => this.buildableManager.setPlaceMode(mode),
    });

    console.info(`[GameScene] Buildable=${this.buildableManager.getPlotCount()}`);
  }

  shutdown() {
    cityBridge.detachScene();
  }

  private readImageLayer(_map: Phaser.Tilemaps.Tilemap, layerName: string): ImageLayerData | null {
    const mapData = this.cache.tilemap.get(CITY_MAP_KEY).data;
    const raw = mapData.layers.find(
      (layer: { type?: string; name?: string }) =>
        layer.type === 'imagelayer' && layer.name === layerName,
    ) as
      | {
          x?: number;
          y?: number;
          offsetx?: number;
          offsety?: number;
          imagewidth?: number;
          imageheight?: number;
        }
      | undefined;

    if (!raw) return null;

    return {
      x: raw.x ?? 0,
      y: raw.y ?? 0,
      offsetX: raw.offsetx ?? 0,
      offsetY: raw.offsety ?? 0,
      width: raw.imagewidth ?? this.textures.get(CITY_BACKGROUND_KEY).getSourceImage().width,
      height: raw.imageheight ?? this.textures.get(CITY_BACKGROUND_KEY).getSourceImage().height,
    };
  }

  private setupCamera() {
    const cam = this.cameras.main;
    cam.setBackgroundColor('rgba(0,0,0,0)');
    cam.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.fitCameraToViewport();
    this.scale.on('resize', () => this.fitCameraToViewport());

    this.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _objects: Phaser.GameObjects.GameObject[],
        _dx: number,
        dy: number,
      ) => {
        cam.setZoom(Phaser.Math.Clamp(cam.zoom - dy * 0.001, 0.35, 2.5));
      },
    );
  }

  /** cover 缩放：铺满可视区域，避免两侧黑边 */
  private fitCameraToViewport() {
    const cam = this.cameras.main;
    const zoomW = this.scale.width / this.mapWidth;
    const zoomH = this.scale.height / this.mapHeight;
    const zoom = Math.max(zoomW, zoomH);
    cam.setZoom(Math.max(0.25, Math.min(zoom, 2.5)));
    cam.centerOn(this.mapWidth / 2, this.mapHeight / 2);
  }

  private setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0) return;
      const result = this.buildableManager.tryPlaceBuilding(pointer.worldX, pointer.worldY);
      this.emitPlacement(result);
    });
  }

  private emitPlacement(result: PlacementResult) {
    if (result.ok) {
      cityBridge.emitPlacement({
        ok: true,
        buildingKey: result.buildingKey,
        plotId: result.plotId,
        tier: result.tier,
        message: `已放置建筑（${result.tier} 地块 #${result.plotId}）`,
      });
      return;
    }
    cityBridge.emitPlacement({
      ok: false,
      reason: result.reason,
      message: result.message,
    });
  }

  private showError(message: string) {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, message, {
        fontFamily: 'Segoe UI, Microsoft YaHei, sans-serif',
        fontSize: '16px',
        color: '#1a4a7a',
        backgroundColor: '#ffffffee',
        padding: { x: 16, y: 12 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3000);
  }
}
