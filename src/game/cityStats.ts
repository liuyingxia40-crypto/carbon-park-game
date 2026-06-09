import type { ChainRates, Resources } from './economy';
import type { IndustryState } from './bridge';

/** 沪上建设社顶栏六维数据 */
export type ShanghaiCityStats = {
  funds: number;
  population: number;
  popularity: number;
  commerce: number;
  culture: number;
  traffic: number;
};

export function computeShanghaiStats(res: Resources, rates: ChainRates, industry: IndustryState): ShanghaiCityStats {
  const buildingCount = industry.placed.length;
  return {
    funds: Math.floor(res.money),
    population: 120 + buildingCount * 38 + Math.floor(res.power * 0.15),
    popularity: 80 + Math.floor(res.green * 2.2) + buildingCount * 12,
    commerce: 40 + Math.floor(Math.max(0, rates.money) * 3) + buildingCount * 8,
    culture: 50 + Math.floor(res.green * 1.8) + buildingCount * 5,
    traffic: Math.min(100, Math.floor(res.pollution * 0.85 + buildingCount * 4)),
  };
}
