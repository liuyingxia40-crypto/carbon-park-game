import {
  allInitialRetrofitDone,
  complianceLabel,
  getFactory,
  INITIAL_EMISSION,
  INITIAL_FUNDS,
  INITIAL_REVENUE,
  STAGE_TITLES,
  type ChoicePhase,
  type ChoiceRecord,
  type DecisionOption,
  type FactoryId,
  type StageId,
} from './phase1Script';

export type GameState = {
  stageId: StageId;
  funds: number;
  emission: number;
  revenue: number;
  choices: ChoiceRecord[];
  initialRetrofitDone: FactoryId[];
  deepOptimizedFactory: FactoryId | null;
};

export function createInitialState(): GameState {
  return {
    stageId: 'diagnosis',
    funds: INITIAL_FUNDS,
    emission: INITIAL_EMISSION,
    revenue: INITIAL_REVENUE,
    choices: [],
    initialRetrofitDone: [],
    deepOptimizedFactory: null,
  };
}

function applyOption(
  state: GameState,
  option: DecisionOption,
  record: ChoiceRecord,
): GameState {
  return {
    ...state,
    funds: state.funds - option.cost,
    emission: Math.max(0, state.emission - option.reduction),
    revenue: state.revenue + option.revenueChange,
    choices: [...state.choices, record],
  };
}

export function applyEventDecision(
  state: GameState,
  phase: ChoicePhase,
  stageTitle: string,
  option: DecisionOption,
): GameState {
  const next = applyOption(state, option, {
    phase,
    stageTitle,
    optionName: option.name,
    cost: option.cost,
    reduction: option.reduction,
    revenueChange: option.revenueChange,
  });

  if (phase === 'diagnosis') return { ...next, stageId: 'retrofit' };
  if (phase === 'inspection') return { ...next, stageId: 'deep_opt' };
  if (phase === 'carbon') return { ...next, stageId: 'report' };
  return next;
}

export function applyInitialRetrofit(
  state: GameState,
  factoryId: FactoryId,
  option: DecisionOption,
): GameState {
  const factoryTitle = STAGE_TITLES.retrofit;
  const next = applyOption(state, option, {
    phase: 'initial',
    stageTitle: factoryTitle,
    factoryId,
    factoryName: getFactory(factoryId).title,
    optionName: option.name,
    cost: option.cost,
    reduction: option.reduction,
    revenueChange: option.revenueChange,
  });

  const initialRetrofitDone = state.initialRetrofitDone.includes(factoryId)
    ? state.initialRetrofitDone
    : [...state.initialRetrofitDone, factoryId];

  const withDone = { ...next, initialRetrofitDone };
  if (allInitialRetrofitDone(initialRetrofitDone)) {
    return { ...withDone, stageId: 'inspection' };
  }
  return withDone;
}

export function applyDeepOptimization(
  state: GameState,
  factoryId: FactoryId,
  option: DecisionOption,
): GameState {
  const next = applyOption(state, option, {
    phase: 'deep',
    stageTitle: STAGE_TITLES.deep_opt,
    factoryId,
    factoryName: getFactory(factoryId).title,
    optionName: option.name,
    cost: option.cost,
    reduction: option.reduction,
    revenueChange: option.revenueChange,
  });
  return {
    ...next,
    deepOptimizedFactory: factoryId,
    stageId: 'carbon',
  };
}

export function canAfford(funds: number, cost: number): boolean {
  return funds >= cost;
}

export function getInitialChoice(state: GameState, factoryId: FactoryId): ChoiceRecord | undefined {
  return state.choices.find((c) => c.phase === 'initial' && c.factoryId === factoryId);
}

export function getDeepChoice(state: GameState): ChoiceRecord | undefined {
  return state.choices.find((c) => c.phase === 'deep');
}

export function getChoiceByPhase(state: GameState, phase: ChoicePhase): ChoiceRecord | undefined {
  return state.choices.find((c) => c.phase === phase);
}

export { complianceLabel };
