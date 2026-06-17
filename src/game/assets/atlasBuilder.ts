import type { FrameRect, GridSliceConfig, PhaserAtlasJson, SheetManifest, SliceConfig } from './types';

export function sliceGrid(config: GridSliceConfig): FrameRect[] {
  const {
    cols,
    rows,
    frameWidth,
    frameHeight,
    frameIds,
    marginX = 0,
    marginY = 0,
    spacingX = 0,
    spacingY = 0,
  } = config;

  const frames: FrameRect[] = [];
  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (i >= frameIds.length) break;
      frames.push({
        id: frameIds[i],
        x: marginX + col * (frameWidth + spacingX),
        y: marginY + row * (frameHeight + spacingY),
        w: frameWidth,
        h: frameHeight,
      });
      i += 1;
    }
  }
  return frames;
}

export function resolveFrames(slice: SliceConfig): FrameRect[] {
  if (slice.type === 'explicit') return slice.frames;
  return sliceGrid(slice);
}

export function computeSheetSize(frames: FrameRect[]): { w: number; h: number } {
  let w = 0;
  let h = 0;
  for (const f of frames) {
    w = Math.max(w, f.x + f.w);
    h = Math.max(h, f.y + f.h);
  }
  return { w: Math.max(w, 1), h: Math.max(h, 1) };
}

/** 生成 Phaser 3 兼容的 Texture Atlas JSON */
export function buildPhaserAtlasJson(manifest: SheetManifest, imageFileName?: string): PhaserAtlasJson {
  const frames = resolveFrames(manifest.slice);
  const size = computeSheetSize(frames);
  const imageName = imageFileName ?? manifest.imageUrl.split('/').pop() ?? `${manifest.atlasKey}.png`;

  const out: PhaserAtlasJson['frames'] = {};
  for (const f of frames) {
    out[f.id] = {
      frame: { x: f.x, y: f.y, w: f.w, h: f.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: f.w, h: f.h },
      sourceSize: { w: f.w, h: f.h },
    };
  }

  return {
    frames: out,
    meta: {
      app: 'industrial-carbon-platform',
      version: '1.0',
      image: imageName,
      format: 'RGBA8888',
      size,
      scale: '1',
    },
  };
}
