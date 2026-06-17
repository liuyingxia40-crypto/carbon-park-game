import Phaser from 'phaser';
import { FactoryZoneManager, type MapVisualConfig } from '../game/park/FactoryZoneManager';
import { CarbonButlerUI } from '../game/park/CarbonButlerUI';
import { ParkAmbientMotion } from '../game/park/ParkAmbientMotion';
import {
  CARBON_BUTLER_KEY,
  CARBON_BUTLER_URL,
  INITIAL_TOTAL_EMISSION,
  PARK_BG_KEY,
  PARK_BG_URL,
  PARK_IMAGE_LAYER_NAME,
  PARK_MAP_JSON_URL,
  PARK_MAP_KEY,
  PARK_OBJECTS_LAYER_NAME,
  STAGE_BG,
  TARGET_EMISSION,
} from '../game/park/paths';
import { parkBridge } from '../game/parkBridge';

type ImageLayerData = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export class IndustrialParkScene extends Phaser.Scene {
  private zoneManager!: FactoryZoneManager;
  private butlerUI?: CarbonButlerUI;
  private ambient?: ParkAmbientMotion;
  private mapWidth = 0;
  private mapHeight = 0;

  constructor() {
    super({ key: 'IndustrialParkScene' });
  }

  preload() {
    this.load.tilemapTiledJSON(PARK_MAP_KEY, PARK_MAP_JSON_URL);
    this.load.image(PARK_BG_KEY, PARK_BG_URL);
    this.load.image(CARBON_BUTLER_KEY, CARBON_BUTLER_URL);
  }

  create() {
    const map = this.make.tilemap({ key: PARK_MAP_KEY });
    const imageLayer = this.readImageLayer(PARK_IMAGE_LAYER_NAME);

    if (!this.textures.exists(PARK_BG_KEY)) {
      this.showError(`缺少背景图 ${PARK_BG_URL}`);
      return;
    }

    const bg = this.add.image(0, 0, PARK_BG_KEY).setOrigin(0, 0).setDepth(0);

    if (imageLayer) {
      bg.setPosition(imageLayer.x + imageLayer.offsetX, imageLayer.y + imageLayer.offsetY);
      this.mapWidth = imageLayer.width;
      this.mapHeight = imageLayer.height;
    } else {
      this.mapWidth = bg.width;
      this.mapHeight = bg.height;
    }

    const objectsLayer =
      map.getObjectLayer(PARK_OBJECTS_LAYER_NAME) ?? map.getObjectLayer('Objects');

    if (!objectsLayer) {
      this.showError(`找不到对象层「${PARK_OBJECTS_LAYER_NAME}」`);
      return;
    }

    this.zoneManager = new FactoryZoneManager(this, objectsLayer);
    if (this.zoneManager.getCount() === 0) {
      this.showError('Objects 层中没有可改造工厂');
      return;
    }

    this.setupCamera();
    this.setupInput();
    this.syncState();
    this.setupButlerUI();
    this.ambient = new ParkAmbientMotion(this);

    parkBridge.attachScene({
      syncMapVisuals: (config) => this.syncMapVisuals(config),
      resetFactories: () => this.resetFactories(),
      selectFactoryById: (id) => this.selectFactoryById(id),
      resetButler: () => this.butlerUI?.reset(),
      showButlerNotice: (text) => this.butlerUI?.showNotice(text),
      hideButler: () => this.butlerUI?.hide(),
    });
  }

  shutdown() {
    this.ambient?.destroy();
    this.ambient = undefined;
    this.zoneManager?.destroy();
    this.butlerUI?.destroy();
    this.butlerUI = undefined;
    parkBridge.detachScene();
    parkBridge.clearSelection();
  }

  private setupButlerUI() {
    if (!this.textures.exists(CARBON_BUTLER_KEY)) {
      this.createButlerFallbackTexture();
    }
    this.butlerUI = new CarbonButlerUI(this, {
      onComplete: () => parkBridge.emitButlerComplete(),
    });
  }

  private createButlerFallbackTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x2d4a38, 1);
    g.fillRoundedRect(0, 0, 180, 320, 16);
    g.lineStyle(3, 0x8ab896, 1);
    g.strokeRoundedRect(0, 0, 180, 320, 16);
    g.generateTexture(CARBON_BUTLER_KEY, 180, 320);
    g.destroy();
  }

  private selectFactoryById(id: string) {
    const factory = this.zoneManager.getFactory(id);
    if (factory) {
      this.zoneManager.setHovered(id);
      parkBridge.selectFactory(factory);
    }
  }

  private syncMapVisuals(config: MapVisualConfig) {
    this.zoneManager.syncVisuals(config);
  }

  private resetFactories() {
    this.zoneManager.resetAll();
    this.syncState();
  }

  private syncState() {
    parkBridge.emitState(
      {
        totalEmission: INITIAL_TOTAL_EMISSION,
        targetEmission: TARGET_EMISSION,
        initialEmission: INITIAL_TOTAL_EMISSION,
        goalReached: false,
      },
      this.zoneManager.getFactories(),
    );
  }

  private readImageLayer(layerName: string): ImageLayerData | null {
    const mapData = this.cache.tilemap.get(PARK_MAP_KEY).data;
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
      width: raw.imagewidth ?? this.textures.get(PARK_BG_KEY).getSourceImage().width,
      height: raw.imageheight ?? this.textures.get(PARK_BG_KEY).getSourceImage().height,
    };
  }

  private setupCamera() {
    const cam = this.cameras.main;
    cam.setBackgroundColor(STAGE_BG);
    cam.setZoom(1);
    cam.setScroll(0, 0);
    cam.setBounds(0, 0, this.mapWidth, this.mapHeight);
  }

  private setupInput() {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const factory = this.zoneManager.findAt(pointer.worldX, pointer.worldY);
      this.zoneManager.setHovered(factory?.id ?? null);
      this.input.manager.canvas.style.cursor = factory ? 'pointer' : 'default';
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0) return;
      const factory = this.zoneManager.findAt(pointer.worldX, pointer.worldY);
      if (factory) {
        parkBridge.selectFactory(factory);
      } else {
        parkBridge.clearSelection();
      }
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
