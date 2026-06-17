import {
  complianceLabel,
  PHASE_LABEL,
  TARGET_EMISSION,
} from '../../game/story/phase1Script';
import { formatWanYuan } from '../../game/story/compliance';
import type { GameState } from '../../game/story/gameState';
import './TopStatusBar.css';

type Props = {
  state: GameState;
};

export function TopStatusBar({ state }: Props) {
  const compliance = complianceLabel(state.emission);

  return (
    <header className="story-topbar">
      <div className="story-topbar__pill">
        <span className="story-topbar__label">资金</span>
        <span className="story-topbar__value">{formatWanYuan(state.funds)}</span>
      </div>
      <div className="story-topbar__pill story-topbar__pill--emission">
        <span className="story-topbar__label">当前排放</span>
        <span className="story-topbar__value">
          {state.emission}
          <span className="story-topbar__target"> / {TARGET_EMISSION}</span>
        </span>
      </div>
      <div className="story-topbar__pill">
        <span className="story-topbar__label">生产收益</span>
        <span className="story-topbar__value">{state.revenue}</span>
      </div>
      <div
        className={`story-topbar__pill story-topbar__pill--compliance${
          compliance === '已达标' ? ' story-topbar__pill--ok' : ''
        }`}
      >
        <span className="story-topbar__label">合规</span>
        <span className="story-topbar__value">{compliance}</span>
      </div>
      <div className="story-topbar__pill story-topbar__pill--phase">
        <span className="story-topbar__label">阶段</span>
        <span className="story-topbar__value story-topbar__value--sm">{PHASE_LABEL}</span>
      </div>
    </header>
  );
}
