import { useState } from 'react';
import { BUILD_MENU_ITEMS } from './BuildMenu';
import type { BuildingKey } from '../game/paths';

type Props = {
  selected: BuildingKey | null;
  onSelect: (key: BuildingKey | null) => void;
};

export function FactoryBuildRail({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside className="build-rail">
      <button
        type="button"
        className="build-rail__tab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        BUILD
      </button>
      {open && (
        <div className="build-rail__panel build-rail__panel--factory">
          <div className="build-rail__list">
            {BUILD_MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`build-btn${selected === item.key ? ' build-btn--active' : ''}`}
                title={`${item.name} $${item.price}`}
                onClick={() => onSelect(item.key)}
              >
                <span className="build-btn__icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="build-btn__name">{item.name}</span>
                <span className="build-btn__price">${item.price}</span>
              </button>
            ))}
          </div>
          {selected && (
            <button type="button" className="build-rail__cancel" onClick={() => onSelect(null)}>
              取消
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
