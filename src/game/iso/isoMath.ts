import { ISO_STEP_X, ISO_STEP_Y, MAP_ORIGIN_X, MAP_ORIGIN_Y, PARK_CENTER_TX, PARK_CENTER_TY } from '../constants';

export { PARK_CENTER_TX, PARK_CENTER_TY };

export function getParkCenterWorld() {
  return tileToWorld(PARK_CENTER_TX, PARK_CENTER_TY);
}

export function getMapWorldCenter() {
  return getParkCenterWorld();
}

/** 等距格心：screenX=(x-y)*64, screenY=(x+y)*32 */
export function tileToWorld(tx: number, ty: number) {
  return {
    x: MAP_ORIGIN_X + (tx - ty) * ISO_STEP_X,
    y: MAP_ORIGIN_Y + (tx + ty) * ISO_STEP_Y,
  };
}

export function worldToTile(wx: number, wy: number) {
  const lx = wx - MAP_ORIGIN_X;
  const ly = wy - MAP_ORIGIN_Y;
  const tx = (lx / ISO_STEP_X + ly / ISO_STEP_Y) / 2;
  const ty = (ly / ISO_STEP_Y - lx / ISO_STEP_X) / 2;
  return { tx: Math.floor(tx), ty: Math.floor(ty) };
}

export function footprintCenterWorld(tx: number, ty: number, w: number, h: number) {
  const cx = tx + (w - 1) / 2;
  const cy = ty + (h - 1) / 2;
  return tileToWorld(cx, cy);
}
