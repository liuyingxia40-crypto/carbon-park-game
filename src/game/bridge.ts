import type { BuildingId } from './buildings';
import type { CityTier } from './cityGrowth';
import type { EvolutionPhase } from './cityEvolution';
import type { CarbonState } from './carbonSystem';
import type { CityDemandState } from './cityDemand';
import type { DevRoute } from './developmentRoute';
import type { ChainRates, Resources } from './economy';
import type { EventState } from './eventSystem';
import type { Milestone } from './growthMilestones';
import type { MetricsSeries } from './metricsHistory';
import type { GuideState } from './onboarding';
import type { PollutionBand } from './pollutionVisual';
import type { SuperBuildingId } from './superBuildings';
import type { TechId } from './techTree';
import type { GameTimeSpeed, GameTimeState } from './timeSystem';
import type { VictoryProgress } from './zeroCarbonGoal';
import type { YearReport } from './yearReport';

export type PlacedBuildingInfo = {
  uid: string;
  id: BuildingId;
  name: string;
  level: number;
  levelName: string;
  upgradeCost: number | null;
};

export type UnlockToast = {
  kind: 'building' | 'tech' | 'tier' | 'grade' | 'evolution' | 'super';
  title: string;
  subtitle?: string;
};

export type IndustryState = {
  shortages: string[];
  placed: PlacedBuildingInfo[];
  unlockedTechs: TechId[];
  coalEfficiency: number;
  powerEfficiency: number;
  devRoute: DevRoute | null;
  builtSupers: SuperBuildingId[];
  milestones: Milestone[];
  evolutionPhase: EvolutionPhase;
  evolutionLabel: string;
  rhythmLabel: string;
  maxBuildingLevel: number;
};

export type CityState = {
  tier: CityTier;
  tierLabel: string;
  pollutionBand: PollutionBand;
  evolutionPhase: EvolutionPhase;
  evolutionLabel: string;
};

export type PlatformState = {
  metrics: MetricsSeries;
  guide: GuideState;
  demoActive: boolean;
  productTagline: string;
};

export type GameBridgeListeners = {
  onResources?: (res: Resources) => void;
  onRates?: (rates: ChainRates) => void;
  onCarbon?: (state: CarbonState) => void;
  onIndustry?: (state: IndustryState) => void;
  onCity?: (state: CityState) => void;
  onEvent?: (state: EventState) => void;
  onDemand?: (state: CityDemandState) => void;
  onVictory?: (state: VictoryProgress) => void;
  onYearReport?: (report: YearReport | null) => void;
  onPlacing?: (id: BuildingId | SuperBuildingId | null) => void;
  onUnlockToast?: (toast: UnlockToast) => void;
  onMessage?: (text: string) => void;
  onPlatform?: (state: PlatformState) => void;
  onGameTime?: (state: GameTimeState) => void;
};

type SceneApi = {
  setBuildMode: (id: BuildingId | null) => void;
  setSuperBuildMode: (id: SuperBuildingId | null) => void;
  greenOffset: () => void;
  ecoUpgrade: () => void;
  researchTech: (id: TechId) => void;
  upgradeBuilding: (uid: string) => void;
  selectRoute: (route: DevRoute) => void;
  settleWithCredits: () => void;
  settleWithFine: () => void;
  dismissReport: () => void;
  toggleDemoMode: () => void;
  guideNext: () => void;
  guideSkip: () => void;
  setTimeSpeed: (speed: GameTimeSpeed) => void;
};

export class GameBridge {
  private listeners: GameBridgeListeners = {};
  private scene: SceneApi | null = null;

  attachScene(api: SceneApi) {
    this.scene = api;
  }

  detachScene() {
    this.scene = null;
  }

  subscribe(listeners: GameBridgeListeners) {
    this.listeners = { ...this.listeners, ...listeners };
    return () => {
      this.listeners = {};
    };
  }

  emitResources(res: Resources) {
    this.listeners.onResources?.(res);
  }

  emitRates(rates: ChainRates) {
    this.listeners.onRates?.(rates);
  }

  emitCarbon(state: CarbonState) {
    this.listeners.onCarbon?.(state);
  }

  emitIndustry(state: IndustryState) {
    this.listeners.onIndustry?.(state);
  }

  emitCity(state: CityState) {
    this.listeners.onCity?.(state);
  }

  emitEvent(state: EventState) {
    this.listeners.onEvent?.(state);
  }

  emitDemand(state: CityDemandState) {
    this.listeners.onDemand?.(state);
  }

  emitVictory(state: VictoryProgress) {
    this.listeners.onVictory?.(state);
  }

  emitYearReport(report: YearReport | null) {
    this.listeners.onYearReport?.(report);
  }

  emitPlacing(id: BuildingId | SuperBuildingId | null) {
    this.listeners.onPlacing?.(id);
  }

  emitUnlockToast(toast: UnlockToast) {
    this.listeners.onUnlockToast?.(toast);
  }

  emitMessage(text: string) {
    this.listeners.onMessage?.(text);
  }

  emitPlatform(state: PlatformState) {
    this.listeners.onPlatform?.(state);
  }

  emitGameTime(state: GameTimeState) {
    this.listeners.onGameTime?.(state);
  }

  selectBuild(id: BuildingId) {
    this.scene?.setBuildMode(id);
  }

  selectSuperBuild(id: SuperBuildingId) {
    this.scene?.setSuperBuildMode(id);
  }

  cancelBuild() {
    this.scene?.setBuildMode(null);
    this.scene?.setSuperBuildMode(null);
  }

  greenOffset() {
    this.scene?.greenOffset();
  }

  ecoUpgrade() {
    this.scene?.ecoUpgrade();
  }

  researchTech(id: TechId) {
    this.scene?.researchTech(id);
  }

  upgradeBuilding(uid: string) {
    this.scene?.upgradeBuilding(uid);
  }

  selectRoute(route: DevRoute) {
    this.scene?.selectRoute(route);
  }

  settleWithCredits() {
    this.scene?.settleWithCredits();
  }

  settleWithFine() {
    this.scene?.settleWithFine();
  }

  dismissReport() {
    this.scene?.dismissReport();
  }

  toggleDemoMode() {
    this.scene?.toggleDemoMode();
  }

  guideNext() {
    this.scene?.guideNext();
  }

  guideSkip() {
    this.scene?.guideSkip();
  }

  setTimeSpeed(speed: GameTimeSpeed) {
    this.scene?.setTimeSpeed(speed);
  }
}

export const gameBridge = new GameBridge();
