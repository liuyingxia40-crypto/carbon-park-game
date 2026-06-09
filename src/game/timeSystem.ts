/** 1x：1 真实秒 ≈ 1 游戏日 */
export const MS_PER_GAME_DAY_AT_1X = 1000;

/** 1200 日/年 → 约 20 分钟/年（1x），落在 15~25 分钟区间 */
export const GAME_DAYS_PER_YEAR = 1200;

export const GAME_DAYS_PER_QUARTER = GAME_DAYS_PER_YEAR / 4;

export type GameTimeSpeed = 0 | 1 | 2 | 4;

export type GameTimeState = {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  day: number;
  yearProgress: number;
  dayProgress: number;
  speed: GameTimeSpeed;
  speedLabel: string;
  paused: boolean;
  yearEndPending: boolean;
  daysPerYear: number;
  realMinutesPerYearAt1x: number;
};

export class GameTimeSystem {
  year = 1;
  private daysCompletedInYear = 0;
  private dayProgress = 0;
  private speed: GameTimeSpeed = 1;
  private frozen = false;

  setSpeed(speed: GameTimeSpeed) {
    this.speed = speed;
  }

  getSpeed(): GameTimeSpeed {
    return this.speed;
  }

  isYearEndPending(): boolean {
    return this.frozen;
  }

  /** 年末报告处理完毕后进入新一年 */
  advanceYear() {
    if (!this.frozen) return;
    this.year += 1;
    this.daysCompletedInYear = 0;
    this.dayProgress = 0;
    this.frozen = false;
  }

  freezeAtYearEnd() {
    this.frozen = true;
    this.daysCompletedInYear = GAME_DAYS_PER_YEAR;
    this.dayProgress = 0;
  }

  /**
   * 推进模拟时钟，返回本帧内完成的「整天」数量（用于每日结算）。
   */
  advance(deltaMs: number): number {
    if (this.speed === 0 || this.frozen) return 0;

    const rate = (deltaMs / MS_PER_GAME_DAY_AT_1X) * this.speed;
    let completed = 0;
    this.dayProgress += rate;

    while (this.dayProgress >= 1 && !this.frozen) {
      this.dayProgress -= 1;
      this.daysCompletedInYear += 1;
      completed += 1;

      if (this.daysCompletedInYear >= GAME_DAYS_PER_YEAR) {
        this.freezeAtYearEnd();
        break;
      }
    }

    return completed;
  }

  getYearProgress(): number {
    if (this.frozen) return 1;
    return Math.min(1, (this.daysCompletedInYear + this.dayProgress) / GAME_DAYS_PER_YEAR);
  }

  getState(): GameTimeState {
    const yearEndPending = this.frozen;
    const day = yearEndPending
      ? GAME_DAYS_PER_YEAR
      : Math.min(GAME_DAYS_PER_YEAR, this.daysCompletedInYear + 1);
    const quarter = Math.min(
      4,
      Math.floor((day - 1) / GAME_DAYS_PER_QUARTER) + 1,
    ) as 1 | 2 | 3 | 4;

    return {
      year: this.year,
      quarter,
      day,
      yearProgress: this.getYearProgress(),
      dayProgress: yearEndPending ? 1 : this.dayProgress,
      speed: this.speed,
      speedLabel: this.speed === 0 ? '暂停' : `${this.speed}x`,
      paused: this.speed === 0,
      yearEndPending,
      daysPerYear: GAME_DAYS_PER_YEAR,
      realMinutesPerYearAt1x: (GAME_DAYS_PER_YEAR * MS_PER_GAME_DAY_AT_1X) / 60_000,
    };
  }
}
