import type { DecisionOption } from '../../game/story/phase1Script';
import { canAfford } from '../../game/story/gameState';
import './EventOverlay.css';

type NarrativeProps = {
  kind: 'narrative';
  title: string;
  text: string;
  buttonLabel: string;
  onContinue: () => void;
};

type DecisionProps = {
  kind: 'decision';
  title: string;
  text: string;
  options: DecisionOption[];
  funds: number;
  onSelect: (option: DecisionOption) => void;
  onInsufficientFunds: () => void;
};

type Props = NarrativeProps | DecisionProps;

export function EventOverlay(props: Props) {
  return (
    <div className="event-scene" role="dialog" aria-live="polite">
      <div className="event-scene__title-panel">
        <h2 className="event-scene__title">{props.title}</h2>
        <p className="event-scene__text">{props.text}</p>
      </div>

      {props.kind === 'narrative' ? (
        <div className="event-scene__action-wrap">
          <button type="button" className="event-scene__continue" onClick={props.onContinue}>
            {props.buttonLabel}
          </button>
        </div>
      ) : (
        <div className="event-scene__cards-wrap">
          <div className="event-scene__cards">
            {props.options.map((opt) => (
              <SchemeCard
                key={opt.id}
                option={opt}
                affordable={canAfford(props.funds, opt.cost)}
                onSelect={() => props.onSelect(opt)}
                onInsufficientFunds={props.onInsufficientFunds}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SchemeCard({
  option,
  affordable,
  onSelect,
  onInsufficientFunds,
}: {
  option: DecisionOption;
  affordable: boolean;
  onSelect: () => void;
  onInsufficientFunds: () => void;
}) {
  const handleChoose = () => {
    if (affordable) onSelect();
    else onInsufficientFunds();
  };

  return (
    <article
      className={`scheme-card scheme-card--${option.tagTone}${affordable ? '' : ' scheme-card--locked'}`}
    >
      <header className="scheme-card__head">
        <h3 className="scheme-card__name">{option.name}</h3>
        <span className={`scheme-card__tag scheme-card__tag--${option.tagTone}`}>{option.tag}</span>
      </header>

      <div className="scheme-card__stats">
        <div className="scheme-card__stat">
          <span className="scheme-card__stat-label">成本</span>
          <span className="scheme-card__stat-val">{option.cost.toLocaleString()}</span>
        </div>
        <div className="scheme-card__stat scheme-card__stat--cut">
          <span className="scheme-card__stat-label">减排</span>
          <span className="scheme-card__stat-val">
            {option.reduction > 0 ? `-${option.reduction}` : '0'}
          </span>
        </div>
        <div
          className={`scheme-card__stat${option.revenueChange >= 0 ? ' scheme-card__stat--up' : ' scheme-card__stat--down'}`}
        >
          <span className="scheme-card__stat-label">收益</span>
          <span className="scheme-card__stat-val">
            {option.revenueChange >= 0 ? '+' : ''}
            {option.revenueChange}
          </span>
        </div>
        <div className="scheme-card__stat">
          <span className="scheme-card__stat-label">风险</span>
          <span className="scheme-card__stat-val">{option.risk}</span>
        </div>
      </div>

      <p className="scheme-card__desc">{option.description}</p>

      <footer className="scheme-card__foot">
        <button
          type="button"
          className={`scheme-card__btn${affordable ? '' : ' scheme-card__btn--disabled'}`}
          onClick={handleChoose}
        >
          {affordable ? '选择方案' : '资金不足'}
        </button>
      </footer>
    </article>
  );
}
