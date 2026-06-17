import Phaser from 'phaser';
import { PARK_MAP_HEIGHT, PARK_MAP_WIDTH } from './park/paths';
import { IndustrialParkScene } from '../scenes/IndustrialParkScene';

/** 与地图 letterbox 区域一致的底色；FIT = contain，完整显示地图不裁切 */
const STAGE_BG = 0x121810;

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: PARK_MAP_WIDTH,
    height: PARK_MAP_HEIGHT,
    backgroundColor: STAGE_BG,
    transparent: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [IndustrialParkScene],
  });
}

export function bindPhaserResize(game: Phaser.Game, parent: HTMLElement) {
  const ro = new ResizeObserver(() => {
    game.scale.refresh();
  });
  ro.observe(parent);
  return () => ro.disconnect();
}
