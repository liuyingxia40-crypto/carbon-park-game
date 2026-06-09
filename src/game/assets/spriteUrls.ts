/** React / CSS 引用的精灵图路径（与 sheetManifests 一致） */
export const SPRITE_ROOT = '/assets/sprites';

export const SPRITE_URLS = {
  buildings: `${SPRITE_ROOT}/buildings_sheet.png`,
  tiles: `${SPRITE_ROOT}/tiles_sheet.png`,
  icons: `${SPRITE_ROOT}/icons_sheet.png`,
  effects: `${SPRITE_ROOT}/effects_sheet.png`,
  ui: `${SPRITE_ROOT}/ui_sheet.png`,
} as const;

export const SHEET_LAYOUT = {
  buildings: { cols: 4, rows: 1, fw: 128, fh: 128 },
  tiles: { cols: 7, rows: 2, fw: 64, fh: 32 },
  icons: { cols: 6, rows: 1, fw: 32, fh: 32 },
  ui: { cols: 2, rows: 2, fw: 256, fh: 64 },
} as const;
