import type { CSSProperties } from 'react';
import type { FactoryBubbleIcon } from './factoryUiMeta';
import './game-ui.css';

const ICON_GLYPH: Record<FactoryBubbleIcon, string> = {
  bolt: '⚡',
  leaf: '🌿',
  gear: '🔧',
};

type Props = {
  text: string;
  icon: FactoryBubbleIcon;
  showUpArrow?: boolean;
  style?: CSSProperties;
};

export function FactoryBubble({ text, icon, showUpArrow, style }: Props) {
  return (
    <div className="factory-bubble" style={style}>
      <span className={`factory-bubble__icon factory-bubble__icon--${icon}`} aria-hidden>
        {ICON_GLYPH[icon]}
      </span>
      <span className="factory-bubble__text">{text}</span>
      {showUpArrow ? (
        <span className="factory-bubble__arrow" aria-hidden>
          ↑
        </span>
      ) : null}
    </div>
  );
}
