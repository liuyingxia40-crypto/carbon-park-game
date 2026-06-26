import type { CSSProperties } from 'react';
import type { FactoryId } from '../story/phase1Script';
import type { TiledFactoryScreenRect } from './mapDisplayCoords';

/** 裁剪后原始工厂贴图宽高比（width / height） */
export const FACTORY_SPRITE_ASPECT: Record<FactoryId, number> = {
  factory_coal: 1254 / 1101,
  factory_chemical: 1254 / 950,
  factory_heavy: 1216 / 949,
};

/** 升级后工厂贴图宽高比 */
export const FACTORY_UPGRADED_ASPECT: Record<FactoryId, number> = {
  factory_coal: 1,
  factory_chemical: 1,
  factory_heavy: 1,
};

/** 升级后显示缩放（底边中心不变，仅放大贴图） */
export const FACTORY_UPGRADED_DISPLAY_SCALE: Partial<Record<FactoryId, number>> = {
  factory_heavy: 2,
};

function factoryDisplayScale(factoryId: FactoryId, upgraded: boolean): number {
  if (!upgraded) return 1;
  return FACTORY_UPGRADED_DISPLAY_SCALE[factoryId] ?? 1;
}

function factorySpriteAspect(factoryId: FactoryId, upgraded: boolean): number {
  return upgraded ? FACTORY_UPGRADED_ASPECT[factoryId] : FACTORY_SPRITE_ASPECT[factoryId];
}

/** 相对地块框的比例微调（x 右正，y 下正） */
export const FACTORY_DISPLAY_NUDGE: Record<FactoryId, { x: number; y: number }> = {
  factory_coal: { x: 0, y: 0 },
  factory_chemical: { x: 0, y: 0 },
  factory_heavy: { x: 0.03, y: 0.02 },
};

/** 升级后额外偏移（叠加在 FACTORY_DISPLAY_NUDGE 上） */
export const FACTORY_UPGRADED_DISPLAY_NUDGE: Partial<Record<FactoryId, { x: number; y: number }>> = {
  factory_heavy: { x: -0.08, y: 0.06 },
};

function factoryDisplayNudge(
  factoryId: FactoryId,
  upgraded: boolean,
): { x: number; y: number } {
  const base = FACTORY_DISPLAY_NUDGE[factoryId];
  const extra = upgraded ? (FACTORY_UPGRADED_DISPLAY_NUDGE[factoryId] ?? { x: 0, y: 0 }) : { x: 0, y: 0 };
  return { x: base.x + extra.x, y: base.y + extra.y };
}

export type FactoryVisualRect = {
  centerX: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

/** object-fit: contain 后工厂贴图在地块框内的真实可见区域 */
export function computeFactoryVisualRect(
  factoryId: FactoryId,
  rect: TiledFactoryScreenRect,
  upgraded = false,
): FactoryVisualRect {
  const aspect = factorySpriteAspect(factoryId, upgraded);
  const nudge = factoryDisplayNudge(factoryId, upgraded);
  const boxAspect = rect.width / rect.height;

  let visualWidth: number;
  let visualHeight: number;
  if (boxAspect > aspect) {
    visualHeight = rect.height;
    visualWidth = rect.height * aspect;
  } else {
    visualWidth = rect.width;
    visualHeight = rect.width / aspect;
  }

  const scale = factoryDisplayScale(factoryId, upgraded);
  visualWidth *= scale;
  visualHeight *= scale;

  const centerX = rect.left + rect.width / 2 + rect.width * nudge.x;
  const visualBottom = rect.top + rect.height + rect.height * nudge.y;

  return {
    centerX,
    top: visualBottom - visualHeight,
    bottom: visualBottom,
    width: visualWidth,
    height: visualHeight,
  };
}

export function factoryImageStyle(
  factoryId: FactoryId,
  rect: TiledFactoryScreenRect,
  upgraded = false,
): CSSProperties {
  const visual = computeFactoryVisualRect(factoryId, rect, upgraded);

  return {
    position: 'absolute',
    left: `${visual.centerX}px`,
    top: `${visual.bottom}px`,
    width: `${visual.width}px`,
    height: `${visual.height}px`,
    transform: 'translate(-50%, -100%)',
    transformOrigin: 'center bottom',
    objectFit: 'contain',
    objectPosition: 'center bottom',
    maxWidth: 'none',
    maxHeight: 'none',
    boxSizing: 'border-box',
    display: 'block',
  };
}
