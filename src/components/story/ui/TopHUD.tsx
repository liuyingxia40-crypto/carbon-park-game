import { formatWanYuan } from '../../../game/story/compliance';
import type { GameState } from '../../../game/story/gameState';
import {
  INITIAL_EMISSION,
  stageIndex,
  TARGET_EMISSION,
} from '../../../game/story/phase1Script';
import { ResourcePill } from './ResourcePill';
import './game-ui.css';

type Props = {
  state: GameState;
};

function computeLevel(state: GameState): number {
  const base = 10;
  const stageBonus = stageIndex(state.stageId);
  const retrofitBonus = state.initialRetrofitDone.length;
  const deepBonus = state.deepOptimizedFactory ? 2 : 0;
  return base + stageBonus + retrofitBonus + deepBonus;
}

function computeXpPercent(state: GameState): number {
  const stage = stageIndex(state.stageId);
  const stagePart = (stage / 5) * 55;
  const retrofitPart = (state.initialRetrofitDone.length / 3) * 30;
  const deepPart = state.deepOptimizedFactory ? 15 : 0;
  return Math.min(100, Math.round(stagePart + retrofitPart + deepPart));
}

function computeDay(state: GameState): number {
  const stage = stageIndex(state.stageId);
  return 16 + stage * 12 + state.initialRetrofitDone.length * 8 + state.choices.length * 2;
}

export function TopHUD({ state }: Props) {
  const level = computeLevel(state);
  const xp = computeXpPercent(state);
  const day = computeDay(state);

  return (
    <header className="top-hud" aria-label="资源栏">
      <div className="top-hud__row">
        <div className="top-hud__level-block">
          <span className="top-hud__level-badge">等级 {level}</span>
          <div className="top-hud__xp">
            <span className="top-hud__xp-label">园区经验</span>
            <div className="top-hud__xp-track" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={100}>
              <div className="top-hud__xp-fill" style={{ width: `${xp}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="top-hud__row">
        <div className="top-hud__resources">
          <ResourcePill kind="money" label="资金" value={formatWanYuan(state.funds)} />
          <ResourcePill
            kind="carbon"
            label="碳排放"
            value={`${state.emission} tCO₂e · ≤${TARGET_EMISSION}`}
          />
          <ResourcePill kind="power" label="电力" value={`${state.powerPercent}%`} />
          <ResourcePill kind="time" label="天数" value={`第${day}天`} />
        </div>
      </div>
    </header>
  );
}

export { INITIAL_EMISSION, TARGET_EMISSION };
