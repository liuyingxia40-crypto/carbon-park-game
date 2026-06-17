import Phaser from 'phaser';
import { ISO_TILE_H, ISO_TILE_W } from '../constants';
import { TILE_FRAMES } from '../assets/assetIds';

const W = ISO_TILE_W;
const H = ISO_TILE_H;
const CX = W / 2;
const CY = H / 2;

function drawDiamond(g: Phaser.GameObjects.Graphics, fill: number, edge?: number) {
  g.fillStyle(fill, 1);
  g.beginPath();
  g.moveTo(CX, 0);
  g.lineTo(W, CY);
  g.lineTo(CX, H);
  g.lineTo(0, CY);
  g.closePath();
  g.fillPath();
  if (edge !== undefined) {
    g.lineStyle(1, edge, 0.35);
    g.strokePath();
  }
}

function drawGrassTile(g: Phaser.GameObjects.Graphics) {
  drawDiamond(g, 0x4a9a52, 0x2d6a34);
  g.fillStyle(0x6bc474, 0.55);
  g.fillTriangle(CX, 4, W - 8, CY, CX, H - 6);
  g.fillStyle(0x3d7a42, 0.4);
  g.fillTriangle(8, CY, CX, H - 4, CX, 4);
}

function drawRoadTile(g: Phaser.GameObjects.Graphics, variant: 'straight' | 'corner' | 'cross' | 't' | 'end' | 'single') {
  drawDiamond(g, 0x6b7280, 0x4b5563);
  g.lineStyle(2, 0xd1d5db, 0.85);
  if (variant === 'straight' || variant === 'single') {
    g.lineBetween(CX, 6, CX, H - 6);
  }
  if (variant === 'corner') {
    g.lineBetween(CX, 6, CX, CY);
    g.lineBetween(CX, CY, W - 6, CY);
  }
  if (variant === 'cross' || variant === 't') {
    g.lineBetween(CX, 6, CX, H - 6);
    g.lineBetween(6, CY, W - 6, CY);
  }
  if (variant === 'end') {
    g.lineBetween(CX, CY, CX, H - 6);
  }
}

function drawWaterTile(g: Phaser.GameObjects.Graphics) {
  drawDiamond(g, 0x3b82c4, 0x2563a8);
  g.fillStyle(0x60a5e8, 0.35);
  g.fillEllipse(CX - 12, CY - 4, 28, 12);
  g.fillEllipse(CX + 14, CY + 6, 22, 10);
}

function drawShoreTile(g: Phaser.GameObjects.Graphics) {
  drawGrassTile(g);
  g.fillStyle(0x3b82c4, 0.75);
  g.fillTriangle(0, CY, CX, H, CX, CY);
}

function drawIndustrialGround(g: Phaser.GameObjects.Graphics) {
  drawDiamond(g, 0x5a5a62, 0x3a3a42);
  g.fillStyle(0x707078, 0.45);
  g.fillRect(CX - 20, CY - 6, 40, 12);
}

/** 当 PNG 缺失或加载失败时，生成 128×64 等距地块 */
export function registerProceduralTileTextures(scene: Phaser.Scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  const ensure = (key: string, draw: () => void) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    draw();
    g.generateTexture(key, W, H);
  };

  ensure(TILE_FRAMES.grass, () => drawGrassTile(g));
  ensure(TILE_FRAMES.grassDetail, () => drawGrassTile(g));
  ensure(TILE_FRAMES.grassVariant, () => drawGrassTile(g));
  ensure(TILE_FRAMES.grassDense, () => drawGrassTile(g));
  ensure(TILE_FRAMES.grassClean, () => drawGrassTile(g));
  ensure(TILE_FRAMES.dirt, () => {
    drawDiamond(g, 0x8b7355, 0x6b5335);
  });

  ensure(TILE_FRAMES.roadStraight, () => drawRoadTile(g, 'straight'));
  ensure(TILE_FRAMES.roadSingle, () => drawRoadTile(g, 'single'));
  ensure(TILE_FRAMES.roadCorner, () => drawRoadTile(g, 'corner'));
  ensure(TILE_FRAMES.roadCross, () => drawRoadTile(g, 'cross'));
  ensure(TILE_FRAMES.roadCrossLarge, () => drawRoadTile(g, 'cross'));
  ensure(TILE_FRAMES.roadCrossSmall, () => drawRoadTile(g, 'cross'));
  ensure(TILE_FRAMES.roadT, () => drawRoadTile(g, 't'));
  ensure(TILE_FRAMES.roadTSmall, () => drawRoadTile(g, 't'));
  ensure(TILE_FRAMES.roadEnd, () => drawRoadTile(g, 'end'));
  ensure(TILE_FRAMES.roadEndSmall, () => drawRoadTile(g, 'end'));
  ensure(TILE_FRAMES.roadSplit, () => drawRoadTile(g, 't'));
  ensure(TILE_FRAMES.roadIndustrial, () => drawRoadTile(g, 'straight'));
  ensure(TILE_FRAMES.roadSmallCorner, () => drawRoadTile(g, 'corner'));

  ensure(TILE_FRAMES.shoreline, () => drawShoreTile(g));
  ensure(TILE_FRAMES.riverCenter, () => drawWaterTile(g));
  ensure(TILE_FRAMES.riverLeft, () => drawWaterTile(g));
  ensure(TILE_FRAMES.riverRight, () => drawWaterTile(g));
  ensure(TILE_FRAMES.industrialGround, () => drawIndustrialGround(g));

  g.destroy();
}
