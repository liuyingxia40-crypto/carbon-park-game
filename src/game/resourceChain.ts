import {
  BUILDINGS,
  getBuildingRates,
  isCoalConsumer,
  isPowerConsumer,
  type BuildingId,
  type BuildingLevel,
} from './buildings';
import type { DemandModifiers } from './cityDemand';
import type { RouteModifiers } from './developmentRoute';
import { routeBuildingMult } from './developmentRoute';
import type { DevRoute } from './developmentRoute';
import type { ChainRates, Resources } from './economy';
import { createEmptyChainRates } from './economy';
import type { EventModifiers } from './eventSystem';
import type { SuperGlobalMods } from './superBuildings';
import { applyModifiersToRates, type TechModifiers } from './techTree';
import type { RhythmMods } from './gameRhythm';

export type BuildingInstance = {
  uid: string;
  id: BuildingId;
  level: BuildingLevel;
};

export type SimResult = {
  delta: ChainRates;
  displayRates: ChainRates;
  shortages: string[];
  coalEfficiency: number;
  powerEfficiency: number;
};

export function simulateIndustrialTick(
  res: Resources,
  buildings: BuildingInstance[],
  mods: TechModifiers,
  ecoPollutionCut: number,
  eventMods: EventModifiers = {
    moneyMult: 1,
    powerMult: 1,
    pollutionPerSec: 0,
    buildCostMult: 1,
  },
  routeMods: RouteModifiers = {
    moneyMult: 1,
    pollutionMult: 1,
    greenMult: 1,
    powerProdMult: 1,
    buildCostMult: 1,
  },
  demandMods: DemandModifiers = {
    moneyMult: 1,
    powerEffMult: 1,
    greenMult: 1,
    pollutionMult: 1,
    coalEffMult: 1,
  },
  devRoute: DevRoute | null = null,
): SimResult {
  const shortages: string[] = [];
  const delta = createEmptyChainRates();
  const displayRates = createEmptyChainRates();

  if (buildings.length === 0) {
    return { delta, displayRates, shortages, coalEfficiency: 1, powerEfficiency: 1 };
  }

  let coalProd = 0;
  let coalDemand = 0;
  let powerProd = 0;
  let powerDemand = 0;

  const scaled: { inst: BuildingInstance; rates: ChainRates }[] = [];

  for (const inst of buildings) {
    let rates = getBuildingRates(inst.id, inst.level);
    rates = applyModifiersToRates(rates, mods);
    if (rates.pollution > 0) {
      rates.pollution = Math.max(0, rates.pollution - ecoPollutionCut);
    }
    scaled.push({ inst, rates });

    if (rates.coal > 0) coalProd += rates.coal;
    if (rates.coal < 0) coalDemand += -rates.coal;
    if (rates.power > 0) powerProd += rates.power;
    if (rates.power < 0) powerDemand += -rates.power;
  }

  let coalEff = 1;
  const coalAvailable = res.coal + coalProd;
  if (coalDemand > 0 && coalAvailable < coalDemand) {
    coalEff = Math.max(0.35 + mods.efficiencyBonus, coalAvailable / coalDemand);
    shortages.push('煤炭短缺');
  }
  coalEff *= demandMods.coalEffMult;

  let powerEff = 1;
  const powerAvailable = res.power + powerProd * routeMods.powerProdMult;
  if (powerDemand > 0 && powerAvailable < powerDemand) {
    powerEff = Math.max(0.4 + mods.efficiencyBonus, powerAvailable / powerDemand);
    shortages.push('电力不足');
  }
  powerEff *= demandMods.powerEffMult;

  for (const { inst, rates } of scaled) {
    let eff = 1;
    if (isCoalConsumer(inst.id) && rates.coal < 0) eff *= coalEff;
    if (isPowerConsumer(inst.id) && rates.power < 0) eff *= powerEff;

    const bDef = BUILDINGS[inst.id];
    const routeMult = routeBuildingMult(devRoute, bDef.tier);
    const applied: ChainRates = {
      money: rates.money * eff * routeMult,
      coal: rates.coal < 0 ? rates.coal * coalEff : rates.coal,
      power:
        rates.power < 0
          ? rates.power * powerEff
          : rates.power * routeMods.powerProdMult,
      pollution:
        rates.pollution *
        (rates.pollution > 0 ? routeMods.pollutionMult * demandMods.pollutionMult : 1) *
        (isCoalConsumer(inst.id) ? coalEff : isPowerConsumer(inst.id) ? powerEff : 1),
      green: rates.green * eff * routeMult * routeMods.greenMult,
    };

    addTo(delta, applied);
    addTo(displayRates, rates);
  }

  delta.money *= eventMods.moneyMult * routeMods.moneyMult * demandMods.moneyMult;
  delta.green *= demandMods.greenMult;
  if (delta.power > 0) delta.power *= eventMods.powerMult;
  if (delta.power < 0) delta.power /= eventMods.powerMult;
  delta.pollution += eventMods.pollutionPerSec;
  displayRates.pollution += eventMods.pollutionPerSec;

  return { delta, displayRates, shortages, coalEfficiency: coalEff, powerEfficiency: powerEff };
}

export function mergeTechModifiers(mods: TechModifiers, superG: SuperGlobalMods): TechModifiers {
  return {
    ...mods,
    efficiencyBonus: mods.efficiencyBonus + superG.efficiencyBonus,
  };
}

export function applyGlobalTickModifiers(
  delta: ChainRates,
  superG: SuperGlobalMods,
  rhythm: RhythmMods,
): ChainRates {
  return {
    money: delta.money * superG.moneyMult * rhythm.moneyMult,
    power: delta.power * superG.powerProdMult,
    pollution: delta.pollution + superG.pollutionPerSec,
    green: delta.green * rhythm.greenMult + superG.greenPerSec,
    coal: delta.coal,
  };
}

function addTo(target: ChainRates, r: ChainRates) {
  target.money += r.money;
  target.coal += r.coal;
  target.power += r.power;
  target.pollution += r.pollution;
  target.green += r.green;
}
