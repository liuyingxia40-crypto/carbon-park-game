import { type ReactNode } from 'react';
import { RetrofitMapView } from './RetrofitMapView';
import type { FactoryId, StageId } from '../../game/story/phase1Script';
import './RetrofitMapView.css';
import './StoryMapStage.css';

type Props = {
  children?: ReactNode;
  mapKey?: number;
  stageId: StageId;
  initialRetrofitDone: FactoryId[];
  deepOptimizedFactory: FactoryId | null;
  selectedFactory: FactoryId | null;
  constructingFactory: FactoryId | null;
  onFactorySelect: (factoryId: FactoryId | null) => void;
};

/** 全屏地图层 + 工厂 overlay（气泡/标签在 RetrofitMapView 内） */
export function StoryMapStage({
  children,
  mapKey = 0,
  stageId,
  initialRetrofitDone,
  deepOptimizedFactory,
  selectedFactory,
  constructingFactory,
  onFactorySelect,
}: Props) {
  return (
    <div className="map-layer">
      <RetrofitMapView
        mapKey={mapKey}
        stageId={stageId}
        initialRetrofitDone={initialRetrofitDone}
        deepOptimizedFactory={deepOptimizedFactory}
        selectedFactory={selectedFactory}
        constructingFactory={constructingFactory}
        onFactorySelect={onFactorySelect}
      />
      {children ? <div className="map-layer__event-layer">{children}</div> : null}
    </div>
  );
}
