import Phaser from 'phaser';
import type { CityGrade } from '../cityRating';
import type { CityTier } from '../cityGrowth';
import type { EvolutionPhase } from '../cityEvolution';

/**
 * 解锁/晋升反馈：建筑、科技、城市升级、评级
 */
export class UnlockFx {
  private overlay?: Phaser.GameObjects.Container;

  playBuildingUnlock(scene: Phaser.Scene, x: number, y: number, name: string) {
    this.burst(scene, x, y, 0x50e0a0, name);
  }

  playTechBreakthrough(scene: Phaser.Scene, name: string) {
    const cam = scene.cameras.main;
    this.showBanner(scene, `科技突破 · ${name}`, 0x6ab0e8, cam.centerX, cam.centerY - 80);
  }

  playCityTierUp(scene: Phaser.Scene, tier: CityTier, label: string) {
    const cam = scene.cameras.main;
    this.showBanner(scene, `城市升级 T${tier} · ${label}`, 0xffc860, cam.centerX, cam.centerY - 100);
    scene.cameras.main.flash(400, 255, 200, 96, false, undefined, 0.15);
  }

  playGradePromotion(scene: Phaser.Scene, grade: CityGrade) {
    const cam = scene.cameras.main;
    this.showBanner(scene, `评级晋升 · ${grade} 级`, 0x50e0a0, cam.centerX, cam.centerY - 120);
    scene.cameras.main.shake(280, 0.004);
  }

  playEvolution(scene: Phaser.Scene, _phase: EvolutionPhase, label: string) {
    const cam = scene.cameras.main;
    this.showBanner(scene, `城市蜕变 · ${label}`, 0x70d8b0, cam.centerX, cam.centerY - 60);
    cam.flash(500, 80, 200, 160, false, undefined, 0.12);
  }

  playSuperBuilt(scene: Phaser.Scene, x: number, y: number, name: string) {
    this.burst(scene, x, y, 0xffd060, name);
    scene.cameras.main.shake(500, 0.006);
  }

  private burst(scene: Phaser.Scene, x: number, y: number, color: number, label: string) {
    const ring = scene.add.circle(x, y, 8, color, 0.6).setDepth(200);
    scene.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });

    const particles = scene.add.particles(x, y, 'particle_spark', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 500,
      quantity: 12,
      blendMode: 'ADD',
      tint: color,
    });
    particles.setDepth(201);
    scene.time.delayedCall(600, () => particles.destroy());

    const txt = scene.add
      .text(x, y - 50, label, {
        fontSize: '14px',
        color: '#e8f8ff',
        fontFamily: 'Consolas, monospace',
        stroke: '#000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(202);
    scene.tweens.add({
      targets: txt,
      y: y - 90,
      alpha: 0,
      duration: 1600,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  private showBanner(scene: Phaser.Scene, text: string, color: number, x: number, y: number) {
    this.overlay?.destroy();
    const bg = scene.add.rectangle(x, y, 420, 48, 0x0a1018, 0.85).setStrokeStyle(2, color);
    const label = scene.add
      .text(x, y, text, {
        fontSize: '16px',
        color: '#e8f0f8',
        fontFamily: 'Consolas, monospace',
      })
      .setOrigin(0.5);
    const c = scene.add.container(0, 0, [bg, label]).setDepth(300);
    c.setAlpha(0);
    c.setScale(0.85);
    scene.tweens.add({
      targets: c,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: 'Back.easeOut',
    });
    scene.tweens.add({
      targets: c,
      alpha: 0,
      y: y - 20,
      delay: 2200,
      duration: 500,
      onComplete: () => c.destroy(),
    });
    this.overlay = c;
  }

  destroy() {
    this.overlay?.destroy();
  }
}
