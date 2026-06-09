import Phaser from 'phaser';
import { VIEW_H, VIEW_W } from './constants';
import { MainScene } from '../scenes/MainScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#00000000',
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: VIEW_W,
      height: VIEW_H,
    },
    scene: [MainScene],
  };
}

export function bindPhaserResize(game: Phaser.Game, parent: HTMLElement) {
  const ro = new ResizeObserver(() => {
    const w = Math.max(320, parent.clientWidth);
    const h = Math.max(240, parent.clientHeight);
    game.scale.resize(w, h);
  });
  ro.observe(parent);
  return () => ro.disconnect();
}
