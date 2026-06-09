import Phaser from 'phaser';
import {
  assignPlotTiers,
  composeBuildingLayout,
  factoryKeyForTier,
} from './buildingPlacement';
import { parseBuildablePlot, plotContainsPoint, type BuildablePlot } from './buildablePlot';
import {
  BUILDING_LABELS,
  type BuildingKey,
  type BuildingPlaceMode,
  isBuildingTextureReady,
} from '../paths';
import { cityBridge } from '../cityBridge';

export type PlacementResult =
  | { ok: true; plotId: number; buildingKey: BuildingKey; tier: BuildablePlot['tier'] }
      | {
      ok: false;
      reason: 'outside' | 'occupied' | 'missing_texture' | 'no_selection' | 'insufficient_funds';
      message: string;
    };

type PlacedBuilding = {
  shadow: Phaser.GameObjects.Ellipse;
  sprite: Phaser.GameObjects.Image;
};

export class BuildableManager {
  private readonly plots: BuildablePlot[] = [];
  private readonly placed = new Map<number, PlacedBuilding>();
  private placeMode: BuildingPlaceMode | null = null;

  constructor(
    private scene: Phaser.Scene,
    objectLayer: Phaser.Tilemaps.ObjectLayer | null,
  ) {
    for (const obj of objectLayer?.objects ?? []) {
      const plot = parseBuildablePlot(obj);
      if (plot) this.plots.push(plot);
    }
    assignPlotTiers(this.plots);
  }

  getPlotCount(): number {
    return this.plots.length;
  }

  getPlaceMode(): BuildingPlaceMode | null {
    return this.placeMode;
  }

  setPlaceMode(mode: BuildingPlaceMode | null) {
    this.placeMode = mode;
  }

  resolveTextureKey(plot: BuildablePlot): BuildingKey | null {
    if (!this.placeMode) return null;
    const key: BuildingKey =
      this.placeMode === 'auto_factory' ? factoryKeyForTier(plot.tier) : this.placeMode;
    return isBuildingTextureReady(this.scene, key) ? key : null;
  }

  findPlotAt(worldX: number, worldY: number): BuildablePlot | null {
    for (let i = this.plots.length - 1; i >= 0; i--) {
      const plot = this.plots[i];
      if (plotContainsPoint(plot, worldX, worldY)) return plot;
    }
    return null;
  }

  tryPlaceBuilding(worldX: number, worldY: number): PlacementResult {
    if (!this.placeMode) {
      return {
        ok: false,
        reason: 'no_selection',
        message: '请先在 BUILD 栏选择建筑',
      };
    }

    const plot = this.findPlotAt(worldX, worldY);
    if (!plot) {
      return {
        ok: false,
        reason: 'outside',
        message: '此处不可建造（请点击 Buildable 空地）',
      };
    }
    if (plot.occupied) {
      return { ok: false, reason: 'occupied', message: '该空地已有建筑' };
    }

    const textureKey = this.resolveTextureKey(plot);
    if (!textureKey) {
      return {
        ok: false,
        reason: 'missing_texture',
        message: `缺少建筑图，请检查 /assets/sprites/`,
      };
    }

    if (!cityBridge.canAfford(textureKey)) {
      return {
        ok: false,
        reason: 'insufficient_funds',
        message: '资金不足，无法建造',
      };
    }

    plot.occupied = true;

    const tex = this.scene.textures.get(textureKey);
    const src = tex.getSourceImage();
    const texW = src.width as number;
    const texH = src.height as number;
    const layout = composeBuildingLayout(plot, texW, texH);

    const shadow = this.scene.add
      .ellipse(
        layout.shadow.x,
        layout.shadow.y,
        layout.shadow.width,
        layout.shadow.height,
        0x000000,
        layout.shadow.alpha,
      )
      .setOrigin(0.5, 0.5)
      .setDepth(layout.shadow.depth);

    const sprite = this.scene.add
      .image(layout.placeX, layout.placeY, textureKey)
      .setOrigin(0.5, 1)
      .setScale(layout.display.scale)
      .setDepth(layout.depth);

    this.placed.set(plot.id, { shadow, sprite });
    return { ok: true, plotId: plot.id, buildingKey: textureKey, tier: plot.tier };
  }
}

export function placeModeHint(mode: BuildingPlaceMode): string {
  return BUILDING_LABELS[mode];
}
