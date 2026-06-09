import { meetsGrade, type CityGrade } from './cityRating';

import type { ChainRates } from './economy';

import { MAX_BUILDING_LEVEL } from './superBuildings';



export type BuildingLevel = 1 | 2 | 3 | 4;



export type BuildingId =

  | 'coal_mine'

  | 'thermal_plant'

  | 'steel_mill'

  | 'solar_plant'

  | 'recycling_plant'

  | 'green_tech_hub';



export type LevelData = {

  rates: ChainRates;

  upgradeCost?: number;

};



export type BuildingDef = {

  id: BuildingId;

  name: string;

  cost: number;

  tilesW: number;

  tilesH: number;

  textureKey: string;

  description: string;

  minGrade: CityGrade;

  minGreen?: number;

  tier: 'chain' | 'green' | 'advanced';

  levelNames: [string, string, string, string];

  levels: Record<BuildingLevel, LevelData>;

};



export const BUILDINGS: Record<BuildingId, BuildingDef> = {

  coal_mine: {

    id: 'coal_mine',

    name: '煤矿',

    cost: 650,

    tilesW: 2,

    tilesH: 2,

    textureKey: 'bld_thermal',

    description: '产出煤炭 · 产业链起点',

    minGrade: 'D',

    tier: 'chain',

    levelNames: ['传统矿井', '机械化矿井', '智能矿井', '无人采矿站'],

    levels: {

      1: { rates: { money: 2, coal: 12, power: -3, pollution: 3, green: 0 } },

      2: { rates: { money: 3, coal: 17, power: -4, pollution: 4, green: 0 }, upgradeCost: 450 },

      3: { rates: { money: 4, coal: 24, power: -5, pollution: 4, green: 0 }, upgradeCost: 850 },

      4: { rates: { money: 6, coal: 32, power: -6, pollution: 3, green: 1 }, upgradeCost: 1400 },

    },

  },

  thermal_plant: {

    id: 'thermal_plant',

    name: '火电厂',

    cost: 900,

    tilesW: 2,

    tilesH: 2,

    textureKey: 'bld_thermal',

    description: '耗煤发电 · 可转型清洁',

    minGrade: 'D',

    tier: 'chain',

    levelNames: ['传统火电', '清洁火电', '智能火电', '氢能源设施'],

    levels: {

      1: { rates: { money: 6, coal: -9, power: 34, pollution: 11, green: 0 } },

      2: { rates: { money: 8, coal: -12, power: 46, pollution: 10, green: 0 }, upgradeCost: 700 },

      3: { rates: { money: 10, coal: -15, power: 58, pollution: 8, green: 1 }, upgradeCost: 1200 },

      4: { rates: { money: 14, coal: -14, power: 72, pollution: 4, green: 3 }, upgradeCost: 2000 },

    },

  },

  steel_mill: {

    id: 'steel_mill',

    name: '钢铁厂',

    cost: 1300,

    tilesW: 3,

    tilesH: 2,

    textureKey: 'bld_steel',

    description: '耗电生产 · 高收入',

    minGrade: 'D',

    tier: 'chain',

    levelNames: ['传统炼钢', '连铸车间', '智能轧钢', '绿色短流程钢'],

    levels: {

      1: { rates: { money: 32, coal: 0, power: -30, pollution: 13, green: 0 } },

      2: { rates: { money: 44, coal: 0, power: -38, pollution: 12, green: 0 }, upgradeCost: 900 },

      3: { rates: { money: 58, coal: 0, power: -48, pollution: 10, green: 1 }, upgradeCost: 1500 },

      4: { rates: { money: 78, coal: 0, power: -52, pollution: 7, green: 2 }, upgradeCost: 2400 },

    },

  },

  solar_plant: {

    id: 'solar_plant',

    name: '光伏电站',

    cost: 600,

    tilesW: 2,

    tilesH: 2,

    textureKey: 'bld_solar',

    description: '清洁电力 · 绿色积分',

    minGrade: 'D',

    tier: 'green',

    levelNames: ['基础光伏', '高效组件', '智能追光', '太空光伏矩阵'],

    levels: {

      1: { rates: { money: 5, coal: 0, power: 12, pollution: -2, green: 4 } },

      2: { rates: { money: 7, coal: 0, power: 16, pollution: -3, green: 5 }, upgradeCost: 500 },

      3: { rates: { money: 9, coal: 0, power: 21, pollution: -4, green: 7 }, upgradeCost: 900 },

      4: { rates: { money: 12, coal: 0, power: 28, pollution: -6, green: 10 }, upgradeCost: 1500 },

    },

  },

  recycling_plant: {

    id: 'recycling_plant',

    name: '仓储中心',

    cost: 950,

    tilesW: 2,

    tilesH: 2,

    textureKey: 'bld_recycle',

    description: '耗电回收 · 减排绿分',

    minGrade: 'C',

    tier: 'green',

    levelNames: ['基础回收', '分拣中心', '循环经济园', '零废智慧工厂'],

    levels: {

      1: { rates: { money: 10, coal: 0, power: -10, pollution: -6, green: 7 } },

      2: { rates: { money: 14, coal: 0, power: -12, pollution: -8, green: 9 }, upgradeCost: 650 },

      3: { rates: { money: 18, coal: 0, power: -14, pollution: -10, green: 12 }, upgradeCost: 1100 },

      4: { rates: { money: 24, coal: 0, power: -15, pollution: -14, green: 16 }, upgradeCost: 1800 },

    },

  },

  green_tech_hub: {

    id: 'green_tech_hub',

    name: '绿色技术中心',

    cost: 2200,

    tilesW: 3,

    tilesH: 2,

    textureKey: 'bld_recycle',

    description: '尖端绿色工业',

    minGrade: 'B',

    minGreen: 25,

    tier: 'advanced',

    levelNames: ['绿科实验室', '碳中和技术部', '智慧绿科中枢', '全球绿科旗舰'],

    levels: {

      1: { rates: { money: 16, coal: 0, power: 14, pollution: -9, green: 11 } },

      2: { rates: { money: 22, coal: 0, power: 18, pollution: -11, green: 14 }, upgradeCost: 1200 },

      3: { rates: { money: 28, coal: 0, power: 22, pollution: -13, green: 18 }, upgradeCost: 2000 },

      4: { rates: { money: 38, coal: 0, power: 28, pollution: -16, green: 24 }, upgradeCost: 3200 },

    },

  },

};



const COAL_CONSUMERS: BuildingId[] = ['thermal_plant'];

const POWER_CONSUMERS: BuildingId[] = [

  'steel_mill',

  'recycling_plant',

  'green_tech_hub',

  'coal_mine',

];



const LEVEL_TINTS: Record<BuildingLevel, number> = {

  1: 0xffffff,

  2: 0xdde8f0,

  3: 0xc8e8ff,

  4: 0xa8ffd8,

};



export function getBuildingRates(id: BuildingId, level: BuildingLevel): ChainRates {

  return { ...BUILDINGS[id].levels[level].rates };

}



export function getLevelName(id: BuildingId, level: BuildingLevel): string {

  return BUILDINGS[id].levelNames[level - 1];

}



export function getLevelTint(level: BuildingLevel): number {

  return LEVEL_TINTS[level];

}



export function getUpgradeCost(id: BuildingId, currentLevel: BuildingLevel): number | null {

  const next = (currentLevel + 1) as BuildingLevel;

  if (next > MAX_BUILDING_LEVEL) return null;

  return BUILDINGS[id].levels[next].upgradeCost ?? null;

}



export function isCoalConsumer(id: BuildingId) {

  return COAL_CONSUMERS.includes(id);

}



export function isPowerConsumer(id: BuildingId) {

  return POWER_CONSUMERS.includes(id);

}



export function isBuildingUnlocked(

  id: BuildingId,

  grade: CityGrade,

  greenPoints: number,

  advancedUnlocked = false,

): boolean {

  const def = BUILDINGS[id];

  if (!meetsGrade(grade, def.minGrade)) return false;

  if (def.minGreen !== undefined && greenPoints < def.minGreen) return false;

  if (def.tier === 'advanced' && !advancedUnlocked && greenPoints < (def.minGreen ?? 40)) {

    return false;

  }

  return true;

}


