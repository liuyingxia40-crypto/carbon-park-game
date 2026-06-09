import Phaser from 'phaser';
import { PARK_MAP_HEIGHT, PARK_MAP_WIDTH } from './park/paths';
import { IndustrialParkScene } from '../scenes/IndustrialParkScene';

/** 森林色兜底，与地图边缘接近；ENVELOP = cover 铺满，不变形 */
const STAGE_BG = 0x3d6b48;

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: PARK_MAP_WIDTH,
    height: PARK_MAP_HEIGHT,
    backgroundColor: STAGE_BG,
    transparent: false,
    scale: {
      mode: Phaser.Scale.ENVELOP,
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
