import Phaser from 'phaser';

export type FactoryStatus = 'old' | 'upgraded';

export type RetrofitFactory = {
  id: string;
  tiledId: number;
  displayName: string;
  factoryType: string;
  emission: number;
  reduction: number;
  status: FactoryStatus;
  hitArea:
    | { kind: 'rectangle'; rect: Phaser.Geom.Rectangle }
    | { kind: 'polygon'; polygon: Phaser.Geom.Polygon };
  centerX: number;
  centerY: number;
};

type TiledProp = { name: string; type?: string; value: string | number | boolean };

function readProp(props: TiledProp[] | undefined, ...names: string[]): string | number | undefined {
  if (!props) return undefined;
  for (const name of names) {
    const hit = props.find((p) => p.name === name || p.name.trim() === name.trim());
    if (hit != null) return hit.value as string | number;
  }
  return undefined;
}

function polygonFromObject(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Geom.Polygon | null {
  if (!obj.polygon || obj.polygon.length < 3) return null;
  const flat: number[] = [];
  const ox = obj.x ?? 0;
  const oy = obj.y ?? 0;
  for (const p of obj.polygon) {
    flat.push(ox + p.x, oy + p.y);
  }
  return new Phaser.Geom.Polygon(flat);
}

function rectangleFromObject(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Geom.Rectangle | null {
  const w = obj.width ?? 0;
  const h = obj.height ?? 0;
  if (w <= 0 || h <= 0) return null;
  return new Phaser.Geom.Rectangle(obj.x ?? 0, obj.y ?? 0, w, h);
}

function centerOf(
  hitArea: RetrofitFactory['hitArea'],
): { centerX: number; centerY: number } {
  if (hitArea.kind === 'rectangle') {
    return { centerX: hitArea.rect.centerX, centerY: hitArea.rect.centerY };
  }
  const bounds = Phaser.Geom.Polygon.GetAABB(hitArea.polygon);
  return { centerX: bounds.centerX, centerY: bounds.centerY };
}

export function factoryContainsPoint(factory: RetrofitFactory, x: number, y: number): boolean {
  if (factory.hitArea.kind === 'rectangle') {
    return Phaser.Geom.Rectangle.Contains(factory.hitArea.rect, x, y);
  }
  return Phaser.Geom.Polygon.Contains(factory.hitArea.polygon, x, y);
}

export function parseRetrofitFactory(obj: Phaser.Types.Tilemaps.TiledObject): RetrofitFactory | null {
  if (!obj.name || obj.type !== 'retrofit_factory') return null;

  const props = obj.properties as TiledProp[] | undefined;
  const displayName = String(readProp(props, 'displayName') ?? obj.name);
  const factoryType = String(readProp(props, 'factoryType') ?? 'unknown');
  const emission = Number(readProp(props, 'emission') ?? 0);
  const reduction = Number(readProp(props, 'reduction', 'reduction ') ?? 0);
  const statusRaw = String(readProp(props, 'status') ?? 'old');
  const status: FactoryStatus = statusRaw === 'upgraded' ? 'upgraded' : 'old';

  const polygon = polygonFromObject(obj);
  const rect = polygon ? null : rectangleFromObject(obj);
  if (!polygon && !rect) return null;

  const hitArea = polygon
    ? ({ kind: 'polygon' as const, polygon })
    : ({ kind: 'rectangle' as const, rect: rect! });

  return {
    id: obj.name,
    tiledId: obj.id ?? 0,
    displayName,
    factoryType,
    emission,
    reduction,
    status,
    hitArea,
    ...centerOf(hitArea),
  };
}
