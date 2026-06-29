import type { GameState } from './gameState';

export function getDefaultHint(state: GameState): string {
  switch (state.stageId) {
    case 'diagnosis':
      return '完成园区诊断，了解排放来源';
    case 'retrofit':
      return `点击地图工厂选择初改方案（${state.initialRetrofitDone.length}/3）`;
    case 'inspection':
      return '应对监管抽查，选择合规策略';
    case 'deep_opt':
      return state.deepOptimizedFactory
        ? '深度优化已完成，进入碳资产补充'
        : '选择一座工厂进行深度优化';
    case 'carbon':
      return '选择碳资产补充方案，向目标排放靠近';
    case 'report':
      return '查看第一阶段改造报告';
  }
}
