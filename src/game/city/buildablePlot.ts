import Phaser from 'phaser';
import { PLACE_Y_RATIO, type PlotTier } from './buildingPlacement';

export type { PlotTier } from './buildingPlacement';

export type BuildableHitArea =
  | { kind: 'rectangle'; rect: Phaser.Geom.Rectangle }
  | { kind: 'polygon'; polygon: Phaser.Geom.Polygon };

export type BuildablePlot = {
  id: number;
  occupied: boolean;
  tier: PlotTier;
  hitArea: BuildableHitArea;
  plotX: number;
  plotY: number;
  plotWidth: number;
  plotHeight: number;
  centerX: number;
  centerY: number;
  placeX: number;
  placeY: number;
};

function polygonFromTiledObject(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Geom.Polygon | null {
  if (!obj.polygon || obj.polygon.length < 3) return null;
  const flat: number[] = [];
  const ox = obj.x ?? 0;
  const oy = obj.y ?? 0;
  for (const p of obj.polygon) {
    flat.push(ox + p.x, oy + p.y);
  }
  return new Phaser.Geom.Polygon(flat);
}

function rectangleFromTiledObject(obj: Phaser.Types.Tilemaps.TiledObject): Phaser.Geom.Rectangle | null {
  const w = obj.width ?? 0;
  const h = obj.height ?? 0;
  if (w <= 0 || h <= 0) return null;
  return new Phaser.Geom.Rectangle(obj.x ?? 0, obj.y ?? 0, w, h);
}

function layoutFromBounds(bounds: Phaser.Geom.Rectangle): Omit<BuildablePlot, 'id' | 'occupied' | 'hitArea' | 'tier'> {
  return {
    plotX: bounds.x,
    plotY: bounds.y,
    plotWidth: bounds.width,
    plotHeight: bounds.height,
    centerX: bounds.centerX,
    centerY: bounds.centerY,
    placeX: bounds.x + bounds.width / 2,
    placeY: bounds.y + bounds.height * PLACE_Y_RATIO,
  };
}

export function parseBuildablePlot(obj: Phaser.Types.Tilemaps.TiledObject): BuildablePlot | null {
  const id = obj.id;
  if (id == null) return null;

  const polygon = polygonFromTiledObject(obj);
  if (polygon) {
    const bounds = Phaser.Geom.Polygon.GetAABB(polygon);
    return {
      id,
      occupied: false,
      tier: 'medium',
      hitArea: { kind: 'polygon', polygon },
      ...layoutFromBounds(bounds),
    };
  }

  const rect = rectangleFromTiledObject(obj);
  if (rect) {
    return {
      id,
      occupied: false,
      tier: 'medium',
      hitArea: { kind: 'rectangle', rect },
      ...layoutFromBounds(rect),
    };
  }

  return null;
}

export function plotContainsPoint(plot: BuildablePlot, x: number, y: number): boolean {
  if (plot.hitArea.kind === 'rectangle') {
    return Phaser.Geom.Rectangle.Contains(plot.hitArea.rect, x, y);
  }
  return Phaser.Geom.Polygon.Contains(plot.hitArea.polygon, x, y);
}
