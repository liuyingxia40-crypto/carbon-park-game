import { MAP_COLS, MAP_ROWS, PARK_CENTER_TX, PARK_CENTER_TY } from '../constants';
import { cellToZone, Terrain, type MapCell, Zone } from './mapTypes';

export { PARK_CENTER_TX, PARK_CENTER_TY, Zone };

export type WorldMapData = {
  cells: MapCell[][];
  zones: Zone[][];
  majorRoad: boolean[][];
};

function emptyCell(): MapCell {
  return {
    terrain: Terrain.Grass,
    road: false,
    roadKind: 'town',
    river: false,
    variant: 0,
  };
}

function syncDerived(data: WorldMapData) {
  for (let ty = 0; ty < MAP_ROWS; ty++) {
    for (let tx = 0; tx < MAP_COLS; tx++) {
      data.zones[ty][tx] = cellToZone(data.cells[ty][tx]);
    }
  }
}

/**
 * 沪上风路网：大面积草地 + 中央棋盘式道路（参考截图）
 */
export function generateIndustrialMap(): WorldMapData {
  const cells = Array.from({ length: MAP_ROWS }, () =>
    Array.from({ length: MAP_COLS }, () => ({ ...emptyCell() })),
  );
  const zones = Array.from({ length: MAP_ROWS }, () => Array.from({ length: MAP_COLS }, () => Zone.Grass));
  const majorRoad = Array.from({ length: MAP_ROWS }, () => Array.from({ length: MAP_COLS }, () => false));

  const margin = 2;
  const gridL = 5;
  const gridR = MAP_COLS - 6;
  const gridT = 4;
  const gridB = MAP_ROWS - 5;

  const road = (tx: number, ty: number, major = false) => {
    if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return;
    cells[ty][tx].road = true;
    cells[ty][tx].river = false;
    if (major) majorRoad[ty][tx] = true;
  };

  // 全场草地
  for (let ty = 0; ty < MAP_ROWS; ty++) {
    for (let tx = 0; tx < MAP_COLS; tx++) {
      cells[ty][tx].terrain = Terrain.Grass;
    }
  }

  // 棋盘主干道（横向 + 纵向，形成街区）
  for (let x = gridL; x <= gridR; x++) {
    for (let y = gridT; y <= gridB; y++) {
      if (x % 2 === 0 || y % 2 === 0) {
        road(x, y, x % 4 === 0 && y % 4 === 0);
      }
    }
  }

  // 外圈连接路
  for (let x = margin; x < MAP_COLS - margin; x++) {
    road(x, gridT - 1, true);
    road(x, gridB + 1, true);
  }
  for (let y = margin; y < MAP_ROWS - margin; y++) {
    road(gridL - 1, y, true);
    road(gridR + 1, y, true);
  }

  const data: WorldMapData = { cells, zones, majorRoad };
  syncDerived(data);
  return data;
}

export function getTilesOfZone(data: WorldMapData, zone: Zone) {
  const list: { tx: number; ty: number }[] = [];
  for (let ty = 0; ty < MAP_ROWS; ty++) {
    for (let tx = 0; tx < MAP_COLS; tx++) {
      if (data.zones[ty][tx] === zone) list.push({ tx, ty });
    }
  }
  return list;
}
