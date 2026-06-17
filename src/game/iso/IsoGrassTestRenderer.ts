import Phaser from 'phaser';
import { TILE_FRAMES } from '../assets/assetIds';
import { GRASS_TEST_MAP_SIZE } from '../constants';
import { isoMapViewportOffset, isoTileCenter, warnGrassTileSize } from './isoGrassTestMath';

/**
 * 10×10 grass 等距拼接测试
 * screenX = (x - y) * 64, screenY = (x + y) * 32
 * tile 128×64, origin 0.5, 无缩放
 */
export class IsoGrassTestRenderer {
  readonly tiles: Phaser.GameObjects.Image[] = [];
  private offsetX = 0;
  private offsetY = 0;
  private viewCenterX = 0;
  private viewCenterY = 0;

  constructor(private scene: Phaser.Scene) {
    const key = TILE_FRAMES.grass;
    if (!scene.textures.exists(key)) {
      throw new Error('缺少 grass 纹理 tile_grass');
    }

    const frame = scene.textures.get(key).get();
    if (frame) {
      warnGrassTileSize(frame.width, frame.height);
    }

    this.layout(scene.scale.width, scene.scale.height);
    console.info(`[IsoGrassTest] ${GRASS_TEST_MAP_SIZE}×${GRASS_TEST_MAP_SIZE} grass 已铺设`);
  }

  layout(viewW: number, viewH: number) {
    const key = TILE_FRAMES.grass;
    const off = isoMapViewportOffset(GRASS_TEST_MAP_SIZE, GRASS_TEST_MAP_SIZE, viewW, viewH);
    this.offsetX = off.x;
    this.offsetY = off.y;
    this.viewCenterX = off.centerX;
    this.viewCenterY = off.centerY;

    if (this.tiles.length === 0) {
      for (let ty = 0; ty < GRASS_TEST_MAP_SIZE; ty++) {
        for (let tx = 0; tx < GRASS_TEST_MAP_SIZE; tx++) {
          const base = isoTileCenter(tx, ty);
          const img = this.scene.add
            .image(this.offsetX + base.x, this.offsetY + base.y, key)
            .setOrigin(0.5, 0.5)
            .setDepth(tx + ty);
          this.tiles.push(img);
        }
      }
      return;
    }

    let i = 0;
    for (let ty = 0; ty < GRASS_TEST_MAP_SIZE; ty++) {
      for (let tx = 0; tx < GRASS_TEST_MAP_SIZE; tx++) {
        const base = isoTileCenter(tx, ty);
        this.tiles[i].setPosition(this.offsetX + base.x, this.offsetY + base.y);
        i += 1;
      }
    }
  }

  getViewCenter() {
    return { x: this.viewCenterX, y: this.viewCenterY };
  }

  destroy() {
    for (const t of this.tiles) t.destroy();
    this.tiles.length = 0;
  }
}
