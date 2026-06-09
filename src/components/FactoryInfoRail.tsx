import { useState } from 'react';
import { BUILD_MENU_ITEMS } from './BuildMenu';
import type { BuildingKey } from '../game/paths';

type Props = {
  selectedBuilding: BuildingKey | null;
  lastMessage: string | null;
};

export function FactoryInfoRail({ selectedBuilding, lastMessage }: Props) {
  const [open, setOpen] = useState(true);
  const item = selectedBuilding
    ? BUILD_MENU_ITEMS.find((b) => b.key === selectedBuilding)
    : undefined;

  return (
    <aside className="info-rail">
      <button
        type="button"
        className="info-rail__tab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        INFO
      </button>
      {open && (
        <div className="info-rail__panel info-rail__panel--factory">
          <h3 className="info-rail__title">
            {item ? item.name : '选择一个建筑或地块'}
          </h3>
          {item ? (
            <>
              <div className="info-rail__icon">{item.icon}</div>
              <p className="info-rail__price">建造费用：${item.price.toLocaleString()}</p>
              <p className="info-rail__desc">{buildingDesc(item.key)}</p>
            </>
          ) : (
            <p className="info-rail__desc">
              点击空地建造工厂，升级产业链，获得更多收益。
            </p>
          )}
          {lastMessage && (
            <div
              className={`info-rail__toast${
                lastMessage.startsWith('已放置') ? ' info-rail__toast--ok' : ''
              }`}
            >
              {lastMessage}
            </div>
          )}
          <h4 className="info-rail__subtitle">操作提示</h4>
          <ul className="info-rail__list">
            <li>左侧 BUILD 选择建筑</li>
            <li>点击地图可建造空地</li>
            <li>滚轮缩放地图视野</li>
          </ul>
        </div>
      )}
    </aside>
  );
}

function buildingDesc(key: BuildingKey): string {
  switch (key) {
    case 'factory_small':
      return '适合小型地块，快速启动基础生产线。';
    case 'factory_medium':
      return '平衡产量与占地，是中期扩张的主力建筑。';
    case 'factory_large':
      return '需要较大空地，产量最高，适合核心工业区。';
    case 'warehouse':
      return '提升仓储上限，缓解资源积压。';
    case 'power_plant':
      return '为工厂提供电力，保障全链运转。';
    case 'refinery':
      return '精炼原材料，提高产业链附加值。';
    default:
      return '点击地图上的可建造区域进行放置。';
  }
}
