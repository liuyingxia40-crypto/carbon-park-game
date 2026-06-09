import type { CityGrade } from './cityRating';
import type { CityTier } from './cityGrowth';
import type { DevRoute } from './developmentRoute';

export type VictoryProgress = {
  achieved: boolean;
  progress: number;
  label: string;
  checklist: { id: string; label: string; done: boolean }[];
};

export function computeVictoryProgress(input: {
  grade: CityGrade;
  pollution: number;
  green: number;
  tier: CityTier;
  greenBuildingCount: number;
  devRoute: DevRoute | null;
  overLimitYears: number;
  hasZeroTower: boolean;
}): VictoryProgress {
  const checks = [
    { id: 'grade', label: '城市评级 S 级', done: input.grade === 'S' },
    { id: 'pollution', label: '污染指数 < 18', done: input.pollution < 18 },
    { id: 'green', label: '绿色积分 ≥ 60', done: input.green >= 60 },
    { id: 'buildings', label: '绿色工业建筑 ≥ 2', done: input.greenBuildingCount >= 2 },
    { id: 'tier', label: '智慧工业都市 (Tier 5)', done: input.tier >= 5 },
    { id: 'super', label: '建造零碳核心塔', done: input.hasZeroTower },
    { id: 'compliance', label: '无超排记录', done: input.overLimitYears === 0 },
    { id: 'route', label: '已选定发展路线', done: input.devRoute !== null },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const progress = Math.round((doneCount / checks.length) * 100);
  const achieved =
    input.grade === 'S' &&
    input.pollution < 18 &&
    input.green >= 60 &&
    input.greenBuildingCount >= 2 &&
    input.tier >= 5 &&
    input.hasZeroTower &&
    input.overLimitYears === 0;

  return {
    achieved,
    progress,
    label: achieved ? '零碳智慧工业城市 · 已达成' : `零碳智慧城 · ${progress}%`,
    checklist: checks,
  };
}
