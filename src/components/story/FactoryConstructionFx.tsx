import {
  CONSTRUCTION_COVER_SRC,
  CRANE_BODY_SRC,
  CRANE_HOOK_SRC,
  CRANE_HOOK_SWING_MS,
} from '../../game/park/factoryPlacements';
import { computeConstructionFxMetrics } from '../../game/park/constructionFxLayout';
import type { TiledFactoryScreenRect } from '../../game/park/mapDisplayCoords';

type Props = {
  box: TiledFactoryScreenRect;
};

/** 工厂 upgrading：覆盖图替代原工厂 + 静态吊机 + 吊钩摆动 */
export function FactoryConstructionFx({ box }: Props) {
  const fx = computeConstructionFxMetrics(box);

  return (
    <div className="map-wrapper__construction-fx" aria-hidden>
      <img
        className="map-wrapper__construction-cover"
        src={CONSTRUCTION_COVER_SRC}
        alt=""
        draggable={false}
        style={fx.cover}
      />
      <img
        className="map-wrapper__crane-body"
        src={CRANE_BODY_SRC}
        alt=""
        draggable={false}
        style={fx.craneBody}
      />
      <div
        className="map-wrapper__crane-hook-mount"
        style={{
          ...fx.hookMount,
          ['--hook-swing-ms' as string]: `${CRANE_HOOK_SWING_MS}ms`,
        }}
      >
        <img
          className="map-wrapper__crane-hook"
          src={CRANE_HOOK_SRC}
          alt=""
          draggable={false}
          style={fx.hook}
        />
      </div>
    </div>
  );
}
