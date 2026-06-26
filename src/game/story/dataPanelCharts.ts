import type { GameState } from './gameState';
import {
  INITIAL_EMISSION,
  INITIAL_FUNDS,
  TARGET_EMISSION,
  type ChoiceRecord,
} from './phase1Script';

export type CarbonTrendData = {
  days: string[];
  values: number[];
  targetLine: number;
};

export type MoneyTrendData = {
  labels: string[];
  /** 万元 */
  values: number[];
};

export type ComplianceGaugeData = {
  progress: number;
  metTarget: boolean;
};

export type DataPanelChartData = {
  carbon: CarbonTrendData;
  money: MoneyTrendData;
  compliance: ComplianceGaugeData;
};

function roundWan(yuan: number): number {
  const wan = yuan / 10_000;
  return Number.isInteger(wan) ? wan : Math.round(wan * 10) / 10;
}

function choiceMoneyLabel(choice: ChoiceRecord): string {
  if (choice.factoryName) {
    const name = choice.optionName.replace(/改造$/, '').slice(0, 6);
    return `${choice.factoryName.replace(/工厂|制造厂/g, '').slice(0, 3)}·${name}`;
  }
  switch (choice.phase) {
    case 'diagnosis':
      return '园区诊断';
    case 'inspection':
      return '监管抽查';
    case 'carbon':
      return '碳资产';
    case 'deep':
      return '深度优化';
    default:
      return choice.optionName.length > 8 ? `${choice.optionName.slice(0, 8)}…` : choice.optionName;
  }
}

function buildCompliance(state: GameState): ComplianceGaugeData {
  const metTarget = state.emission <= TARGET_EMISSION;
  if (metTarget) {
    return { progress: 100, metTarget: true };
  }

  const totalNeeded = INITIAL_EMISSION - TARGET_EMISSION;
  const reduced = INITIAL_EMISSION - state.emission;
  const emissionScore =
    totalNeeded > 0
      ? Math.min(100, Math.max(0, Math.round((reduced / totalNeeded) * 100)))
      : 0;

  const riskPenalty = Math.min(35, Math.round(state.complianceRisk * 0.8));
  const progress = Math.max(0, emissionScore - riskPenalty);

  return { progress, metTarget: false };
}

/** 根据当前游戏状态回放决策，生成三张图的数据序列 */
export function buildDataPanelCharts(state: GameState): DataPanelChartData {
  let emission = INITIAL_EMISSION;
  let funds = INITIAL_FUNDS;

  const carbonDays = ['第1天'];
  const carbonValues = [emission];
  const moneyLabels = ['初始'];
  const moneyValues = [roundWan(funds)];

  for (const choice of state.choices) {
    funds -= choice.cost;
    emission = Math.max(0, emission - choice.reduction);

    carbonDays.push(`第${carbonDays.length + 1}天`);
    carbonValues.push(emission);
    moneyLabels.push(choiceMoneyLabel(choice));
    moneyValues.push(roundWan(funds));
  }

  return {
    carbon: {
      days: carbonDays,
      values: carbonValues,
      targetLine: TARGET_EMISSION,
    },
    money: {
      labels: moneyLabels,
      values: moneyValues,
    },
    compliance: buildCompliance(state),
  };
}

export function carbonChartYRange(values: number[], targetLine: number): { min: number; max: number } {
  const dataMin = Math.min(...values, targetLine);
  const dataMax = Math.max(...values, INITIAL_EMISSION);
  const pad = Math.max(6, Math.round((dataMax - dataMin) * 0.08));
  return {
    min: Math.max(0, Math.floor(dataMin - pad)),
    max: Math.ceil(dataMax + pad),
  };
}

export function moneyChartYMax(values: number[]): number {
  const peak = Math.max(...values, roundWan(INITIAL_FUNDS));
  return Math.max(20, Math.ceil((peak * 1.12) / 10) * 10);
}
