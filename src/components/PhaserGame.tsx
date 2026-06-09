import { useEffect, useRef } from 'react';
import { bindPhaserResize, createPhaserGame } from '../game/createGame';
import './PhaserGame.css';

type Props = {
  bootKey?: number;
};

export function PhaserGame({ bootKey = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    const game = createPhaserGame(parent);
    gameRef.current = game;
    const unbindResize = bindPhaserResize(game, parent);

    return () => {
      unbindResize();
      game.destroy(true);
      gameRef.current = null;
    };
  }, [bootKey]);

  return <div ref={containerRef} className="phaser-game" />;
}
