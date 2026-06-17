import type { BuildingId } from './buildings';
import type { BuildingLevel } from './buildings';
import { footprintCenterWorld } from './iso/isoMath';
import { PARK_CENTER_TX, PARK_CENTER_TY } from './constants';

export const OPENING_HUB_TX = PARK_CENTER_TX;
export const OPENING_HUB_TY = PARK_CENTER_TY;

export type StarterBuilding = {
  id: BuildingId;
  tx: number;
  ty: number;
  level: BuildingLevel;
};

/** 路网街区上的示例建筑 */
export const STARTER_BUILDINGS: StarterBuilding[] = [
  { id: 'thermal_plant', tx: 9, ty: 8, level: 1 },
  { id: 'steel_mill', tx: 13, ty: 10, level: 1 },
  { id: 'solar_plant', tx: 11, ty: 12, level: 1 },
];

export function getOpeningTownFocusWorld() {
  let sx = 0;
  let sy = 0;
  for (const s of STARTER_BUILDINGS) {
    const { x, y } = footprintCenterWorld(s.tx, s.ty, 2, 2);
    sx += x;
    sy += y;
  }
  const n = STARTER_BUILDINGS.length;
  return { x: sx / n, y: sy / n };
}
