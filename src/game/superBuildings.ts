import { meetsGrade, type CityGrade } from './cityRating';
import type { ChainRates } from './economy';

export type SuperBuildingId =
  | 'carbon_exchange'
  | 'zero_carbon_tower'
  | 'smart_industry_core'
  | 'mega_storage';

export type SuperGlobalMods = {
  moneyMult: number;
  pollutionPerSec: number;
  greenPerSec: number;
  powerProdMult: number;
  efficiencyBonus: number;
  emissionReducePerSec: number;
};

export type SuperBuildingDef = {
  id: SuperBuildingId;
  name: string;
  cost: number;
  tilesW: number;
  tilesH: number;
  textureKey: string;
  description: string;
  minGrade: CityGrade;
  minGreen: number;
  rates: ChainRates;
  global: SuperGlobalMods;
};

export const SUPER_BUILDINGS: Record<SuperBuildingId, SuperBuildingDef> = {
  carbon_exchange: {
    id: 'carbon_exchange',
    name: '全球碳交易中心',
    cost: 15000,
    tilesW: 4,
    tilesH: 3,
    textureKey: 'bld_carbon_exchange',
    description: '碳经济枢纽 · 全局收益与减排',
    minGrade: 'A',
    minGreen: 80,
    rates: { money: 45, power: -8, pollution: -4, green: 6, coal: 0 },
    global: { moneyMult: 1.08, pollutionPerSec: -2, greenPerSec: 2, powerProdMult: 1, efficiencyBonus: 0, emissionReducePerSec: 3 },
  },
  zero_carbon_tower: {
    id: 'zero_carbon_tower',
    name: '零碳核心塔',
    cost: 22000,
    tilesW: 3,
    tilesH: 4,
    textureKey: 'bld_zero_tower',
    description: '终局绿塔 · 强力净化与绿分',
    minGrade: 'S',
    minGreen: 100,
    rates: { money: 28, power: 20, pollution: -18, green: 14, coal: 0 },
    global: { moneyMult: 1.05, pollutionPerSec: -5, greenPerSec: 4, powerProdMult: 1.1, efficiencyBonus: 0.02, emissionReducePerSec: 5 },
  },
  smart_industry_core: {
    id: 'smart_industry_core',
    name: '智慧工业大脑',
    cost: 18000,
    tilesW: 4,
    tilesH: 3,
    textureKey: 'bld_smart_core',
    description: 'AI调度 · 全场效率提升',
    minGrade: 'A',
    minGreen: 60,
    rates: { money: 38, power: 10, pollution: -3, green: 5, coal: 0 },
    global: { moneyMult: 1.1, pollutionPerSec: 0, greenPerSec: 1, powerProdMult: 1.15, efficiencyBonus: 0.12, emissionReducePerSec: 2 },
  },
  mega_storage: {
    id: 'mega_storage',
    name: '超级储能中心',
    cost: 12000,
    tilesW: 3,
    tilesH: 3,
    textureKey: 'bld_mega_storage',
    description: '电网蓄能 · 电力缓冲与增产',
    minGrade: 'B',
    minGreen: 50,
    rates: { money: 22, power: 35, pollution: 2, green: 3, coal: 0 },
    global: { moneyMult: 1.04, pollutionPerSec: 0, greenPerSec: 1, powerProdMult: 1.25, efficiencyBonus: 0.05, emissionReducePerSec: 0 },
  },
};

export const MAX_BUILDING_LEVEL = 4 as const;

export function isSuperUnlocked(
  id: SuperBuildingId,
  grade: CityGrade,
  green: number,
  alreadyBuilt: SuperBuildingId[],
): boolean {
  if (alreadyBuilt.includes(id)) return false;
  const def = SUPER_BUILDINGS[id];
  return meetsGrade(grade, def.minGrade) && green >= def.minGreen;
}

export function aggregateSuperGlobals(built: SuperBuildingId[]): SuperGlobalMods {
  const out: SuperGlobalMods = {
    moneyMult: 1,
    pollutionPerSec: 0,
    greenPerSec: 0,
    powerProdMult: 1,
    efficiencyBonus: 0,
    emissionReducePerSec: 0,
  };
  for (const id of built) {
    const g = SUPER_BUILDINGS[id].global;
    out.moneyMult *= g.moneyMult;
    out.pollutionPerSec += g.pollutionPerSec;
    out.greenPerSec += g.greenPerSec;
    out.powerProdMult *= g.powerProdMult;
    out.efficiencyBonus += g.efficiencyBonus;
    out.emissionReducePerSec += g.emissionReducePerSec;
  }
  return out;
}
