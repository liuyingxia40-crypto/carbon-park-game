/** 每日资源变化（产业链，按游戏日结算） */
export type ChainRates = {
  money: number;
  power: number;
  pollution: number;
  green: number;
  coal: number;
};

export type Resources = {
  money: number;
  power: number;
  pollution: number;
  green: number;
  coal: number;
};

export const STARTING_RESOURCES: Resources = {
  money: 10000,
  power: 48,
  pollution: 0,
  green: 0,
  coal: 50,
};

export function createEmptyChainRates(): ChainRates {
  return { money: 0, power: 0, pollution: 0, green: 0, coal: 0 };
}

export function addChainRates(a: ChainRates, b: ChainRates): ChainRates {
  return {
    money: a.money + b.money,
    power: a.power + b.power,
    pollution: a.pollution + b.pollution,
    green: a.green + b.green,
    coal: a.coal + b.coal,
  };
}

export function applyChainTick(res: Resources, delta: ChainRates): Resources {
  return {
    money: res.money + delta.money,
    power: Math.max(0, res.power + delta.power),
    pollution: Math.max(0, res.pollution + delta.pollution),
    green: Math.max(0, res.green + delta.green),
    coal: Math.max(0, res.coal + delta.coal),
  };
}

/** UI 用：与旧接口兼容 */
export type EconomyRates = ChainRates;
