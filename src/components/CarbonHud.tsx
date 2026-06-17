import type { ParkState } from '../game/parkBridge';
import './CarbonHud.css';

type Props = {
  state: ParkState;
};

export function CarbonHud({ state }: Props) {
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
    <div className="carbon-hud">
      <div className="carbon-hud__header">
        <span className="carbon-hud__title">碳排放状态</span>
        {state.goalReached ? (
          <span className="carbon-hud__tag carbon-hud__tag--ok">园区排放达标</span>
        ) : (
          <span className="carbon-hud__tag carbon-hud__tag--warn">仍需改造</span>
        )}
      </div>

      <div className="carbon-hud__main">
        <span className="carbon-hud__label">总排放</span>
        <span className="carbon-hud__value">{state.totalEmission}</span>
        <span className="carbon-hud__unit">tCO₂e</span>
      </div>

      <div className="carbon-hud__target">
        <span>目标 ≤ {state.targetEmission} tCO₂e</span>
        <span>初始 {state.initialEmission}</span>
      </div>

      <div className="carbon-hud__bar" aria-hidden>
        <div className="carbon-hud__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
