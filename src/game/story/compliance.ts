import {
  DEEP_OPTIONS,
  TARGET_EMISSION,
  allInitialRetrofitDone,
  type DecisionOption,
  type FactoryId,
  type StageId,
} from './phase1Script';

export type FailureReason = 'second_round_funds' | 'compliance';

/** Display raw yuan as 万 with one decimal, e.g. 410000 → "41.0 万". */
export function formatWanYuan(amount: number): string {
  const wan = amount / 10_000;
  return Number.isInteger(wan) ? `${wan} 万` : `${wan.toFixed(1)} 万`;
}

/** 方案卡醒目费用，如 300000 → "¥ 30万". */
export function formatCardCostYuan(amount: number): string {
  if (amount <= 0) return '¥ 0';
  const wan = amount / 10_000;
  const text = Number.isInteger(wan) ? `${wan}` : wan.toFixed(1);
  return `¥ ${text}万`;
}

export function carbonGapTon(emission: number): number {
  return Math.max(0, emission - TARGET_EMISSION);
}

export function isCarbonQuotaOption(option: DecisionOption): boolean {
  return option.name.includes('碳配额');
}

/** 第二轮（深度优化）最低所需资金 */
export function getSecondRoundMinCost(): number {
  return Math.min(...Object.values(DEEP_OPTIONS).map((o) => o.cost));
}

/**
 * 第一轮三家工厂初改全部完成后，若资金低于第二轮任一深度优化方案，则游戏失败。
 */
export function shouldFailAfterRoundOne(state: {
  stageId: StageId;
  funds: number;
  initialRetrofitDone: FactoryId[];
  deepOptimizedFactory: FactoryId | null;
}): boolean {
  if (!allInitialRetrofitDone(state.initialRetrofitDone)) return false;
  if (state.deepOptimizedFactory) return false;
  if (state.stageId === 'diagnosis' || state.stageId === 'retrofit' || state.stageId === 'report') {
    return false;
  }
  return state.funds < getSecondRoundMinCost();
}

export function triggersComplianceFailure(option: DecisionOption, stageId: StageId): boolean {
  if (stageId === 'retrofit') return false;
  if (stageId === 'deep_opt') return true;
  return isCarbonQuotaOption(option);
}
