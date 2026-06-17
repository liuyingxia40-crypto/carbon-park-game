import { ICON_FRAMES } from '../game/assets/assetIds';
import { SHEET_LAYOUT, SPRITE_URLS } from '../game/assets/spriteUrls';

const ICON_SHEET = SPRITE_URLS.icons;
const ICON_SIZE = SHEET_LAYOUT.icons.fw;

const ICON_INDEX: Record<string, number> = {
  [ICON_FRAMES.money]: 0,
  [ICON_FRAMES.power]: 1,
  [ICON_FRAMES.pollution]: 2,
  [ICON_FRAMES.green]: 3,
};

/** 无 icons_sheet.png 时的纯色图标 */
const BOOTSTRAP_ICON: Record<string, { bg: string; fg: string }> = {
  [ICON_FRAMES.money]: { bg: '#fff4d8', fg: '#c89820' },
  [ICON_FRAMES.power]: { bg: '#e0f4ff', fg: '#4090c8' },
  [ICON_FRAMES.pollution]: { bg: '#f0e8e4', fg: '#a07060' },
  [ICON_FRAMES.green]: { bg: '#e0f8ec', fg: '#40a870' },
};

type IconSpriteProps = {
  icon: keyof typeof ICON_FRAMES | 'money' | 'power' | 'pollution' | 'green';
  size?: number;
  className?: string;
};

export function IconSprite({ icon, size = 18, className = '' }: IconSpriteProps) {
  const frameId = icon.startsWith('icon_') ? icon : ICON_FRAMES[icon as keyof typeof ICON_FRAMES];
  const idx = ICON_INDEX[frameId] ?? 0;
  const sheetW = 6 * ICON_SIZE;
  const boot = BOOTSTRAP_ICON[frameId];

  return (
    <span
      className={`icon-sprite ${className}`}
      style={
        boot
          ? {
              display: 'inline-block',
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${boot.fg}88, ${boot.bg})`,
              border: `1px solid ${boot.fg}44`,
              verticalAlign: 'middle',
            }
          : {
              display: 'inline-block',
              width: size,
              height: size,
              backgroundImage: `url(${ICON_SHEET})`,
              backgroundPosition: `-${idx * size}px 0`,
              backgroundSize: `${(sheetW / ICON_SIZE) * size}px ${size}px`,
              verticalAlign: 'middle',
            }
      }
      aria-hidden
    />
  );
}
