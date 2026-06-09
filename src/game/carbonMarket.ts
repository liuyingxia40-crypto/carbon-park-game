/** 碳交易：绿色积分抵消排放、解锁高级工业 */
export const CREDIT_PER_EMISSION_UNIT = 12;
export const EMISSION_OFFSET_PER_TRADE = 22;
export const POLLUTION_REDUCE_PER_TRADE = 5;
export const ADVANCED_UNLOCK_GREEN = 40;
export const YEAR_OVERFLOW_CREDIT_RATE = 10;

export type CarbonMarketState = {
  totalTrades: number;
  advancedUnlocked: boolean;
};

export function emissionUnitsFromGreen(green: number): number {
  return Math.floor(green / CREDIT_PER_EMISSION_UNIT);
}

export function greenCostForEmission(units: number): number {
  return units * CREDIT_PER_EMISSION_UNIT;
}

export function greenCostForOverflow(overflow: number): number {
  return Math.ceil(overflow / EMISSION_OFFSET_PER_TRADE) * YEAR_OVERFLOW_CREDIT_RATE;
}

export function canUnlockAdvancedIndustry(green: number, advancedUnlocked: boolean): boolean {
  return !advancedUnlocked && green >= ADVANCED_UNLOCK_GREEN;
}
