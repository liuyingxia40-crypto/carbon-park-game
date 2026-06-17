import type { ChainRates } from './economy';
import {
  computeCityGrade,
  dropGrade,
  type CityGrade,
} from './cityRating';
import type { Resources } from './economy';
import {
  ADVANCED_UNLOCK_GREEN,
  greenCostForOverflow,
} from './carbonMarket';
import type { MetricsSeries } from './metricsHistory';
import { GAME_DAYS_PER_YEAR } from './timeSystem';
import type { GreenTransitionTrend, PollutionTrend } from './yearReport';
import {
  buildYearReport,
  createEmptyYearStats,
  type YearReport,
  type YearStatsSnapshot,
} from './yearReport';

export type YearReportContext = {
  greenTrend: GreenTransitionTrend;
  pollutionTrend: PollutionTrend;
  chartSnapshot: MetricsSeries;
};

export const BASE_EMISSION_LIMIT = 70;
export const LIMIT_GROWTH_PER_YEAR = 18;
/** 超排：按游戏日罚款（原每秒数值，现每日结算一次） */
export const OVER_LIMIT_FINE_PER_DAY = 35;
export const YEAR_END_FINE_PER_UNIT = 8;

export const GREEN_OFFSET_COST = 10;
export const GREEN_OFFSET_EMISSION = 18;
export const GREEN_OFFSET_POLLUTION = 4;

export const ECO_UPGRADE_MONEY = 600;
export const ECO_UPGRADE_GREEN = 12;
export const ECO_UPGRADE_MAX = 3;
export const ECO_UPGRADE_POLLUTION_REDUCTION = 1;

export type CarbonState = {
  year: number;
  yearProgress: number;
  yearEmission: number;
  yearLimit: number;
  isOverLimit: boolean;
  cityGrade: CityGrade;
  ecoUpgradeLevel: number;
  overLimitYears: number;
  lifetimeIncome: number;
  yearIncome: number;
  advancedUnlocked: boolean;
  pendingReport: YearReport | null;
  pendingOverflow: number;
};

export function getYearEmissionLimit(year: number): number {
  return BASE_EMISSION_LIMIT + (year - 1) * LIMIT_GROWTH_PER_YEAR;
}

export class CarbonSystem {
  year = 1;
  yearElapsedDays = 0;
  yearEmission = 0;
  ecoUpgradeLevel = 0;
  overLimitYears = 0;
  lifetimeIncome = 0;
  cityGrade: CityGrade = 'D';
  advancedUnlocked = false;
  pendingReport: YearReport | null = null;
  pendingOverflow = 0;

  private penalizedThisYear = false;
  private yearStats: YearStatsSnapshot = createEmptyYearStats();
  private reportContext: YearReportContext | null = null;

  setReportContext(ctx: YearReportContext) {
    this.reportContext = ctx;
  }

  getYearLimit() {
    return getYearEmissionLimit(this.year);
  }

  getState(yearProgress: number): CarbonState {
    const limit = this.getYearLimit();
    return {
      year: this.year,
      yearProgress,
      yearEmission: Math.floor(this.yearEmission),
      yearLimit: limit,
      isOverLimit: this.yearEmission > limit,
      cityGrade: this.cityGrade,
      ecoUpgradeLevel: this.ecoUpgradeLevel,
      overLimitYears: this.overLimitYears,
      lifetimeIncome: this.lifetimeIncome,
      yearIncome: Math.floor(this.yearStats.yearIncome),
      advancedUnlocked: this.advancedUnlocked,
      pendingReport: this.pendingReport,
      pendingOverflow: this.pendingOverflow,
    };
  }

  recordTick(resources: Resources, rates: ChainRates) {
    if (rates.money > 0) {
      this.yearStats.yearIncome += rates.money;
      this.lifetimeIncome += rates.money;
    }
    if (rates.green > 0) this.yearStats.yearGreenEarned += rates.green;
    this.yearStats.peakPower = Math.max(this.yearStats.peakPower, resources.power);
  }

  /** 每日结算：累计排放、超排罚款，年末生成报告（不立即跳年） */
  tickDay(resources: Resources, rates: ChainRates): {
    resources: Resources;
    messages: string[];
    yearEnded: boolean;
  } {
    const messages: string[] = [];
    let res = { ...resources };

    this.recordTick(res, rates);

    const emissionRate = Math.max(0, rates.pollution);
    const passiveOffset = res.green >= 20 ? Math.min(2, emissionRate * 0.25) : res.green >= 8 ? 1 : 0;
    const netEmission = Math.max(0, emissionRate - passiveOffset);

    this.yearEmission += netEmission;

    const limit = this.getYearLimit();
    if (this.yearEmission > limit) {
      res.money = Math.max(0, res.money - OVER_LIMIT_FINE_PER_DAY);
      if (!this.penalizedThisYear) {
        this.penalizedThisYear = true;
        this.cityGrade = dropGrade(this.cityGrade);
        messages.push(`超排处罚：评级降至 ${this.cityGrade}，每日罚款 ¥${OVER_LIMIT_FINE_PER_DAY}`);
      }
    }

    if (res.green >= ADVANCED_UNLOCK_GREEN) {
      this.advancedUnlocked = true;
    }

    this.yearElapsedDays += 1;
    let yearEnded = false;
    if (this.yearElapsedDays >= GAME_DAYS_PER_YEAR) {
      const ended = this.endYear(res);
      res = ended.resources;
      messages.push(...ended.messages);
      yearEnded = true;
    }

    this.cityGrade = computeCityGrade({
      lifetimeIncome: this.lifetimeIncome,
      pollution: res.pollution,
      green: res.green,
      overLimitYears: this.overLimitYears,
    });

    return { resources: res, messages, yearEnded };
  }

  /** 年度报告归档后进入新一年 */
  beginNextYear() {
    this.year += 1;
    this.yearEmission = 0;
    this.yearElapsedDays = 0;
    this.penalizedThisYear = false;
    this.yearStats = createEmptyYearStats();
  }

  private endYear(res: Resources): { resources: Resources; messages: string[] } {
    const messages: string[] = [];
    let resources = { ...res };
    const limit = this.getYearLimit();
    const overflow = Math.max(0, this.yearEmission - limit);

    const report = buildYearReport({
      year: this.year,
      stats: this.yearStats,
      totalEmission: this.yearEmission,
      emissionLimit: limit,
      greenPoints: resources.green,
      pollution: resources.pollution,
      cityGrade: this.cityGrade,
      overLimit: overflow > 0,
      greenTrend: this.reportContext?.greenTrend,
      pollutionTrend: this.reportContext?.pollutionTrend,
      chartSnapshot: this.reportContext?.chartSnapshot,
    });

    this.pendingReport = report;
    this.pendingOverflow = Math.floor(overflow);

    if (overflow > 0) {
      this.overLimitYears += 1;
      messages.push(
        `第 ${this.year} 年结算：超排 ${Math.floor(overflow)} 单位 · 请处理碳交易或缴纳罚款`,
      );
    } else {
      messages.push(`第 ${this.year} 年达标 · 年度工业报告已生成`);
    }

    messages.push(`第 ${this.year} 年已结束 · 请查阅年度工业报告`);
    return { resources, messages };
  }

  /** 年末：用绿色积分抵消超排（不罚款、不降级） */
  settleOverflowWithCredits(res: Resources): {
    ok: boolean;
    resources: Resources;
    message: string;
  } {
    if (this.pendingOverflow <= 0) {
      return { ok: false, resources: res, message: '无待处理超排' };
    }
    const cost = greenCostForOverflow(this.pendingOverflow);
    if (res.green < cost) {
      return {
        ok: false,
        resources: res,
        message: `绿色积分不足（需要 ${cost}，当前 ${Math.floor(res.green)}）`,
      };
    }
    this.pendingOverflow = 0;
    this.pendingReport = null;
    if (this.overLimitYears > 0) this.overLimitYears -= 1;
    return {
      ok: true,
      resources: { ...res, green: res.green - cost },
      message: `碳交易抵消：消耗 ${cost} 绿色积分，免除本年超排罚款`,
    };
  }

  /** 年末：缴纳罚款并关闭报告 */
  settleOverflowWithFine(res: Resources): {
    ok: boolean;
    resources: Resources;
    message: string;
  } {
    if (this.pendingOverflow <= 0) {
      this.dismissReport();
      return { ok: true, resources: res, message: '年度报告已归档' };
    }
    const fine = Math.floor(this.pendingOverflow * YEAR_END_FINE_PER_UNIT);
    this.pendingOverflow = 0;
    this.pendingReport = null;
    this.cityGrade = dropGrade(this.cityGrade);
    return {
      ok: true,
      resources: { ...res, money: Math.max(0, res.money - fine) },
      message: `已缴纳超排罚款 ¥${fine}，评级 ${this.cityGrade}`,
    };
  }

  dismissReport() {
    this.pendingReport = null;
    this.pendingOverflow = 0;
  }

  spendGreenOffset(res: Resources): { ok: boolean; resources: Resources; message: string } {
    if (res.green < GREEN_OFFSET_COST) {
      return { ok: false, resources: res, message: `绿色积分不足（需要 ${GREEN_OFFSET_COST}）` };
    }
    return {
      ok: true,
      resources: {
        ...res,
        green: res.green - GREEN_OFFSET_COST,
        pollution: Math.max(0, res.pollution - GREEN_OFFSET_POLLUTION),
      },
      message: `碳抵消：-${GREEN_OFFSET_EMISSION} 年度排放，-${GREEN_OFFSET_POLLUTION} 污染`,
    };
  }

  applyGreenOffsetEmission() {
    this.yearEmission = Math.max(0, this.yearEmission - GREEN_OFFSET_EMISSION);
  }

  reduceYearEmission(amount: number) {
    this.yearEmission = Math.max(0, this.yearEmission - amount);
  }

  buyEcoUpgrade(res: Resources): { ok: boolean; resources: Resources; message: string } {
    if (this.ecoUpgradeLevel >= ECO_UPGRADE_MAX) {
      return { ok: false, resources: res, message: '环保升级已达最高等级' };
    }
    if (res.money < ECO_UPGRADE_MONEY || res.green < ECO_UPGRADE_GREEN) {
      return {
        ok: false,
        resources: res,
        message: `需要 ¥${ECO_UPGRADE_MONEY} + ${ECO_UPGRADE_GREEN} 绿色积分`,
      };
    }
    this.ecoUpgradeLevel += 1;
    return {
      ok: true,
      resources: {
        ...res,
        money: res.money - ECO_UPGRADE_MONEY,
        green: res.green - ECO_UPGRADE_GREEN,
      },
      message: `环保升级 Lv.${this.ecoUpgradeLevel}：全场污染 -${ECO_UPGRADE_POLLUTION_REDUCTION}/日`,
    };
  }

  getEcoPollutionReduction(): number {
    return this.ecoUpgradeLevel * ECO_UPGRADE_POLLUTION_REDUCTION;
  }
}
