import { UI_FRAMES } from '../game/assets/assetIds';
import { SHEET_LAYOUT, SPRITE_URLS } from '../game/assets/spriteUrls';

const UI_INDEX: Record<string, { col: number; row: number }> = {
  [UI_FRAMES.resourceBar]: { col: 0, row: 0 },
  [UI_FRAMES.buildMenu]: { col: 1, row: 0 },
  [UI_FRAMES.statusPanel]: { col: 0, row: 1 },
  [UI_FRAMES.buildingInfo]: { col: 1, row: 1 },
};

type UiSpriteProps = {
  frame: keyof typeof UI_FRAMES | (typeof UI_FRAMES)[keyof typeof UI_FRAMES];
  width?: number | string;
  height?: number | string;
  className?: string;
  children?: React.ReactNode;
};

/** ui_sheet 九宫格式铺底（可拉伸） */
export function UiSprite({ frame, width = '100%', height = 64, className = '', children }: UiSpriteProps) {
  const frameId = frame.startsWith('ui_') ? frame : UI_FRAMES[frame as keyof typeof UI_FRAMES];
  const { col, row } = UI_INDEX[frameId] ?? { col: 0, row: 0 };
  const { fw, fh, cols, rows } = SHEET_LAYOUT.ui;
  const sheetW = cols * fw;
  const sheetH = rows * fh;

  return (
    <div
      className={`ui-sprite ${className}`}
      style={{
        width,
        height,
        backgroundImage: `url(${SPRITE_URLS.ui})`,
        backgroundPosition: `-${col * fw}px -${row * fh}px`,
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
}
