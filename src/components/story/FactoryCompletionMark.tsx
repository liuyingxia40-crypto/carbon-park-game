import { SUCCESS_RING_SRC } from '../../game/park/factoryPlacements';
import {
  completionMarkAnchorStyle,
  completionRingStyle,
} from '../../game/park/constructionFxLayout';
import type { TiledFactoryScreenRect } from '../../game/park/mapDisplayCoords';

type Props = {
  box: TiledFactoryScreenRect;
};

/** 升级完成后：工厂右上方的小型完成光圈 + 「低碳」标记 */
export function FactoryCompletionMark({ box }: Props) {
  return (
    <div className="map-wrapper__completion-mark" style={completionMarkAnchorStyle(box)} aria-hidden>
      <img
        className="map-wrapper__completion-ring"
        src={SUCCESS_RING_SRC}
        alt=""
        draggable={false}
        style={completionRingStyle(box)}
      />
      <span className="map-wrapper__low-carbon-badge">低碳</span>
    </div>
  );
}
