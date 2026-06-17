import { BUILD_MENU_ITEMS } from './BuildMenu';
import type { BuildingKey } from '../game/paths';
import './InfoPanel.css';

type Props = {
  selectedBuilding: BuildingKey | null;
  lastMessage: string | null;
};

export function InfoPanel({ selectedBuilding, lastMessage }: Props) {
  const item = BUILD_MENU_ITEMS.find((b) => b.key === selectedBuilding);

  return (
    <aside className="info-panel">
      <div className="info-panel__card">
        <h2 className="info-panel__title">
          {item ? item.name : '选择一个建筑或地块'}
        </h2>
        {item ? (
          <>
            <div className="info-panel__icon">{item.icon}</div>
            <p className="info-panel__price">建造费用：${item.price.toLocaleString()}</p>
            <p className="info-panel__desc">{buildingDesc(item.key)}</p>
          </>
        ) : (
          <p className="info-panel__desc">
            点击空地建造工厂，升级产业链，获得更多收益。
          </p>
        )}
        {lastMessage && (
          <div
            className={`info-panel__toast${
              lastMessage.startsWith('已放置') ? ' info-panel__toast--ok' : ''
            }`}
          >
            {lastMessage}
          </div>
        )}
      </div>

      <div className="info-panel__card info-panel__card--hint">
        <h3 className="info-panel__subtitle">操作提示</h3>
        <ul className="info-panel__list">
          <li>在底部选择建筑类型</li>
          <li>点击地图上的可建造空地</li>
          <li>滚轮缩放地图视野</li>
        </ul>
      </div>
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
