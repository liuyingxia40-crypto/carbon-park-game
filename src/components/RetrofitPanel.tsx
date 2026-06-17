import { getFactoryCopy } from '../game/park/factoryCopy';
import type { ParkFactoryView } from '../game/parkBridge';
import './RetrofitPanel.css';

type Props = {
  factory: ParkFactoryView;
  onRetrofit: () => void;
  onClose: () => void;
};

export function RetrofitPanel({ factory, onRetrofit, onClose }: Props) {
  const upgraded = factory.status === 'upgraded';
  const copy = getFactoryCopy(factory.id);

  return (
    <div className="retrofit-overlay" role="presentation" onClick={onClose}>
      <div
        className="retrofit-panel"
        role="dialog"
        aria-labelledby="retrofit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="retrofit-panel__header">
          <p className="retrofit-panel__header-title">低碳改造方案</p>
          <button
            type="button"
            className="retrofit-panel__close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <div className="retrofit-panel__body">
          <h2 id="retrofit-title" className="retrofit-panel__title">
            {factory.displayName}
          </h2>

          <div className="retrofit-panel__section">
            <h3 className="retrofit-panel__section-title">当前问题</h3>
            <p className="retrofit-panel__text">{copy.problem}</p>
          </div>

          <dl className="retrofit-panel__rows">
            <div className="retrofit-panel__row">
              <dt>当前排放</dt>
              <dd>{factory.emission} tCO₂e</dd>
            </div>
            <div className="retrofit-panel__row retrofit-panel__row--solution">
              <dt>改造方案</dt>
              <dd>{copy.solutionName}</dd>
            </div>
            <div className="retrofit-panel__row retrofit-panel__row--cut">
              <dt>预期减排</dt>
              <dd>−{factory.reduction} tCO₂e</dd>
            </div>
          </dl>

          {upgraded ? (
            <p className="retrofit-panel__done">✓ 改造已完成，减排已计入园区总排放</p>
          ) : (
            <div className="retrofit-panel__actions">
              <button type="button" className="retrofit-panel__action" onClick={onRetrofit}>
                开始改造
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
