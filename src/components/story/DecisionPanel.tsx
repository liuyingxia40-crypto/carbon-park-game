import { formatWanYuan } from '../../game/story/compliance';
import type { DecisionOption, RiskLevel } from '../../game/story/phase1Script';
import { canAfford } from '../../game/story/gameState';
import './DecisionPanel.css';

type NarrativeProps = {
  kind: 'narrative';
  title: string;
  text: string;
  buttonLabel: string;
  funds: number;
  onContinue: () => void;
};

type DecisionProps = {
  kind: 'decision';
  title: string;
  text: string;
  options: DecisionOption[];
  funds: number;
  onSelect: (option: DecisionOption) => void;
};

type Props = NarrativeProps | DecisionProps;

export function DecisionPanel(props: Props) {
  return (
    <div className="decision-panel-wrap">
      <div className="decision-panel" role="dialog" aria-live="polite">
        <h2 className="decision-panel__title">{props.title}</h2>
        <p className="decision-panel__text">{props.text}</p>

        {props.kind === 'narrative' ? (
          <button type="button" className="decision-panel__continue" onClick={props.onContinue}>
            {props.buttonLabel}
          </button>
        ) : (
          <div className="decision-panel__options">
            {props.options.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                affordable={canAfford(props.funds, opt.cost)}
                onSelect={() => props.onSelect(opt)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OptionCard({
  option,
  affordable,
  onSelect,
}: {
  option: DecisionOption;
  affordable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`option-card${affordable ? '' : ' option-card--disabled'}`}
      onClick={affordable ? onSelect : undefined}
      disabled={!affordable}
      title={affordable ? undefined : '资金不足，无法选择该方案'}
    >
      <div className="option-card__head">
        <span className="option-card__name">{option.name}</span>
        <span className={`option-card__risk option-card__risk--${riskClass(option.risk)}`}>
          风险 {option.risk}
        </span>
      </div>
      <p className="option-card__desc">{option.description}</p>
      <div className="option-card__stats">
        <span>成本 {formatWanYuan(option.cost)}</span>
        <span className="option-card__cut">减排 −{option.reduction}</span>
        <span className={option.revenueChange >= 0 ? 'option-card__up' : 'option-card__down'}>
          收益 {option.revenueChange >= 0 ? '+' : ''}
          {option.revenueChange}
        </span>
      </div>
      {!affordable && <span className="option-card__warn">资金不足，无法选择该方案</span>}
    </button>
  );
}

function riskClass(risk: RiskLevel): string {
  if (risk === '低') return 'low';
  if (risk === '中') return 'mid';
  if (risk === '中高') return 'midhigh';
  return 'high';
}
