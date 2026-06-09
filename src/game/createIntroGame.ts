import Phaser from 'phaser';
import { INTRO_COMPLETE_EVENT } from './intro/paths';
import { IntroScene } from '../scenes/IntroScene';

export function createIntroGame(parent: HTMLElement): Phaser.Game {
  const width = parent.clientWidth || window.innerWidth;
  const height = parent.clientHeight || window.innerHeight;

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: 0x050505,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      mouse: true,
      touch: true,
    },
    scene: [IntroScene],
  });
}

export function bindIntroComplete(game: Phaser.Game, onEnterGame: () => void): () => void {
  const handler = () => onEnterGame();
  game.events.on(INTRO_COMPLETE_EVENT, handler);
  return () => game.events.off(INTRO_COMPLETE_EVENT, handler);
}

export function bindIntroResize(game: Phaser.Game, parent: HTMLElement): () => void {
  const ro = new ResizeObserver(() => {
    game.scale.resize(parent.clientWidth, parent.clientHeight);
  });
  ro.observe(parent);
  return () => ro.disconnect();
}
