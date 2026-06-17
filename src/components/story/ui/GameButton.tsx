import { type ReactNode } from 'react';
import './game-ui.css';

type Props = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  showBadge?: boolean;
  ariaLabel?: string;
};

export function GameButton({ icon, label, onClick, showBadge, ariaLabel }: Props) {
  return (
    <button
      type="button"
      className="game-btn"
      onClick={onClick}
      aria-label={ariaLabel ?? label}
    >
      {showBadge ? <span className="game-btn__badge" aria-hidden /> : null}
      <span className="game-btn__icon">{icon}</span>
      <span className="game-btn__label">{label}</span>
    </button>
  );
}
