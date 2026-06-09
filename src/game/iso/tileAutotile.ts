import { TILE_FRAMES } from '../assets/assetIds';
import type { MapCell } from './mapTypes';
import { Terrain } from './mapTypes';

const N = 1;
const E = 2;
const S = 4;
const W = 8;

export function roadNeighborMask(cells: MapCell[][], tx: number, ty: number): number {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  let mask = 0;
  if (ty > 0 && cells[ty - 1][tx].road) mask |= N;
  if (tx < cols - 1 && cells[ty][tx + 1].road) mask |= E;
  if (ty < rows - 1 && cells[ty + 1][tx].road) mask |= S;
  if (tx > 0 && cells[ty][tx - 1].road) mask |= W;
  return mask;
}

function pickRoad(
  town: string,
  townMajor: string,
  industrial: string,
  concrete: string,
  kind: MapCell['roadKind'],
  major: boolean,
): string {
  if (kind === 'concrete') return concrete;
  if (kind === 'industrial') return industrial;
  return major ? townMajor : town;
}

/** 4 向道路自动拼接 */
export function resolveRoadFrame(
  mask: number,
  kind: MapCell['roadKind'],
  major: boolean,
): string {
  if (mask === 0) {
    return pickRoad(
      TILE_FRAMES.roadSingle,
      TILE_FRAMES.roadSingle,
      TILE_FRAMES.roadEndSmall,
      TILE_FRAMES.concreteSmall,
      kind,
      major,
    );
  }
  if (mask === 15) {
    return pickRoad(
      TILE_FRAMES.roadCross,
      TILE_FRAMES.roadCrossLarge,
      TILE_FRAMES.roadCrossLarge,
      TILE_FRAMES.concreteRoad,
      kind,
      major,
    );
  }
  if (mask === 7 || mask === 11 || mask === 13 || mask === 14) {
    return pickRoad(
      TILE_FRAMES.roadT,
      TILE_FRAMES.roadSplit,
      TILE_FRAMES.roadSplit,
      TILE_FRAMES.concreteRoad,
      kind,
      major,
    );
  }
  if (mask === 3 || mask === 6 || mask === 12 || mask === 9) {
    return pickRoad(
      TILE_FRAMES.roadCorner,
      TILE_FRAMES.roadCorner,
      TILE_FRAMES.roadSmallCorner,
      TILE_FRAMES.concreteRoad,
      kind,
      major,
    );
  }
  if (mask === 5 || mask === 10) {
    return pickRoad(
      TILE_FRAMES.roadStraight,
      TILE_FRAMES.roadStraight,
      TILE_FRAMES.roadIndustrial,
      TILE_FRAMES.concreteRoad,
      kind,
      major,
    );
  }
  return pickRoad(
    TILE_FRAMES.roadEnd,
    TILE_FRAMES.roadEnd,
    TILE_FRAMES.roadEndSmall,
    TILE_FRAMES.concreteRoad,
    kind,
    major,
  );
}

/** 基底：草地铺满（沪上绿野） */
export function terrainFrame(cell: MapCell): string {
  if (cell.terrain === Terrain.Dirt) return TILE_FRAMES.dirt;
  return TILE_FRAMES.grass;
}

/** 河岸：仅草地邻接河流处 */
export function shouldPlaceShore(cells: MapCell[][], tx: number, ty: number): boolean {
  const cell = cells[ty][tx];
  if (cell.river || cell.road || cell.terrain === Terrain.Industrial) return false;
  return hasRiverNeighbor(cells, tx, ty);
}

export function resolveRiverFrame(cells: MapCell[][], tx: number, ty: number): string {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const isRiver = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    return cells[y][x].river;
  };

  const w = isRiver(tx - 1, ty);
  const e = isRiver(tx + 1, ty);
  const n = isRiver(tx, ty - 1);
  const s = isRiver(tx, ty + 1);

  if (w && e) return TILE_FRAMES.riverCenter;
  if (w && !e) return TILE_FRAMES.riverRight;
  if (!w && e) return TILE_FRAMES.riverLeft;
  if (n || s) return TILE_FRAMES.riverCenter;
  return TILE_FRAMES.riverCenter;
}

export function hasRiverNeighbor(cells: MapCell[][], tx: number, ty: number): boolean {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  const isRiver = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    return cells[y][x].river;
  };
  return isRiver(tx, ty - 1) || isRiver(tx + 1, ty) || isRiver(tx, ty + 1) || isRiver(tx - 1, ty);
}
