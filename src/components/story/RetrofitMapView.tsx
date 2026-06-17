import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CONSTRUCTION_ANIMATION_MS,
  factorySpriteSrc,
  PLACEMENT_MAP_JSON,
} from '../../game/park/factoryPlacements';
import {
  clientPointToMapCoords,
  factoryImageStyle,
  measureMapImageScale,
  tiledFactoryObjectToScreenRect,
  type MapImageScale,
} from '../../game/park/mapDisplayCoords';
import {
  hitTestPolygon,
  parseRetrofitMap,
  type ParsedRetrofitMap,
  type TiledMapJson,
} from '../../game/park/parseTiledMapPlacements';
import {
  isMapFactoryStage,
  type FactoryId,
  type StageId,
} from '../../game/story/phase1Script';
import {
  FACTORY_UI_META,
  FactoryBubble,
  FactoryNameTag,
  factoryStarCount,
} from './ui';
import './RetrofitMapView.css';

/** 临时：显示 factory_objects 调试框，确认与 Tiled 对齐后改为 false */
const SHOW_FACTORY_DEBUG_BOUNDS = false;

type Props = {
  mapKey?: number;
  stageId: StageId;
  initialRetrofitDone: FactoryId[];
  deepOptimizedFactory: FactoryId | null;
  selectedFactory: FactoryId | null;
  constructingFactory: FactoryId | null;
  onFactorySelect: (factoryId: FactoryId | null) => void;
};

export function RetrofitMapView({
  mapKey = 0,
  stageId,
  initialRetrofitDone,
  deepOptimizedFactory,
  selectedFactory,
  constructingFactory,
  onFactorySelect,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [layout, setLayout] = useState<ParsedRetrofitMap | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapScale, setMapScale] = useState<MapImageScale | null>(null);
  const [hoveredFactory, setHoveredFactory] = useState<FactoryId | null>(null);

  const measureMap = useCallback(() => {
    const image = imageRef.current;
    const container = wrapperRef.current;
    if (!image || !container) return;
    const next = measureMapImageScale(image, container.clientWidth, container.clientHeight);
    if (next) setMapScale(next);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${PLACEMENT_MAP_JSON}?v=${mapKey}`);
        if (!res.ok) throw new Error(`无法加载 ${PLACEMENT_MAP_JSON}`);
        const map = (await res.json()) as TiledMapJson;
        const parsed = parseRetrofitMap(map);
        if (parsed.factories.length < 3) {
          throw new Error('factory_objects 层中工厂数量不足');
        }
        if (!cancelled) {
          setLayout(parsed);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLayout(null);
          setLoadError(err instanceof Error ? err.message : '加载地图失败');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mapKey]);

  useEffect(() => {
    const container = wrapperRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    measureMap();
    const observer = new ResizeObserver(() => measureMap());
    observer.observe(container);
    image.addEventListener('load', measureMap);
    return () => {
      observer.disconnect();
      image.removeEventListener('load', measureMap);
    };
  }, [layout?.mapImage, measureMap]);

  const actionable = isMapFactoryStage(stageId);

  const isFactoryClickable = useCallback(
    (factoryId: FactoryId): boolean => {
      if (!actionable) return false;
      if (stageId === 'retrofit') {
        return !initialRetrofitDone.includes(factoryId);
      }
      if (stageId === 'deep_opt') {
        if (deepOptimizedFactory) return false;
        return initialRetrofitDone.includes(factoryId);
      }
      return false;
    },
    [actionable, stageId, initialRetrofitDone, deepOptimizedFactory],
  );

  const resolveFactoryVisualState = (factoryId: FactoryId) => {
    if (constructingFactory === factoryId) return 'constructing';
    if (selectedFactory === factoryId) return 'selected';
    if (hoveredFactory === factoryId && isFactoryClickable(factoryId)) return 'hover';
    if (isFactoryClickable(factoryId)) return 'actionable';
    return 'idle';
  };

  const factoryScreenRect = useCallback(
    (factory: ParsedRetrofitMap['factories'][number], rotation?: number) => {
      if (!mapScale) return null;
      return tiledFactoryObjectToScreenRect(
        {
          x: factory.tiledX,
          y: factory.tiledY,
          width: factory.width,
          height: factory.height,
          rotation: rotation ?? factory.rotation,
        },
        mapScale,
      );
    },
    [mapScale],
  );

  const mapPointFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const image = imageRef.current;
      if (!image || !mapScale) return null;
      return clientPointToMapCoords(clientX, clientY, image, mapScale);
    },
    [mapScale],
  );

  const findFactoryAtPoint = useCallback(
    (clientX: number, clientY: number): FactoryId | null => {
      if (!layout) return null;
      const point = mapPointFromEvent(clientX, clientY);
      if (!point) return null;

      for (const factory of layout.factories) {
        if (hitTestPolygon(factory.hitPolygon, point.x, point.y)) {
          return factory.factoryId;
        }
      }
      return null;
    },
    [layout, mapPointFromEvent],
  );

  const handleMapClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!actionable) return;
      const factoryId = findFactoryAtPoint(event.clientX, event.clientY);
      if (!factoryId || !isFactoryClickable(factoryId)) return;
      onFactorySelect(factoryId);
    },
    [actionable, findFactoryAtPoint, isFactoryClickable, onFactorySelect],
  );

  const handleMapMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!layout || !actionable) {
        setHoveredFactory(null);
        return;
      }
      const factoryId = findFactoryAtPoint(event.clientX, event.clientY);
      if (factoryId && isFactoryClickable(factoryId)) {
        setHoveredFactory(factoryId);
      } else {
        setHoveredFactory(null);
      }
    },
    [layout, actionable, findFactoryAtPoint, isFactoryClickable],
  );

  if (loadError) {
    return <p className="retrofit-map__error">{loadError}</p>;
  }

  if (!layout) {
    return <p className="retrofit-map__loading">加载地图中…</p>;
  }

  return (
    <div
      className={`map-wrapper retrofit-map${actionable ? ' map-wrapper--actionable' : ''}`}
      ref={wrapperRef}
      onClick={actionable ? handleMapClick : undefined}
      onMouseMove={actionable ? handleMapMove : undefined}
      onMouseLeave={actionable ? () => setHoveredFactory(null) : undefined}
    >
      <img
        ref={imageRef}
        className="map-wrapper__image"
        src={layout.mapImage}
        alt="工业园地图"
        draggable={false}
        onLoad={measureMap}
      />

      {mapScale ? (
        <div className="map-wrapper__object-layer">
          {SHOW_FACTORY_DEBUG_BOUNDS
            ? layout.factories.map((factory) => {
                const debugBox = factoryScreenRect(factory, 0);
                if (!debugBox) return null;
                return (
                  <div
                    key={`debug-${factory.objectId}`}
                    className="map-wrapper__debug-bounds"
                    style={factoryImageStyle(debugBox)}
                    title={`factory_objects #${factory.objectId}`}
                    aria-hidden
                  />
                );
              })
            : null}

          {layout.factories.map((factory) => {
            const visualState = resolveFactoryVisualState(factory.factoryId);
            const uiMeta = FACTORY_UI_META[factory.factoryId];
            const stars = factoryStarCount(
              factory.factoryId,
              initialRetrofitDone,
              deepOptimizedFactory,
            );
            const box = factoryScreenRect(factory);
            if (!box) return null;

            const centerX = box.left + box.width / 2;
            const bubbleTop = box.top - 8;
            const nameTagTop = box.top + box.height + 4;
            const clickable = isFactoryClickable(factory.factoryId);
            const showBubble = true;

            return (
              <div key={factory.factoryId} className={`map-wrapper__factory-slot map-wrapper__factory--${visualState}`}>
                <img
                  className="map-wrapper__factory-sprite"
                  src={factorySpriteSrc(factory.factoryId)}
                  alt={uiMeta.title}
                  title={uiMeta.title}
                  draggable={false}
                  style={factoryImageStyle(box)}
                />
                {visualState === 'constructing' ? (
                  <div className="map-wrapper__construction" style={factoryImageStyle(box)} aria-hidden>
                    <span className="map-wrapper__construction-label">施工中</span>
                  </div>
                ) : null}
                {showBubble ? (
                  <div
                    className="map-wrapper__bubble-anchor"
                    style={{
                      left: centerX,
                      top: bubbleTop,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <FactoryBubble
                      text={uiMeta.bubbleText}
                      icon={uiMeta.bubbleIcon}
                      showUpArrow={uiMeta.showUpArrow && clickable}
                    />
                  </div>
                ) : null}
                <FactoryNameTag
                  title={uiMeta.title}
                  stars={stars}
                  style={{
                    left: centerX,
                    top: nameTagTop,
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export { CONSTRUCTION_ANIMATION_MS };
