/**
 * 检查 tiles_sheet.png 是否存在及尺寸是否匹配 7×2 × 64×32
 * 用法: node scripts/check-tiles-sheet.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pngPath = path.join(root, 'public', 'assets', 'sprites', 'tiles_sheet.png');

const EXPECT_W = 7 * 64;
const EXPECT_H = 2 * 32;

if (!fs.existsSync(pngPath)) {
  console.error('✗ 未找到:', pngPath);
  console.error('  请将 tiles_sheet.png 复制到上述目录后重试。');
  process.exit(1);
}

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('✓ 文件存在:', pngPath);
  console.log('  安装 sharp 后可校验尺寸: npm i -D sharp');
  process.exit(0);
}

const meta = await sharp(pngPath).metadata();
console.log(`✓ tiles_sheet.png  ${meta.width}×${meta.height}`);

if (meta.width === EXPECT_W && meta.height === EXPECT_H) {
  console.log('✓ 尺寸与默认 7×2 切分 (64×32) 一致');
} else {
  const cols = Math.round(meta.width / 64);
  const rows = Math.round(meta.height / 32);
  console.warn(`⚠ 期望 ${EXPECT_W}×${EXPECT_H}，实际 ${meta.width}×${meta.height}`);
  console.warn(`  若你的图集是 ${cols}×${rows} 格，请修改 tileSheetLayout.ts 与 generate-atlases.mjs`);
}
