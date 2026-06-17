import Phaser from 'phaser';
import type { CityTier } from '../cityGrowth';
import type { WorldMapData } from '../iso/mapGenerator';

/** 沪上界面下关闭额外装饰线 */
export class CityGrowthVisuals {
  private decorGfx: Phaser.GameObjects.Graphics;
  private gridGfx: Phaser.GameObjects.Graphics;
  private lastTier: CityTier = -1 as CityTier;

  constructor(
    scene: Phaser.Scene,
    _mapData: WorldMapData,
  ) {
    this.decorGfx = scene.add.graphics().setDepth(2);
    this.gridGfx = scene.add.graphics().setDepth(3);
  }

  setTier(tier: CityTier, nightFactor: number) {
    if (tier === this.lastTier && nightFactor < 0.02) return;
    this.lastTier = tier;
    this.decorGfx.clear();
    this.gridGfx.clear();
  }

  destroy() {
    this.decorGfx.destroy();
    this.gridGfx.destroy();
  }
}
