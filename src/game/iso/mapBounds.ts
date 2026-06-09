import { ISO_TILE_H, ISO_TILE_W, MAP_COLS, MAP_ROWS, MAP_ORIGIN_Y } from '../constants';
import { tileToWorld } from './isoMath';

export type MapWorldBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
};

export function getMapWorldBounds(): MapWorldBounds {
  const tl = tileToWorld(0, 0);
  const br = tileToWorld(MAP_COLS - 1, MAP_ROWS - 1);
  const minX = tl.x - ISO_TILE_W * 0.75;
  const minY = MAP_ORIGIN_Y - ISO_TILE_H;
  const maxX = br.x + ISO_TILE_W * 0.75;
  const maxY = br.y + ISO_TILE_H * 1.5;
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}
