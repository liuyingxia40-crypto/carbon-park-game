import type { ParkFactoryView } from '../../game/parkBridge';
import './FactoryList.css';

type Props = {
  factories: ParkFactoryView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function FactoryList({ factories, selectedId, onSelect }: Props) {
  return (
    <section className="factory-list">
      <h2 className="factory-list__title">工厂列表</h2>
      <ul className="factory-list__items">
        {factories.map((f) => {
          const upgraded = f.status === 'upgraded';
          return (
            <li key={f.id}>
              <button
                type="button"
                className={`factory-card${selectedId === f.id ? ' factory-card--active' : ''}${
                  upgraded ? ' factory-card--done' : ''
                }`}
                onClick={() => onSelect(f.id)}
              >
                <div className="factory-card__head">
                  <span className="factory-card__name">{f.displayName}</span>
                  <span
                    className={`factory-card__status${
                      upgraded ? ' factory-card__status--done' : ''
                    }`}
                  >
                    {upgraded ? '已改造' : '未改造'}
                  </span>
                </div>
                <div className="factory-card__stats">
                  <span>排放 {f.emission} tCO₂e</span>
                  <span className="factory-card__cut">可减 −{f.reduction}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
