import { useEffect, useRef, useState } from 'react';
import './game-ui.css';

export type ResourceKind = 'money' | 'carbon' | 'power' | 'time';

type Props = {
  kind: ResourceKind;
  label: string;
  value: string;
};

const ICONS: Record<ResourceKind, string> = {
  money: '💰',
  carbon: '🌿',
  power: '⚡',
  time: '🕐',
};

export function ResourcePill({ kind, label, value }: Props) {
  const prev = useRef(value);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPop(true);
      const t = window.setTimeout(() => setPop(false), 450);
      return () => window.clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="resource-pill">
      <span className={`resource-pill__icon resource-pill__icon--${kind}`} aria-hidden>
        {ICONS[kind]}
      </span>
      <div className="resource-pill__body">
        <span className="resource-pill__label">{label}</span>
        <span className={`resource-pill__value${pop ? ' resource-pill__value--pop' : ''}`}>{value}</span>
      </div>
    </div>
  );
}
