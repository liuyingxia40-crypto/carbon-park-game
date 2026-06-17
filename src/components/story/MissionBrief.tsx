import type { GameState } from '../../game/story/gameState';
import { getMissionBrief } from './GameHeader';
import './MissionBrief.css';

type Props = {
  state: GameState;
  statusMessage?: string;
};

export function MissionBrief({ state, statusMessage }: Props) {
  const brief = getMissionBrief(state);
  const actionLine = statusMessage ?? brief.nextStep;

  return (
    <aside className="mission-brief" role="complementary" aria-label="任务提示">
      <div className="mission-brief__avatar" aria-hidden>
        <span className="mission-brief__avatar-icon">CB</span>
      </div>
      <div className="mission-brief__lines">
        <p className="mission-brief__problem">{brief.problem}</p>
        <p className="mission-brief__action">
          <span className="mission-brief__action-mark" aria-hidden>▸</span>
          {actionLine}
        </p>
      </div>
    </aside>
  );
}
