import type { ParkPhaseStatus, ParkState } from '../../game/parkBridge';
import './GameTopBar.css';

const STATUS_LABEL: Record<ParkPhaseStatus, string> = {
  pending: '待改造',
  in_progress: '改造中',
  completed: '已达标',
};

type Props = {
  state: ParkState;
};

export function GameTopBar({ state }: Props) {
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((state.initialEmission - state.totalEmission) /
        (state.initialEmission - state.targetEmission)) *
        100,
    ),
  );

  return (
    <header className="game-topbar">
      <div className="game-topbar__brand">
        <span className="game-topbar__emblem" aria-hidden>
          ♻
        </span>
        <div className="game-topbar__titles">
          <h1 className="game-topbar__title">低碳工业园改造计划</h1>
          <p className="game-topbar__subtitle">帮助高排放园区完成绿色低碳转型</p>
        </div>
      </div>

      <div className="game-topbar__resources">
        <ResourcePill label="资金" value="420,000" tone="funds" />
        <ResourcePill
          label="总排放"
          value={`${state.totalEmission}`}
          suffix="tCO₂e"
          tone="emission"
          sub={`目标 ≤${state.targetEmission}`}
          progress={progress}
        />
        <ResourcePill
          label="已改造"
          value={`${state.upgradedCount}/${state.totalFactories}`}
        />
        <ResourcePill
          label="状态"
          value={state.goalReached ? '已达标' : STATUS_LABEL[state.phaseStatus]}
          tone={state.goalReached ? 'ok' : state.phaseStatus === 'pending' ? 'warn' : 'info'}
        />
        <ResourcePill label="阶段" value="旧厂改造" />
      </div>
    </header>
  );
}

function ResourcePill({
  label,
  value,
  suffix,
  sub,
  progress,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
  progress?: number;
  tone?: 'funds' | 'emission' | 'ok' | 'warn' | 'info';
}) {
  return (
    <div className={`game-pill${tone ? ` game-pill--${tone}` : ''}`}>
      <span className="game-pill__label">{label}</span>
      <span className="game-pill__value">
        {value}
        {suffix && <span className="game-pill__suffix"> {suffix}</span>}
      </span>
      {sub && <span className="game-pill__sub">{sub}</span>}
      {progress != null && (
        <span className="game-pill__bar" aria-hidden>
          <span className="game-pill__fill" style={{ width: `${progress}%` }} />
        </span>
      )}
    </div>
  );
}
