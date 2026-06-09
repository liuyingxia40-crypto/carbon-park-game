import { useState } from 'react';
import './GameLeftRail.css';

const MENU_ITEMS = [
  { id: 'retrofit', label: '改造', icon: '🔧' },
  { id: 'quest', label: '任务', icon: '📋' },
  { id: 'overview', label: '总览', icon: '📊' },
] as const;

type MenuId = (typeof MENU_ITEMS)[number]['id'];

type Props = {
  hasSelection?: boolean;
};

export function GameLeftRail({ hasSelection }: Props) {
  const [active, setActive] = useState<MenuId>('retrofit');

  return (
    <aside className="game-side-menu" aria-label="改造菜单">
      <h2 className="game-side-menu__title">改造菜单</h2>
      <nav className="game-side-menu__nav">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`game-menu-btn${active === item.id ? ' game-menu-btn--active' : ''}${
              item.id === 'retrofit' && hasSelection ? ' game-menu-btn--hint' : ''
            }`}
            onClick={() => setActive(item.id)}
          >
            <span className="game-menu-btn__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="game-menu-btn__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
