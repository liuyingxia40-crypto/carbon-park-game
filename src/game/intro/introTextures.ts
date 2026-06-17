import Phaser from 'phaser';
import {
  INTRO_BG_KEY,
  INTRO_ENVELOPE_CLOSED_KEY,
  INTRO_ENVELOPE_OPEN_KEY,
  INTRO_LETTER_KEY,
} from './paths';

function isTextureUsable(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  const tex = scene.textures.get(key);
  if (tex.key === '__MISSING') return false;
  const src = tex.getSourceImage();
  const w = typeof src === 'object' && src !== null && 'width' in src ? (src as { width: number }).width : 0;
  return w > 2;
}

function drawIntroBg(g: Phaser.GameObjects.Graphics, w: number, h: number) {
  g.fillGradientStyle(0x08080a, 0x08080a, 0x12141a, 0x12141a, 1);
  g.fillRect(0, 0, w, h);
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(w / 2, h / 2, w * 0.92, h * 0.88);
}

function drawEnvelopeClosed(g: Phaser.GameObjects.Graphics, w: number, h: number) {
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(28, 78, w - 52, h - 96, 6);
  g.fillStyle(0xc9a96e);
  g.fillRoundedRect(24, 72, w - 48, h - 88, 5);
  g.fillStyle(0xb89258);
  g.fillTriangle(w / 2, 28, 36, 82, w - 36, 82);
  g.lineStyle(1, 0x8a7048, 0.45);
  g.strokeTriangle(w / 2, 28, 36, 82, w - 36, 82);
  g.lineStyle(1, 0x9a8050, 0.35);
  g.strokeRoundedRect(24, 72, w - 48, h - 88, 5);
  g.fillStyle(0x5a2828);
  g.fillCircle(w / 2, h * 0.58, 24);
  g.lineStyle(1.5, 0x3a1818, 0.7);
  g.strokeCircle(w / 2, h * 0.58, 24);
}

function drawEnvelopeOpen(g: Phaser.GameObjects.Graphics, w: number, h: number) {
  g.fillStyle(0x000000, 0.22);
  g.fillRoundedRect(28, 88, w - 52, h - 106, 6);
  g.fillStyle(0xc9a96e);
  g.fillRoundedRect(24, 82, w - 48, h - 98, 5);
  g.fillStyle(0xa88850);
  g.fillTriangle(w / 2, 18, 36, 72, w - 36, 72);
  g.fillStyle(0xd4b480);
  g.fillRect(24, 72, w - 48, 28);
  g.lineStyle(1, 0x9a8050, 0.35);
  g.strokeRoundedRect(24, 82, w - 48, h - 98, 5);
}

function drawLetter(g: Phaser.GameObjects.Graphics, w: number, h: number) {
  g.fillStyle(0x000000, 0.18);
  g.fillRoundedRect(18, 14, w - 32, h - 26, 4);
  g.fillStyle(0xe8dcc8);
  g.fillRoundedRect(14, 10, w - 28, h - 20, 3);
  g.lineStyle(1, 0xc8b898, 0.5);
  g.strokeRoundedRect(14, 10, w - 28, h - 20, 3);
  g.lineStyle(0.5, 0xd0c4b0, 0.35);
  for (let y = 48; y < h - 36; y += 22) {
    g.lineBetween(36, y, w - 36, y);
  }
}

function generateTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics, w: number, h: number) => void,
) {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  const g = scene.add.graphics();
  draw(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}

/** PNG 缺失时用程序纹理替代，避免 __MISSING 绿色占位图 */
export function ensureIntroTextures(scene: Phaser.Scene): void {
  if (!isTextureUsable(scene, INTRO_BG_KEY)) {
    generateTexture(scene, INTRO_BG_KEY, 960, 640, drawIntroBg);
  }
  if (!isTextureUsable(scene, INTRO_ENVELOPE_CLOSED_KEY)) {
    generateTexture(scene, INTRO_ENVELOPE_CLOSED_KEY, 360, 240, drawEnvelopeClosed);
  }
  if (!isTextureUsable(scene, INTRO_ENVELOPE_OPEN_KEY)) {
    generateTexture(scene, INTRO_ENVELOPE_OPEN_KEY, 360, 240, drawEnvelopeOpen);
  }
  if (!isTextureUsable(scene, INTRO_LETTER_KEY)) {
    generateTexture(scene, INTRO_LETTER_KEY, 320, 420, drawLetter);
  }
}
