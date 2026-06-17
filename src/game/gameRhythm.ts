/** 游戏节奏：前期扩张 · 中期压力 · 后期绿色智慧 */
export type RhythmPhase = 'early' | 'mid' | 'late';

export type RhythmMods = {
  phase: RhythmPhase;
  moneyMult: number;
  buildCostMult: number;
  greenMult: number;
  label: string;
};

export function getRhythmMods(buildingCount: number, lifetimeIncome: number): RhythmMods {
  if (buildingCount <= 3 && lifetimeIncome < 6000) {
    return {
      phase: 'early',
      moneyMult: 1.25,
      buildCostMult: 0.88,
      greenMult: 1,
      label: '快速扩张期 · 收益加成',
    };
  }
  if (buildingCount >= 10 || lifetimeIncome >= 25000) {
    return {
      phase: 'late',
      moneyMult: 1,
      buildCostMult: 1.08,
      greenMult: 1.2,
      label: '绿色转型期 · 绿分加成',
    };
  }
  return {
    phase: 'mid',
    moneyMult: 1,
    buildCostMult: 1,
    greenMult: 1,
    label: '资源平衡期 · 产业链压力',
  };
}
