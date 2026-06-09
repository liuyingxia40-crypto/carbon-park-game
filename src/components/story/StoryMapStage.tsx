import { type ReactNode, useEffect, useRef } from 'react';
import { PhaserGame } from '../PhaserGame';
import { computeContainLayout } from '../../game/park/mapStageLayout';
import './StoryMapStage.css';

/** 地图主舞台：Phaser 交互地图 + 事件层 overlay */
export function StoryMapStage({
  children,
  mapKey = 0,
}: {
  children?: ReactNode;
  mapKey?: number;
}) {
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
    <div className="game-stage" ref={stageRef}>
      <div className="game-stage__map-host" ref={hostRef}>
        <PhaserGame bootKey={mapKey} />
      </div>
      {children && <div className="game-stage__event-layer">{children}</div>}
    </div>
  );
}
