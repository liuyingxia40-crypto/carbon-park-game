import type { ParkPhaseStatus, ParkState } from '../../game/parkBridge';
import './ParkTaskPanel.css';

const PHASE_LABEL: Record<ParkPhaseStatus, string> = {
  pending: '待改造',
  in_progress: '改造中',
  completed: '已达标',
};

type Props = {
  state: ParkState;
};

export function ParkTaskPanel({ state }: Props) {
  return (
    <section className="park-task">
      <h2 className="park-task__title">改造任务</h2>

      <div className="park-task__card">
        <h3 className="park-task__label">当前目标</h3>
        <p className="park-task__text">
          将园区总排放降至 <strong>{state.targetEmission} tCO₂e</strong> 以下
        </p>
      </div>

      <div className="park-task__card">
        <h3 className="park-task__label">改造进度</h3>
        <p className="park-task__metric">
          已改造工厂：<strong>{state.upgradedCount}</strong> / {state.totalFactories}
        </p>
      </div>

      <div className="park-task__card">
        <h3 className="park-task__label">当前状态</h3>
        <span className={`park-task__badge park-task__badge--${state.phaseStatus}`}>
          {PHASE_LABEL[state.phaseStatus]}
        </span>
      </div>

      <p className="park-task__hint">
        点击地图上的旧工厂，或从下方列表选择工厂，查看低碳改造方案。
      </p>
    </section>
  );
}
