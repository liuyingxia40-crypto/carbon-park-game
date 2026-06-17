/**
 * 裁掉 PNG 四周透明边距，保留建筑周围安全边距。
 * 运行: node scripts/trim-sprite-transparent-padding.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const spritesDir = path.join(root, 'public/assets/sprites');

/** 建筑周围保留的透明安全边距（px），范围 10–20 */
const PADDING = 12;
/** 忽略低 alpha 噪点 / 半透明外晕 */
const ALPHA_THRESHOLD = 32;

const FILES = [
  { input: 'coal_factory_base.png', output: 'coal_factory_base_trim.png' },
  { input: 'chemical_factory_base.png', output: 'chemical_factory_base_trim.png' },
  { input: 'green_factory_basic.png', output: 'green_factory_basic_trim.png' },
];

async function findOpaqueBounds(inputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + (channels - 1)];
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error(`未找到不透明像素: ${inputPath}`);
  }

  return { width, height, minX, minY, maxX, maxY };
}

async function trimSprite({ input, output }) {
  const inputPath = path.join(spritesDir, input);
  const outputPath = path.join(spritesDir, output);

  const { width, height, minX, minY, maxX, maxY } = await findOpaqueBounds(inputPath);

  const left = Math.max(0, minX - PADDING);
  const top = Math.max(0, minY - PADDING);
  const right = Math.min(width - 1, maxX + PADDING);
  const bottom = Math.min(height - 1, maxY + PADDING);
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  await sharp(inputPath)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .png({ compressionLevel: 6, palette: false })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();

  console.log(
    `${input}: ${width}x${height} → ${output} ${meta.width}x${meta.height}` +
      ` (content bbox ${minX},${minY}–${maxX},${maxY}, padding ${PADDING}px, α>${ALPHA_THRESHOLD})`,
  );

  return { output, width: meta.width, height: meta.height, image: `/assets/sprites/${output}` };
}

const trimResults = [];
for (const file of FILES) {
  trimResults.push(await trimSprite(file));
}

const mapJsonPath = path.join(root, 'public/assets/maps/industrial_park_v1.json');
const map = JSON.parse(readFileSync(mapJsonPath, 'utf8'));
const tileset = map.tilesets?.find((t) => t.name === 'factory_sprites');
if (tileset?.tiles) {
  const byPath = new Map(trimResults.map((r) => [r.output, r]));
  const tileImageOrder = [
    'green_factory_basic_trim.png',
    'coal_factory_base_trim.png',
    'chemical_factory_base_trim.png',
  ];
  for (const tile of tileset.tiles) {
    const name = tile.image.split('/').pop();
    const hit = byPath.get(name);
    if (hit) {
      tile.imagewidth = hit.width;
      tile.imageheight = hit.height;
    }
  }
  writeFileSync(mapJsonPath, JSON.stringify(map, null, 1));
  console.log('Updated tile dimensions in', mapJsonPath);
}

console.log('Done.');
