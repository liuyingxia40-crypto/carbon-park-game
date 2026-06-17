import Phaser from 'phaser';
import { AssetManager } from '../assets';
import { ISO_TILE_H, ISO_TILE_W, MAP_COLS, MAP_ROWS } from '../constants';
import type { EvolutionPhase } from '../cityEvolution';
import {
  resolveRiverFrame,
  resolveRoadFrame,
  roadNeighborMask,
  shouldPlaceShore,
  terrainFrame,
} from './tileAutotile';
import type { WorldMapData } from './mapGenerator';
import { tileToWorld } from './isoMath';

const LAYER_DEPTH = {
  terrain: 0,
  shore: 1,
  river: 2,
  road: 3,
} as const;

/**
 * 逐格铺设独立 PNG 纹理（每格一张图，64×32 显示）
 * map 逻辑层 → 每格对应一个 texture key
 */
export class IsoTileMapRenderer {
  readonly tiles: Phaser.GameObjects.Image[] = [];

  constructor(
    private scene: Phaser.Scene,
    mapData: WorldMapData,
  ) {
    if (!AssetManager.hasTilesAtlas()) {
      throw new Error(AssetManager.getLoadError() || '地块图未加载');
    }

    const { cells, majorRoad } = mapData;
    let placed = 0;

    for (let ty = 0; ty < MAP_ROWS; ty++) {
      for (let tx = 0; tx < MAP_COLS; tx++) {
        const cell = cells[ty][tx];

        if (!cell.river) {
          if (this.place(tx, ty, terrainFrame(cell), LAYER_DEPTH.terrain)) placed++;
        }

        if (shouldPlaceShore(cells, tx, ty)) {
          if (this.place(tx, ty, 'tile_shoreline', LAYER_DEPTH.shore)) placed++;
        }

        if (cell.river) {
          if (this.place(tx, ty, resolveRiverFrame(cells, tx, ty), LAYER_DEPTH.river)) placed++;
        }

        if (cell.road) {
          const mask = roadNeighborMask(cells, tx, ty);
          const frame = resolveRoadFrame(mask, cell.roadKind, majorRoad[ty][tx]);
          if (this.place(tx, ty, frame, LAYER_DEPTH.road)) placed++;
        }
      }
    }

    console.info(`[IsoTileMapRenderer] 已铺设 ${placed} 格 (${MAP_COLS}×${MAP_ROWS})`);
  }

  private place(tx: number, ty: number, textureKey: string, layer: number): boolean {
    const useAtlas = AssetManager.usesTileAtlasFrames();
    const atlasKey = AssetManager.getTilesAtlasKey();
    if (useAtlas) {
      if (!this.scene.textures.exists(atlasKey)) return false;
      const tex = this.scene.textures.get(atlasKey);
      if (!tex.has(textureKey)) {
        console.warn(`[IsoTileMapRenderer] 图集缺少帧 ${textureKey}`);
        return false;
      }
    } else if (!this.scene.textures.exists(textureKey)) {
      console.warn(`[IsoTileMapRenderer] 缺少纹理 ${textureKey}`);
      return false;
    }

    const { x, y } = tileToWorld(tx, ty);
    const img = useAtlas
      ? this.scene.add.image(x, y, atlasKey, textureKey)
      : this.scene.add.image(x, y, textureKey);
    img.setOrigin(0.5, 0.5).setDisplaySize(ISO_TILE_W, ISO_TILE_H).setDepth((tx + ty) * 10 + layer);
    this.tiles.push(img);
    return true;
  }

  setEvolutionPhase(_phase: EvolutionPhase) {}

  setPollutionLevel(_pollution: number, _emissionRatio = 0) {}

  destroy() {
    for (const t of this.tiles) t.destroy();
    this.tiles.length = 0;
  }
}
