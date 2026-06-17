export type DemandId = 'power_shortage' | 'pollution_crisis' | 'green_industry_boom' | 'stable';

export type DemandModifiers = {
  moneyMult: number;
  powerEffMult: number;
  greenMult: number;
  pollutionMult: number;
  coalEffMult: number;
};

export type CityDemandState = {
  id: DemandId;
  name: string;
  description: string;
  remainingDays: number;
  nextInDays: number;
};

const DEMANDS: Record<
  Exclude<DemandId, 'stable'>,
  { name: string; description: string; durationDays: number; mods: DemandModifiers }
> = {
  power_shortage: {
    name: '电力短缺',
    description: '城市用电紧张 · 耗电工厂效率 -18%，火电收益 -10%',
    durationDays: 28,
    mods: { moneyMult: 0.92, powerEffMult: 0.82, greenMult: 1, pollutionMult: 1, coalEffMult: 1 },
  },
  pollution_crisis: {
    name: '污染危机',
    description: '环保督查 · 污染增速 +20%，绿色工厂收益 +15%',
    durationDays: 32,
    mods: { moneyMult: 1, powerEffMult: 1, greenMult: 1.15, pollutionMult: 1.2, coalEffMult: 0.95 },
  },
  green_industry_boom: {
    name: '绿色产业需求',
    description: '政策扶持绿电 · 绿色积分 +30%，重污染建筑收益 -12%',
    durationDays: 30,
    mods: { moneyMult: 0.88, powerEffMult: 1, greenMult: 1.3, pollutionMult: 0.95, coalEffMult: 1 },
  },
};

const DEMAND_IDS = Object.keys(DEMANDS) as Exclude<DemandId, 'stable'>[];

export class CityDemandSystem {
  private active: Exclude<DemandId, 'stable'> | null = null;
  private remainingDays = 0;
  private cooldownDays = 18;

  getModifiers(): DemandModifiers {
    if (!this.active) {
      return { moneyMult: 1, powerEffMult: 1, greenMult: 1, pollutionMult: 1, coalEffMult: 1 };
    }
    return { ...DEMANDS[this.active].mods };
  }

  tick(): string[] {
    const messages: string[] = [];
    if (this.active) {
      this.remainingDays -= 1;
      if (this.remainingDays <= 0) {
        messages.push(`城市需求结束：${DEMANDS[this.active].name}`);
        this.active = null;
        this.cooldownDays = 22 + Math.floor(Math.random() * 14);
      }
      return messages;
    }

    this.cooldownDays -= 1;
    if (this.cooldownDays <= 0) {
      this.active = DEMAND_IDS[Math.floor(Math.random() * DEMAND_IDS.length)];
      this.remainingDays = DEMANDS[this.active].durationDays;
      this.cooldownDays = 999;
      messages.push(`城市需求：${DEMANDS[this.active].name} — ${DEMANDS[this.active].description}`);
    }
    return messages;
  }

  getState(): CityDemandState {
    if (!this.active) {
      return {
        id: 'stable',
        name: '城市平稳',
        description: '暂无特殊需求，下一波动态需求即将出现',
        remainingDays: 0,
        nextInDays: Math.max(0, this.cooldownDays),
      };
    }
    const d = DEMANDS[this.active];
    return {
      id: this.active,
      name: d.name,
      description: d.description,
      remainingDays: this.remainingDays,
      nextInDays: 0,
    };
  }
}
