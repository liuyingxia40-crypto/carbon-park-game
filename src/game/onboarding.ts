export type GuideStepId =
  | 'welcome'
  | 'route'
  | 'factory'
  | 'pollution'
  | 'green'
  | 'carbon'
  | 'goal'
  | 'done';

export type GuideState = {
  step: GuideStepId | null;
  title: string;
  body: string;
  cta?: string;
  progress: number;
};

const STEPS: GuideStepId[] = ['welcome', 'route', 'factory', 'pollution', 'green', 'carbon', 'goal', 'done'];

const COPY: Record<Exclude<GuideStepId, 'done'>, { title: string; body: string; cta?: string }> = {
  welcome: {
    title: '工业小镇',
    body: '镜头已对准开局工业区：火电、钢铁、仓储与光伏正在运转。左侧选建筑，在工业地块上继续扩张。',
    cta: '开始经营',
  },
  route: {
    title: '选择发展路线',
    body: '重工业偏重收益，绿色路线偏重减排与绿分，高科技兼顾效率。路线决定长期策略。',
    cta: '点击路线卡片',
  },
  factory: {
    title: '部署工厂',
    body: '煤矿→火电→钢铁形成产业链。点击左侧产业卡片，再在地图上工业地块建造。',
    cta: '部署第一座工厂',
  },
  pollution: {
    title: '污染与环境',
    body: '工厂会增加污染，地图天空与河流会随之变化。留意顶部污染指数与年度排放上限。',
  },
  green: {
    title: '绿色积分',
    body: '光伏、回收与绿科建筑产出绿色积分，用于碳交易、解锁高级工业与抵消超排。',
    cta: '考虑部署绿色设施',
  },
  carbon: {
    title: '碳交易机制',
    body: '年度排放超标可缴纳罚款，或消耗绿色积分抵消。绿分也是碳资产的核心指标。',
    cta: '打开碳交易政策',
  },
  goal: {
    title: '零碳智慧工业城市',
    body: '提升评级、降低污染、建造超级建筑，最终打造可展示的零碳智慧工业文明。',
  },
};

export class OnboardingGuide {
  private step: GuideStepId = 'welcome';
  private dismissed = false;

  getState(input: {
    hasRoute: boolean;
    buildingCount: number;
    pollution: number;
    green: number;
    placedGreen: boolean;
    openedCarbon: boolean;
  }): GuideState {
    if (this.dismissed) {
      return { step: null, title: '', body: '', progress: 100 };
    }

    this.advanceByGameplay(input);

    const step = this.step;
    if (step === 'done') {
      return { step: null, title: '', body: '', progress: 100 };
    }

    const copy = COPY[step];
    const idx = STEPS.indexOf(step);
    return {
      step,
      title: copy.title,
      body: copy.body,
      cta: copy.cta,
      progress: Math.round((idx / (STEPS.length - 1)) * 100),
    };
  }

  private advanceByGameplay(input: {
    hasRoute: boolean;
    buildingCount: number;
    pollution: number;
    green: number;
    placedGreen: boolean;
    openedCarbon: boolean;
  }) {
    if (this.step === 'welcome') return;
    if (this.step === 'route' && input.hasRoute) this.step = 'factory';
    if (this.step === 'factory' && input.buildingCount >= 1) this.step = 'pollution';
    if (this.step === 'pollution' && input.pollution > 8) this.step = 'green';
    if (this.step === 'green' && (input.placedGreen || input.green >= 5)) this.step = 'carbon';
    if (this.step === 'carbon' && (input.openedCarbon || input.green >= 12)) this.step = 'goal';
    if (this.step === 'goal' && input.buildingCount >= 4) this.step = 'done';
  }

  next() {
    const idx = STEPS.indexOf(this.step);
    if (idx < STEPS.length - 1) this.step = STEPS[idx + 1];
    else this.step = 'done';
  }

  skip() {
    this.dismissed = true;
    this.step = 'done';
  }

  markCarbonOpened() {
    if (this.step === 'carbon') this.next();
  }
}
