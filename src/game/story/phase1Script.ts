import { getFactoryCopy } from '../park/factoryCopy';

export const INITIAL_FUNDS = 420_000;
export const INITIAL_EMISSION = 460;
export const TARGET_EMISSION = 200;
export const INITIAL_REVENUE = 100;
export const PHASE_LABEL = '旧厂低碳转型';

export type RiskLevel = '低' | '中' | '中高' | '高';
export type TagTone = 'long' | 'balance' | 'short' | 'risk';

export type FactoryId = 'factory_coal' | 'factory_chemical' | 'factory_heavy';

export type StageId =
  | 'diagnosis'
  | 'retrofit'
  | 'inspection'
  | 'deep_opt'
  | 'carbon'
  | 'report';

export type ChoicePhase = 'diagnosis' | 'initial' | 'inspection' | 'deep' | 'carbon';

export type DecisionOption = {
  id: string;
  name: string;
  cost: number;
  reduction: number;
  revenueChange: number;
  risk: RiskLevel;
  tag: string;
  tagTone: TagTone;
  description: string;
};

export type EventDecision = {
  title: string;
  text: string;
  options: DecisionOption[];
};

export type FactoryDef = {
  id: FactoryId;
  title: string;
  emission: number;
  riskLevel: RiskLevel;
  problem: string;
  options: DecisionOption[];
};

export const PHASE_PROGRESS: { id: StageId; label: string }[] = [
  { id: 'diagnosis', label: '诊断' },
  { id: 'retrofit', label: '初改' },
  { id: 'inspection', label: '抽查' },
  { id: 'deep_opt', label: '深改' },
  { id: 'carbon', label: '碳资产' },
  { id: 'report', label: '结算' },
];

export const STAGE_TITLES: Record<StageId, string> = {
  diagnosis: '园区诊断',
  retrofit: '工厂初步改造',
  inspection: '监管抽查',
  deep_opt: '深度优化',
  carbon: '碳资产补充',
  report: '第一阶段报告',
};

export const DIAGNOSIS_EVENT: EventDecision = {
  title: '园区诊断',
  text: '你接手的工业园区已经多年未进行系统碳盘查。要制定有效改造方案，首先需要了解主要排放来源。',
  options: [
    {
      id: 'diag_a',
      name: '基础排放核算',
      cost: 10_000,
      reduction: 0,
      revenueChange: 0,
      risk: '低',
      tag: '稳健型',
      tagTone: 'long',
      description: '显示三座工厂的基础排放数据。',
    },
    {
      id: 'diag_b',
      name: '深度碳盘查',
      cost: 30_000,
      reduction: 0,
      revenueChange: 0,
      risk: '低',
      tag: '平衡型',
      tagTone: 'balance',
      description: '识别隐藏排放问题，并解锁更多深度改造方案。',
    },
    {
      id: 'diag_c',
      name: '跳过诊断，直接改造',
      cost: 0,
      reduction: 0,
      revenueChange: 0,
      risk: '高',
      tag: '高风险',
      tagTone: 'risk',
      description: '节省资金，但后续部分信息不完整。',
    },
  ],
};

export const INSPECTION_EVENT: EventDecision = {
  title: '监管抽查通知',
  text: '监管部门将在本季度末进行排放合规检查。园区当前排放仍需继续压降，你需要决定下一步策略。',
  options: [
    {
      id: 'insp_a',
      name: '追加设备改造',
      cost: 80_000,
      reduction: 60,
      revenueChange: 10,
      risk: '中',
      tag: '平衡型',
      tagTone: 'balance',
      description: '继续投入设备升级，长期收益更好。',
    },
    {
      id: 'insp_b',
      name: '购买碳配额应急',
      cost: 60_000,
      reduction: 50,
      revenueChange: 0,
      risk: '低',
      tag: '稳健型',
      tagTone: 'long',
      description: '快速缓解合规压力，但不是根本改造。',
    },
    {
      id: 'insp_c',
      name: '保留资金，等待下一阶段',
      cost: 0,
      reduction: 0,
      revenueChange: 20,
      risk: '高',
      tag: '高风险',
      tagTone: 'risk',
      description: '短期现金压力小，但合规风险上升。',
    },
  ],
};

export const CARBON_EVENT: EventDecision = {
  title: '碳资产补充方案',
  text: '经过第一阶段工厂改造，园区排放已经明显下降。为了接近或达到目标，你还可以使用碳资产方案进行补足。',
  options: [
    {
      id: 'carbon_a',
      name: '购买碳配额补足缺口',
      cost: 80_000,
      reduction: 60,
      revenueChange: 0,
      risk: '低',
      tag: '稳健型',
      tagTone: 'long',
      description: '适合短期达标，但长期仍需继续改造。',
    },
    {
      id: 'carbon_b',
      name: '申请绿色项目认证',
      cost: 60_000,
      reduction: 45,
      revenueChange: 10,
      risk: '中',
      tag: '平衡型',
      tagTone: 'balance',
      description: '周期较长，但提升企业绿色形象和长期价值。',
    },
    {
      id: 'carbon_c',
      name: '暂不购买',
      cost: 0,
      reduction: 0,
      revenueChange: 20,
      risk: '高',
      tag: '高风险',
      tagTone: 'risk',
      description: '保留资金，但可能无法达标。',
    },
  ],
};

export const DEEP_OPT_INTRO = {
  title: '深度优化选择',
  text: '第一轮改造完成后，你还有机会选择一座工厂进行深度优化。资金有限，只能选择一个重点方向。',
};

export const FACTORIES: FactoryDef[] = [
  {
    id: 'factory_coal',
    title: '燃煤工厂',
    emission: 160,
    riskLevel: '高',
    problem: '设备老旧，能效偏低，是园区主要排放来源。',
    options: [
      {
        id: 'coal_a',
        name: '基础低碳改造',
        cost: 60_000,
        reduction: 50,
        revenueChange: 10,
        risk: '低',
        tag: '稳健型',
        tagTone: 'long',
        description: '适合初步降低排放，投入较低。',
      },
      {
        id: 'coal_b',
        name: '深度优化改造',
        cost: 120_000,
        reduction: 90,
        revenueChange: 5,
        risk: '中',
        tag: '平衡型',
        tagTone: 'balance',
        description: '减排效果更强，但资金压力更大。',
      },
      {
        id: 'coal_c',
        name: '暂缓改造',
        cost: 0,
        reduction: 0,
        revenueChange: 0,
        risk: '高',
        tag: '高风险',
        tagTone: 'risk',
        description: '暂时不投入资金，但后续履约风险升高。',
      },
    ],
  },
  {
    id: 'factory_chemical',
    title: '化工厂',
    emission: 120,
    riskLevel: '中',
    problem: '废气处理不足，资源浪费明显，存在过程排放压力。',
    options: [
      {
        id: 'chem_a',
        name: '基础低碳改造',
        cost: 70_000,
        reduction: 45,
        revenueChange: 5,
        risk: '低',
        tag: '稳健型',
        tagTone: 'long',
        description: '适合初步降低排放，投入较低。',
      },
      {
        id: 'chem_b',
        name: '深度优化改造',
        cost: 110_000,
        reduction: 70,
        revenueChange: 15,
        risk: '中',
        tag: '平衡型',
        tagTone: 'balance',
        description: '减排效果更强，但资金压力更大。',
      },
      {
        id: 'chem_c',
        name: '暂缓改造',
        cost: 0,
        reduction: 0,
        revenueChange: 0,
        risk: '高',
        tag: '高风险',
        tagTone: 'risk',
        description: '暂时不投入资金，但后续履约风险升高。',
      },
    ],
  },
  {
    id: 'factory_heavy',
    title: '绿色制造厂',
    emission: 180,
    riskLevel: '中高',
    problem: '设备能耗高，生产过程排放集中，改造难度较大。',
    options: [
      {
        id: 'heavy_a',
        name: '基础低碳改造',
        cost: 65_000,
        reduction: 45,
        revenueChange: 20,
        risk: '低',
        tag: '稳健型',
        tagTone: 'long',
        description: '适合初步降低排放，投入较低。',
      },
      {
        id: 'heavy_b',
        name: '深度优化改造',
        cost: 150_000,
        reduction: 120,
        revenueChange: 5,
        risk: '中高',
        tag: '技术型',
        tagTone: 'balance',
        description: '减排效果更强，但资金压力更大。',
      },
      {
        id: 'heavy_c',
        name: '暂缓改造',
        cost: 0,
        reduction: 0,
        revenueChange: 0,
        risk: '高',
        tag: '高风险',
        tagTone: 'risk',
        description: '暂时不投入资金，但后续履约风险升高。',
      },
    ],
  },
];

export const DEEP_OPTIONS: Record<FactoryId, DecisionOption> = {
  factory_coal: {
    id: 'coal_deep',
    name: '能源结构替换',
    cost: 90_000,
    reduction: 70,
    revenueChange: 5,
    risk: '中',
    tag: '深度型',
    tagTone: 'balance',
    description: '进一步降低燃煤依赖，提升长期合规能力。',
  },
  factory_chemical: {
    id: 'chem_deep',
    name: '循环利用系统',
    cost: 75_000,
    reduction: 55,
    revenueChange: 15,
    risk: '中',
    tag: '深度型',
    tagTone: 'balance',
    description: '提高资源回收率，同时降低过程排放。',
  },
  factory_heavy: {
    id: 'heavy_deep',
    name: '智能能耗调度',
    cost: 65_000,
    reduction: 45,
    revenueChange: 20,
    risk: '低',
    tag: '深度型',
    tagTone: 'long',
    description: '通过监测与调度降低高峰能耗。',
  },
};

export const FACTORY_OPERATION_LABELS = {
  normal: '普通低碳改造',
  deep: '深度优化改造',
} as const;

export type FactoryOperationActions = {
  normal: DecisionOption;
  deep: DecisionOption;
};

/** 工厂操作卡上的两档改造选项（初改阶段） */
export function getFactoryOperationActions(factoryId: FactoryId): FactoryOperationActions {
  const factory = getFactory(factoryId);
  if (factoryId === 'factory_heavy') {
    return {
      normal: DEEP_OPTIONS.factory_heavy,
      deep: factory.options[1],
    };
  }
  return {
    normal: factory.options[0],
    deep: factory.options[1],
  };
}

export type ChoiceRecord = {
  phase: ChoicePhase;
  stageTitle: string;
  factoryId?: FactoryId;
  factoryName?: string;
  optionName: string;
  cost: number;
  reduction: number;
  revenueChange: number;
};

export function getFactory(id: FactoryId): FactoryDef {
  const f = FACTORIES.find((x) => x.id === id);
  if (!f) throw new Error(`Unknown factory: ${id}`);
  return f;
}


export function getDefaultInitialOption(factoryId: FactoryId): DecisionOption {
  const factory = getFactory(factoryId);
  const copy = getFactoryCopy(factoryId);
  return (
    factory.options.find((o) => o.name === copy.solutionName) ??
    factory.options[1] ??
    factory.options[0]
  );
}

export function getDefaultEventOption(stageId: StageId): DecisionOption | null {
  if (stageId === 'diagnosis') return DIAGNOSIS_EVENT.options[0];
  if (stageId === 'inspection') return INSPECTION_EVENT.options[0];
  if (stageId === 'carbon') return CARBON_EVENT.options[0];
  return null;
}

export function getEventForStage(stageId: StageId): EventDecision | null {
  if (stageId === 'diagnosis') return DIAGNOSIS_EVENT;
  if (stageId === 'inspection') return INSPECTION_EVENT;
  if (stageId === 'carbon') return CARBON_EVENT;
  return null;
}

export function isMapFactoryStage(stageId: StageId): boolean {
  return stageId === 'retrofit' || stageId === 'deep_opt';
}

export function formatChoiceHint(option: Pick<DecisionOption, 'name' | 'reduction' | 'revenueChange'>): string {
  const emission = option.reduction > 0 ? `排放 -${option.reduction}` : '排放 0';
  const revenue =
    option.revenueChange === 0
      ? '收益 0'
      : `收益 ${option.revenueChange > 0 ? '+' : ''}${option.revenueChange}`;
  return `已选择：${option.name}｜${emission}｜${revenue}`;
}

export function complianceLabel(emission: number): string {
  if (emission <= TARGET_EMISSION) return '已达标';
  if (emission <= 260) return '接近达标';
  return '未达标';
}

export function reportEvaluation(emission: number): string {
  if (emission <= TARGET_EMISSION) {
    return '第一阶段改造成功，园区排放已降至目标线以下。';
  }
  if (emission <= 260) {
    return '园区排放已经明显下降，但仍未完全达标。下一阶段需要继续加强碳资产管理和深度改造。';
  }
  return '园区仍存在较大减排缺口，合规风险较高。';
}

export function allInitialRetrofitDone(done: FactoryId[]): boolean {
  return FACTORIES.every((f) => done.includes(f.id));
}

export function stageIndex(stageId: StageId): number {
  return PHASE_PROGRESS.findIndex((s) => s.id === stageId);
}
