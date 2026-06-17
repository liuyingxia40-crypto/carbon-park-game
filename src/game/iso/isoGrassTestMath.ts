import {
  GRASS_TEST_MAP_SIZE,
  ISO_STEP_X,
  ISO_STEP_Y,
  ISO_TILE_H,
  ISO_TILE_W,
} from '../constants';

/** 等距格心坐标（无额外 origin 偏移） */
export function isoTileCenter(tx: number, ty: number) {
  return {
    x: (tx - ty) * ISO_STEP_X,
    y: (tx + ty) * ISO_STEP_Y,
  };
}

/** 将 map 几何中心对齐到视口中心所需的平移 */
export function isoMapViewportOffset(
  cols: number,
  rows: number,
  viewW: number,
  viewH: number,
): { x: number; y: number; centerX: number; centerY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let ty = 0; ty < rows; ty++) {
    for (let tx = 0; tx < cols; tx++) {
      const { x, y } = isoTileCenter(tx, ty);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    x: viewW / 2 - centerX,
    y: viewH / 2 - centerY,
    centerX: viewW / 2,
    centerY: viewH / 2,
  };
}

export function warnGrassTileSize(frameW: number, frameH: number) {
  if (frameW !== ISO_TILE_W || frameH !== ISO_TILE_H) {
    console.warn(
      `[IsoGrassTest] grass 纹理应为 ${ISO_TILE_W}×${ISO_TILE_H}，当前 ${frameW}×${frameH} — 未缩放，拼接可能不齐`,
    );
  }
}

export const GRASS_TEST_COLS = GRASS_TEST_MAP_SIZE;
export const GRASS_TEST_ROWS = GRASS_TEST_MAP_SIZE;
