import { useEffect, useRef, type ReactNode } from 'react';
import { computeContainLayout } from '../../game/park/mapStageLayout';
import { PARK_BG_URL } from '../../game/park/paths';

type Props = {
  children: ReactNode;
  overlay?: ReactNode;
};

/**
 * 双层地图舞台：
 * - park-map-bg：cover + blur + 暗色遮罩（纯装饰，不参与交互）
 * - park-map-host：contain 尺寸，Phaser 主地图 + Tiled 点击区
 */
export function MapStage({ children, overlay }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const host = hostRef.current;
    if (!stage || !host) return;

    const apply = () => {
      const { displayWidth, displayHeight } = computeContainLayout(
        stage.clientWidth,
        stage.clientHeight,
      );
      host.style.width = `${displayWidth}px`;
      host.style.height = `${displayHeight}px`;
    };

    const ro = new ResizeObserver(apply);
    ro.observe(stage);
    apply();
    return () => ro.disconnect();
  }, []);

  return (
    <div className="park-map-frame">
      <div className="park-map-stage" ref={stageRef}>
        <div
          className="park-map-bg"
          style={{ backgroundImage: `url(${PARK_BG_URL})` }}
          aria-hidden
        />
        <div className="park-map-host" ref={hostRef}>
          {children}
        </div>
        {overlay}
      </div>
    </div>
  );
}
