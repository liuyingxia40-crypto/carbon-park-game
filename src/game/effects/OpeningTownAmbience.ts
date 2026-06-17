import Phaser from 'phaser';
import { AssetManager } from '../assets';
import { OPENING_HUB_TX, OPENING_HUB_TY } from '../starterLayout';
import { Zone, type WorldMapData } from '../iso/mapGenerator';
import { tileToWorld } from '../iso/isoMath';

/**
 * 开局小镇环境：电线杆、路灯、连接火电的电缆（sprite 特效）
 */
export class OpeningTownAmbience {
  private gfx: Phaser.GameObjects.Graphics;
  private poles: Phaser.GameObjects.Image[] = [];
  private sparks: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor(
    private scene: Phaser.Scene,
    private mapData: WorldMapData,
    thermalWorld: { x: number; y: number },
  ) {
    this.gfx = scene.add.graphics().setDepth(44);
    this.drawPowerNetwork(thermalWorld);
    this.placePowerPoles();
    this.placeStreetLamps();
  }

  private drawPowerNetwork(thermal: { x: number; y: number }) {
    this.gfx.clear();
    const hub = tileToWorld(OPENING_HUB_TX, OPENING_HUB_TY);

    this.gfx.lineStyle(3, 0x7ad8f8, 0.55);
    this.gfx.lineBetween(thermal.x, thermal.y - 28, hub.x, hub.y - 12);

    const roads: { x: number; y: number }[] = [];
    for (let ty = 0; ty < this.mapData.zones.length; ty++) {
      for (let tx = 0; tx < this.mapData.zones[0].length; tx++) {
        if (this.mapData.zones[ty][tx] !== Zone.Road) continue;
        const d = Math.abs(tx - OPENING_HUB_TX) + Math.abs(ty - OPENING_HUB_TY);
        if (d <= 10 && d >= 2) roads.push(tileToWorld(tx, ty));
      }
    }

    for (const p of roads.slice(0, 14)) {
      this.gfx.lineBetween(thermal.x, thermal.y - 24, p.x, p.y - 10);
    }

    if (AssetManager.hasAtlas('effects')) {
      const tex = AssetManager.getParticleTexture(false);
      const em = this.scene.add.particles(thermal.x, thermal.y - 36, tex.key, {
        frame: tex.frame,
        speed: { min: 8, max: 22 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 400,
        frequency: 120,
        quantity: 1,
        blendMode: 'ADD',
        tint: 0xffe8a0,
      });
      em.setDepth(55);
      this.sparks.push(em);
    }
  }

  private placePowerPoles() {
    if (!AssetManager.hasAtlas('effects')) return;

    let placed = 0;
    for (let ty = 0; ty < this.mapData.zones.length; ty++) {
      for (let tx = 0; tx < this.mapData.zones[0].length; tx++) {
        if (this.mapData.zones[ty][tx] !== Zone.Road) continue;
        const dist = Math.abs(tx - OPENING_HUB_TX) + Math.abs(ty - OPENING_HUB_TY);
        if (dist < 3 || dist > 11) continue;
        if ((tx + ty) % 3 !== 0) continue;

        const { x, y } = tileToWorld(tx, ty);
        const pole = this.scene.add
          .image(x + 6, y - 14, 'effects', 'fx_power')
          .setScale(1.4)
          .setDepth(43);
        this.poles.push(pole);
        placed++;
        if (placed >= 16) return;
      }
    }
  }

  private placeStreetLamps() {
    for (let ty = 0; ty < this.mapData.zones.length; ty++) {
      for (let tx = 0; tx < this.mapData.zones[0].length; tx++) {
        if (!this.mapData.majorRoad[ty][tx]) continue;
        if ((tx * 7 + ty * 11) % 5 !== 0) continue;
        const { x, y } = tileToWorld(tx, ty);
        this.gfx.fillStyle(0xffd878, 0.75);
        this.gfx.fillCircle(x - 4, y - 8, 3);
        this.gfx.fillStyle(0xfff0c0, 0.35);
        this.gfx.fillCircle(x - 4, y - 8, 6);
      }
    }
  }

  pulseLines(time: number) {
    const pulse = 0.4 + (Math.sin(time / 280) + 1) * 0.25;
    this.gfx.setAlpha(pulse);
  }

  destroy() {
    this.gfx.destroy();
    this.poles.forEach((p) => p.destroy());
    this.sparks.forEach((s) => s.destroy());
  }
}
