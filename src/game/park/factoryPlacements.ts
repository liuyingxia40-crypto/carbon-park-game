import type { FactoryId } from '../story/phase1Script';

export const PLACEMENT_MAP_IMAGE = '/assets/tiles/industrial_park_v1.png';
export const PLACEMENT_MAP_JSON = '/assets/maps/industrial_park_v1.json';

export const TILED_OBJECT_LAYERS = {
  factoryObjects: 'factory_objects',
  buildablePlots: 'buildable_plots',
} as const;

export const BUILDABLE_PLOT_ORDER = ['plot_1', 'plot_2', 'plot_3'] as const;

/** 运行时唯一使用的工厂贴图（裁剪版） */
export const FACTORY_SPRITE_SRC: Record<FactoryId, string> = {
  factory_coal: '/assets/sprites/coal_factory_base_trim.png',
  factory_chemical: '/assets/sprites/chemical_factory_base_trim.png',
  factory_heavy: '/assets/sprites/green_factory_basic_trim.png',
};

export const FACTORY_SPRITE_TRIM_VERSION = '3';

export const FACTORY_SPRITE_TRIM_PATHS: Record<string, string> = {
  '/assets/sprites/coal_factory_base.png': FACTORY_SPRITE_SRC.factory_coal,
  '/assets/sprites/chemical_factory_base.png': FACTORY_SPRITE_SRC.factory_chemical,
  '/assets/sprites/green_factory_basic.png': FACTORY_SPRITE_SRC.factory_heavy,
  '/assets/sprites/coal_factory_base_trim.png': FACTORY_SPRITE_SRC.factory_coal,
  '/assets/sprites/chemical_factory_base_trim.png': FACTORY_SPRITE_SRC.factory_chemical,
  '/assets/sprites/green_factory_basic_trim.png': FACTORY_SPRITE_SRC.factory_heavy,
};

export function resolveFactorySpritePath(imagePath: string): string {
  const base = imagePath.split('?')[0];
  const trimmed = FACTORY_SPRITE_TRIM_PATHS[base];
  if (!trimmed) return imagePath;
  return `${trimmed}?v=${FACTORY_SPRITE_TRIM_VERSION}`;
}

export function factorySpriteSrc(factoryId: FactoryId): string {
  return `${FACTORY_SPRITE_SRC[factoryId]}?v=${FACTORY_SPRITE_TRIM_VERSION}`;
}

export function spriteImageToFactoryId(imagePath: string): FactoryId | null {
  const path = imagePath.split('?')[0];
  if (path.includes('coal_factory')) return 'factory_coal';
  if (path.includes('chemical_factory')) return 'factory_chemical';
  if (path.includes('green_factory')) return 'factory_heavy';
  return null;
}

export const CONSTRUCTION_ANIMATION_MS = 2200;
