import type { CityGrade } from './cityRating';
import { gradeIndex } from './cityRating';

export type CityTier = 0 | 1 | 2 | 3 | 4 | 5;

const TIER_LABELS: Record<CityTier, string> = {
  0: '初创园区',
  1: '成长工业城',
  2: '区域工业枢纽',
  3: '智慧工业都市',
  4: '高速工业走廊',
  5: '零碳智慧港城',
};

export function getCityTier(
  buildingCount: number,
  grade: CityGrade,
  lifetimeIncome: number,
): CityTier {
  let score = buildingCount;
  score += gradeIndex(grade) * 2;
  if (lifetimeIncome > 5000) score += 1;
  if (lifetimeIncome > 15000) score += 2;
  if (lifetimeIncome > 35000) score += 2;

  if (score >= 20) return 5;
  if (score >= 16) return 4;
  if (score >= 12) return 3;
  if (score >= 7) return 2;
  if (score >= 3) return 1;
  return 0;
}

export function tierBuildingScale(tier: CityTier): number {
  return 0.9 + tier * 0.035;
}

export function tierLabel(tier: CityTier): string {
  return TIER_LABELS[tier];
}
