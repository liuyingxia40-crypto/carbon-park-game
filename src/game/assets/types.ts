/** 单帧定义（像素坐标，左上原点） */
export type FrameRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** 均匀网格切分 */
export type GridSliceConfig = {
  type: 'grid';
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  /** 按行优先排列的帧 ID */
  frameIds: string[];
  marginX?: number;
  marginY?: number;
  spacingX?: number;
  spacingY?: number;
};

/** 显式坐标切分 */
export type ExplicitSliceConfig = {
  type: 'explicit';
  frames: FrameRect[];
};

export type SliceConfig = GridSliceConfig | ExplicitSliceConfig;

export type SheetManifest = {
  /** Phaser 纹理/atlas 键名 */
  atlasKey: string;
  /** public 下路径，Vite 以 / 为根 */
  imageUrl: string;
  /** 生成的 json 路径（可选，运行时也可内联） */
  atlasJsonUrl?: string;
  slice: SliceConfig;
};

/** Phaser load.atlas 使用的 JSON 结构 */
export type PhaserAtlasJson = {
  frames: Record<
    string,
    {
      frame: { x: number; y: number; w: number; h: number };
      rotated: boolean;
      trimmed: boolean;
      spriteSourceSize: { x: number; y: number; w: number; h: number };
      sourceSize: { w: number; h: number };
    }
  >;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
};

export type AtlasFrameRef = {
  atlasKey: string;
  frameId: string;
};
