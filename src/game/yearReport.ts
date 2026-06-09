import type { CityGrade } from './cityRating';
import { GRADE_LABELS } from './cityRating';
import type { MetricsSeries } from './metricsHistory';

export type GreenTransitionTrend = 'rising' | 'stable' | 'declining';
export type PollutionTrend = 'improving' | 'worsening' | 'stable';

export type YearReport = {
  year: number;
  income: number;
  powerSupply: number;
  totalEmission: number;
  emissionLimit: number;
  overflow: number;
  greenPoints: number;
  greenEarned: number;
  pollution: number;
  cityGrade: CityGrade;
  verdict: string;
  developmentComment: string;
  citySummary: string;
  greenTransitionTrend: GreenTransitionTrend;
  pollutionTrend: PollutionTrend;
  score: number;
  chartSnapshot?: MetricsSeries;
};

export type YearStatsSnapshot = {
  yearIncome: number;
  yearGreenEarned: number;
  peakPower: number;
};

export function createEmptyYearStats(): YearStatsSnapshot {
  return { yearIncome: 0, yearGreenEarned: 0, peakPower: 0 };
}

export function buildYearReport(input: {
  year: number;
  stats: YearStatsSnapshot;
  totalEmission: number;
  emissionLimit: number;
  greenPoints: number;
  pollution: number;
  cityGrade: CityGrade;
  overLimit: boolean;
  greenTrend?: GreenTransitionTrend;
  pollutionTrend?: PollutionTrend;
  chartSnapshot?: MetricsSeries;
}): YearReport {
  const overflow = Math.max(0, input.totalEmission - input.emissionLimit);
  const score = computeYearScore(input);
  const verdict = pickVerdict(score, input.cityGrade, overflow, input.pollution);
  const developmentComment = pickDevelopmentComment(
    input.stats.yearIncome,
    input.stats.yearGreenEarned,
    overflow,
    input.cityGrade,
  );
  const greenTransitionTrend = input.greenTrend ?? 'stable';
  const pollutionTrend = input.pollutionTrend ?? 'stable';
  const citySummary = buildCitySummary(
    input.cityGrade,
    greenTransitionTrend,
    pollutionTrend,
    overflow,
    input.pollution,
  );

  return {
    year: input.year,
    income: Math.floor(input.stats.yearIncome),
    powerSupply: Math.floor(input.stats.peakPower),
    totalEmission: Math.floor(input.totalEmission),
    emissionLimit: input.emissionLimit,
    overflow: Math.floor(overflow),
    greenPoints: Math.floor(input.greenPoints),
    greenEarned: Math.floor(input.stats.yearGreenEarned),
    pollution: Math.floor(input.pollution),
    cityGrade: input.cityGrade,
    verdict,
    developmentComment,
    citySummary,
    greenTransitionTrend,
    pollutionTrend,
    score,
    chartSnapshot: input.chartSnapshot,
  };
}

function buildCitySummary(
  grade: CityGrade,
  greenTrend: GreenTransitionTrend,
  pollutionTrend: PollutionTrend,
  overflow: number,
  pollution: number,
): string {
  if (grade === 'S' && pollution < 20) {
    return '您的城市已进入零碳智慧工业示范阶段，具备企业级展示与传播价值。';
  }
  if (greenTrend === 'rising' && pollutionTrend === 'improving') {
    return '你的城市正在向零碳工业转型，绿色资产积累与环境质量同步改善。';
  }
  if (greenTrend === 'rising') {
    return '你的城市正在向零碳工业转型，绿色积分持续增长，建议继续扩大绿电与回收产能。';
  }
  if (overflow > 0) {
    return '工业产能扩张较快，碳排放压力上升，宜通过碳交易与绿色投资平衡增长与环境。';
  }
  if (pollutionTrend === 'worsening') {
    return '污染指数呈上升趋势，需关注排放上限并布局绿色工业设施。';
  }
  return '城市工业经济稳步运行，可在收益与绿色转型之间继续优化布局。';
}

export function greenTrendLabel(t: GreenTransitionTrend): string {
  if (t === 'rising') return '绿色转型加速 ↑';
  if (t === 'declining') return '绿分增长放缓 ↓';
  return '绿色指标平稳 →';
}

export function pollutionTrendLabel(t: PollutionTrend): string {
  if (t === 'improving') return '环境质量改善 ↑';
  if (t === 'worsening') return '污染压力上升 ↓';
  return '环境指标平稳 →';
}

function computeYearScore(input: {
  stats: YearStatsSnapshot;
  totalEmission: number;
  emissionLimit: number;
  pollution: number;
  cityGrade: CityGrade;
}): number {
  let s = 50;
  s += Math.min(25, input.stats.yearIncome / 400);
  s += Math.min(15, input.stats.yearGreenEarned * 0.8);
  if (input.totalEmission <= input.emissionLimit) s += 20;
  else s -= Math.min(25, (input.totalEmission - input.emissionLimit) * 0.3);
  s -= Math.min(20, input.pollution * 0.2);
  const gradeBonus: Record<CityGrade, number> = { D: 0, C: 4, B: 8, A: 12, S: 18 };
  s += gradeBonus[input.cityGrade];
  return Math.max(0, Math.min(100, Math.round(s)));
}

function pickVerdict(score: number, grade: CityGrade, overflow: number, pollution: number): string {
  if (grade === 'S' && pollution < 20) return '卓越 · 零碳工业典范';
  if (score >= 85 && overflow === 0) return '优秀 · 绿色工业稳步前行';
  if (score >= 70) return '良好 · 产能与环境基本平衡';
  if (score >= 50) return '合格 · 需加强减排与绿电投入';
  if (overflow > 30) return '警示 · 碳排放严重超标';
  return '待改进 · 工业增长代价过高';
}

function pickDevelopmentComment(
  income: number,
  greenEarned: number,
  overflow: number,
  grade: CityGrade,
): string {
  if (grade === 'S') {
    return '城市已形成碳中和示范格局，可向智慧零碳都市迈进。';
  }
  if (greenEarned > income * 0.15 && overflow === 0) {
    return '绿色转型成效显著，建议扩大光伏与回收产能。';
  }
  if (income > 8000 && overflow > 0) {
    return '重工业拉动收入，但环境成本攀升，宜投资碳交易与绿电。';
  }
  if (overflow > 0) {
    return '本年度超排，可通过绿色积分抵消或缴纳罚款，并调整发展路线。';
  }
  return `当前评级「${GRADE_LABELS[grade]}」，继续优化产业链与年度排放控制。`;
}
