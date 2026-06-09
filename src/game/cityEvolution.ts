import type { CityGrade } from './cityRating';
import { gradeIndex } from './cityRating';
import type { CityTier } from './cityGrowth';

/** 城市蜕变阶段：污染工业 → 未来绿色文明 */
export type EvolutionPhase = 0 | 1 | 2 | 3 | 4;

const PHASE_LABELS: Record<EvolutionPhase, string> = {
  0: '老旧工业区',
  1: '成长工业城',
  2: '转型工业园',
  3: '智慧绿色园区',
  4: '未来绿色工业文明',
};

export function getEvolutionPhase(input: {
  tier: CityTier;
  grade: CityGrade;
  pollution: number;
  greenBuildingRatio: number;
  superCount: number;
}): EvolutionPhase {
  let phase: EvolutionPhase = 0;
  if (input.tier >= 1 || input.greenBuildingRatio > 0.15) phase = 1;
  if (input.tier >= 2 || gradeIndex(input.grade) >= 2) phase = 2;
  if (
    (input.tier >= 3 && input.pollution < 45) ||
    input.greenBuildingRatio > 0.35 ||
    input.superCount >= 1
  ) {
    phase = 3;
  }
  if (
    (input.tier >= 4 && gradeIndex(input.grade) >= 3 && input.pollution < 28) ||
    (input.superCount >= 2 && input.pollution < 35)
  ) {
    phase = 4;
  }
  return phase;
}

export function evolutionLabel(phase: EvolutionPhase): string {
  return PHASE_LABELS[phase];
}

/** 地图调色板插值系数 0=灰暗工业 1=未来绿 */
export function evolutionGreenT(phase: EvolutionPhase): number {
  return [0, 0.2, 0.45, 0.7, 0.92][phase];
}
