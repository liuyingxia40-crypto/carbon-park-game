import { useMemo } from 'react';
import { formatWanYuan } from '../../../game/story/compliance';
import { buildDataPanelCharts } from '../../../game/story/dataPanelCharts';
import type { GameState } from '../../../game/story/gameState';
import { TARGET_EMISSION } from '../../../game/story/phase1Script';
import { CarbonTrendChart } from './CarbonTrendChart';
import { ComplianceGaugeChart } from './ComplianceGaugeChart';
import { MoneyTrendChart } from './MoneyTrendChart';
import './data-panel.css';

type Props = {
  open: boolean;
  onClose: () => void;
  state: GameState;
};

export function DataPanel({ open, onClose, state }: Props) {
  const charts = useMemo(() => buildDataPanelCharts(state), [state]);

  if (!open) return null;

  const summary = {
    fundsLabel: formatWanYuan(state.funds),
    emission: state.emission,
    targetEmission: TARGET_EMISSION,
    powerPercent: state.powerPercent,
  };

  return (
    <div className="data-panel-root" role="dialog" aria-modal="true" aria-labelledby="data-panel-title">
      <div className="data-panel-root__scrim" aria-hidden onClick={onClose} />
      <div className="data-panel">
        <header className="data-panel__header">
          <span className="data-panel__header-icon" aria-hidden>
            📊
          </span>
          <h2 id="data-panel-title" className="data-panel__title">
            园区数据概览
          </h2>
        </header>

        <div className="data-panel__summary">
          <div className="data-panel__stat">
            <span className="data-panel__stat-label">当前资金</span>
            <span className="data-panel__stat-value data-panel__stat-value--money">
              {summary.fundsLabel}
            </span>
          </div>
          <div className="data-panel__stat">
            <span className="data-panel__stat-label">当前排放</span>
            <span className="data-panel__stat-value data-panel__stat-value--carbon">
              {summary.emission} tCO₂e
            </span>
          </div>
          <div className="data-panel__stat">
            <span className="data-panel__stat-label">合规目标</span>
            <span className="data-panel__stat-value">≤{summary.targetEmission} tCO₂e</span>
          </div>
          <div className="data-panel__stat">
            <span className="data-panel__stat-label">电力负荷</span>
            <span className="data-panel__stat-value data-panel__stat-value--power">
              {summary.powerPercent}%
            </span>
          </div>
        </div>

        <div className="data-panel__charts">
          <div className="data-panel__chart-card">
            <CarbonTrendChart {...charts.carbon} />
          </div>
          <div className="data-panel__chart-card">
            <MoneyTrendChart {...charts.money} />
          </div>
          <div className="data-panel__chart-card">
            <ComplianceGaugeChart
              progress={charts.compliance.progress}
              metTarget={charts.compliance.metTarget}
            />
          </div>
        </div>

        <footer className="data-panel__footer">
          <button type="button" className="data-panel__back-btn" onClick={onClose}>
            返回地图
          </button>
        </footer>
      </div>
    </div>
  );
}
