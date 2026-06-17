import Phaser from 'phaser';
import type { BuildingId } from '../buildings';

type Node = { x: number; y: number; id: BuildingId; sprite?: Phaser.GameObjects.Image };

const POWER_SOURCES: BuildingId[] = ['thermal_plant', 'solar_plant', 'green_tech_hub'];
const POWER_SINKS: BuildingId[] = ['steel_mill', 'coal_mine', 'recycling_plant'];

/**
 * 电力流动：发电站 → 工厂 的加亮电缆
 */
export class PowerGridEffects {
  private lines: Phaser.GameObjects.Graphics;
  private glow: Phaser.GameObjects.Graphics;
  private pulse = 0;

  constructor(scene: Phaser.Scene) {
    this.glow = scene.add.graphics().setDepth(44);
    this.lines = scene.add.graphics().setDepth(45);
  }

  rebuild(nodes: Node[]) {
    this.lines.clear();
    this.glow.clear();
    const sources = nodes.filter((n) => POWER_SOURCES.includes(n.id));
    const sinks = nodes.filter((n) => POWER_SINKS.includes(n.id));
    if (sources.length === 0) return;

    const thermal = sources.find((s) => s.id === 'thermal_plant') ?? sources[0];

    this.glow.lineStyle(8, 0x90e8ff, 0.12);
    this.lines.lineStyle(3, 0x5ad0f8, 0.5);

    const targets = sinks.length > 0 ? sinks : nodes.filter((n) => n.id !== thermal.id);
    for (const sink of targets) {
      const sx = thermal.x;
      const sy = thermal.y - 32;
      const tx = sink.x;
      const ty = sink.y - 18;
      this.glow.lineBetween(sx, sy, tx, ty);
      this.lines.lineBetween(sx, sy, tx, ty);
    }
  }

  update(time: number, powerOk: boolean) {
    this.pulse = (Math.sin(time / 200) + 1) / 2;
    const alpha = powerOk ? 0.45 + this.pulse * 0.4 : 0.2 + this.pulse * 0.15;
    this.lines.setAlpha(alpha);
    this.glow.setAlpha(alpha * 0.7);
  }

  destroy() {
    this.lines.destroy();
    this.glow.destroy();
  }
}
