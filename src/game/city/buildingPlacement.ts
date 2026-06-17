import Phaser from 'phaser';
import { BUILDING_KEYS, type BuildingKey } from '../paths';
import type { BuildablePlot } from './buildablePlot';

export type PlotTier = 'small' | 'medium' | 'large';

export const PLACE_Y_RATIO = 0.88;
export const BUILDING_WIDTH_RATIO = 0.75;
export const BUILDING_HEIGHT_RATIO = 0.95;

export type BuildingDisplay = {
  scale: number;
  displayWidth: number;
  displayHeight: number;
};

export type ShadowLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  depth: number;
};

export type BuildingLayout = {
  placeX: number;
  placeY: number;
  display: BuildingDisplay;
  shadow: ShadowLayout;
  depth: number;
};

export function plotArea(plot: BuildablePlot): number {
  return plot.plotWidth * plot.plotHeight;
}

export function assignPlotTiers(plots: BuildablePlot[]): void {
  if (plots.length === 0) return;
  const areas = plots.map(plotArea).sort((a, b) => a - b);
  const n = areas.length;
  const smallMax = areas[Math.max(0, Math.floor(n / 3) - 1)] ?? areas[0];
  const largeMin = areas[Math.min(n - 1, Math.floor((2 * n) / 3))] ?? areas[n - 1];
  for (const plot of plots) {
    const area = plotArea(plot);
    if (area <= smallMax) plot.tier = 'small';
    else if (area >= largeMin) plot.tier = 'large';
    else plot.tier = 'medium';
  }
}

export function factoryKeyForTier(tier: PlotTier): BuildingKey {
  switch (tier) {
    case 'small':
      return BUILDING_KEYS.factory_small;
    case 'medium':
      return BUILDING_KEYS.factory_medium;
    case 'large':
      return BUILDING_KEYS.factory_large;
  }
}

export function computePlacement(plot: BuildablePlot): { placeX: number; placeY: number } {
  return {
    placeX: plot.plotX + plot.plotWidth / 2,
    placeY: plot.plotY + plot.plotHeight * PLACE_Y_RATIO,
  };
}

export function computeBuildingDisplay(
  textureWidth: number,
  textureHeight: number,
  plot: BuildablePlot,
): BuildingDisplay {
  if (textureWidth <= 0 || textureHeight <= 0) {
    return { scale: 1, displayWidth: textureWidth, displayHeight: textureHeight };
  }
  const maxW = plot.plotWidth * BUILDING_WIDTH_RATIO;
  const maxH = plot.plotHeight * BUILDING_HEIGHT_RATIO;
  const scale = Math.min(maxW / textureWidth, maxH / textureHeight);
  return {
    scale,
    displayWidth: textureWidth * scale,
    displayHeight: textureHeight * scale,
  };
}

export function computeShadowLayout(placeX: number, placeY: number, displayWidth: number): ShadowLayout {
  return {
    x: placeX,
    y: placeY + 5,
    width: displayWidth * 0.65,
    height: Phaser.Math.Clamp(20, 16, 24),
    alpha: 0.18,
    depth: placeY - 1,
  };
}

export function composeBuildingLayout(
  plot: BuildablePlot,
  textureWidth: number,
  textureHeight: number,
): BuildingLayout {
  const { placeX, placeY } = computePlacement(plot);
  const display = computeBuildingDisplay(textureWidth, textureHeight, plot);
  const shadow = computeShadowLayout(placeX, placeY, display.displayWidth);
  return {
    placeX,
    placeY,
    display,
    shadow,
    depth: placeY + 1,
  };
}
