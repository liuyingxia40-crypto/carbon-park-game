import type { CityGrade } from './cityRating';
import { meetsGrade } from './cityRating';
import type { ChainRates } from './economy';

export type TechCategory = 'energy' | 'eco' | 'industry';

export type TechId =
  | 'advanced_mining'
  | 'clean_combustion'
  | 'smart_grid'
  | 'carbon_capture'
  | 'green_circulation'
  | 'industrial_automation';

export type TechDef = {
  id: TechId;
  name: string;
  category: TechCategory;
  description: string;
  cost: { money: number; green: number };
  minGrade: CityGrade;
  requires?: TechId[];
  modifiers: {
    coalMult?: number;
    powerMult?: number;
    moneyMult?: number;
    pollutionMult?: number;
    greenMult?: number;
    efficiencyBonus?: number;
  };
};

export const TECH_TREE: Record<TechId, TechDef> = {
  advanced_mining: {
    id: 'advanced_mining',
    name: '先进采煤',
    category: 'industry',
    description: '煤矿产出 +25%',
    cost: { money: 1200, green: 0 },
    minGrade: 'D',
    modifiers: { coalMult: 1.25 },
  },
  clean_combustion: {
    id: 'clean_combustion',
    name: '清洁燃烧',
    category: 'energy',
    description: '火电厂污染 -20%',
    cost: { money: 1500, green: 5 },
    minGrade: 'C',
    requires: ['advanced_mining'],
    modifiers: { pollutionMult: 0.85 },
  },
  smart_grid: {
    id: 'smart_grid',
    name: '智能电网',
    category: 'energy',
    description: '发电效率 +15%',
    cost: { money: 1800, green: 8 },
    minGrade: 'C',
    modifiers: { powerMult: 1.15, efficiencyBonus: 0.05 },
  },
  carbon_capture: {
    id: 'carbon_capture',
    name: '碳捕捉',
    category: 'eco',
    description: '全场污染 -15%',
    cost: { money: 2000, green: 15 },
    minGrade: 'B',
    requires: ['clean_combustion'],
    modifiers: { pollutionMult: 0.85 },
  },
  green_circulation: {
    id: 'green_circulation',
    name: '绿色循环',
    category: 'eco',
    description: '绿色积分 +30%',
    cost: { money: 1400, green: 10 },
    minGrade: 'C',
    modifiers: { greenMult: 1.3 },
  },
  industrial_automation: {
    id: 'industrial_automation',
    name: '工业自动化',
    category: 'industry',
    description: '工业收入 +20%',
    cost: { money: 2500, green: 12 },
    minGrade: 'B',
    requires: ['smart_grid'],
    modifiers: { moneyMult: 1.2 },
  },
};

export type TechModifiers = {
  coalMult: number;
  powerMult: number;
  moneyMult: number;
  pollutionMult: number;
  greenMult: number;
  efficiencyBonus: number;
};

export function emptyModifiers(): TechModifiers {
  return {
    coalMult: 1,
    powerMult: 1,
    moneyMult: 1,
    pollutionMult: 1,
    greenMult: 1,
    efficiencyBonus: 0,
  };
}

export function computeTechModifiers(unlocked: Set<TechId>): TechModifiers {
  const m = emptyModifiers();
  for (const id of unlocked) {
    const t = TECH_TREE[id].modifiers;
    if (t.coalMult) m.coalMult *= t.coalMult;
    if (t.powerMult) m.powerMult *= t.powerMult;
    if (t.moneyMult) m.moneyMult *= t.moneyMult;
    if (t.pollutionMult) m.pollutionMult *= t.pollutionMult;
    if (t.greenMult) m.greenMult *= t.greenMult;
    if (t.efficiencyBonus) m.efficiencyBonus += t.efficiencyBonus;
  }
  return m;
}

export class TechSystem {
  unlocked = new Set<TechId>();

  canResearch(
    id: TechId,
    grade: CityGrade,
    money: number,
    green: number,
  ): { ok: boolean; reason?: string } {
    if (this.unlocked.has(id)) return { ok: false, reason: '已研究' };
    const t = TECH_TREE[id];
    if (!meetsGrade(grade, t.minGrade)) return { ok: false, reason: `需要评级 ${t.minGrade}` };
    if (t.requires?.some((r) => !this.unlocked.has(r))) {
      return { ok: false, reason: '需先完成前置科技' };
    }
    if (money < t.cost.money || green < t.cost.green) {
      return { ok: false, reason: '资源不足' };
    }
    return { ok: true };
  }

  research(id: TechId): TechModifiers {
    this.unlocked.add(id);
    return computeTechModifiers(this.unlocked);
  }

  getModifiers() {
    return computeTechModifiers(this.unlocked);
  }

  getUnlockedList(): TechId[] {
    return [...this.unlocked];
  }
}

export function applyModifiersToRates(rates: ChainRates, mods: TechModifiers): ChainRates {
  const r = { ...rates };
  if (r.coal > 0) r.coal *= mods.coalMult;
  if (r.power > 0) r.power *= mods.powerMult;
  if (r.power < 0) r.power /= mods.powerMult;
  if (r.money > 0) r.money *= mods.moneyMult;
  if (r.pollution > 0) r.pollution *= mods.pollutionMult;
  if (r.green > 0) r.green *= mods.greenMult;
  return r;
}
