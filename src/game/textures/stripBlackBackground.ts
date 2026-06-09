import Phaser from 'phaser';

export type StripBlackOptions = {
  /** RGB 均低于此值视为背景（0–255） */
  threshold?: number;
};

/**
 * 将纹理中近黑色像素变为透明（适用于 PNG 带黑底未抠图的情况）
 */
export function stripBlackFromTexture(
  scene: Phaser.Scene,
  textureKey: string,
  options: StripBlackOptions = {},
): boolean {
  if (!scene.textures.exists(textureKey)) return false;

  const threshold = options.threshold ?? 28;
  const texture = scene.textures.get(textureKey);
  const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement | null;
  if (!source || !('width' in source) || source.width < 1) return false;

  const w = source.width;
  const h = source.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(source as CanvasImageSource, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      d[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  if (scene.textures.exists(textureKey)) {
    scene.textures.remove(textureKey);
  }
  scene.textures.addCanvas(textureKey, canvas);
  return true;
}

/** 批量处理地块等独立纹理 */
export function stripBlackFromKeys(scene: Phaser.Scene, keys: readonly string[], threshold = 28) {
  let n = 0;
  for (const key of keys) {
    if (stripBlackFromTexture(scene, key, { threshold })) n += 1;
  }
  return n;
}

/** 整张图集抠黑底，保留 atlas 帧坐标 */
export function stripBlackFromAtlasSource(
  scene: Phaser.Scene,
  atlasKey: string,
  options: StripBlackOptions = {},
): boolean {
  if (!scene.textures.exists(atlasKey)) return false;

  const threshold = options.threshold ?? 28;
  const texture = scene.textures.get(atlasKey);
  const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement | null;
  if (!source || !('width' in source) || source.width < 1) return false;

  const w = source.width;
  const h = source.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(source as CanvasImageSource, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] <= threshold && d[i + 1] <= threshold && d[i + 2] <= threshold) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const src = texture.source[0];
  src.image = canvas;
  src.width = w;
  src.height = h;
  src.isCanvas = true;
  src.update();
  return true;
}
