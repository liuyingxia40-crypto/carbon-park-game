export type CityGrade = 'D' | 'C' | 'B' | 'A' | 'S';

const GRADE_ORDER: CityGrade[] = ['D', 'C', 'B', 'A', 'S'];

export function gradeIndex(g: CityGrade): number {
  return GRADE_ORDER.indexOf(g);
}

export function dropGrade(g: CityGrade): CityGrade {
  const i = gradeIndex(g);
  return GRADE_ORDER[Math.max(0, i - 1)];
}

export function meetsGrade(current: CityGrade, required: CityGrade): boolean {
  return gradeIndex(current) >= gradeIndex(required);
}

/** 根据经营与环境指标计算城市评级 */
export function computeCityGrade(input: {
  lifetimeIncome: number;
  pollution: number;
  green: number;
  overLimitYears: number;
}): CityGrade {
  let score = 20;
  score += Math.min(35, input.lifetimeIncome / 350);
  score += Math.min(25, input.green * 1.2);
  score -= Math.min(30, input.pollution * 0.35);
  score -= input.overLimitYears * 12;

  if (score >= 72) return 'S';
  if (score >= 58) return 'A';
  if (score >= 42) return 'B';
  if (score >= 28) return 'C';
  return 'D';
}

export const GRADE_LABELS: Record<CityGrade, string> = {
  D: '污染城市',
  C: '工业城镇',
  B: '绿色园区',
  A: '生态工业城',
  S: '碳中和示范区',
};
