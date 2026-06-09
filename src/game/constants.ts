/** 视口基准 */
export const VIEW_W = 1280;
export const VIEW_H = 960;

/** 关闭 grass 测试，启用完整沪上界面 */
export const ISO_GRASS_TEST_ONLY = false;

/** 等距步进 screenX=(x-y)*STEP_X, screenY=(x+y)*STEP_Y */
export const ISO_STEP_X = 64;
export const ISO_STEP_Y = 32;

/** 地块显示尺寸 */
export const ISO_TILE_W = 128;
export const ISO_TILE_H = 64;

export const GRASS_TEST_MAP_SIZE = 10;

export const MAP_COLS = 22;
export const MAP_ROWS = 22;

export const PARK_CENTER_TX = 11;
export const PARK_CENTER_TY = 11;

export const MAP_ORIGIN_X = (MAP_ROWS - 1) * (ISO_STEP_X / 2) + 80;
export const MAP_ORIGIN_Y = 120;

const MAP_MAX_X = MAP_ORIGIN_X + (MAP_COLS - 1) * ISO_STEP_X;
const MAP_MAX_Y = MAP_ORIGIN_Y + (MAP_COLS - 1 + MAP_ROWS - 1) * ISO_STEP_Y;
export const WORLD_W = MAP_MAX_X + ISO_TILE_W;
export const WORLD_H = MAP_MAX_Y + ISO_TILE_H;

export const CAMERA_ZOOM_MIN = 0.45;
export const CAMERA_ZOOM_MAX = 1.2;
export const CAMERA_ZOOM_DEFAULT = 0.72;
export const CAMERA_PAN_LERP = 0.14;
export const CAMERA_ZOOM_LERP = 0.12;

export const ECONOMY_TICK_MS = 1000;
