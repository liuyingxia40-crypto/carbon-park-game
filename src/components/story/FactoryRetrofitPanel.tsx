import type { ChoiceRecord, DecisionOption, FactoryDef } from '../../game/story/phase1Script';
import { canAfford } from '../../game/story/gameState';
import './FactoryRetrofitPanel.css';

type Props = {
  factory: FactoryDef;
  mode: 'initial' | 'deep';
  funds: number;
  readonly: boolean;
  choice?: ChoiceRecord;
  deepOption?: DecisionOption;
  deepLocked?: boolean;
  deepTargetName?: string;
  onSelect: (option: DecisionOption) => void;
  onInsufficientFunds: () => void;
  onClose: () => void;
};

export function FactoryRetrofitPanel({
  factory,
  mode,
  funds,
  readonly,
  choice,
  deepOption,
  deepLocked,
  deepTargetName,
  onSelect,
  onInsufficientFunds,
  onClose,
}: Props) {
  const panelTitle = mode === 'deep' ? `${factory.title} · 深度优化` : factory.title;

  return (
    <div className="factory-panel" role="dialog" aria-live="polite">
      <div className="factory-panel__title-panel">
        <button type="button" className="factory-panel__close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <h2 className="factory-panel__title">{panelTitle}</h2>
        <p className="factory-panel__problem">{factory.problem}</p>
        <p className="factory-panel__emission">当前排放 {factory.emission} tCO₂e</p>
      </div>

      {readonly && choice ? (
        <div className="factory-panel__result">
          <p className="factory-panel__result-label">
            {mode === 'deep' ? '已选深度方案' : '已选初改方案'}
          </p>
          <h3 className="factory-panel__result-name">{choice.optionName}</h3>
          <div className="factory-panel__result-stats">
            <span>成本 {choice.cost.toLocaleString()}</span>
            <span>减排 -{choice.reduction}</span>
            <span>收益 {choice.revenueChange >= 0 ? '+' : ''}{choice.revenueChange}</span>
          </div>
          <p className="factory-panel__result-note">
            {deepLocked
              ? `深度优化已在「${deepTargetName}」完成，本工厂本轮不可再选。`
              : mode === 'deep'
                ? '该工厂深度优化已完成。'
                : '该工厂初改已完成，无法重复选择。'}
          </p>
        </div>
      ) : mode === 'deep' && deepOption ? (
        <div className="factory-panel__cards-wrap factory-panel__cards-wrap--single">
          <div className="factory-panel__cards">
            <SchemeCard
              option={deepOption}
              affordable={canAfford(funds, deepOption.cost)}
              onSelect={() => onSelect(deepOption)}
              onInsufficientFunds={onInsufficientFunds}
            />
          </div>
        </div>
      ) : (
        <div className="factory-panel__cards-wrap">
          <div className="factory-panel__cards">
            {factory.options.map((opt) => (
              <SchemeCard
                key={opt.id}
                option={opt}
                affordable={canAfford(funds, opt.cost)}
                onSelect={() => onSelect(opt)}
                onInsufficientFunds={onInsufficientFunds}
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
