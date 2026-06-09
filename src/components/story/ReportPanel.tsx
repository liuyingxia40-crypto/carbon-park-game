import { useState } from 'react';
import {
  INITIAL_EMISSION,
  TARGET_EMISSION,
  complianceLabel,
} from '../../game/story/phase1Script';
import { getChoiceByPhase } from '../../game/story/gameState';
import type { GameState } from '../../game/story/gameState';
import './ReportPanel.css';

const SERVICE_STEPS = [
  '碳排放诊断',
  '工厂减排方案设计',
  '监管合规评估',
  '碳资产补足方案',
  '阶段成果报告',
] as const;

type Props = {
  state: GameState;
  onRestart: () => void;
};

export function ReportPanel({ state, onRestart }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const compliance = complianceLabel(state.emission);
  const totalReduction = INITIAL_EMISSION - state.emission;
  const carbonChoice = getChoiceByPhase(state, 'carbon');
  const decisionCount = state.choices.length;
  const metTarget = state.emission <= TARGET_EMISSION;

  const statusClass =
    compliance === '已达标' ? 'ok' : compliance === '接近达标' ? 'warn' : 'risk';

  const summaryText = metTarget
    ? `通过第一阶段服务，园区排放由 ${INITIAL_EMISSION} tCO₂e 降至 ${state.emission} tCO₂e，已低于目标排放线。`
    : `通过第一阶段服务，园区排放由 ${INITIAL_EMISSION} tCO₂e 降至 ${state.emission} tCO₂e，距离目标仍有差距。`;

  return (
    <div className="report-scene" role="dialog">
      <div className="report-scene__panel">
        <header className="report-scene__header">
          <p className="report-scene__brand">低碳服务团队</p>
          <h2 className="report-scene__title">第一阶段成果报告</h2>
          <p className="report-scene__subtitle">
            我们已完成园区排放诊断、旧厂初改与碳资产补足方案。
          </p>
        </header>

        <section className={`report-hero report-hero--${statusClass}`}>
          <div className="report-hero__main">
            <span className="report-hero__label">园区当前排放</span>
            <p className="report-hero__emission">
              {state.emission}
              <span className="report-hero__target">/ {TARGET_EMISSION} tCO₂e</span>
            </p>
          </div>
          <div className="report-hero__side">
            <div className="report-hero__badge">
              <span className="report-hero__badge-label">状态</span>
              <span className="report-hero__badge-value">{compliance}</span>
            </div>
            <div className="report-hero__reduction">
              <span className="report-hero__badge-label">累计减排</span>
              <span className="report-hero__reduction-value">{totalReduction} tCO₂e</span>
            </div>
          </div>
        </section>

        <section className="report-core-stats">
          <CoreStat label="初始排放" value={`${INITIAL_EMISSION}`} unit="tCO₂e" />
          <CoreStat label="当前排放" value={`${state.emission}`} unit="tCO₂e" highlight />
          <CoreStat label="目标排放" value={`≤ ${TARGET_EMISSION}`} unit="tCO₂e" />
          <CoreStat label="累计减排" value={`${totalReduction}`} unit="tCO₂e" accent />
        </section>

        <section className="report-secondary-stats">
          <span>剩余资金 ¥{state.funds.toLocaleString()}</span>
          <span>生产收益 {state.revenue}</span>
          <span>已改造工厂 {state.initialRetrofitDone.length}/3</span>
        </section>

        <p className="report-scene__summary">{summaryText}本阶段主要通过工厂节能改造、设备升级与碳资产补足等组合方案完成减排。</p>

        <section className="report-service report-service--flow">
          <h3 className="report-service__title">服务流程完成</h3>
          <ul className="report-service__steps">
            {SERVICE_STEPS.map((step) => (
              <li key={step}>
                <span className="report-service__check" aria-hidden>
                  ✓
                </span>
                {step}
              </li>
            ))}
          </ul>
        </section>

        <section className="report-service report-service--contrib">
          <h3 className="report-service__title">服务贡献</h3>
          <div className="report-contrib-grid">
            <ContribItem label="诊断识别排放源" value="3 处" />
            <ContribItem label="制定改造方案" value={`${decisionCount} 项`} />
            <ContribItem label="碳资产补足" value={`${carbonChoice?.reduction ?? 0} tCO₂e`} />
            <ContribItem label="最终累计减排" value={`${totalReduction} tCO₂e`} highlight />
          </div>
        </section>

        <section className="report-decisions">
          {!showDetails ? (
            <div className="report-decisions__collapsed">
              <span>已完成 {decisionCount} 项关键决策</span>
              <button
                type="button"
                className="report-decisions__toggle"
                onClick={() => setShowDetails(true)}
              >
                查看详细方案记录
              </button>
            </div>
          ) : (
            <div className="report-decisions__expanded">
              <div className="report-decisions__head">
                <span>详细方案记录（{decisionCount} 项）</span>
                <button
                  type="button"
                  className="report-decisions__toggle"
                  onClick={() => setShowDetails(false)}
                >
                  收起
                </button>
              </div>
              <ul className="report-decisions__list">
                {state.choices.map((c, i) => (
                  <li key={`${c.phase}-${c.factoryId ?? i}`}>
                    <span className="report-decisions__name">
                      {c.stageTitle}
                      {c.factoryName ? ` · ${c.factoryName}` : ''} — {c.optionName}
                    </span>
                    <span className="report-decisions__meta">
                      成本 {c.cost.toLocaleString()} · 减排 -{c.reduction} · 收益{' '}
                      {c.revenueChange >= 0 ? '+' : ''}
                      {c.revenueChange}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="report-scene__actions">
          <button type="button" className="report-scene__btn report-scene__btn--primary" onClick={onRestart}>
            重新开始
          </button>
          <button type="button" className="report-scene__btn report-scene__btn--ghost" disabled>
            进入第二阶段（开发中）
          </button>
        </div>
      </div>
    </div>
  );
}

function CoreStat({
  label,
  value,
  unit,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  const mod = accent ? 'accent' : highlight ? 'hi' : '';
  return (
    <div className={`report-core-stat${mod ? ` report-core-stat--${mod}` : ''}`}>
      <span className="report-core-stat__label">{label}</span>
      <span className="report-core-stat__value">{value}</span>
      <span className="report-core-stat__unit">{unit}</span>
    </div>
  );
}

function ContribItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`report-contrib${highlight ? ' report-contrib--hi' : ''}`}>
      <span className="report-contrib__label">{label}</span>
      <span className="report-contrib__value">{value}</span>
    </div>
  );
}
