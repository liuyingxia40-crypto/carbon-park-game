import { PARK_MAP_HEIGHT, PARK_MAP_WIDTH } from './paths';

export type MapContainLayout = {
  stageWidth: number;
  stageHeight: number;
  scale: number;
  displayWidth: number;
  displayHeight: number;
  offsetX: number;
  offsetY: number;
};

/** contain 居中：完整显示地图，不裁切 */
export function computeContainLayout(
  stageWidth: number,
  stageHeight: number,
): MapContainLayout {
  const scale = Math.min(stageWidth / PARK_MAP_WIDTH, stageHeight / PARK_MAP_HEIGHT);
  const displayWidth = PARK_MAP_WIDTH * scale;
  const displayHeight = PARK_MAP_HEIGHT * scale;
  const offsetX = (stageWidth - displayWidth) / 2;
  const offsetY = (stageHeight - displayHeight) / 2;
  return {
    stageWidth,
    stageHeight,
    scale,
    displayWidth,
    displayHeight,
    offsetX,
    offsetY,
  };
}
