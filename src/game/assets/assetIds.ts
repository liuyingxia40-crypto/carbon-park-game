/** 全局资源 ID（与 atlas 内帧名一致） */

export const BUILDING_FRAMES = {
  thermal: 'bld_thermal',
  steel: 'bld_steel',
  solar: 'bld_solar',
  recycle: 'bld_recycle',
} as const;

/** tiles 图集帧 ID（7×6，行优先，与 tileSheetLayout 一致） */
export const TILE_FRAMES = {
  grass: 'tile_grass',
  grassDetail: 'tile_grass_detail',
  dirt: 'tile_dirt',
  roadStraight: 'tile_road_straight',
  roadCorner: 'tile_road_corner',
  roadCross: 'tile_road_cross',
  concrete: 'tile_concrete',
  grassVariant: 'tile_grass_variant',
  dirtDetail: 'tile_dirt_detail',
  industrialGround: 'tile_industrial_ground',
  roadT: 'tile_road_t',
  roadEnd: 'tile_road_end',
  roadSmallCorner: 'tile_road_small_corner',
  concreteDark: 'tile_concrete_dark',
  grassDense: 'tile_grass_dense',
  grassRock: 'tile_grass_rock',
  industrialMark: 'tile_industrial_mark',
  roadSplit: 'tile_road_split',
  roadCrossLarge: 'tile_road_cross_large',
  roadIndustrial: 'tile_road_industrial',
  roadEndSmall: 'tile_road_end_small',
  grassBig: 'tile_grass_big',
  dirtEdge: 'tile_dirt_edge',
  roadSingle: 'tile_road_single',
  roadTSmall: 'tile_road_t_small',
  roadCrossSmall: 'tile_road_cross_small',
  shoreline: 'tile_shoreline',
  concreteTile: 'tile_concrete_tile',
  riverLeft: 'tile_river_left',
  riverCenter: 'tile_river_center',
  riverRight: 'tile_river_right',
  industrialRoad: 'tile_industrial_road',
  concreteRoad: 'tile_concrete_road',
  crackGround: 'tile_crack_ground',
  industrialWarning: 'tile_industrial_warning',
  grassClean: 'tile_grass_clean',
  industrialDirt: 'tile_industrial_dirt',
  industrialCorner: 'tile_industrial_corner',
  shadowTile: 'tile_shadow_tile',
  concreteSmall: 'tile_concrete_small',
  barrierYellow: 'tile_barrier_yellow',
  barrierWhite: 'tile_barrier_white',
} as const;

export const TILES_ATLAS_KEY = 'tiles';

export const ICON_FRAMES = {
  money: 'icon_money',
  power: 'icon_power',
  pollution: 'icon_pollution',
  green: 'icon_green',
  ui_close: 'icon_ui_close',
  ui_build: 'icon_ui_build',
} as const;

export const EFFECT_FRAMES = {
  smoke: 'fx_smoke',
  power: 'fx_power',
  upgrade: 'fx_upgrade',
  warning: 'fx_warning',
} as const;

export const UI_FRAMES = {
  resourceBar: 'ui_resource_bar',
  buildMenu: 'ui_build_menu',
  statusPanel: 'ui_status_panel',
  buildingInfo: 'ui_building_info',
} as const;

export type BuildingFrameId = (typeof BUILDING_FRAMES)[keyof typeof BUILDING_FRAMES];
export type TileFrameId = (typeof TILE_FRAMES)[keyof typeof TILE_FRAMES];
