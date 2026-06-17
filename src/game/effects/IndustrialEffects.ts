import Phaser from 'phaser';
import { AssetManager } from '../assets';
import type { BuildingId, BuildingLevel } from '../buildings';

type FactoryFx = {
  emitters: Phaser.GameObjects.Particles.ParticleEmitter[];
  smokeBaseFreq: number[];
  baseScale: number;
  level: BuildingLevel;
};

const CHIMNEY_OFFSET: Partial<Record<BuildingId, { x: number; y: number }[]>> = {
  thermal_plant: [
    { x: 22, y: -58 },
    { x: 4, y: -50 },
  ],
  steel_mill: [
    { x: 36, y: -64 },
    { x: 12, y: -56 },
  ],
};

/** 仅保留烟囱烟雾，无窗户色块占位 */
export class IndustrialEffects {
  private fxMap = new Map<Phaser.GameObjects.Image, FactoryFx>();
  private smokeStress = 1;

  attach(
    scene: Phaser.Scene,
    sprite: Phaser.GameObjects.Image,
    id: BuildingId,
    level: BuildingLevel = 1,
  ) {
    if (this.fxMap.has(sprite)) return;
    if (id !== 'thermal_plant' && id !== 'steel_mill') return;

    const emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    const smokeBaseFreq: number[] = [];
    const scale = Phaser.Math.Clamp(sprite.scaleX, 0.8, 2.2);
    const pScale = scale * 0.35;

    const smokeTex = AssetManager.getParticleTexture(true);
    const baseFreq = id === 'thermal_plant' ? 55 : 90;

    const smokeCfg: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      speed: { min: 10, max: 28 },
      angle: { min: 250, max: 290 },
      scale: { start: pScale, end: 0.02 },
      alpha: { start: 0.5, end: 0 },
      lifespan: { min: 2200, max: 3800 },
      frequency: baseFreq,
      tint: [0x999999, 0xbbbbbb, 0x777777],
    };
    if (smokeTex.frame) smokeCfg.frame = smokeTex.frame;

    const chimneys = CHIMNEY_OFFSET[id] ?? [{ x: 0, y: -52 }];
    for (const off of chimneys) {
      const em = scene.add.particles(
        sprite.x + off.x * scale,
        sprite.y + off.y * scale,
        smokeTex.key,
        { ...smokeCfg, frequency: baseFreq / this.smokeStress },
      );
      em.setDepth(sprite.depth + 2);
      emitters.push(em);
      smokeBaseFreq.push(baseFreq);
    }

    this.fxMap.set(sprite, {
      emitters,
      smokeBaseFreq,
      baseScale: scale,
      level,
    });
  }

  setSmokeStress(v: number) {
    this.smokeStress = Phaser.Math.Clamp(v, 0.6, 2);
    for (const fx of this.fxMap.values()) {
      fx.emitters.forEach((em, i) => {
        em.setFrequency(fx.smokeBaseFreq[i] / this.smokeStress);
      });
    }
  }

  setNightFactor(_v: number) {}

  setPollutionStress(_pollution: number, _emissionRatio = 0) {
    this.setSmokeStress(1 + _pollution / 120);
  }

  setBuildingLevel(_scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, _level: BuildingLevel) {
    const fx = this.fxMap.get(sprite);
    if (fx) fx.level = _level;
  }

  syncPositions(sprite: Phaser.GameObjects.Image) {
    const fx = this.fxMap.get(sprite);
    if (!fx) return;
    const id = (sprite.getData('buildingId') as BuildingId) ?? 'thermal_plant';
    const chimneys = CHIMNEY_OFFSET[id] ?? [{ x: 0, y: -52 }];
    fx.emitters.forEach((em, i) => {
      const off = chimneys[i] ?? chimneys[0];
      em.setPosition(sprite.x + off.x * fx.baseScale, sprite.y + off.y * fx.baseScale);
    });
  }

  detach(sprite: Phaser.GameObjects.Image) {
    const fx = this.fxMap.get(sprite);
    if (!fx) return;
    fx.emitters.forEach((e) => e.destroy());
    this.fxMap.delete(sprite);
  }

  destroyAll() {
    for (const fx of this.fxMap.values()) {
      fx.emitters.forEach((e) => e.destroy());
    }
    this.fxMap.clear();
  }
}
