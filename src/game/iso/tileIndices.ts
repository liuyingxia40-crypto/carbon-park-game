import { TILE_FRAMES } from '../assets/assetIds';
import { TILE_SHEET } from '../assets/tileSheetLayout';

/** 逻辑地块类型（TileMap tile index 对应 spritesheet 帧） */
export enum TileKind {
  Grass = 'grass',
  Dirt = 'dirt',
  Road = 'road',
  River = 'river',
  Industrial = 'industrial',
}

const KIND_BASE_FRAME: Record<TileKind, string> = {
  [TileKind.Grass]: TILE_FRAMES.grass,
  [TileKind.Dirt]: TILE_FRAMES.dirt,
  [TileKind.Road]: TILE_FRAMES.roadStraight,
  [TileKind.River]: TILE_FRAMES.riverCenter,
  [TileKind.Industrial]: TILE_FRAMES.industrialGround,
};

/** 图集帧名 → spritesheet 内帧序号（0 起） */
export function frameNameToIndex(frameName: string): number {
  const idx = (TILE_SHEET.frameIds as readonly string[]).indexOf(frameName);
  if (idx < 0) {
    console.warn(`[tileIndices] 未知帧 ${frameName}，回退 grass`);
    return 0;
  }
  return idx;
}

export function kindToFrameIndex(kind: TileKind): number {
  return frameNameToIndex(KIND_BASE_FRAME[kind]);
}

/** Phaser Tilemap 使用的 GID（含 tileset.firstgid） */
export function toMapGid(tileset: Phaser.Tilemaps.Tileset, frameIndex: number): number {
  return tileset.firstgid + frameIndex;
}

export function frameNameToGid(tileset: Phaser.Tilemaps.Tileset, frameName: string): number {
  return toMapGid(tileset, frameNameToIndex(frameName));
}
