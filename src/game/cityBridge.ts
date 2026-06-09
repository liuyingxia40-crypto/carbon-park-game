import type { BuildingKey, BuildingPlaceMode } from './paths';

export type CityPlacementEvent =
  | {
      ok: true;
      buildingKey: string;
      plotId: number;
      tier: string;
      message: string;
    }
  | {
      ok: false;
      reason: string;
      message: string;
    };

type CitySceneApi = {
  setPlaceMode: (mode: BuildingPlaceMode | null) => void;
};

type CitySubscriber = {
  onPlacement?: (event: CityPlacementEvent) => void;
  onPlaceMode?: (mode: BuildingPlaceMode | null) => void;
};

class CityBridge {
  private scene: CitySceneApi | null = null;
  private subscribers = new Set<CitySubscriber>();
  private affordCheck: ((key: BuildingKey) => boolean) | null = null;
  placeMode: BuildingPlaceMode | null = null;

  attachScene(api: CitySceneApi) {
    this.scene = api;
    if (this.placeMode) api.setPlaceMode(this.placeMode);
  }

  detachScene() {
    this.scene = null;
  }

  subscribe(sub: CitySubscriber) {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  setAffordCheck(fn: ((key: BuildingKey) => boolean) | null) {
    this.affordCheck = fn;
  }

  canAfford(key: BuildingKey): boolean {
    return this.affordCheck?.(key) ?? true;
  }

  setPlaceMode(mode: BuildingPlaceMode | null) {
    this.placeMode = mode;
    this.scene?.setPlaceMode(mode);
    for (const sub of this.subscribers) sub.onPlaceMode?.(mode);
  }

  emitPlacement(event: CityPlacementEvent) {
    for (const sub of this.subscribers) sub.onPlacement?.(event);
  }
}

export const cityBridge = new CityBridge();
