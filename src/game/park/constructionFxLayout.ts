import type { CSSProperties } from 'react';
import type { TiledFactoryScreenRect } from './mapDisplayCoords';

/** 覆盖图基础宽度 = 原工厂宽度 × 1.05 */
const CONSTRUCTION_COVER_BASE_WIDTH_SCALE = 1.05;

/** 在基础尺寸上再放大：宽 ×1.12、高 ×1.08（中心与底边中心不变） */
export const CONSTRUCTION_COVER_WIDTH_GROW = 1.12;
export const CONSTRUCTION_COVER_HEIGHT_GROW = 1.08;

/** 覆盖图最终宽度 = 原工厂宽度 × 1.05 × 1.12 */
export const CONSTRUCTION_COVER_WIDTH_SCALE =
  CONSTRUCTION_COVER_BASE_WIDTH_SCALE * CONSTRUCTION_COVER_WIDTH_GROW;

/** 覆盖图最终高度 = 原工厂高度 × 1.08 */
export const CONSTRUCTION_COVER_HEIGHT_SCALE = CONSTRUCTION_COVER_HEIGHT_GROW;

/** 吊机宽度 = 覆盖图宽度 × 0.4（≤ 0.45） */
export const CRANE_BODY_COVER_WIDTH_SCALE = 0.4;

/** 吊钩宽度 = 吊机宽度 × 0.18（原 0.1 × 1.8） */
export const CRANE_HOOK_BODY_WIDTH_SCALE = 0.18;

/** 吊钩沿横臂左右移动范围 = 吊机宽度 × 0.08（沿臂下方小范围） */
export const CRANE_HOOK_TRAVEL_CRANE_WIDTH_SCALE = 0.08;

/**
 * 吊机底边锚点 X：贴近施工体左上侧（相对覆盖图左缘，略向右压入）
 */
export const CRANE_ANCHOR_X_FROM_COVER_LEFT = 0.32;

/**
 * 吊机底边锚点 Y：进一步下压，塔身与左上缘轻微重叠
 */
export const CRANE_BASE_OVERLAP_COVER_HEIGHT = 0.6;

/** 吊机锚点微调（像素） */
export const CRANE_ANCHOR_OFFSET_X = 30;
export const CRANE_ANCHOR_OFFSET_Y = 30;

/** 吊机 PNG 内横臂起点/终点（相对吊机图宽度，自左缘） */
export const CRANE_ARM_START_X_RATIO = 0.22;
export const CRANE_ARM_END_X_RATIO = 0.9;

/** 吊钩挂点沿横臂长度位置（0–1，68% 处） */
export const CRANE_HOOK_ARM_POSITION = 0.68;

/** 横臂下缘相对吊机图底边的高度比例（自底向上） */
export const CRANE_ARM_BOTTOM_FROM_CRANE_BOTTOM = 0.5;

/** 吊钩线缆视觉加长（scaleY） */
export const CRANE_HOOK_CABLE_STRETCH = 1.35;

export type ConstructionFxMetrics = {
  cover: CSSProperties;
  craneBody: CSSProperties;
  hookMount: CSSProperties;
  hook: CSSProperties;
};

export type ConstructionCoverMetrics = {
  centerX: number;
  bottomY: number;
  coverWidth: number;
  coverHeight: number;
  coverTop: number;
  coverLeft: number;
};

/** 覆盖图尺寸：底边中心对齐工厂，中心 x 不变，仅放大宽高 */
export function computeConstructionCoverMetrics(rect: TiledFactoryScreenRect): ConstructionCoverMetrics {
  const centerX = rect.left + rect.width / 2;
  const bottomY = rect.top + rect.height;
  const coverWidth = rect.width * CONSTRUCTION_COVER_WIDTH_SCALE;
  const coverHeight = rect.height * CONSTRUCTION_COVER_HEIGHT_SCALE;

  return {
    centerX,
    bottomY,
    coverWidth,
    coverHeight,
    coverTop: bottomY - coverHeight,
    coverLeft: centerX - coverWidth / 2,
  };
}

/** 施工覆盖图：与原工厂底边中心对齐 */
export function constructionCoverStyle(rect: TiledFactoryScreenRect): CSSProperties {
  const cover = computeConstructionCoverMetrics(rect);

  return {
    position: 'absolute',
    left: `${cover.coverLeft}px`,
    top: `${cover.coverTop}px`,
    width: `${cover.coverWidth}px`,
    height: `${cover.coverHeight}px`,
    objectFit: 'contain',
    objectPosition: 'center bottom',
    pointerEvents: 'none',
  };
}

/** 覆盖图 + 吊机 + 吊钩的绝对像素布局 */
export function computeConstructionFxMetrics(rect: TiledFactoryScreenRect): ConstructionFxMetrics {
  const cover = computeConstructionCoverMetrics(rect);
  const { coverWidth, coverHeight, coverTop, coverLeft } = cover;

  const craneWidth = coverWidth * CRANE_BODY_COVER_WIDTH_SCALE;
  const hookWidth = craneWidth * CRANE_HOOK_BODY_WIDTH_SCALE;
  const hookTravel = craneWidth * CRANE_HOOK_TRAVEL_CRANE_WIDTH_SCALE;

  /** 吊机：左后侧底座，塔身压入施工体左上缘 */
  const craneAnchorX = coverLeft + coverWidth * CRANE_ANCHOR_X_FROM_COVER_LEFT + CRANE_ANCHOR_OFFSET_X;
  const craneAnchorY = coverTop + coverHeight * CRANE_BASE_OVERLAP_COVER_HEIGHT + CRANE_ANCHOR_OFFSET_Y;
  const craneLeft = craneAnchorX - craneWidth / 2;

  /** 吊钩挂点：相对 crane_body 横臂，顶部对齐横臂下缘 */
  const armSpan = CRANE_ARM_END_X_RATIO - CRANE_ARM_START_X_RATIO;
  const hookAttachX =
    craneLeft + craneWidth * (CRANE_ARM_START_X_RATIO + CRANE_HOOK_ARM_POSITION * armSpan);
  const hookAttachY = craneAnchorY - craneWidth * CRANE_ARM_BOTTOM_FROM_CRANE_BOTTOM;

  return {
    cover: constructionCoverStyle(rect),
    craneBody: {
      position: 'absolute',
      left: `${craneAnchorX}px`,
      top: `${craneAnchorY}px`,
      width: `${craneWidth}px`,
      height: 'auto',
      transform: 'translate(-50%, -100%)',
      transformOrigin: 'center bottom',
      objectFit: 'contain',
      objectPosition: 'center bottom',
      pointerEvents: 'none',
    },
    hookMount: {
      position: 'absolute',
      left: `${hookAttachX}px`,
      top: `${hookAttachY}px`,
      transform: 'translate(-50%, 0)',
      transformOrigin: 'top center',
      pointerEvents: 'none',
      ['--hook-travel' as string]: `${hookTravel}px`,
      ['--hook-cable-stretch' as string]: `${CRANE_HOOK_CABLE_STRETCH}`,
    },
    hook: {
      display: 'block',
      width: `${hookWidth}px`,
      height: 'auto',
      objectFit: 'contain',
      objectPosition: 'top center',
      pointerEvents: 'none',
    },
  };
}

/** 升级完成标记锚点：工厂右上方 */
export function completionMarkAnchorStyle(rect: TiledFactoryScreenRect): CSSProperties {
  return {
    position: 'absolute',
    left: `${rect.left + rect.width * 0.9}px`,
    top: `${rect.top + rect.height * 0.14}px`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  };
}

export function completionRingStyle(rect: TiledFactoryScreenRect): CSSProperties {
  const size = Math.max(rect.width, rect.height) * 0.22;
  return {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain',
    display: 'block',
  };
}
