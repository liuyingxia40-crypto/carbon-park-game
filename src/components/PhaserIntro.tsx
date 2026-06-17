import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import {
  bindIntroComplete,
  bindIntroResize,
  createIntroGame,
} from '../game/createIntroGame';
import './PhaserIntro.css';

type Props = {
  onEnterGame: () => void;
};

export function PhaserIntro({ onEnterGame }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onEnterGameRef = useRef(onEnterGame);
  onEnterGameRef.current = onEnterGame;

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const game = createIntroGame(parent);
    gameRef.current = game;

    const unbindResize = bindIntroResize(game, parent);
    const unbindComplete = bindIntroComplete(game, () => onEnterGameRef.current());

    return () => {
      unbindComplete();
      unbindResize();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="phaser-intro" />;
}
