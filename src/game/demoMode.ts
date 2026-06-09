import type { BuildingId } from './buildings';
import type { DevRoute } from './developmentRoute';
import type { SuperBuildingId } from './superBuildings';

export type DemoAction =
  | { type: 'route'; route: DevRoute }
  | { type: 'build'; id: BuildingId }
  | { type: 'super'; id: SuperBuildingId }
  | { type: 'upgrade'; uid: string }
  | { type: 'greenOffset' }
  | { type: 'ecoUpgrade' }
  | { type: 'none' };

const DEMO_BUILD_ORDER: BuildingId[] = [
  'coal_mine',
  'thermal_plant',
  'steel_mill',
  'solar_plant',
  'recycling_plant',
  'green_tech_hub',
];

/**
 * 演示模式：展会/大屏自动经营展示
 */
export class DemoModeController {
  active = false;
  private step = 0;
  private cooldown = 0;

  toggle() {
    this.active = !this.active;
    this.step = 0;
    this.cooldown = 0;
    return this.active;
  }

  tick(input: {
    hasRoute: boolean;
    money: number;
    green: number;
    pollution: number;
    placedIds: BuildingId[];
    builtSupers: SuperBuildingId[];
    placed: { uid: string; id: BuildingId; level: number }[];
    canPlace: (id: BuildingId) => boolean;
    canPlaceSuper: (id: SuperBuildingId) => boolean;
  }): DemoAction {
    if (!this.active) return { type: 'none' };

    if (this.cooldown > 0) {
      this.cooldown -= 1;
      return { type: 'none' };
    }

    if (!input.hasRoute) {
      this.cooldown = 3;
      return { type: 'route', route: 'green' };
    }

    if (input.pollution > 55 && input.green >= 10) {
      this.cooldown = 8;
      return { type: 'greenOffset' };
    }

    const upgradable = input.placed.find((p) => p.level < 4 && input.money > 800);
    if (upgradable && this.step % 4 === 2) {
      this.cooldown = 6;
      this.step += 1;
      return { type: 'upgrade', uid: upgradable.uid };
    }

    const nextB = DEMO_BUILD_ORDER.find((id) => !input.placedIds.includes(id) && input.canPlace(id));
    if (nextB && input.money > 1200) {
      this.cooldown = 10;
      this.step += 1;
      return { type: 'build', id: nextB };
    }

    const superOrder: SuperBuildingId[] = ['mega_storage', 'smart_industry_core', 'carbon_exchange', 'zero_carbon_tower'];
    const nextS = superOrder.find((id) => !input.builtSupers.includes(id) && input.canPlaceSuper(id));
    if (nextS && input.money > 15000) {
      this.cooldown = 14;
      this.step += 1;
      return { type: 'super', id: nextS };
    }

    if (input.green >= 12 && this.step % 5 === 0) {
      this.cooldown = 12;
      return { type: 'ecoUpgrade' };
    }

    this.cooldown = 4;
    this.step += 1;
    return { type: 'none' };
  }

  getLabel(): string {
    return this.active ? '演示模式 · 自动展示绿色转型' : '';
  }
}
