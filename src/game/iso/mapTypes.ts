/** 地形基底（草地 → 工业地 → 道路 → 河流 → 装饰 分层绘制） */
export enum Terrain {
  Grass = 0,
  Dirt = 1,
  Industrial = 2,
  Concrete = 3,
}

export type RoadKind = 'town' | 'industrial' | 'concrete';

export type MapCell = {
  terrain: Terrain;
  road: boolean;
  roadKind: RoadKind;
  river: boolean;
  /** 0–1，用于稳定随机选 tile 变体 */
  variant: number;
};

/** 逻辑分区（建造判定等） */
export enum Zone {
  Grass = 0,
  Road = 1,
  Industrial = 2,
  River = 3,
}

export function cellToZone(cell: MapCell): Zone {
  if (cell.river) return Zone.River;
  if (cell.road) return Zone.Road;
  if (cell.terrain === Terrain.Industrial || cell.terrain === Terrain.Concrete) return Zone.Industrial;
  return Zone.Grass;
}

export function cellVariant(tx: number, ty: number): number {
  const n = (tx * 7919 + ty * 104729) % 9973;
  return n / 9973;
}
