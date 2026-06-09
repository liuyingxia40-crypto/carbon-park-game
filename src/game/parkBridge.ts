import type { FactoryStatus, RetrofitFactory } from './park/parseRetrofitFactory';
import type { MapVisualConfig } from './park/FactoryZoneManager';

export type ParkFactoryView = {
  id: string;
  displayName: string;
  factoryType: string;
  emission: number;
  reduction: number;
  status: FactoryStatus;
};

export type ParkPhaseStatus = 'pending' | 'in_progress' | 'completed';

export type ParkState = {
  totalEmission: number;
  targetEmission: number;
  initialEmission: number;
  goalReached: boolean;
  upgradedCount: number;
  totalFactories: number;
  factories: ParkFactoryView[];
  phaseStatus: ParkPhaseStatus;
};

type ParkSceneApi = {
  syncMapVisuals: (config: MapVisualConfig) => void;
  resetFactories: () => void;
  selectFactoryById: (id: string) => void;
  resetButler: () => void;
};

type ParkSubscriber = {
  onState?: (state: ParkState) => void;
  onFactorySelect?: (factory: ParkFactoryView | null) => void;
  onMessage?: (text: string) => void;
  onButlerComplete?: () => void;
};

function toView(f: RetrofitFactory): ParkFactoryView {
  return {
    id: f.id,
    displayName: f.displayName,
    factoryType: f.factoryType,
    emission: f.emission,
    reduction: f.reduction,
    status: f.status,
  };
}

function phaseFrom(upgraded: number, goalReached: boolean): ParkPhaseStatus {
  if (goalReached) return 'completed';
  if (upgraded > 0) return 'in_progress';
  return 'pending';
}

class ParkBridge {
  private scene: ParkSceneApi | null = null;
  private subscribers = new Set<ParkSubscriber>();
  private pendingVisuals: MapVisualConfig | null = null;
  private butlerIntroDone = false;
  private state: ParkState = {
    totalEmission: 460,
    targetEmission: 200,
    initialEmission: 460,
    goalReached: false,
    upgradedCount: 0,
    totalFactories: 3,
    factories: [],
    phaseStatus: 'pending',
  };
  selectedId: string | null = null;

  attachScene(api: ParkSceneApi) {
    this.scene = api;
    if (this.pendingVisuals) {
      api.syncMapVisuals(this.pendingVisuals);
    }
  }

  detachScene() {
    this.scene = null;
  }

  subscribe(sub: ParkSubscriber) {
    this.subscribers.add(sub);
    sub.onState?.(this.state);
    if (this.butlerIntroDone) sub.onButlerComplete?.();
    return () => {
      this.subscribers.delete(sub);
    };
  }

  emitState(
    partial: Partial<ParkState> & Pick<ParkState, 'totalEmission' | 'targetEmission' | 'initialEmission' | 'goalReached'>,
    factories: RetrofitFactory[],
  ) {
    const views = factories.map(toView);
    const upgradedCount = views.filter((f) => f.status === 'upgraded').length;
    this.state = {
      ...this.state,
      ...partial,
      factories: views,
      upgradedCount,
      totalFactories: views.length,
      phaseStatus: phaseFrom(upgradedCount, partial.goalReached),
    };
    for (const sub of this.subscribers) sub.onState?.(this.state);
  }

  clearSelection() {
    this.selectFactory(null);
  }

  selectFactory(factory: RetrofitFactory | null) {
    this.selectedId = factory?.id ?? null;
    const view = factory ? toView(factory) : null;
    for (const sub of this.subscribers) sub.onFactorySelect?.(view);
  }

  emitMessage(text: string) {
    for (const sub of this.subscribers) sub.onMessage?.(text);
  }

  syncMapVisuals(config: MapVisualConfig) {
    this.pendingVisuals = config;
    this.scene?.syncMapVisuals(config);
  }

  resetFactories() {
    this.pendingVisuals = { stageId: 'diagnosis', initialDone: [], deepDone: null };
    this.scene?.resetFactories();
  }

  emitButlerComplete() {
    if (this.butlerIntroDone) return;
    this.butlerIntroDone = true;
    for (const sub of this.subscribers) sub.onButlerComplete?.();
  }

  resetButlerIntro() {
    this.butlerIntroDone = false;
    this.scene?.resetButler();
  }

  resetButlerIntroState() {
    this.butlerIntroDone = false;
  }

  isButlerIntroDone() {
    return this.butlerIntroDone;
  }

  syncEmission(emission: number, goalReached: boolean) {
    this.state = {
      ...this.state,
      totalEmission: emission,
      goalReached,
    };
    for (const sub of this.subscribers) sub.onState?.(this.state);
  }
}

export type { MapVisualConfig };
export const parkBridge = new ParkBridge();
