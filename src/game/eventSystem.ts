import Phaser from 'phaser';

export type EventId =
  | 'eco_inspection'
  | 'energy_crisis'
  | 'heat_wave'
  | 'green_subsidy';

export type EventModifiers = {
  moneyMult: number;
  powerMult: number;
  pollutionPerSec: number;
  buildCostMult: number;
};

export type ActiveEvent = {
  id: EventId;
  name: string;
  description: string;
  remainingDays: number;
  durationDays: number;
  modifiers: EventModifiers;
};

export type EventState = {
  active: ActiveEvent | null;
  nextInDays: number;
};

const EVENT_DEFS: Record<
  EventId,
  {
    name: string;
    description: string;
    durationDays: number;
    weight: number;
    modifiers: EventModifiers;
  }
> = {
  eco_inspection: {
    name: '环保检查',
    description: '污染偏高将处以罚款 · 减排可避罚',
    durationDays: 18,
    weight: 1.2,
    modifiers: { moneyMult: 1, powerMult: 1, pollutionPerSec: 0, buildCostMult: 1.1 },
  },
  energy_crisis: {
    name: '能源危机',
    description: '全网电力产出 -35%',
    durationDays: 16,
    weight: 1,
    modifiers: { moneyMult: 1, powerMult: 0.65, pollutionPerSec: 0, buildCostMult: 1 },
  },
  heat_wave: {
    name: '高温天气',
    description: '冷却负荷上升 · 污染 +4/s',
    durationDays: 14,
    weight: 0.9,
    modifiers: { moneyMult: 0.95, powerMult: 0.9, pollutionPerSec: 4, buildCostMult: 1 },
  },
  green_subsidy: {
    name: '绿色补贴',
    description: '清洁能源补贴 · 收益与绿分提升',
    durationDays: 20,
    weight: 0.85,
    modifiers: { moneyMult: 1.25, powerMult: 1, pollutionPerSec: -1, buildCostMult: 0.85 },
  },
};

export class EventSystem {
  active: ActiveEvent | null = null;
  private cooldown = Phaser.Math.Between(18, 28);
  private elapsed = 0;
  private inspectionFined = false;

  getState(): EventState {
    return {
      active: this.active,
      nextInDays: this.active ? 0 : Math.max(0, Math.ceil(this.cooldown - this.elapsed)),
    };
  }

  getModifiers(): EventModifiers {
    if (!this.active) {
      return { moneyMult: 1, powerMult: 1, pollutionPerSec: 0, buildCostMult: 1 };
    }
    return { ...this.active.modifiers };
  }

  tick(pollution: number, _resources: { money: number }): { messages: string[]; moneyDelta: number } {
    const messages: string[] = [];
    let moneyDelta = 0;

    if (this.active) {
      this.active.remainingDays -= 1;

      if (this.active.id === 'eco_inspection' && pollution > 45 && !this.inspectionFined) {
        this.inspectionFined = true;
        moneyDelta = -400;
        messages.push('环保检查未通过：罚款 ¥400');
      }

      if (this.active.remainingDays <= 0) {
        messages.push(`事件结束：${this.active.name}`);
        this.active = null;
        this.elapsed = 0;
        this.cooldown = Phaser.Math.Between(22, 36);
        this.inspectionFined = false;
      }
    } else {
      this.elapsed += 1;
      if (this.elapsed >= this.cooldown) {
        const ev = this.rollEvent();
        this.active = ev;
        this.elapsed = 0;
        messages.push(`【事件】${ev.name}：${ev.description}`);
      }
    }

    return { messages, moneyDelta };
  }

  private rollEvent(): ActiveEvent {
    const ids = Object.keys(EVENT_DEFS) as EventId[];
    let total = 0;
    for (const id of ids) total += EVENT_DEFS[id].weight;
    let r = Math.random() * total;
    let picked = ids[0];
    for (const id of ids) {
      r -= EVENT_DEFS[id].weight;
      if (r <= 0) {
        picked = id;
        break;
      }
    }
    const def = EVENT_DEFS[picked];
    return {
      id: picked,
      name: def.name,
      description: def.description,
      remainingDays: def.durationDays,
      durationDays: def.durationDays,
      modifiers: { ...def.modifiers },
    };
  }
}
