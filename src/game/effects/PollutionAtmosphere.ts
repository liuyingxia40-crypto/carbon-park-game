import Phaser from 'phaser';
import { pollutionBand, pollutionVisualT } from '../pollutionVisual';

const CAMERA_BASE = 0xc8e8f4;
const SKY_CLEAN = 0xd8ecf4;
const SKY_MODERATE = 0x8a9098;
const SKY_SEVERE = 0x5a5550;
const AMBIENT_CLEAN = 0xa8d8f8;
const AMBIENT_SEVERE = 0x8a8070;

/** 轻量天空叠层（尺寸随画布变化） */
export class PollutionAtmosphere {
  private skyWash: Phaser.GameObjects.Rectangle;
  private hazeOverlay: Phaser.GameObjects.Rectangle;
  private ambientGlow: Phaser.GameObjects.Rectangle;
  private lastT = -1;
  private nightDim = 0;

  constructor(private scene: Phaser.Scene) {
    this.ambientGlow = scene.add
      .rectangle(0, 0, 1, 1, AMBIENT_CLEAN, 0.06)
      .setScrollFactor(0)
      .setDepth(198)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.skyWash = scene.add
      .rectangle(0, 0, 1, 1, SKY_CLEAN, 0)
      .setScrollFactor(0)
      .setDepth(199);

    this.hazeOverlay = scene.add
      .rectangle(0, 0, 1, 1, 0x9a9088, 0)
      .setScrollFactor(0)
      .setDepth(201)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.onResize();
  }

  onResize() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    for (const rect of [this.ambientGlow, this.skyWash, this.hazeOverlay]) {
      rect.setPosition(w / 2, h / 2);
      rect.setSize(w, h);
    }
  }

  setNightDim(amount: number) {
    this.nightDim = amount;
  }

  update(pollution: number, emissionRatio = 0) {
    const t = pollutionVisualT(pollution, emissionRatio) + this.nightDim * 0.12;
    const clamped = Phaser.Math.Clamp(t, 0, 1);
    if (Math.abs(clamped - this.lastT) < 0.008) return;
    this.lastT = clamped;

    const band = pollutionBand(clamped);
    this.scene.cameras.main.setBackgroundColor(CAMERA_BASE);

    let skyTarget = SKY_CLEAN;
    if (band === 'moderate') skyTarget = SKY_MODERATE;
    if (band === 'severe') skyTarget = SKY_SEVERE;

    const sky = this.lerpColor(SKY_CLEAN, skyTarget, clamped);
    this.skyWash.setFillStyle(sky, 0.02 + clamped * 0.06);

    const ambient = this.lerpColor(AMBIENT_CLEAN, AMBIENT_SEVERE, clamped);
    this.ambientGlow.setFillStyle(ambient, 0.05 + (1 - clamped) * 0.08);

    this.hazeOverlay.setAlpha(clamped * 0.12);
    this.hazeOverlay.setFillStyle(band === 'severe' ? 0x6a6058 : 0x9a9088);
  }

  private lerpColor(a: number, b: number, t: number) {
    const ca = Phaser.Display.Color.IntegerToColor(a);
    const cb = Phaser.Display.Color.IntegerToColor(b);
    const r = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, Math.floor(t * 100));
    return Phaser.Display.Color.GetColor(r.r, r.g, r.b);
  }

  destroy() {
    this.skyWash.destroy();
    this.hazeOverlay.destroy();
    this.ambientGlow.destroy();
  }
}
