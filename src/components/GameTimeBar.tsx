import { gameBridge } from '../game/bridge';
import type { GameTimeSpeed, GameTimeState } from '../game/timeSystem';

const SPEEDS: { speed: GameTimeSpeed; label: string }[] = [
  { speed: 0, label: '暂停' },
  { speed: 1, label: '1x' },
  { speed: 2, label: '2x' },
  { speed: 4, label: '4x' },
];

const QUARTER_LABELS: Record<GameTimeState['quarter'], string> = {
  1: '第一季度',
  2: '第二季度',
  3: '第三季度',
  4: '第四季度',
};

type Props = {
  time: GameTimeState;
};

export function GameTimeBar({ time }: Props) {
  return (
    <div className="game-time-bar">
      <div className="game-time-bar__clock">
        <span className="game-time-bar__year">第 {time.year} 年</span>
        <span className="game-time-bar__quarter">{QUARTER_LABELS[time.quarter]}</span>
        <span className="game-time-bar__day">
          第 {time.day} 日
          <em> / {time.daysPerYear}</em>
        </span>
        {time.yearEndPending && <span className="game-time-bar__pending">年度结算中</span>}
      </div>

      <div className="game-time-bar__progress" title={`年度进度 ${Math.floor(time.yearProgress * 100)}%`}>
        <div className="game-time-bar__year-track">
          <div
            className="game-time-bar__year-fill"
            style={{ width: `${Math.min(100, time.yearProgress * 100)}%` }}
          />
        </div>
        <div className="game-time-bar__quarters" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="game-time-bar__controls">
        {SPEEDS.map(({ speed, label }) => (
          <button
            key={speed}
            type="button"
            className={`game-time-bar__speed${time.speed === speed ? ' game-time-bar__speed--active' : ''}`}
            onClick={() => gameBridge.setTimeSpeed(speed)}
            aria-pressed={time.speed === speed}
          >
            {label}
          </button>
        ))}
        <span className="game-time-bar__hint">
          1x ≈ 1 秒/日 · 全年约 {Math.round(time.realMinutesPerYearAt1x)} 分钟
        </span>
      </div>
    </div>
  );
}
