/** 地图在视口中的缩放（object-fit: contain + 略缩小） */
export type MapImageScale = {
  naturalWidth: number;
  naturalHeight: number;
  clientWidth: number;
  clientHeight: number;
  scaleX: number;
  scaleY: number;
  /** 地图内容区相对容器左上角的 X 偏移（letterbox） */
  offsetX: number;
  /** 地图内容区相对容器左上角的 Y 偏移（letterbox） */
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
};

/** 与 CSS object-fit: contain 一致，不再额外缩小（留白由容器 inset 负责） */
export const MAP_DISPLAY_SHRINK = 1;

/**
 * 按 object-fit: contain 计算地图缩放与偏移（可略缩小）。
 * viewport 传容器宽高；不传则用 img 布局尺寸。
 */
export function measureMapImageScale(
  image: HTMLImageElement,
  viewportWidth?: number,
  viewportHeight?: number,
): MapImageScale | null {
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const clientWidth = viewportWidth ?? image.clientWidth;
  const clientHeight = viewportHeight ?? image.clientHeight;

  if (!naturalWidth || !naturalHeight || !clientWidth || !clientHeight) {
    return null;
  }

  const fitScale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
  const scale = fitScale * MAP_DISPLAY_SHRINK;
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (clientWidth - renderedWidth) / 2;
  const offsetY = (clientHeight - renderedHeight) / 2;

  return {
    naturalWidth,
    naturalHeight,
    clientWidth,
    clientHeight,
    scaleX: scale,
    scaleY: scale,
    offsetX,
    offsetY,
    renderedWidth,
    renderedHeight,
  };
}

/** factory_objects 原始字段（Tiled JSON） */
export type TiledFactoryObject = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TiledFactoryScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
};

export function tiledFactoryObjectToScreenRect(
  object: TiledFactoryObject,
  scale: MapImageScale,
): TiledFactoryScreenRect {
  return {
    left: object.x * scale.scaleX + scale.offsetX,
    top: (object.y - object.height) * scale.scaleY + scale.offsetY,
    width: object.width * scale.scaleX,
    height: object.height * scale.scaleY,
    rotation: object.rotation ?? 0,
  };
}


export function clientPointToMapCoords(
  clientX: number,
  clientY: number,
  image: HTMLImageElement,
  scale: MapImageScale,
): { x: number; y: number } | null {
  const rect = image.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;

  const { offsetX, offsetY, renderedWidth, renderedHeight, scaleX, scaleY } = scale;

  if (
    localX < offsetX ||
    localY < offsetY ||
    localX > offsetX + renderedWidth ||
    localY > offsetY + renderedHeight
  ) {
    return null;
  }

  return {
    x: (localX - offsetX) / scaleX,
    y: (localY - offsetY) / scaleY,
  };
}
