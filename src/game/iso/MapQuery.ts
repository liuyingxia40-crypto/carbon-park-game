import { MAP_COLS, MAP_ROWS } from '../constants';
import { Zone, type WorldMapData } from './mapGenerator';

export class MapQuery {
  constructor(private data: WorldMapData) {}

  getZone(tx: number, ty: number): Zone | null {
    if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return null;
    return this.data.zones[ty][tx];
  }

  canBuildOn(tx: number, ty: number) {
    return this.getZone(tx, ty) === Zone.Industrial;
  }

  isBlocked(tx: number, ty: number) {
    const z = this.getZone(tx, ty);
    return z === null || z === Zone.River || z === Zone.Road;
  }
}
