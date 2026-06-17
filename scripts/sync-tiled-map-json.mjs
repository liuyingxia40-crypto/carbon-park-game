/**
 * 从 TMX 生成游戏用 JSON：地图背景 + factory_objects + buildable_plots（仅点击区）。
 * 运行: node scripts/sync-tiled-map-json.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmxPath = path.join(root, 'src/assets/maps/industrial_park_v1.tmx');
const outPath = path.join(root, 'public/assets/maps/industrial_park_v1.json');

/** 游戏运行时使用的裁剪贴图（TMX 仍指向原图，同步时替换） */
const TRIM_SPRITE_BY_ORIGINAL = {
  '/assets/sprites/green_factory_basic.png': {
    image: '/assets/sprites/green_factory_basic_trim.png',
    imagewidth: 1223,
    imageheight: 956,
  },
  '/assets/sprites/coal_factory_base.png': {
    image: '/assets/sprites/coal_factory_base_trim.png',
    imagewidth: 1254,
    imageheight: 1108,
  },
  '/assets/sprites/chemical_factory_base.png': {
    image: '/assets/sprites/chemical_factory_base_trim.png',
    imagewidth: 1254,
    imageheight: 950,
  },
};

function applyTrimSprite(tile) {
  const trim = TRIM_SPRITE_BY_ORIGINAL[tile.image];
  if (!trim) return tile;
  return { ...tile, image: trim.image, imagewidth: trim.imagewidth, imageheight: trim.imageheight };
}

const tmx = readFileSync(tmxPath, 'utf8');

function readAttr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function readFloat(tag, name) {
  const v = readAttr(tag, name);
  return v == null ? 0 : Number(v);
}

function parsePolygon(tag) {
  const m = tag.match(/points="([^"]*)"/);
  if (!m) return [];
  return m[1].split(/\s+/).map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return { x, y };
  });
}

function parseProperties(block) {
  const props = [];
  const re = /<property\s+([^/]*?)\/>/g;
  let m;
  while ((m = re.exec(block))) {
    const attrs = m[1];
    const name = readAttr(`<${attrs}>`, 'name');
    const type = readAttr(`<${attrs}>`, 'type');
    const value = readAttr(`<${attrs}>`, 'value');
    if (name != null) {
      props.push({
        name,
        type: type ?? 'string',
        value: type === 'int' ? Number(value) : value,
      });
    }
  }
  return props;
}

function parseObjectGroups(source) {
  const layers = [];
  const objectGroupRe = /<objectgroup\s+id="(\d+)"\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/objectgroup>/g;
  const objectRe = /<object\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/object>)/g;
  let og;
  while ((og = objectGroupRe.exec(source))) {
    const [, id, name, body] = og;
    const objects = [];
    let om;
    const localObjectRe = new RegExp(objectRe.source, 'g');
    while ((om = localObjectRe.exec(body))) {
      const attrs = om[1];
      const inner = om[2] ?? '';
      const obj = {
        id: Number(readAttr(`<${attrs}>`, 'id')),
        name: readAttr(`<${attrs}>`, 'name') ?? '',
        type: readAttr(`<${attrs}>`, 'type') ?? '',
        x: readFloat(`<${attrs}>`, 'x'),
        y: readFloat(`<${attrs}>`, 'y'),
        width: readFloat(`<${attrs}>`, 'width'),
        height: readFloat(`<${attrs}>`, 'height'),
        rotation: readFloat(`<${attrs}>`, 'rotation'),
        visible: true,
      };
      const gid = readAttr(`<${attrs}>`, 'gid');
      if (gid) obj.gid = Number(gid);
      const polygon = parsePolygon(inner);
      if (polygon.length) obj.polygon = polygon;
      const props = parseProperties(inner);
      if (props.length) obj.properties = props;
      if (inner.includes('<point')) obj.point = true;
      objects.push(obj);
    }
    layers.push({
      id: Number(id),
      name,
      type: 'objectgroup',
      draworder: 'topdown',
      objects,
      opacity: 1,
      visible: true,
      x: 0,
      y: 0,
    });
  }
  return layers;
}

const imageMatch = tmx.match(
  /<imagelayer[\s\S]*?<image[^>]*source="([^"]+)"[^>]*width="(\d+)"[^>]*height="(\d+)"/,
);
const mapImageLayer = imageMatch
  ? {
      id: 2,
      name: 'map_image',
      type: 'imagelayer',
      image: '/assets/tiles/industrial_park_v1.png',
      imagewidth: Number(imageMatch[2]),
      imageheight: Number(imageMatch[3]),
      opacity: 1,
      visible: true,
      x: 0,
      y: 0,
    }
  : null;

const tmxObjectLayers = parseObjectGroups(tmx);

const tilesetMatch = tmx.match(/<tileset[\s\S]*?<\/tileset>/);
const tilesets = [];
if (tilesetMatch) {
  const block = tilesetMatch[0];
  const firstgid = Number(readAttr(block, 'firstgid') ?? 1);
  const tileRe =
    /<tile\s+id="(\d+)"[\s\S]*?<image\s+[^>]*source="([^"]+)"[^>]*width="(\d+)"[^>]*height="(\d+)"/g;
  let tm;
  const tiles = [];
  while ((tm = tileRe.exec(block))) {
    tiles.push(
      applyTrimSprite({
        id: Number(tm[1]),
        image: tm[2].replace(/^.*public/, '').replace(/\\/g, '/'),
        imagewidth: Number(tm[3]),
        imageheight: Number(tm[4]),
      }),
    );
  }
  tilesets.push({ firstgid, name: 'factory_sprites', tiles });
}

const layers = [mapImageLayer, ...tmxObjectLayers].filter(Boolean);

const map = {
  compressionlevel: -1,
  height: Number(readAttr(tmx, 'height')),
  width: Number(readAttr(tmx, 'width')),
  infinite: false,
  layers,
  nextlayerid: 8,
  nextobjectid: 13,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.12.1',
  tileheight: 32,
  tilewidth: 32,
  tilesets,
  type: 'map',
  version: '1.10',
};

writeFileSync(outPath, JSON.stringify(map, null, 1));
console.log('Wrote', outPath);
