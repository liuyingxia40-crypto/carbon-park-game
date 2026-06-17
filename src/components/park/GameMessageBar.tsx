import type { ParkState } from '../../game/parkBridge';
import './GameMessageBar.css';

type Props = {
  state: ParkState;
};

export function GameMessageBar({ state }: Props) {
  const lines = buildMessages(state);

  return (
    <footer className="game-msgbar">
      <span className="game-msgbar__icon" aria-hidden>
        ▶
      </span>
      <p className="game-msgbar__text">{lines.join('　·　')}</p>
    </footer>
  );
}

function buildMessages(state: ParkState): string[] {
  const msgs = ['点击地图上的旧工厂，查看低碳改造方案'];

  if (state.upgradedCount > 0) {
    msgs.push(`当前已完成 ${state.upgradedCount}/${state.totalFactories} 工厂改造`);
  } else {
    msgs.push('完成全部改造后，园区碳排放达标');
  }

  if (state.goalReached) {
    msgs.push('园区碳排放已达标，恭喜完成第一阶段！');
  }

  return msgs;
}
