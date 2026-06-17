import type { ReactNode } from 'react';
import { formatWanYuan } from '../../../game/story/compliance';
import type { ChoiceRecord, DecisionOption } from '../../../game/story/phase1Script';
import { canAfford } from '../../../game/story/gameState';
import { DecisionCard } from './DecisionCard';
import './game-ui.css';

type Props = {
  title: string;
  subtitle?: string;
  options: DecisionOption[];
  funds: number;
  readonly?: boolean;
  choice?: ChoiceRecord;
  readonlyNote?: string;
  onSelect: (option: DecisionOption) => void;
  onClose: () => void;
};

function PanelChrome({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="decision-panel-game" role="region" aria-labelledby="decision-panel-title">
      <div className="decision-panel-game__title-plate">
        <span className="decision-panel-game__title-leaf" aria-hidden>
          🌿
        </span>
        <h2 id="decision-panel-title" className="decision-panel-game__title">
          {title}
        </h2>
      </div>

      <div className="decision-panel-game__frame">
        <div className="decision-panel-game__board">
          {subtitle ? <div className="decision-panel-game__info-pill">{subtitle}</div> : null}
          {children}
          {footer ? <footer className="decision-panel-game__footer">{footer}</footer> : null}
        </div>
      </div>
    </div>
  );
}

export function RetrofitDecisionPanel({
  title,
  subtitle,
  options,
  funds,
  readonly,
  choice,
  readonlyNote,
  onSelect,
  onClose,
}: Props) {
  if (readonly && choice) {
    return (
      <PanelChrome
        title={title}
        subtitle={subtitle}
        footer={
          <button type="button" className="decision-panel-game__back-btn" onClick={onClose}>
            返回地图
          </button>
        }
      >
        <div className="decision-panel-game__result">
          <p className="scheme-card__desc">已选方案</p>
          <h3 className="scheme-card__name scheme-card__name--starter">{choice.optionName}</h3>
          <div className="scheme-card__stat scheme-card__stat--starter">
            <span className="scheme-card__stat-label">成本</span>
            <span className="scheme-card__stat-value">{formatWanYuan(choice.cost)}</span>
            <span className="scheme-card__stat-label"> · 减排</span>
            <span className="scheme-card__stat-value">-{choice.reduction}</span>
          </div>
          {readonlyNote ? <p className="scheme-card__desc">{readonlyNote}</p> : null}
        </div>
      </PanelChrome>
    );
  }

  return (
    <PanelChrome title={title} subtitle={subtitle}>
      <div className={`decision-panel-game__cards${options.length === 1 ? ' decision-panel-game__cards--single' : ''}`}>
        {options.map((opt, index) => (
          <DecisionCard
            key={opt.id}
            option={opt}
            index={index}
            total={options.length}
            affordable={canAfford(funds, opt.cost)}
            onSelect={() => onSelect(opt)}
          />
        ))}
      </div>
      <p className="decision-panel-game__hint">选择改造方案，推进园区低碳升级</p>
    </PanelChrome>
  );
}
