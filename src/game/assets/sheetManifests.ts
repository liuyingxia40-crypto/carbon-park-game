import { BUILDING_FRAMES, EFFECT_FRAMES, ICON_FRAMES, UI_FRAMES } from './assetIds';
import { TILE_SHEET } from './tileSheetLayout';
import type { SheetManifest } from './types';

const SPRITE_ROOT = '/assets/sprites';
const ATLAS_ROOT = '/assets/atlases';

export const SHEET_MANIFESTS: SheetManifest[] = [
  {
    atlasKey: 'buildings',
    imageUrl: `${SPRITE_ROOT}/buildings_sheet.png`,
    atlasJsonUrl: `${ATLAS_ROOT}/buildings_atlas.json`,
    slice: {
      type: 'grid',
      cols: 4,
      rows: 1,
      frameWidth: 128,
      frameHeight: 128,
      frameIds: [
        BUILDING_FRAMES.thermal,
        BUILDING_FRAMES.steel,
        BUILDING_FRAMES.solar,
        BUILDING_FRAMES.recycle,
      ],
    },
  },
  {
    atlasKey: 'tiles',
    imageUrl: `${SPRITE_ROOT}/tiles_sheet.png`,
    atlasJsonUrl: `${ATLAS_ROOT}/tiles_atlas.json`,
    slice: {
      type: 'grid',
      cols: TILE_SHEET.cols,
      rows: 6,
      frameWidth: TILE_SHEET.frameWidth,
      frameHeight: TILE_SHEET.frameHeight,
      frameIds: [...TILE_SHEET.frameIds],
    },
  },
  {
    atlasKey: 'icons',
    imageUrl: `${SPRITE_ROOT}/icons_sheet.png`,
    atlasJsonUrl: `${ATLAS_ROOT}/icons_atlas.json`,
    slice: {
      type: 'grid',
      cols: 6,
      rows: 1,
      frameWidth: 32,
      frameHeight: 32,
      frameIds: [
        ICON_FRAMES.money,
        ICON_FRAMES.power,
        ICON_FRAMES.pollution,
        ICON_FRAMES.green,
        ICON_FRAMES.ui_build,
        ICON_FRAMES.ui_close,
      ],
    },
  },
  {
    atlasKey: 'effects',
    imageUrl: `${SPRITE_ROOT}/effects_sheet.png`,
    atlasJsonUrl: `${ATLAS_ROOT}/effects_atlas.json`,
    slice: {
      type: 'grid',
      cols: 4,
      rows: 1,
      frameWidth: 32,
      frameHeight: 32,
      frameIds: [
        EFFECT_FRAMES.smoke,
        EFFECT_FRAMES.power,
        EFFECT_FRAMES.upgrade,
        EFFECT_FRAMES.warning,
      ],
    },
  },
  {
    atlasKey: 'ui',
    imageUrl: `${SPRITE_ROOT}/ui_sheet.png`,
    atlasJsonUrl: `${ATLAS_ROOT}/ui_atlas.json`,
    slice: {
      type: 'grid',
      cols: 2,
      rows: 2,
      frameWidth: 256,
      frameHeight: 64,
      frameIds: [
        UI_FRAMES.resourceBar,
        UI_FRAMES.buildMenu,
        UI_FRAMES.statusPanel,
        UI_FRAMES.buildingInfo,
      ],
    },
  },
];

export const BUILDING_TEXTURE_MAP: Record<string, { atlasKey: string; frameId: string }> = {
  coal_mine: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.thermal },
  thermal_plant: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.thermal },
  steel_mill: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.steel },
  solar_plant: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.solar },
  recycling_plant: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.recycle },
  green_tech_hub: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.recycle },
  carbon_exchange: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.steel },
  zero_carbon_tower: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.solar },
  smart_industry_core: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.steel },
  mega_storage: { atlasKey: 'buildings', frameId: BUILDING_FRAMES.thermal },
};

export function getManifestByKey(key: string): SheetManifest | undefined {
  return SHEET_MANIFESTS.find((m) => m.atlasKey === key);
}
