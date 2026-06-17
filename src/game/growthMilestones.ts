import type { BuildingId } from './buildings';
import { BUILDINGS } from './buildings';
import type { CityGrade } from './cityRating';
import { gradeIndex } from './cityRating';
import type { SuperBuildingId } from './superBuildings';
import { SUPER_BUILDINGS } from './superBuildings';
import type { TechId } from './techTree';
import { TECH_TREE } from './techTree';

export type Milestone = {
  id: string;
  label: string;
  progress: number;
  done: boolean;
  priority: number;
};

export function computeMilestones(input: {
  grade: CityGrade;
  green: number;
  buildingCount: number;
  maxBuildingLevel: number;
  unlockedTechs: TechId[];
  builtSupers: SuperBuildingId[];
  placedIds: BuildingId[];
  advancedUnlocked: boolean;
}): Milestone[] {
  const milestones: Milestone[] = [];
  const grades: CityGrade[] = ['D', 'C', 'B', 'A', 'S'];
  const nextGrade = grades[Math.min(4, gradeIndex(input.grade) + 1)];
  if (input.grade !== 'S') {
    milestones.push({
      id: 'grade',
      label: `提升城市评级至 ${nextGrade}`,
      progress: Math.min(100, gradeIndex(input.grade) * 22 + input.green * 0.5),
      done: false,
      priority: 3,
    });
  }

  if (input.maxBuildingLevel < 4) {
    milestones.push({
      id: 'upgrade',
      label: '将工厂升级至 Lv.4（氢能/智慧级）',
      progress: (input.maxBuildingLevel / 4) * 100,
      done: false,
      priority: 4,
    });
  }

  const lockedTech = (Object.keys(TECH_TREE) as TechId[]).find((id) => !input.unlockedTechs.includes(id));
  if (lockedTech) {
    const t = TECH_TREE[lockedTech];
    milestones.push({
      id: 'tech',
      label: `研究科技：${t.name}`,
      progress: input.unlockedTechs.length * (100 / 6),
      done: false,
      priority: 2,
    });
  }

  if (!input.advancedUnlocked) {
    milestones.push({
      id: 'carbon',
      label: '碳交易解锁高级工业（40 绿分）',
      progress: Math.min(100, (input.green / 40) * 100),
      done: false,
      priority: 5,
    });
  }

  const nextSuper = (Object.keys(SUPER_BUILDINGS) as SuperBuildingId[]).find(
    (id) => !input.builtSupers.includes(id),
  );
  if (nextSuper) {
    const s = SUPER_BUILDINGS[nextSuper];
    milestones.push({
      id: `super_${nextSuper}`,
      label: `建造超级建筑：${s.name}`,
      progress: Math.min(100, (input.green / s.minGreen) * 50 + gradeIndex(input.grade) * 12),
      done: false,
      priority: 1,
    });
  }

  const lockedBld = (Object.keys(BUILDINGS) as BuildingId[]).find(
    (id) => !input.placedIds.includes(id) && BUILDINGS[id].tier === 'green',
  );
  if (lockedBld && input.buildingCount < 12) {
    milestones.push({
      id: 'expand',
      label: `扩张：部署 ${BUILDINGS[lockedBld].name}`,
      progress: Math.min(100, input.buildingCount * 9),
      done: false,
      priority: 6,
    });
  }

  if (input.builtSupers.length === 4) {
    milestones.push({
      id: 'master',
      label: '工业文明大师 · 全部超级建筑已建成',
      progress: 100,
      done: true,
      priority: 0,
    });
  }

  return milestones.filter((m) => !m.done).sort((a, b) => a.priority - b.priority).slice(0, 4);
}
