import { BUILDING_FRAMES } from '../game/assets/assetIds';
import { BUILDING_TEXTURE_MAP } from '../game/assets/sheetManifests';
import { SHEET_LAYOUT, SPRITE_URLS } from '../game/assets/spriteUrls';
import type { BuildingId } from '../game/buildings';

const FRAME_INDEX: Record<string, number> = {
  [BUILDING_FRAMES.thermal]: 0,
  [BUILDING_FRAMES.steel]: 1,
  [BUILDING_FRAMES.solar]: 2,
  [BUILDING_FRAMES.recycle]: 3,
};

type Props = {
  buildingId: BuildingId | string;
  size?: number;
};

export function BuildingThumb({ buildingId, size = 48 }: Props) {
  const ref = BUILDING_TEXTURE_MAP[buildingId];
  const frameId = ref?.frameId ?? BUILDING_FRAMES.thermal;
  const idx = FRAME_INDEX[frameId] ?? 0;
  const { fw, cols } = SHEET_LAYOUT.buildings;
  const sheetW = cols * fw;

  return (
    <span
      className="building-thumb"
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${SPRITE_URLS.buildings})`,
        backgroundPosition: `-${idx * size}px 0`,
        backgroundSize: `${(sheetW / fw) * size}px ${size}px`,
      }}
      aria-hidden
    />
  );
}
