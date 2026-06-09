import type { ParkFactoryView, ParkState } from '../../game/parkBridge';
import './GameRightPanel.css';

type Props = {
  state: ParkState;
  selectedId: string | null;
  onSelectFactory: (id: string) => void;
};

export function GameRightPanel({ state, selectedId, onSelectFactory }: Props) {
  return (
    <aside className="game-right-panel">
      <section className="game-quest">
        <h2 className="game-quest__tab">任务</h2>
        <p className="game-quest__goal">
          目标：总排放 ≤ <strong>{state.targetEmission}</strong> tCO₂e
        </p>
        <p className="game-quest__line">
          进度 <strong>{state.upgradedCount}/{state.totalFactories}</strong> 座
        </p>
        {!state.goalReached && (
          <p className="game-quest__warn">仍需改造</p>
        )}
        {state.goalReached && (
          <p className="game-quest__ok">园区排放达标</p>
        )}
      </section>

      <section className="game-factory-list">
        <h2 className="game-factory-list__tab">工厂</h2>
        <ul>
          {state.factories.map((f) => (
            <FactoryQuestCard
              key={f.id}
              factory={f}
              active={selectedId === f.id}
              onSelect={() => onSelectFactory(f.id)}
            />
          ))}
        </ul>
      </section>
    </aside>
  );
}

function FactoryQuestCard({
  factory,
  active,
  onSelect,
}: {
  factory: ParkFactoryView;
  active: boolean;
  onSelect: () => void;
}) {
  const done = factory.status === 'upgraded';

  return (
    <li>
      <button
        type="button"
        className={`game-factory-card${active ? ' game-factory-card--active' : ''}${
          done ? ' game-factory-card--done' : ''
        }`}
        onClick={onSelect}
      >
        <span className="game-factory-card__name">{factory.displayName}</span>
        <span className="game-factory-card__row">
          <span>排放 {factory.emission}</span>
          <span className="game-factory-card__cut">−{factory.reduction}</span>
        </span>
        <span
          className={`game-factory-card__badge${
            done ? ' game-factory-card__badge--done' : ''
          }`}
        >
          {done ? '已改造' : '未改造'}
        </span>
      </button>
    </li>
  );
}
