import Phaser from 'phaser';
import { TILES_ATLAS_KEY } from './assetIds';
import { TILE_SHEET } from './tileSheetLayout';

const SRC_KEY = '__tiles_sheet_src';

/** 从源图按 7×6、64×32（margin/spacing=0）裁出独立帧，注册 Phaser spritesheet */
export function buildSpritesheetFromSource(scene: Phaser.Scene): void {
  if (!scene.textures.exists(SRC_KEY)) {
    throw new Error('tiles 源图未加载');
  }

  const { cols, rows, frameWidth: fw, frameHeight: fh } = TILE_SHEET;
  const sheetW = cols * fw;
  const sheetH = rows * fh;
  const src = scene.textures.get(SRC_KEY).getSourceImage() as HTMLImageElement | HTMLCanvasElement;

  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建 tiles 切片 canvas');

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.drawImage(
        src as CanvasImageSource,
        col * fw,
        row * fh,
        fw,
        fh,
        col * fw,
        row * fh,
        fw,
        fh,
      );
    }
  }

  if (scene.textures.exists(TILES_ATLAS_KEY)) {
    scene.textures.remove(TILES_ATLAS_KEY);
  }

  scene.textures.addSpriteSheet(TILES_ATLAS_KEY, canvas as unknown as HTMLImageElement, {
    frameWidth: fw,
    frameHeight: fh,
    margin: 0,
    spacing: 0,
  });
}
