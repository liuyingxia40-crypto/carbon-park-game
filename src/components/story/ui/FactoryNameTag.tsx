import type { CSSProperties } from 'react';
import './game-ui.css';

type Props = {
  title: string;
  stars: number;
  maxStars?: number;
  style?: CSSProperties;
};

export function FactoryNameTag({ title, stars, maxStars = 3, style }: Props) {
  return (
    <div className="factory-name-tag" style={style}>
      <span className="factory-name-tag__plate">{title}</span>
      <div className="factory-name-tag__stars" aria-label="星级">
        {Array.from({ length: maxStars }, (_, i) => (
          <span
            key={i}
            className={`factory-name-tag__star${
              i < stars ? ' factory-name-tag__star--filled' : ' factory-name-tag__star--empty'
            }`}
            aria-hidden
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}
