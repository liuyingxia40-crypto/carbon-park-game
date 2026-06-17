import { TARGET_EMISSION, type DecisionOption, type StageId } from './phase1Script';

/** Display raw yuan as 万 with one decimal, e.g. 410000 → "41.0 万". */
export function formatWanYuan(amount: number): string {
  return `${(amount / 10_000).toFixed(1)} 万`;
}

export function carbonGapTon(emission: number): number {
  return Math.max(0, emission - TARGET_EMISSION);
}

export function isCarbonQuotaOption(option: DecisionOption): boolean {
  return option.name.includes('碳配额');
}

export function triggersComplianceFailure(option: DecisionOption, stageId: StageId): boolean {
  if (stageId === 'retrofit' || stageId === 'deep_opt') return true;
  return isCarbonQuotaOption(option);
}
