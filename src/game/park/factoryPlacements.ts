import type { FactoryId } from '../story/phase1Script';

export const PLACEMENT_MAP_IMAGE = '/assets/tiles/industrial_park_v1.png';
export const PLACEMENT_MAP_JSON = '/assets/maps/industrial_park_v1.json';

export const TILED_OBJECT_LAYERS = {
  factoryObjects: 'factory_objects',
  buildablePlots: 'buildable_plots',
} as const;

export const BUILDABLE_PLOT_ORDER = ['plot_1', 'plot_2', 'plot_3'] as const;

/** 未升级工厂贴图（original） */
export const FACTORY_ORIGINAL_SRC: Record<FactoryId, string> = {
  factory_coal: '/assets/factories/original/coal_factory.png',
  factory_chemical: '/assets/factories/original/chemical_factory.png',
  factory_heavy: '/assets/factories/original/heavy_factory.png',
};

/** 初改完成后的工厂贴图（upgraded） */
export const FACTORY_UPGRADED_SRC: Record<FactoryId, string> = {
  factory_coal: '/assets/factories/upgraded/coal_factory_upgraded.png',
  factory_chemical: '/assets/factories/upgraded/chemical_factory_upgraded.png',
  factory_heavy: '/assets/factories/upgraded/heavy_factory_upgraded.png',
};

/** @deprecated 使用 FACTORY_ORIGINAL_SRC */
export const FACTORY_SPRITE_SRC = FACTORY_ORIGINAL_SRC;

export const FACTORY_SPRITE_TRIM_VERSION = '4';

export const FACTORY_SPRITE_TRIM_PATHS: Record<string, string> = {
  '/assets/sprites/coal_factory_base.png': FACTORY_ORIGINAL_SRC.factory_coal,
  '/assets/sprites/chemical_factory_base.png': FACTORY_ORIGINAL_SRC.factory_chemical,
  '/assets/sprites/green_factory_basic.png': FACTORY_ORIGINAL_SRC.factory_heavy,
  '/assets/sprites/coal_factory_base_trim.png': FACTORY_ORIGINAL_SRC.factory_coal,
  '/assets/sprites/chemical_factory_base_trim.png': FACTORY_ORIGINAL_SRC.factory_chemical,
  '/assets/sprites/green_factory_basic_trim.png': FACTORY_ORIGINAL_SRC.factory_heavy,
  '/assets/factories/original/coal_factory.png': FACTORY_ORIGINAL_SRC.factory_coal,
  '/assets/factories/original/chemical_factory.png': FACTORY_ORIGINAL_SRC.factory_chemical,
  '/assets/factories/original/heavy_factory.png': FACTORY_ORIGINAL_SRC.factory_heavy,
};

export function resolveFactorySpritePath(imagePath: string): string {
  const base = imagePath.split('?')[0];
  const trimmed = FACTORY_SPRITE_TRIM_PATHS[base];
  if (!trimmed) return imagePath;
  return `${trimmed}?v=${FACTORY_SPRITE_TRIM_VERSION}`;
}

export function factorySpriteSrc(factoryId: FactoryId, upgraded = false): string {
  const base = upgraded ? FACTORY_UPGRADED_SRC[factoryId] : FACTORY_ORIGINAL_SRC[factoryId];
  return `${base}?v=${FACTORY_SPRITE_TRIM_VERSION}`;
}

export function isFactoryUpgraded(
  factoryId: FactoryId,
  initialRetrofitDone: FactoryId[],
): boolean {
  return initialRetrofitDone.includes(factoryId);
}

/** 所有已知工厂贴图路径 → FactoryId（用于 Tiled gid 解析，与 ?v= 无关） */
const FACTORY_ID_BY_SPRITE_PATH: Record<string, FactoryId> = (() => {
  const map: Record<string, FactoryId> = {};
  for (const [id, src] of Object.entries(FACTORY_ORIGINAL_SRC) as [FactoryId, string][]) {
    map[src] = id;
  }
  for (const [id, src] of Object.entries(FACTORY_UPGRADED_SRC) as [FactoryId, string][]) {
    map[src] = id;
  }
  for (const [legacyPath, canonical] of Object.entries(FACTORY_SPRITE_TRIM_PATHS)) {
    const id = Object.entries(FACTORY_ORIGINAL_SRC).find(([, v]) => v === canonical)?.[0] as
      | FactoryId
      | undefined;
    if (id) map[legacyPath] = id;
  }
  return map;
})();

export function spriteImageToFactoryId(imagePath: string): FactoryId | null {
  const path = imagePath.split('?')[0];
  const byPath = FACTORY_ID_BY_SPRITE_PATH[path];
  if (byPath) return byPath;

  const lower = path.toLowerCase();
  if (lower.includes('coal_factory') || lower.includes('factory_coal')) return 'factory_coal';
  if (lower.includes('chemical_factory') || lower.includes('factory_chemical')) {
    return 'factory_chemical';
  }
  if (
    lower.includes('heavy_factory') ||
    lower.includes('green_factory') ||
    lower.includes('factory_heavy')
  ) {
    return 'factory_heavy';
  }
  return null;
}

/** 开发环境：探测贴图是否真正加载成功 */
export function probeFactorySpriteLoad(src: string, factoryId: FactoryId): void {
  if (!import.meta.env.DEV) return;

  const img = new Image();
  img.onload = () => {
    console.info('[factory-sprite]', factoryId, {
      src: img.currentSrc || img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      status: 'loaded',
    });
  };
  img.onerror = () => {
    console.error('[factory-sprite]', factoryId, {
      src: img.currentSrc || img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      status: 'error',
    });
  };
  img.src = src;
}

export const CONSTRUCTION_ANIMATION_MS = 2000;

/** 工厂 upgrading 时叠加的施工特效（不写入 Tiled） */
export const CONSTRUCTION_COVER_SRC = '/assets/effects/construction/construction_cover.png';
export const CRANE_BODY_SRC = '/assets/effects/construction/crane_body.png';
export const CRANE_HOOK_SRC = '/assets/effects/construction/crane_hook.png';
export const SUCCESS_RING_SRC = '/assets/effects/construction/success_ring.png';

/** 吊钩沿横梁左右摆动周期（秒） */
export const CRANE_HOOK_SWING_MS = 2000;

/** 施工完成后 success_ring 播放时长 */
export const SUCCESS_RING_MS = 900;
