import { BUILDING_KEYS, type BuildingKey } from '../game/paths';
import './BuildMenu.css';

export type BuildMenuItem = {
  key: BuildingKey;
  name: string;
  price: number;
  icon: string;
};

export const BUILD_MENU_ITEMS: BuildMenuItem[] = [
  { key: BUILDING_KEYS.factory_small, name: '小型工厂', price: 500, icon: '🏭' },
  { key: BUILDING_KEYS.factory_medium, name: '中型工厂', price: 1200, icon: '🏗️' },
  { key: BUILDING_KEYS.factory_large, name: '大型工厂', price: 3000, icon: '🏢' },
  { key: BUILDING_KEYS.warehouse, name: '仓库', price: 800, icon: '📦' },
  { key: BUILDING_KEYS.power_plant, name: '电厂', price: 2000, icon: '⚡' },
  { key: BUILDING_KEYS.refinery, name: '精炼厂', price: 4500, icon: '🛢️' },
];

type Props = {
  selected: BuildingKey | null;
  onSelect: (key: BuildingKey) => void;
};

export function BuildMenu({ selected, onSelect }: Props) {
  return (
    <footer className="build-menu">
      <div className="build-menu__inner">
        {BUILD_MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`build-menu__btn${selected === item.key ? ' build-menu__btn--active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            <span className="build-menu__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="build-menu__name">{item.name}</span>
            <span className="build-menu__price">${item.price.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}
