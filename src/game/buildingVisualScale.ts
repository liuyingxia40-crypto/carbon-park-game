import { ISO_TILE_W } from './constants';

/**
 * 建筑缩放：与等距格子对齐（128px 纹理 ≈ footprint 格宽）
 */
export function getBuildingSpriteScale(
  tilesW: number,
  tilesH: number,
  opts?: { starter?: boolean },
): number {
  const footprint = Math.max(tilesW, tilesH);
  const tileUnits = footprint * (ISO_TILE_W / 128);
  const starterBoost = opts?.starter ? 1.06 : 1;
  return tileUnits * 0.65 * starterBoost;
}
