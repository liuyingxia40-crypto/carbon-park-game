import {
  BUILDABLE_PLOT_ORDER,
  PLACEMENT_MAP_IMAGE,
  resolveFactorySpritePath,
  spriteImageToFactoryId,
  TILED_OBJECT_LAYERS,
} from './factoryPlacements';
import type { FactoryId } from '../story/phase1Script';

type TiledPoint = { x: number; y: number };

type TiledObject = {
  id: number;
  name: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  gid?: number;
  polygon?: TiledPoint[];
  properties?: Array<{ name: string; value: string | number | boolean }>;
  point?: boolean;
  visible?: boolean;
};

type TiledImageLayer = {
  name: string;
  type: 'imagelayer';
  image?: string;
  offsetx?: number;
  offsety?: number;
  x?: number;
  y?: number;
};

type TiledObjectGroup = {
  name: string;
  type: string;
  objects?: TiledObject[];
  offsetx?: number;
  offsety?: number;
  x?: number;
  y?: number;
  visible?: boolean;
};

type TiledTileDef = {
  id: number;
  image: string;
};

type TiledTileset = {
  firstgid: number;
  tiles?: TiledTileDef[];
};

export type TiledMapJson = {
  layers?: Array<TiledObjectGroup | TiledImageLayer>;
  tilesets?: TiledTileset[];
};

export type ParsedFactorySprite = {
  objectId: number;
  factoryId: FactoryId;
  label: string;
  image: string;
  /** Tiled JSON 原始 object.x（左侧） */
  tiledX: number;
  /** Tiled JSON 原始 object.y（Tile Object 底边锚点） */
  tiledY: number;
  width: number;
  height: number;
  rotation: number;
  layerOffsetX: number;
  layerOffsetY: number;
  /** buildable_plots 多边形，仅用于点击检测，不渲染 */
  hitPolygon: TiledPoint[];
};

export type ParsedRetrofitMap = {
  mapImage: string;
  mapImageOffsetX: number;
  mapImageOffsetY: number;
  factories: ParsedFactorySprite[];
  factoryById: Record<FactoryId, ParsedFactorySprite>;
};

const GID_MASK = 0x1fffffff;

const FACTORY_LABELS: Record<FactoryId, string> = {
  factory_coal: '燃煤工厂',
  factory_chemical: '化工厂',
  factory_heavy: '绿色制造厂',
};

function objectWorldXY(obj: TiledObject, layer: TiledObjectGroup): { x: number; y: number } {
  const layerX = (layer.x ?? 0) + (layer.offsetx ?? 0);
  const layerY = (layer.y ?? 0) + (layer.offsety ?? 0);
  return { x: obj.x + layerX, y: obj.y + layerY };
}

function tileObjectRenderRect(
  obj: TiledObject,
  layer: TiledObjectGroup,
): { x: number; y: number; width: number; height: number } {
  const offsetX = (layer.offsetx ?? 0);
  const offsetY = (layer.offsety ?? 0);
  const width = obj.width ?? 0;
  const height = obj.height ?? 0;
  return {
    x: obj.x + offsetX,
    y: obj.y - height + offsetY,
    width,
    height,
  };
}

function findObjectLayer(map: TiledMapJson, layerName: string): TiledObjectGroup | undefined {
  const layer = map.layers?.find(
    (entry) => entry.type === 'objectgroup' && entry.name === layerName,
  );
  return layer as TiledObjectGroup | undefined;
}

function parseMapImage(map: TiledMapJson): {
  mapImage: string;
  mapImageOffsetX: number;
  mapImageOffsetY: number;
} {
  const imageLayer = map.layers?.find((layer) => layer.type === 'imagelayer') as
    | TiledImageLayer
    | undefined;

  return {
    mapImage: imageLayer?.image ?? PLACEMENT_MAP_IMAGE,
    mapImageOffsetX: (imageLayer?.x ?? 0) + (imageLayer?.offsetx ?? 0),
    mapImageOffsetY: (imageLayer?.y ?? 0) + (imageLayer?.offsety ?? 0),
  };
}

function buildGidImageLookup(map: TiledMapJson): Map<number, string> {
  const lookup = new Map<number, string>();
  for (const tileset of map.tilesets ?? []) {
    const firstgid = tileset.firstgid ?? 1;
    for (const tile of tileset.tiles ?? []) {
      lookup.set(firstgid + tile.id, tile.image);
    }
  }
  return lookup;
}

function resolveGidImage(gid: number | undefined, lookup: Map<number, string>): string {
  if (!gid) return '';
  const raw = lookup.get(gid & GID_MASK) ?? '';
  return resolveFactorySpritePath(raw);
}

function rectHitPolygon(x: number, y: number, width: number, height: number): TiledPoint[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];
}

function polygonFromPlotObject(
  obj: TiledObject,
  layer: TiledObjectGroup,
): TiledPoint[] | null {
  const origin = objectWorldXY(obj, layer);
  if (obj.polygon?.length) {
    return obj.polygon.map((point) => ({
      x: origin.x + point.x,
      y: origin.y + point.y,
    }));
  }
  const w = obj.width ?? 0;
  const h = obj.height ?? 0;
  if (w > 0 && h > 0) return rectHitPolygon(origin.x, origin.y, w, h);
  return null;
}

function parseBuildablePlotHitAreas(map: TiledMapJson): Map<string, TiledPoint[]> {
  const layer = findObjectLayer(map, TILED_OBJECT_LAYERS.buildablePlots);
  const result = new Map<string, TiledPoint[]>();
  if (!layer?.objects?.length) return result;

  for (const obj of layer.objects) {
    if (!obj.name) continue;
    const poly = polygonFromPlotObject(obj, layer);
    if (poly) result.set(obj.name, poly);
  }
  return result;
}

function parseFactorySprites(map: TiledMapJson): ParsedFactorySprite[] {
  const layer = findObjectLayer(map, TILED_OBJECT_LAYERS.factoryObjects);
  if (!layer?.objects?.length) return [];

  const gidLookup = buildGidImageLookup(map);
  const plotHits = parseBuildablePlotHitAreas(map);

  const sortedObjects = layer.objects
    .filter((obj) => obj.visible !== false)
    .sort((a, b) => a.id - b.id);

  return sortedObjects.map((obj, index) => {
    const width = obj.width ?? 0;
    const height = obj.height ?? 0;
    const layerOffsetX = layer.offsetx ?? 0;
    const layerOffsetY = layer.offsety ?? 0;
    const mapRect = tileObjectRenderRect(obj, layer);
    const image = resolveGidImage(obj.gid, gidLookup);
    const factoryId = spriteImageToFactoryId(image);
    if (!factoryId) {
      throw new Error(`无法识别工厂贴图：${image || obj.id}`);
    }

    const plotId = BUILDABLE_PLOT_ORDER[index];
    const hitPolygon =
      (plotId && plotHits.get(plotId)) ??
      rectHitPolygon(mapRect.x, mapRect.y, width, height);

    return {
      objectId: obj.id,
      factoryId,
      label: FACTORY_LABELS[factoryId],
      image,
      tiledX: obj.x,
      tiledY: obj.y,
      width,
      height,
      rotation: obj.rotation ?? 0,
      layerOffsetX,
      layerOffsetY,
      hitPolygon,
    };
  });
}

export function parseRetrofitMap(map: TiledMapJson): ParsedRetrofitMap {
  const factories = parseFactorySprites(map);
  const factoryById = {} as Record<FactoryId, ParsedFactorySprite>;
  for (const factory of factories) {
    factoryById[factory.factoryId] = factory;
  }

  const { mapImage, mapImageOffsetX, mapImageOffsetY } = parseMapImage(map);

  return {
    mapImage,
    mapImageOffsetX,
    mapImageOffsetY,
    factories,
    factoryById,
  };
}

export function polygonToSvgPoints(polygon: TiledPoint[]): string {
  return polygon.map((p) => `${p.x},${p.y}`).join(' ');
}

export function hitTestPolygon(polygon: TiledPoint[], mapX: number, mapY: number): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > mapY !== yj > mapY && mapX < ((xj - xi) * (mapY - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getFactoryStatusLabel(
  factoryId: FactoryId,
  initialRetrofitDone: FactoryId[],
  deepOptimizedFactory: FactoryId | null,
): '待改造' | '已初改' | '已深改' {
  if (deepOptimizedFactory === factoryId) return '已深改';
  if (initialRetrofitDone.includes(factoryId)) return '已初改';
  return '待改造';
}
