import Phaser from 'phaser';

/** 污染视觉归一化 0（洁净）~ 1（重度） */
export function pollutionVisualT(pollution: number, emissionRatio = 0): number {
  const p = Phaser.Math.Clamp(pollution / 85, 0, 1);
  const e = Phaser.Math.Clamp(emissionRatio * 0.4, 0, 0.35);
  return Phaser.Math.Clamp(p + e, 0, 1);
}

export type PollutionBand = 'clean' | 'moderate' | 'severe';

export function pollutionBand(t: number): PollutionBand {
  if (t < 0.28) return 'clean';
  if (t < 0.58) return 'moderate';
  return 'severe';
}
