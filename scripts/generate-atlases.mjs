/**
 * 根据 sheetManifests 生成 Phaser Atlas JSON
 * 用法: node scripts/generate-atlases.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const atlasDir = path.join(publicDir, 'assets', 'atlases');
const spriteDir = path.join(publicDir, 'assets', 'sprites');
const srcTilesDir = path.join(root, 'src', 'assets', 'tiles');

const TILE_FRAME_IDS = [
  'tile_grass',
  'tile_grass_detail',
  'tile_dirt',
  'tile_road_straight',
  'tile_road_corner',
  'tile_road_cross',
  'tile_concrete',
  'tile_grass_variant',
  'tile_dirt_detail',
  'tile_industrial_ground',
  'tile_road_t',
  'tile_road_end',
  'tile_road_small_corner',
  'tile_concrete_dark',
  'tile_grass_dense',
  'tile_grass_rock',
  'tile_industrial_mark',
  'tile_road_split',
  'tile_road_cross_large',
  'tile_road_industrial',
  'tile_road_end_small',
  'tile_grass_big',
  'tile_dirt_edge',
  'tile_road_single',
  'tile_road_t_small',
  'tile_road_cross_small',
  'tile_shoreline',
  'tile_concrete_tile',
  'tile_river_left',
  'tile_river_center',
  'tile_river_right',
  'tile_industrial_road',
  'tile_concrete_road',
  'tile_crack_ground',
  'tile_industrial_warning',
  'tile_grass_clean',
  'tile_industrial_dirt',
  'tile_industrial_corner',
  'tile_shadow_tile',
  'tile_concrete_small',
  'tile_barrier_yellow',
  'tile_barrier_white',
];

const MANIFESTS = [
  {
    atlasKey: 'buildings',
    image: 'buildings_sheet.png',
    cols: 4,
    rows: 1,
    fw: 128,
    fh: 128,
    ids: ['bld_thermal', 'bld_steel', 'bld_solar', 'bld_recycle'],
  },
  {
    atlasKey: 'tiles',
    image: 'tiles_sheet.png',
    cols: 7,
    rows: 6,
    fw: 219,
    fh: 170,
    ids: TILE_FRAME_IDS,
    srcTilesDir,
  },
  {
    atlasKey: 'icons',
    image: 'icons_sheet.png',
    cols: 6,
    rows: 1,
    fw: 32,
    fh: 32,
    ids: ['icon_money', 'icon_power', 'icon_pollution', 'icon_green', 'icon_ui_build', 'icon_ui_close'],
  },
  {
    atlasKey: 'effects',
    image: 'effects_sheet.png',
    cols: 4,
    rows: 1,
    fw: 32,
    fh: 32,
    ids: ['fx_smoke', 'fx_power', 'fx_upgrade', 'fx_warning'],
  },
  {
    atlasKey: 'ui',
    image: 'ui_sheet.png',
    cols: 2,
    rows: 2,
    fw: 256,
    fh: 64,
    ids: ['ui_resource_bar', 'ui_build_menu', 'ui_status_panel', 'ui_building_info'],
  },
];

function gridFrames(m) {
  const frames = [];
  let i = 0;
  for (let row = 0; row < m.rows; row++) {
    for (let col = 0; col < m.cols; col++) {
      if (i >= m.ids.length) break;
      frames.push({
        id: m.ids[i],
        x: col * m.fw,
        y: row * m.fh,
        w: m.fw,
        h: m.fh,
      });
      i += 1;
    }
  }
  return frames;
}

function buildJson(m, frames) {
  const size = {
    w: Math.max(...frames.map((f) => f.x + f.w), 1),
    h: Math.max(...frames.map((f) => f.y + f.h), 1),
  };
  const out = { frames: {}, meta: { app: 'generate-atlases', version: '1', image: m.image, format: 'RGBA8888', size, scale: '1' } };
  for (const f of frames) {
    out.frames[f.id] = {
      frame: { x: f.x, y: f.y, w: f.w, h: f.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h },
      sourceSize: { w: f.w, h: f.h },
    };
  }
  return out;
}

function findTilesPng() {
  const pub = path.join(spriteDir, 'tiles_sheet.png');
  if (fs.existsSync(pub)) return pub;
  if (!fs.existsSync(srcTilesDir)) return null;
  const files = fs.readdirSync(srcTilesDir).filter((f) => /\.(png|jpg)$/i.test(f));
  if (files.length === 0) return null;
  const named = files.find((f) => /tiles_sheet/i.test(f));
  return path.join(srcTilesDir, named ?? files[0]);
}

fs.mkdirSync(atlasDir, { recursive: true });
fs.mkdirSync(spriteDir, { recursive: true });

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  sharp = null;
}

for (const m of MANIFESTS) {
  let manifest = { ...m };
  const pngPath =
    m.atlasKey === 'tiles' ? findTilesPng() : path.join(spriteDir, m.image);

  if (m.atlasKey === 'tiles') {
    if (sharp && pngPath && fs.existsSync(pngPath)) {
      const meta = await sharp(pngPath).metadata();
      const fw = Math.floor((meta.width ?? m.fw * m.cols) / m.cols);
      const fh = Math.floor((meta.height ?? m.fh * m.rows) / m.rows);
      manifest = { ...m, fw, fh };
      console.log(`  ℹ tiles 切格 ${fw}×${fh}（源图 ${meta.width}×${meta.height}，逻辑 ${m.cols}×${m.rows}）`);
    } else {
      manifest = { ...m, fw: 64, fh: 32 };
      console.log(`  ℹ tiles 默认 64×32 切格（逻辑 ${m.cols}×${m.rows}）`);
    }
  }

  const frames = gridFrames(manifest);
  const json = buildJson(manifest, frames);
  const outPath = path.join(atlasDir, `${manifest.atlasKey}_atlas.json`);
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  console.log(`✓ ${manifest.atlasKey}_atlas.json (${json.meta.size.w}x${json.meta.size.h})`);

  if (sharp && pngPath && fs.existsSync(pngPath)) {
    const meta = await sharp(pngPath).metadata();
    if (meta.width < json.meta.size.w || meta.height < json.meta.size.h) {
      console.warn(`  ⚠ ${path.basename(pngPath)} 尺寸 ${meta.width}x${meta.height} 小于 atlas ${json.meta.size.w}x${json.meta.size.h}`);
    } else {
      console.log(`  ✓ ${path.basename(pngPath)} ${meta.width}x${meta.height}`);
    }
  } else if (!pngPath || !fs.existsSync(pngPath)) {
    console.warn(`  ⚠ 缺少 ${m.image}（可将图集放到 src/assets/tiles/ 或 public/assets/sprites/）`);
  }
}

console.log('\n完成。运行 npm run dev 加载 src/assets/tiles 图集');
