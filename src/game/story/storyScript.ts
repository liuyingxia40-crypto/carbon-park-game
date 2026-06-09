export const INITIAL_EMISSION = 460;
export const TARGET_EMISSION = 200;
export const FUNDS = 420_000;
export const PHASE_LABEL = '旧厂改造';

export type StoryStageId =
  | 'intro'
  | 'coal'
  | 'chemical'
  | 'heavy'
  | 'ending_win'
  | 'ending_lose';

export type StoryChoice = {
  id: string;
  label: string;
  /** 正值=减排，负值=增排 */
  delta: number;
};

export type StoryStage = {
  id: StoryStageId;
  text: string;
  choices: StoryChoice[];
};

export const STORY_STAGES: Record<Exclude<StoryStageId, 'ending_win' | 'ending_lose'>, StoryStage> = {
  intro: {
    id: 'intro',
    text: '你继承了一座老旧工业园。园区目前总排放为 460 tCO₂e，远高于 200 tCO₂e 的目标线。低碳改造团队将帮助你完成第一轮园区减排。',
    choices: [{ id: 'start', label: '开始诊断', delta: 0 }],
  },
  coal: {
    id: 'coal',
    text: '燃煤工厂设备老旧，能源效率低，是园区主要排放来源之一。',
    choices: [
      { id: 'coal_a', label: 'A. 接入绿电与节能设备，减排 90', delta: 90 },
      { id: 'coal_b', label: 'B. 继续使用原有燃煤设备，减排 0', delta: 0 },
      { id: 'coal_c', label: 'C. 只做表面清洁改造，减排 20', delta: 20 },
    ],
  },
  chemical: {
    id: 'chemical',
    text: '化工厂生产过程中存在废气排放和资源浪费，需要进行过程治理。',
    choices: [
      { id: 'chem_a', label: 'A. 建设废气处理与资源回收系统，减排 70', delta: 70 },
      { id: 'chem_b', label: 'B. 增加工厂产能，排放增加 40', delta: -40 },
      { id: 'chem_c', label: 'C. 只更换厂区标识，减排 5', delta: 5 },
    ],
  },
  heavy: {
    id: 'heavy',
    text: '重型制造厂能耗高、生产过程排放集中，需要更系统的碳管理方案。',
    choices: [
      { id: 'heavy_a', label: 'A. 安装碳捕集与能耗监测系统，减排 120', delta: 120 },
      { id: 'heavy_b', label: 'B. 只购买短期碳配额，减排 40', delta: 40 },
      { id: 'heavy_c', label: 'C. 暂不处理，减排 0', delta: 0 },
    ],
  },
};

export const ENDING_WIN = {
  id: 'ending_win' as const,
  text: '改造完成！园区总排放已降至目标线以下。你成功帮助工业园完成了第一阶段低碳转型。',
  choices: [
    { id: 'view', label: '查看改造成果', delta: 0 },
    { id: 'restart', label: '重新开始', delta: 0 },
  ],
};

export const ENDING_LOSE = {
  id: 'ending_lose' as const,
  text: '园区仍未达标。请重新评估改造方案，选择更有效的低碳路径。',
  choices: [{ id: 'retry', label: '重新选择', delta: 0 }],
};

export function nextStageAfterChoice(current: StoryStageId): StoryStageId | null {
  switch (current) {
    case 'intro':
      return 'coal';
    case 'coal':
      return 'chemical';
    case 'chemical':
      return 'heavy';
    case 'heavy':
      return null;
    default:
      return null;
  }
}

export function getStage(id: StoryStageId): StoryStage {
  if (id === 'ending_win') {
    return { id: 'ending_win', text: ENDING_WIN.text, choices: ENDING_WIN.choices };
  }
  if (id === 'ending_lose') {
    return { id: 'ending_lose', text: ENDING_LOSE.text, choices: ENDING_LOSE.choices };
  }
  return STORY_STAGES[id];
}
