import Phaser from 'phaser';

const BASE = 0x2e3138;
const MID = 0x3e424a;
const HI = 0x4e525a;
const LIGHT = 0xffb040;
const LIGHT_COOL = 0x70b8d8;
const CHIMNEY = 0x3a3a42;

function drawChimney(g: Phaser.GameObjects.Graphics, x: number, y: number, tall = false) {
  const h = tall ? 28 : 22;
  g.fillStyle(CHIMNEY, 1);
  g.fillRect(x, y, 10, h);
  g.fillStyle(0x4a4a52, 1);
  g.fillRect(x + 1, y - 4, 8, 5);
  g.fillStyle(0x555560, 0.5);
  g.fillRect(x + 2, y + 4, 6, h - 6);
}

function drawWindows(g: Phaser.GameObjects.Graphics, x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    g.fillStyle(LIGHT, 0.9);
    g.fillRect(x + i * 10, y, 6, 5);
    g.fillStyle(0xffe8a0, 0.4);
    g.fillRect(x + i * 10 + 1, y + 1, 4, 2);
  }
}

function drawFactoryBase(g: Phaser.GameObjects.Graphics, w: number, h: number) {
  g.fillStyle(BASE, 1);
  g.fillRect(4, h - 28, w - 8, 26);
  g.fillStyle(MID, 1);
  g.fillRect(8, h - 38, w - 20, 14);
  g.fillStyle(HI, 0.6);
  g.fillRect(8, h - 40, w - 20, 3);
}

export function registerIndustrialTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('bld_thermal')) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  // 煤矿
  drawFactoryBase(g, 96, 72);
  g.fillStyle(0x1a1a1e, 1);
  g.fillRect(18, 44, 60, 16);
  g.fillStyle(0x2a2a30, 1);
  g.fillRect(24, 28, 20, 20);
  g.fillStyle(0x0a0a0c, 1);
  g.fillRect(28, 32, 12, 14);
  g.fillStyle(0x4a4a52, 1);
  g.fillRect(50, 36, 24, 8);
  g.fillStyle(0x3a3a42, 1);
  g.fillRect(54, 20, 8, 20);
  drawWindows(g, 12, 38, 2);
  g.generateTexture('bld_coal', 96, 72);

  g.clear();
  // 火电厂
  drawFactoryBase(g, 96, 72);
  drawChimney(g, 58, 8, true);
  drawChimney(g, 44, 14, false);
  drawWindows(g, 14, 38, 4);
  g.fillStyle(0x4a5058, 1);
  g.fillRect(22, 48, 28, 14);
  g.fillStyle(0xff6020, 0.8);
  g.fillCircle(63, 2, 5);
  g.generateTexture('bld_thermal', 96, 72);

  g.clear();
  // 钢铁厂
  drawFactoryBase(g, 128, 72);
  drawChimney(g, 88, 4, true);
  drawChimney(g, 72, 10, true);
  drawChimney(g, 100, 12, false);
  g.fillStyle(MID, 1);
  g.fillRect(24, 18, 40, 22);
  g.fillStyle(0x5a4038, 1);
  g.fillTriangle(44, 10, 24, 26, 64, 26);
  drawWindows(g, 8, 40, 5);
  g.fillStyle(0xff8030, 0.75);
  g.fillRect(40, 6, 12, 6);
  g.generateTexture('bld_steel', 128, 72);

  g.clear();
  // 光伏电站（统一深灰支架 + 冷色灯）
  g.fillStyle(BASE, 1);
  g.fillRect(6, 40, 84, 18);
  g.fillStyle(MID, 1);
  g.fillRect(38, 34, 10, 24);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      g.fillStyle(0x2a3a48, 1);
      g.fillRect(10 + col * 18, 12 + row * 10, 16, 8);
      g.fillStyle(LIGHT_COOL, 0.35);
      g.fillRect(12 + col * 18, 13 + row * 10, 12, 3);
    }
  }
  g.fillStyle(LIGHT_COOL, 0.7);
  g.fillRect(42, 28, 4, 4);
  g.generateTexture('bld_solar', 96, 64);

  g.clear();
  // 回收工厂
  drawFactoryBase(g, 96, 72);
  g.fillStyle(0x3a5a48, 1);
  g.fillRect(20, 32, 56, 24);
  g.fillStyle(0x4a6a52, 1);
  g.fillRect(28, 20, 12, 16);
  g.fillRect(52, 24, 14, 12);
  g.fillStyle(0x5aca6a, 0.8);
  g.fillCircle(34, 28, 4);
  g.fillCircle(58, 30, 3);
  drawWindows(g, 12, 40, 3);
  g.generateTexture('bld_recycle', 96, 72);

  g.clear();
  // 绿色技术中心
  drawFactoryBase(g, 128, 72);
  g.fillStyle(0x2a4a3a, 1);
  g.fillRect(16, 24, 96, 28);
  g.fillStyle(0x4a8a6a, 1);
  g.fillRect(40, 8, 48, 20);
  g.fillStyle(LIGHT_COOL, 0.9);
  g.fillCircle(64, 16, 6);
  drawWindows(g, 20, 36, 6);
  g.fillStyle(0x3a6a50, 1);
  g.fillRect(8, 44, 24, 12);
  g.generateTexture('bld_green_hub', 128, 72);

  g.clear();
  drawFactoryBase(g, 160, 88);
  g.fillStyle(0x1a3a4a, 1);
  g.fillRect(20, 20, 120, 40);
  g.fillStyle(0x50c0e0, 0.9);
  g.fillRect(50, 8, 60, 16);
  g.fillStyle(0x3a8a6a, 1);
  g.fillRect(30, 44, 100, 20);
  drawWindows(g, 24, 48, 8);
  g.fillStyle(0x70e0a0, 0.8);
  g.fillCircle(80, 16, 8);
  g.generateTexture('bld_carbon_exchange', 160, 88);

  g.clear();
  drawFactoryBase(g, 96, 120);
  g.fillStyle(0x2a4a5a, 1);
  g.fillRect(28, 12, 40, 80);
  g.fillStyle(0x50e0a0, 0.85);
  g.fillRect(32, 20, 32, 60);
  g.fillStyle(0xa0ffe0, 0.6);
  g.fillCircle(48, 8, 10);
  g.fillStyle(0x3a6a5a, 1);
  g.fillRect(16, 72, 64, 16);
  g.generateTexture('bld_zero_tower', 96, 120);

  g.clear();
  drawFactoryBase(g, 160, 88);
  g.fillStyle(0x2a3040, 1);
  g.fillRect(24, 24, 112, 36);
  g.fillStyle(0x6ab0e8, 0.9);
  for (let i = 0; i < 5; i++) g.fillRect(30 + i * 22, 28, 14, 8);
  g.fillStyle(0x4a5a6a, 1);
  g.fillRect(40, 8, 80, 18);
  g.fillStyle(0xff60ff, 0.5);
  g.fillCircle(80, 4, 6);
  g.generateTexture('bld_smart_core', 160, 88);

  g.clear();
  drawFactoryBase(g, 120, 96);
  g.fillStyle(0x3a4a5a, 1);
  g.fillRect(20, 32, 80, 40);
  g.fillStyle(0x50a0d0, 0.9);
  g.fillRect(28, 20, 20, 24);
  g.fillRect(52, 20, 20, 24);
  g.fillRect(76, 20, 20, 24);
  g.fillStyle(0xffe040, 0.8);
  g.fillCircle(60, 12, 6);
  g.generateTexture('bld_mega_storage', 120, 96);

  g.clear();
  g.fillStyle(0x6a9a6a, 0.7);
  g.beginPath();
  g.moveTo(32, 0);
  g.lineTo(64, 16);
  g.lineTo(32, 32);
  g.lineTo(0, 16);
  g.closePath();
  g.fillPath();
  g.generateTexture('tile_highlight_ok', 64, 32);

  g.clear();
  g.fillStyle(0xaa4040, 0.7);
  g.beginPath();
  g.moveTo(32, 0);
  g.lineTo(64, 16);
  g.lineTo(32, 32);
  g.lineTo(0, 16);
  g.closePath();
  g.fillPath();
  g.generateTexture('tile_highlight_bad', 64, 32);

  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(8, 8, 6);
  g.generateTexture('particle_smoke', 16, 16);

  g.clear();
  g.fillStyle(0xffcc66, 1);
  g.fillCircle(4, 4, 3);
  g.generateTexture('particle_spark', 8, 8);

  g.destroy();
}

/** 仅高亮与粒子（不生成占位建筑/色块瓦片） */
export function registerMinimalGameTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('tile_highlight_ok')) return;

  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x8ad8a0, 0.55);
  g.beginPath();
  g.moveTo(32, 0);
  g.lineTo(64, 16);
  g.lineTo(32, 32);
  g.lineTo(0, 16);
  g.closePath();
  g.fillPath();
  g.generateTexture('tile_highlight_ok', 64, 32);

  g.clear();
  g.fillStyle(0xf08080, 0.55);
  g.beginPath();
  g.moveTo(32, 0);
  g.lineTo(64, 16);
  g.lineTo(32, 32);
  g.lineTo(0, 16);
  g.closePath();
  g.fillPath();
  g.generateTexture('tile_highlight_bad', 64, 32);

  g.clear();
  g.fillStyle(0xffffff, 0.85);
  g.fillCircle(8, 8, 6);
  g.generateTexture('particle_smoke', 16, 16);

  g.clear();
  g.fillStyle(0xffe8a0, 1);
  g.fillCircle(4, 4, 3);
  g.generateTexture('particle_spark', 8, 8);

  g.destroy();
}
