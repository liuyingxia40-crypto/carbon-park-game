import { TILE_FRAMES } from './assetIds';

/** 文件名（无扩展名）→ 纹理键 */
const FILE_TO_FRAME: Record<string, string> = {
  grass: TILE_FRAMES.grass,
  'grass(1)': TILE_FRAMES.grass,
  'pico8-isometric(1)': TILE_FRAMES.grass,
  abstractTile_08: TILE_FRAMES.grass,
  industrial: TILE_FRAMES.industrialGround,
  industrial_ground: TILE_FRAMES.industrialGround,
  road: TILE_FRAMES.roadStraight,
  road_straight: TILE_FRAMES.roadStraight,
  road_corner: TILE_FRAMES.roadCorner,
  road_cross: TILE_FRAMES.roadCross,
  road_t: TILE_FRAMES.roadT,
  water: TILE_FRAMES.riverCenter,
  river: TILE_FRAMES.riverCenter,
  shore: TILE_FRAMES.shoreline,
  shoreline: TILE_FRAMES.shoreline,
  dirt: TILE_FRAMES.dirt,
};

/** 草地优先用等距小图（128×64 或接近），避免 1024 大图 */
const GRASS_FILE_PRIORITY = ['pico8-isometric(1)', 'abstractTile_08', 'grass(1)', 'grass'];

const modules = import.meta.glob<string>('../../assets/tiles/*.{png,PNG,jpg,JPG}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const TILE_IMAGE_URLS: Record<string, string> = {};

function fileBase(path: string): string {
  return path.split(/[/\\]/).pop()?.replace(/\.(png|jpg|jpeg)$/i, '') ?? '';
}

for (const path of Object.keys(modules)) {
  const url = modules[path] as string;
  const base = fileBase(path);
  const frameId = FILE_TO_FRAME[base];
  if (frameId && url && !TILE_IMAGE_URLS[frameId]) {
    TILE_IMAGE_URLS[frameId] = url;
  }
}

for (const name of GRASS_FILE_PRIORITY) {
  const hit = Object.entries(modules).find(([p]) => fileBase(p) === name);
  if (hit) {
    TILE_IMAGE_URLS[TILE_FRAMES.grass] = hit[1] as string;
    break;
  }
}

export function applyTileFallbacks() {
  const grass = TILE_IMAGE_URLS[TILE_FRAMES.grass];
  const road = TILE_IMAGE_URLS[TILE_FRAMES.roadStraight];
  const shore = TILE_IMAGE_URLS[TILE_FRAMES.shoreline];

  if (grass) {
    if (!TILE_IMAGE_URLS[TILE_FRAMES.dirt]) TILE_IMAGE_URLS[TILE_FRAMES.dirt] = grass;
    if (!TILE_IMAGE_URLS[TILE_FRAMES.shoreline]) TILE_IMAGE_URLS[TILE_FRAMES.shoreline] = grass;
    if (!TILE_IMAGE_URLS[TILE_FRAMES.riverCenter]) TILE_IMAGE_URLS[TILE_FRAMES.riverCenter] = grass;
    if (!TILE_IMAGE_URLS[TILE_FRAMES.industrialGround]) TILE_IMAGE_URLS[TILE_FRAMES.industrialGround] = grass;
  }
  if (shore) {
    if (!TILE_IMAGE_URLS[TILE_FRAMES.riverCenter]) TILE_IMAGE_URLS[TILE_FRAMES.riverCenter] = shore;
  }
  if (road) {
    const roadFallbacks = [
      TILE_FRAMES.roadT,
      TILE_FRAMES.roadEnd,
      TILE_FRAMES.roadSingle,
      TILE_FRAMES.roadIndustrial,
      TILE_FRAMES.roadSplit,
      TILE_FRAMES.roadCrossLarge,
      TILE_FRAMES.roadEndSmall,
      TILE_FRAMES.roadSmallCorner,
      TILE_FRAMES.roadTSmall,
      TILE_FRAMES.roadCrossSmall,
      TILE_FRAMES.roadCorner,
      TILE_FRAMES.roadCross,
    ];
    for (const id of roadFallbacks) {
      if (!TILE_IMAGE_URLS[id]) TILE_IMAGE_URLS[id] = road;
    }
  }
}

/** 地图最低要求：有草地 + 道路即可渲染 */
export const REQUIRED_TILE_TEXTURES = [TILE_FRAMES.grass, TILE_FRAMES.roadStraight] as const;

export function listMissingTileTextures(): string[] {
  return REQUIRED_TILE_TEXTURES.filter((id) => !TILE_IMAGE_URLS[id]);
}

applyTileFallbacks();
