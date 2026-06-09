import {
  complianceLabel,
  PHASE_LABEL,
  PHASE_PROGRESS,
  STAGE_TITLES,
  TARGET_EMISSION,
  stageIndex,
} from '../../game/story/phase1Script';
import type { GameState } from '../../game/story/gameState';
import './GameHeader.css';

type Props = {
  state: GameState;
};

export function GameHeader({ state }: Props) {
  const compliance = complianceLabel(state.emission);
  const phaseName = STAGE_TITLES[state.stageId];
  const currentIdx = stageIndex(state.stageId);

  return (
    <header className="hud">
      <div className="hud__panel hud__panel--brand">
        <div className="hud__icon" aria-hidden>
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="6" y="22" width="16" height="18" rx="3" fill="#6b9080" stroke="#2d3a34" strokeWidth="2.5" />
            <rect x="26" y="12" width="16" height="28" rx="3" fill="#95c9a8" stroke="#2d3a34" strokeWidth="2.5" />
            <path d="M10 18h8M30 8h8" stroke="#2d3a34" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="38" cy="10" r="5" fill="#ffd166" stroke="#2d3a34" strokeWidth="2" />
          </svg>
        </div>
        <div className="hud__titles">
          <h1 className="hud__title">低碳工业园改造计划</h1>
          <p className="hud__subtitle">{PHASE_LABEL}</p>
        </div>
      </div>

      <div className="hud__panel hud__panel--resources">
        <HudStat label="资金" value={state.funds.toLocaleString()} />
        <HudStat
          label="排放"
          value={`${state.emission}`}
          suffix={`/ ${TARGET_EMISSION}`}
          accent="amber"
        />
        <HudStat label="收益" value={String(state.revenue)} accent="blue" />
        <HudStat
          label="合规"
          value={compliance}
          accent={compliance === '已达标' ? 'green' : compliance === '接近达标' ? 'amber' : 'red'}
        />
      </div>

      <div className="hud__panel hud__panel--phase">
        <div className="hud__phase-head">
          <span className="hud__phase-label">当前阶段</span>
          <span className="hud__phase-name">{phaseName}</span>
        </div>
        <nav className="hud__flow" aria-label="阶段进度">
          {PHASE_PROGRESS.map((step, i) => {
            const isCurrent = step.id === state.stageId;
            const isDone = i < currentIdx || (step.id === 'report' && state.stageId === 'report');
            return (
              <span key={step.id} className="hud__flow-segment">
                {i > 0 && <span className="hud__flow-arrow" aria-hidden>→</span>}
                <span
                  className={`hud__flow-step${isCurrent ? ' hud__flow-step--current' : ''}${isDone ? ' hud__flow-step--done' : ''}`}
                >
                  {step.label}
                </span>
              </span>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function HudStat({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: 'green' | 'amber' | 'blue' | 'red';
}) {
  return (
    <div className={`hud-stat${accent ? ` hud-stat--${accent}` : ''}`}>
      <span className="hud-stat__label">{label}</span>
      <span className="hud-stat__value">
        {value}
        {suffix && <span className="hud-stat__suffix">{suffix}</span>}
      </span>
    </div>
  );
}

export function getDefaultHint(state: GameState): string {
  switch (state.stageId) {
    case 'diagnosis':
      return '完成园区诊断，了解排放来源';
    case 'retrofit':
      return `点击地图工厂选择初改方案（${state.initialRetrofitDone.length}/3）`;
    case 'inspection':
      return '应对监管抽查，选择合规策略';
    case 'deep_opt':
      return state.deepOptimizedFactory
        ? '深度优化已完成，进入碳资产补充'
        : '选择一座工厂进行深度优化';
    case 'carbon':
      return '选择碳资产补充方案，向目标排放靠近';
    case 'report':
      return '查看第一阶段改造报告';
  }
}
