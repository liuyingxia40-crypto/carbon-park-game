import Phaser from 'phaser';
import { gameBridge } from '../game/bridge';
import {
  BUILDINGS,
  getLevelName,
  getUpgradeCost,
  isBuildingUnlocked,
  type BuildingId,
  type BuildingLevel,
} from '../game/buildings';
import { evolutionLabel, getEvolutionPhase, type EvolutionPhase } from '../game/cityEvolution';
import { UnlockFx } from '../game/effects/UnlockFx';
import { getRhythmMods } from '../game/gameRhythm';
import { computeMilestones } from '../game/growthMilestones';
import {
  applyGlobalTickModifiers,
  mergeTechModifiers,
} from '../game/resourceChain';
import {
  aggregateSuperGlobals,
  isSuperUnlocked,
  SUPER_BUILDINGS,
  type SuperBuildingId,
} from '../game/superBuildings';
import { getCityTier, tierBuildingScale, tierLabel, type CityTier } from '../game/cityGrowth';
import { CityDemandSystem } from '../game/cityDemand';
import { CarbonSystem } from '../game/carbonSystem';
import type { DevRoute } from '../game/developmentRoute';
import { getRouteModifiers } from '../game/developmentRoute';
import { IsoCameraController } from '../game/camera/IsoCameraController';
import { GameTimeSystem, type GameTimeSpeed } from '../game/timeSystem';
import { EventSystem } from '../game/eventSystem';
import { applyChainTick, STARTING_RESOURCES, type Resources } from '../game/economy';
import { CityGrowthVisuals } from '../game/effects/CityGrowthVisuals';
import { IndustrialEffects } from '../game/effects/IndustrialEffects';
import { PollutionAtmosphere } from '../game/effects/PollutionAtmosphere';
import { PowerGridEffects } from '../game/effects/PowerGridEffects';
import { getMapWorldBounds } from '../game/iso/mapBounds';
import { IsoTileMapRenderer } from '../game/iso/IsoTileMapRenderer';
import { MapQuery } from '../game/iso/MapQuery';
import { getBuildingSpriteScale } from '../game/buildingVisualScale';
import { generateIndustrialMap } from '../game/iso/mapGenerator';
import { STARTER_BUILDINGS } from '../game/starterLayout';
import { ISO_TILE_H, ISO_TILE_W } from '../game/constants';
import { footprintCenterWorld, tileToWorld, worldToTile } from '../game/iso/isoMath';
import { pollutionBand, pollutionVisualT } from '../game/pollutionVisual';
import { simulateIndustrialTick } from '../game/resourceChain';
import { TechSystem, TECH_TREE, type TechId } from '../game/techTree';
import { AssetManager } from '../game/assets';
import type { CityGrade } from '../game/cityRating';
import { DemoModeController, type DemoAction } from '../game/demoMode';
import { gradeToScore, MetricsHistory } from '../game/metricsHistory';
import { OnboardingGuide } from '../game/onboarding';
import { computeVictoryProgress } from '../game/zeroCarbonGoal';
import { ISO_GRASS_TEST_ONLY, MAP_COLS, MAP_ROWS } from '../game/constants';
import { IsoGrassTestRenderer } from '../game/iso/IsoGrassTestRenderer';
import { TILE_FRAMES } from '../game/assets/assetIds';

type PlacedBuilding = {
  uid: string;
  id: BuildingId;
  level: BuildingLevel;
  tx: number;
  ty: number;
  sprite: Phaser.GameObjects.Image;
};

type SuperPlaced = {
  uid: string;
  id: SuperBuildingId;
  tx: number;
  ty: number;
  sprite: Phaser.GameObjects.Image;
};

export class MainScene extends Phaser.Scene {
  private mapRenderer?: IsoTileMapRenderer;
  private grassTest?: IsoGrassTestRenderer;
  private tileErrorText?: Phaser.GameObjects.Text;
  private mapQuery!: MapQuery;
  private cityVisuals!: CityGrowthVisuals;
  private cameraCtrl!: IsoCameraController;
  private atmosphere!: PollutionAtmosphere;
  private factoryFx!: IndustrialEffects;
  private powerGrid!: PowerGridEffects;
  private unlockFx!: UnlockFx;
  private metrics = new MetricsHistory();
  private guide = new OnboardingGuide();
  private demo = new DemoModeController();
  private gameTime = new GameTimeSystem();
  private carbon = new CarbonSystem();
  private tech = new TechSystem();
  private gameEvents = new EventSystem();
  private cityDemand = new CityDemandSystem();
  private devRoute: DevRoute | null = null;
  private occupancy = new Set<string>();
  private buildingUid = 0;
  private cityTier: CityTier = 0;

  private resources: Resources = { ...STARTING_RESOURCES };
  private lastSim = simulateIndustrialTick(
    this.resources,
    [],
    this.tech.getModifiers(),
    0,
    this.gameEvents.getModifiers(),
  );
  private placed: PlacedBuilding[] = [];
  private superPlaced: SuperPlaced[] = [];

  private placingId: BuildingId | null = null;
  private placingSuperId: SuperBuildingId | null = null;

  private lastGrade: CityGrade = 'D';
  private lastTier: CityTier = 0;
  private lastEvolution: EvolutionPhase = 0;
  private unlockedSeen = new Set<string>();
  private ghost?: Phaser.GameObjects.Image;
  private placementGfx?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    AssetManager.queuePreload(this);
  }

  private createGrassTileTest() {
    AssetManager.finalizeLoad(this);
    this.cameras.main.setBackgroundColor('#00000000');

    if (!this.textures.exists(TILE_FRAMES.grass)) {
      this.showTileMapLoadError(AssetManager.getLoadError() || '缺少 grass.png');
      return;
    }

    this.grassTest = new IsoGrassTestRenderer(this);
    this.centerGrassTestCamera();

    this.scale.on('resize', () => {
      this.grassTest?.layout(this.scale.width, this.scale.height);
      this.centerGrassTestCamera();
    });

    gameBridge.attachScene({
      setBuildMode: () => {},
      setSuperBuildMode: () => {},
      greenOffset: () => false,
      ecoUpgrade: () => false,
      researchTech: () => false,
      upgradeBuilding: () => false,
      selectRoute: () => {},
      settleWithCredits: () => {},
      settleWithFine: () => {},
      dismissReport: () => {},
      toggleDemoMode: () => {},
      guideNext: () => {},
      guideSkip: () => {},
      setTimeSpeed: () => {},
    });

    gameBridge.emitMessage('等距 grass 10×10 拼接测试');
    this.syncUi();
  }

  private centerGrassTestCamera() {
    const cam = this.cameras.main;
    cam.setZoom(1);
    const c = this.grassTest?.getViewCenter();
    if (c) {
      cam.centerOn(c.x, c.y);
    }
  }

  private showTileMapLoadError(message: string) {
    const { width, height } = this.scale;
    this.tileErrorText?.destroy();
    this.tileErrorText = this.add
      .text(
        width / 2,
        height / 2,
        `地图加载失败\n\n${message}\n\n请确认 src/assets/tiles/ 下有:\ngrass.png 或 pico8-isometric(1).png\nroad.png`,
        {
          fontFamily: 'Microsoft YaHei, Segoe UI, sans-serif',
          fontSize: '16px',
          color: '#2a3238',
          backgroundColor: '#fdfbf3ee',
          padding: { x: 16, y: 12 },
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(500);
  }

  create() {
    if (ISO_GRASS_TEST_ONLY) {
      this.createGrassTileTest();
      return;
    }

    this.cameras.main.setBackgroundColor('#00000000');
    AssetManager.finalizeLoad(this);

    const mapData = generateIndustrialMap();
    this.mapQuery = new MapQuery(mapData);

    if (!AssetManager.hasTilesAtlas()) {
      this.showTileMapLoadError(AssetManager.getLoadError());
    } else {
      try {
        this.mapRenderer = new IsoTileMapRenderer(this, mapData);
        console.info('[MainScene] 地图已渲染');
      } catch (e) {
        this.showTileMapLoadError(e instanceof Error ? e.message : '地图渲染失败');
      }
    }
    this.cityVisuals = new CityGrowthVisuals(this, mapData);
    this.atmosphere = new PollutionAtmosphere(this);
    this.factoryFx = new IndustrialEffects();
    this.powerGrid = new PowerGridEffects(this);
    this.unlockFx = new UnlockFx();

    this.devRoute = 'heavy';

    this.guide.skip();

    this.spawnStarterBuildings();
    this.rebuildSimulation();

    this.cameraCtrl = new IsoCameraController(this);
    this.cameraCtrl.fitToMap(getMapWorldBounds(), 0.96);
    this.cameraCtrl.bindInput(this);
    this.scale.on('resize', () => {
      this.cameraCtrl.fitToMap(getMapWorldBounds(), 0.96);
      this.atmosphere.onResize();
    });
    this.atmosphere.update(0, 0);
    this.cityVisuals.setTier(0, 0);
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onPointerUp(p));

    gameBridge.attachScene({
      setBuildMode: (id) => this.setBuildMode(id),
      setSuperBuildMode: (id) => this.setSuperBuildMode(id),
      greenOffset: () => this.doGreenOffset(),
      ecoUpgrade: () => this.doEcoUpgrade(),
      researchTech: (id) => this.doResearchTech(id),
      upgradeBuilding: (uid) => this.doUpgradeBuilding(uid),
      selectRoute: (route) => this.doSelectRoute(route),
      settleWithCredits: () => this.doSettleCredits(),
      settleWithFine: () => this.doSettleFine(),
      dismissReport: () => this.doDismissReport(),
      toggleDemoMode: () => this.toggleDemoMode(),
      guideNext: () => this.guideNext(),
      guideSkip: () => this.guideSkip(),
      setTimeSpeed: (speed) => this.setTimeSpeed(speed),
    });

    gameBridge.emitMessage('早晚高峰带来通勤需求，请关注交通压力。');
    this.syncUi();
    this.emitGameTimeUi();
  }

  shutdown() {
    this.factoryFx.destroyAll();
    this.powerGrid.destroy();
    this.cityVisuals.destroy();
    this.scale.off('resize');
    this.atmosphere.destroy();
    this.unlockFx.destroy();
    this.placementGfx?.destroy();
    gameBridge.detachScene();
  }

  private getBuildCostMult() {
    return (
      this.gameEvents.getModifiers().buildCostMult *
      getRouteModifiers(this.devRoute).buildCostMult *
      getRhythmMods(this.placed.length + this.superPlaced.length, this.carbon.lifetimeIncome).buildCostMult
    );
  }

  setSuperBuildMode(id: SuperBuildingId | null) {
    this.placingId = null;
    this.placingSuperId = id;
    gameBridge.emitPlacing(id);

    if (!id) {
      this.ghost?.destroy();
      this.ghost = undefined;
      this.placementGfx?.clear();
      return;
    }

    const built = this.superPlaced.map((s) => s.id);
    if (!isSuperUnlocked(id, this.carbon.cityGrade, this.resources.green, built)) {
      const def = SUPER_BUILDINGS[id];
      gameBridge.emitMessage(`需要评级 ${def.minGrade} + ${def.minGreen} 绿色积分`);
      this.placingSuperId = null;
      gameBridge.emitPlacing(null);
      return;
    }

    const def = SUPER_BUILDINGS[id];
    const cost = Math.floor(def.cost * this.getBuildCostMult());
    if (this.resources.money < cost) {
      gameBridge.emitMessage(`资金不足，需要 ¥${cost}`);
      return;
    }

    if (!this.ghost) {
      this.ghost = this.createBuildingImage(0, 0, id, def.textureKey, 100).setAlpha(0.62);
    } else {
      this.applyGhostTexture(this.ghost, id, def.textureKey);
    }
    const baseScale = getBuildingSpriteScale(def.tilesW, def.tilesH) * tierBuildingScale(this.cityTier);
    this.ghost.setScale(baseScale);
    gameBridge.emitMessage(`部署超级建筑 ${def.name}：点击工业地块`);
  }

  setBuildMode(id: BuildingId | null) {
    if (id) {
      if (!isBuildingUnlocked(id, this.carbon.cityGrade, this.resources.green, this.carbon.advancedUnlocked)) {
        gameBridge.emitMessage(this.lockReason(id));
        return;
      }
      const cost = Math.floor(BUILDINGS[id].cost * this.getBuildCostMult());
      if (this.resources.money < cost) {
        gameBridge.emitMessage(`资金不足，需要 ¥${cost}`);
        return;
      }
    }

    this.placingSuperId = null;
    this.placingId = id;
    gameBridge.emitPlacing(id);

    if (!id) {
      this.ghost?.destroy();
      this.ghost = undefined;
      this.placementGfx?.clear();
      return;
    }

    const def = BUILDINGS[id];
    if (!this.ghost) {
      this.ghost = this.createBuildingImage(0, 0, id, def.textureKey, 100).setAlpha(0.62);
    } else {
      this.applyGhostTexture(this.ghost, id, def.textureKey);
    }
    const baseScale = getBuildingSpriteScale(def.tilesW, def.tilesH) * tierBuildingScale(this.cityTier);
    this.ghost.setScale(baseScale);
    gameBridge.emitMessage(`部署 ${def.name}：点击工业地块`);
  }

  doResearchTech(id: TechId) {
    const check = this.tech.canResearch(
      id,
      this.carbon.cityGrade,
      this.resources.money,
      this.resources.green,
    );
    if (!check.ok) {
      gameBridge.emitMessage(check.reason ?? '无法研究');
      return;
    }
    const t = TECH_TREE[id];
    this.resources.money -= t.cost.money;
    this.resources.green -= t.cost.green;
    this.tech.research(id);
    gameBridge.emitMessage(`科技完成：${t.name}`);
    this.unlockFx.playTechBreakthrough(this, t.name);
    gameBridge.emitUnlockToast({ kind: 'tech', title: '科技突破', subtitle: t.name });
    this.syncUi();
  }

  doUpgradeBuilding(uid: string) {
    const b = this.placed.find((p) => p.uid === uid);
    if (!b || b.level >= 4) return;
    const cost = getUpgradeCost(b.id, b.level);
    if (cost === null || this.resources.money < cost) {
      gameBridge.emitMessage(cost ? `升级需要 ¥${cost}` : '已满级');
      return;
    }
    this.resources.money -= cost;
    b.level = (b.level + 1) as BuildingLevel;
    this.factoryFx.setBuildingLevel(this, b.sprite, b.level);
    const lvlName = getLevelName(b.id, b.level);
    gameBridge.emitMessage(`${BUILDINGS[b.id].name} → ${lvlName} (Lv.${b.level})`);
    if (b.level >= 4) {
      this.unlockFx.playBuildingUnlock(this, b.sprite.x, b.sprite.y, `${lvlName} · 满级`);
    }
    this.syncUi();
  }

  private lockReason(id: BuildingId): string {
    const def = BUILDINGS[id];
    if (def.minGreen !== undefined && this.resources.green < def.minGreen) {
      return `需要 ${def.minGreen} 绿色积分解锁 ${def.name}`;
    }
    return `城市评级 ${def.minGrade} 解锁 ${def.name}`;
  }

  doGreenOffset() {
    this.guide.markCarbonOpened();
    const result = this.carbon.spendGreenOffset(this.resources);
    if (!result.ok) {
      gameBridge.emitMessage(result.message);
      return;
    }
    this.resources = result.resources;
    this.carbon.applyGreenOffsetEmission();
    gameBridge.emitMessage(result.message);
    this.syncUi();
  }

  doEcoUpgrade() {
    const result = this.carbon.buyEcoUpgrade(this.resources);
    if (!result.ok) {
      gameBridge.emitMessage(result.message);
      return;
    }
    this.resources = result.resources;
    gameBridge.emitMessage(result.message);
    this.syncUi();
  }

  doSelectRoute(route: DevRoute) {
    if (this.devRoute === route) return;
    this.devRoute = route;
    gameBridge.emitMessage(`发展路线：${route === 'heavy' ? '重工业' : route === 'green' ? '绿色能源' : '高科技工业'}`);
    this.syncUi();
  }

  doSettleCredits() {
    const result = this.carbon.settleOverflowWithCredits(this.resources);
    if (!result.ok) {
      gameBridge.emitMessage(result.message);
      return;
    }
    this.resources = result.resources;
    gameBridge.emitMessage(result.message);
    this.completeYearTransitionIfNeeded();
    this.syncUi();
  }

  doSettleFine() {
    const result = this.carbon.settleOverflowWithFine(this.resources);
    this.resources = result.resources;
    gameBridge.emitMessage(result.message);
    this.completeYearTransitionIfNeeded();
    this.syncUi();
  }

  doDismissReport() {
    this.carbon.dismissReport();
    this.completeYearTransitionIfNeeded();
    this.syncUi();
  }

  private setTimeSpeed(speed: GameTimeSpeed) {
    this.gameTime.setSpeed(speed);
    const labels: Record<GameTimeSpeed, string> = {
      0: '时间已暂停',
      1: '时间流速 1x（1 秒 ≈ 1 游戏日）',
      2: '时间流速 2x',
      4: '时间流速 4x',
    };
    gameBridge.emitMessage(labels[speed]);
    this.emitGameTimeUi();
  }

  private completeYearTransitionIfNeeded() {
    if (!this.gameTime.isYearEndPending() || this.carbon.pendingReport) return;
    this.gameTime.advanceYear();
    this.carbon.beginNextYear();
    gameBridge.emitMessage(`进入第 ${this.carbon.year} 年 · 排放上限 ${this.carbon.getYearLimit()}`);
  }

  private emitGameTimeUi() {
    gameBridge.emitGameTime(this.gameTime.getState());
  }

  toggleDemoMode() {
    const on = this.demo.toggle();
    gameBridge.emitMessage(on ? '演示模式已开启 · 自动展示绿色工业转型' : '演示模式已关闭');
    this.syncUi();
  }

  guideNext() {
    this.guide.next();
    this.syncUi();
  }

  guideSkip() {
    this.guide.skip();
    this.syncUi();
  }

  private runDemoAction(action: DemoAction) {
    switch (action.type) {
      case 'route':
        this.doSelectRoute(action.route);
        break;
      case 'build': {
        const spot = this.findAutoPlaceTile(BUILDINGS[action.id].tilesW, BUILDINGS[action.id].tilesH);
        if (spot) {
          this.placingId = action.id;
          const { x, y } = footprintCenterWorld(spot.tx, spot.ty, BUILDINGS[action.id].tilesW, BUILDINGS[action.id].tilesH);
          this.tryPlace(x, y);
        }
        break;
      }
      case 'super': {
        const def = SUPER_BUILDINGS[action.id];
        const spot = this.findAutoPlaceTile(def.tilesW, def.tilesH);
        if (spot) {
          this.placingSuperId = action.id;
          const { x, y } = footprintCenterWorld(spot.tx, spot.ty, def.tilesW, def.tilesH);
          this.tryPlaceSuper(x, y);
        }
        break;
      }
      case 'upgrade':
        this.doUpgradeBuilding(action.uid);
        break;
      case 'greenOffset':
        this.doGreenOffset();
        break;
      case 'ecoUpgrade':
        this.doEcoUpgrade();
        break;
      default:
        break;
    }
  }

  private findAutoPlaceTile(w: number, h: number): { tx: number; ty: number } | null {
    for (let ty = 0; ty < MAP_ROWS - h; ty++) {
      for (let tx = 0; tx < MAP_COLS - w; tx++) {
        if (!this.mapQuery.canBuildOn(tx, ty)) continue;
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++) {
          for (let dx = 0; dx < w; dx++) {
            if (!this.mapQuery.canBuildOn(tx + dx, ty + dy) || this.occupancy.has(this.cellKey(tx + dx, ty + dy))) {
              ok = false;
            }
          }
        }
        if (ok) return { tx, ty };
      }
    }
    return null;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (!this.placingId && !this.placingSuperId) {
      this.cameraCtrl.resetDragFlag();
      return;
    }
    if (this.cameraCtrl.didDragThisRelease()) {
      this.cameraCtrl.resetDragFlag();
      return;
    }
    const world = this.cameraCtrl.worldPoint(pointer);
    if (this.placingSuperId) this.tryPlaceSuper(world.x, world.y);
    else this.tryPlace(world.x, world.y);
    this.cameraCtrl.resetDragFlag();
  }

  private tryPlace(wx: number, wy: number) {
    if (!this.placingId) return;
    const def = BUILDINGS[this.placingId];
    const cost = Math.floor(def.cost * this.getBuildCostMult());

    if (!isBuildingUnlocked(this.placingId, this.carbon.cityGrade, this.resources.green, this.carbon.advancedUnlocked)) {
      gameBridge.emitMessage(this.lockReason(this.placingId));
      return;
    }
    if (this.resources.money < cost) {
      gameBridge.emitMessage(`资金不足，需要 ¥${cost}`);
      return;
    }
    if (!this.canPlaceFootprint(wx, wy, def.tilesW, def.tilesH)) {
      gameBridge.emitMessage('请在工业地块空位建造');
      return;
    }

    const { tx, ty } = worldToTile(wx, wy);
    this.markOccupied(tx, ty, def.tilesW, def.tilesH, true);
    const { x, y } = footprintCenterWorld(tx, ty, def.tilesW, def.tilesH);
    const scale = getBuildingSpriteScale(def.tilesW, def.tilesH) * tierBuildingScale(this.cityTier);
    const sprite = this.createBuildingImage(x, y, this.placingId, def.textureKey, y + 50).setScale(scale);

    const uid = `b${++this.buildingUid}`;
    this.factoryFx.attach(this, sprite, this.placingId, 1);
    this.placed.push({ uid, id: this.placingId, level: 1, tx, ty, sprite });
    this.resources.money -= cost;

    this.unlockFx.playBuildingUnlock(this, x, y, def.name);
    this.markUnlock('bld', this.placingId);
    this.syncUi();
    gameBridge.emitMessage(`${def.name} Lv.1 投入运营`);
    this.setBuildMode(null);
  }

  private tryPlaceSuper(wx: number, wy: number) {
    if (!this.placingSuperId) return;
    const def = SUPER_BUILDINGS[this.placingSuperId];
    const cost = Math.floor(def.cost * this.getBuildCostMult());
    const built = this.superPlaced.map((s) => s.id);
    if (!isSuperUnlocked(this.placingSuperId, this.carbon.cityGrade, this.resources.green, built)) {
      gameBridge.emitMessage('超级建筑未解锁或已建造');
      return;
    }
    if (this.resources.money < cost) {
      gameBridge.emitMessage(`资金不足，需要 ¥${cost}`);
      return;
    }
    if (!this.canPlaceFootprint(wx, wy, def.tilesW, def.tilesH)) {
      gameBridge.emitMessage('请在足够大的工业地块建造超级建筑');
      return;
    }

    const { tx, ty } = worldToTile(wx, wy);
    this.markOccupied(tx, ty, def.tilesW, def.tilesH, true);
    const { x, y } = footprintCenterWorld(tx, ty, def.tilesW, def.tilesH);
    const scale = getBuildingSpriteScale(def.tilesW, def.tilesH) * tierBuildingScale(this.cityTier);
    const sprite = this.createBuildingImage(x, y, this.placingSuperId, def.textureKey, y + 60).setScale(scale);
    sprite.setTint(0xc8f0e8);

    const uid = `s${++this.buildingUid}`;
    this.superPlaced.push({ uid, id: this.placingSuperId, tx, ty, sprite });
    this.resources.money -= cost;

    this.unlockFx.playSuperBuilt(this, x, y, def.name);
    gameBridge.emitUnlockToast({ kind: 'super', title: '超级建筑落成', subtitle: def.name });
    this.syncUi();
    gameBridge.emitMessage(`★ ${def.name} 落成 · 全局加成已生效`);
    this.setSuperBuildMode(null);
  }

  private markUnlock(kind: string, key: string) {
    const id = `${kind}:${key}`;
    if (this.unlockedSeen.has(id)) return;
    this.unlockedSeen.add(id);
    const def = BUILDINGS[key as BuildingId];
    if (def) {
      gameBridge.emitUnlockToast({ kind: 'building', title: '产业解锁', subtitle: def.name });
    }
  }

  private canPlaceFootprint(wx: number, wy: number, w: number, h: number) {
    const { tx, ty } = worldToTile(wx, wy);
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        if (!this.mapQuery.canBuildOn(tx + dx, ty + dy)) return false;
        if (this.occupancy.has(this.cellKey(tx + dx, ty + dy))) return false;
      }
    }
    return true;
  }

  private markOccupied(tx: number, ty: number, w: number, h: number, occupy: boolean) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const key = this.cellKey(tx + dx, ty + dy);
        if (occupy) this.occupancy.add(key);
        else this.occupancy.delete(key);
      }
    }
  }

  private cellKey(tx: number, ty: number) {
    return `${tx},${ty}`;
  }

  private spawnStarterBuildings() {
    for (const s of STARTER_BUILDINGS) {
      this.placeStarterBuilding(s.id, s.tx, s.ty, s.level);
    }
  }

  private placeStarterBuilding(id: BuildingId, tx: number, ty: number, level: BuildingLevel) {
    const def = BUILDINGS[id];
    this.markOccupied(tx, ty, def.tilesW, def.tilesH, true);
    const { x, y } = footprintCenterWorld(tx, ty, def.tilesW, def.tilesH);
    const scale =
      getBuildingSpriteScale(def.tilesW, def.tilesH, { starter: true }) * tierBuildingScale(this.cityTier);
    const sprite = this.createBuildingImage(x, y, id, def.textureKey, y + 50).setScale(scale);
    sprite.setData('buildingId', id);
    const uid = `b${++this.buildingUid}`;
    this.factoryFx.attach(this, sprite, id, level);
    this.placed.push({ uid, id, level, tx, ty, sprite });
  }

  private rebuildSimulation() {
    const ecoCut = this.carbon.getEcoPollutionReduction();
    this.lastSim = simulateIndustrialTick(
      this.resources,
      this.placed.map((p) => ({ uid: p.uid, id: p.id, level: p.level })),
      mergeTechModifiers(this.tech.getModifiers(), aggregateSuperGlobals([])),
      ecoCut,
      this.gameEvents.getModifiers(),
      getRouteModifiers(this.devRoute),
      this.cityDemand.getModifiers(),
      this.devRoute,
    );
  }

  private createBuildingImage(x: number, y: number, buildingKey: string, _textureKey: string, depth: number) {
    const tex = AssetManager.getBuildingTexture(buildingKey);
    if (!tex) {
      console.warn(`[MainScene] 建筑精灵未找到: ${buildingKey}`);
      return this.add.image(x, y, 'bld_thermal').setDepth(depth).setVisible(false).setAlpha(0);
    }
    const img = tex.frame
      ? this.add.image(x, y, tex.key, tex.frame)
      : this.add.image(x, y, tex.key);
    img.setOrigin(0.5, 0.92);
    return img.setDepth(depth);
  }

  private applyGhostTexture(ghost: Phaser.GameObjects.Image, buildingKey: string, _textureKey: string) {
    const tex = AssetManager.getBuildingTexture(buildingKey);
    if (!tex) return;
    if (tex.frame) ghost.setTexture(tex.key, tex.frame);
    else ghost.setTexture(tex.key);
  }

  private ensurePlacementGfx() {
    if (!this.placementGfx) {
      this.placementGfx = this.add.graphics().setDepth(98);
    }
    return this.placementGfx;
  }

  private drawPlacementFootprint(tx: number, ty: number, w: number, h: number, ok: boolean) {
    const g = this.ensurePlacementGfx();
    g.clear();
    const color = ok ? 0x5ec99a : 0xe87860;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const { x, y } = tileToWorld(tx + dx, ty + dy);
        const hw = ISO_TILE_W / 2 - 1;
        const hh = ISO_TILE_H / 2 - 1;
        g.fillStyle(color, 0.28);
        g.fillTriangle(x, y - hh, x + hw, y, x, y + hh);
        g.fillTriangle(x, y - hh, x - hw, y, x, y + hh);
      }
    }
  }

  private updatePlacementPreview() {
    if ((!this.placingId && !this.placingSuperId) || !this.ghost) return;
    const p = this.input.activePointer;
    const world = this.cameraCtrl.worldPoint(p);

    if (this.placingSuperId) {
      const def = SUPER_BUILDINGS[this.placingSuperId];
      const cost = Math.floor(def.cost * this.getBuildCostMult());
      const built = this.superPlaced.map((s) => s.id);
      const ok =
        this.canPlaceFootprint(world.x, world.y, def.tilesW, def.tilesH) &&
        this.resources.money >= cost &&
        isSuperUnlocked(this.placingSuperId, this.carbon.cityGrade, this.resources.green, built);
      const { tx, ty } = worldToTile(world.x, world.y);
      const { x, y } = footprintCenterWorld(tx, ty, def.tilesW, def.tilesH);
      this.ghost.setPosition(x, y + 8);
      this.ghost.setTint(ok ? 0xffffff : 0xff8888);
      this.drawPlacementFootprint(tx, ty, def.tilesW, def.tilesH, ok);
      return;
    }

    const def = BUILDINGS[this.placingId!];
    const cost = Math.floor(def.cost * this.getBuildCostMult());
    const ok =
      this.canPlaceFootprint(world.x, world.y, def.tilesW, def.tilesH) &&
      this.resources.money >= cost &&
      isBuildingUnlocked(this.placingId!, this.carbon.cityGrade, this.resources.green, this.carbon.advancedUnlocked);

    const { tx, ty } = worldToTile(world.x, world.y);
    const { x, y } = footprintCenterWorld(tx, ty, def.tilesW, def.tilesH);
    this.ghost.setPosition(x, y + 8);
    this.ghost.setTint(ok ? 0xffffff : 0xff8888);
    this.drawPlacementFootprint(tx, ty, def.tilesW, def.tilesH, ok);
  }

  private tickEconomy() {
    const ecoCut = this.carbon.getEcoPollutionReduction();
    const eventMods = this.gameEvents.getModifiers();
    const routeMods = getRouteModifiers(this.devRoute);
    const demandMods = this.cityDemand.getModifiers();
    const superIds = this.superPlaced.map((s) => s.id);
    const superG = aggregateSuperGlobals(superIds);
    const rhythm = getRhythmMods(this.placed.length + this.superPlaced.length, this.carbon.lifetimeIncome);
    const techMods = mergeTechModifiers(this.tech.getModifiers(), superG);

    this.lastSim = simulateIndustrialTick(
      this.resources,
      this.placed.map((p) => ({ uid: p.uid, id: p.id, level: p.level })),
      techMods,
      ecoCut,
      eventMods,
      routeMods,
      demandMods,
      this.devRoute,
    );

    let delta = { ...this.lastSim.delta };
    for (const sid of superIds) {
      const r = SUPER_BUILDINGS[sid].rates;
      delta.money += r.money;
      delta.power += r.power;
      delta.pollution += r.pollution;
      delta.green += r.green;
      delta.coal += r.coal;
    }
    delta = applyGlobalTickModifiers(delta, superG, rhythm);

    if (this.placed.length > 0 || this.superPlaced.length > 0) {
      this.resources = applyChainTick(this.resources, delta);
      this.lastSim = {
        ...this.lastSim,
        delta,
        displayRates: {
          money: this.lastSim.displayRates.money + superIds.reduce((s, id) => s + SUPER_BUILDINGS[id].rates.money, 0),
          power: this.lastSim.displayRates.power,
          pollution: this.lastSim.displayRates.pollution + superG.pollutionPerSec,
          green: this.lastSim.displayRates.green + superG.greenPerSec,
          coal: this.lastSim.displayRates.coal,
        },
      };
    }

    if (superG.emissionReducePerSec > 0) {
      this.carbon.reduceYearEmission(superG.emissionReducePerSec);
    }

    const eventTick = this.gameEvents.tick(this.resources.pollution, this.resources);
    this.resources.money += eventTick.moneyDelta;
    for (const msg of eventTick.messages) {
      gameBridge.emitMessage(msg);
    }

    for (const msg of this.cityDemand.tick()) {
      gameBridge.emitMessage(msg);
    }

    const carbonResult = this.carbon.tickDay(this.resources, {
      money: this.lastSim.delta.money,
      power: 0,
      pollution: this.lastSim.delta.pollution,
      green: this.lastSim.delta.green,
      coal: 0,
    });
    this.resources = carbonResult.resources;
    for (const msg of carbonResult.messages) {
      gameBridge.emitMessage(msg);
    }
    if (carbonResult.yearEnded && !this.gameTime.isYearEndPending()) {
      this.gameTime.freezeAtYearEnd();
    }

    if (!this.demo.active) {
      this.syncUi();
      return;
    }

    const carbonState = this.carbon.getState(this.gameTime.getYearProgress());
    const demoAction = this.demo.tick({
      hasRoute: this.devRoute !== null,
      money: this.resources.money,
      green: this.resources.green,
      pollution: this.resources.pollution,
      placedIds: this.placed.map((p) => p.id),
      builtSupers: this.superPlaced.map((s) => s.id),
      placed: this.placed.map((p) => ({ uid: p.uid, id: p.id, level: p.level })),
      canPlace: (id) =>
        isBuildingUnlocked(id, carbonState.cityGrade, this.resources.green, carbonState.advancedUnlocked) &&
        this.resources.money >= Math.floor(BUILDINGS[id].cost * this.getBuildCostMult()),
      canPlaceSuper: (id) =>
        isSuperUnlocked(id, carbonState.cityGrade, this.resources.green, this.superPlaced.map((s) => s.id)) &&
        this.resources.money >= Math.floor(SUPER_BUILDINGS[id].cost * this.getBuildCostMult()),
    });
    if (demoAction.type !== 'none') this.runDemoAction(demoAction);

    this.syncUi();
  }

  private syncUi() {
    const carbonState = this.carbon.getState(this.gameTime.getYearProgress());
    this.cityTier = getCityTier(
      this.placed.length + this.superPlaced.length,
      carbonState.cityGrade,
      carbonState.lifetimeIncome,
    );

    const greenCount = this.placed.filter((p) => BUILDINGS[p.id].tier !== 'chain').length;
    const evolutionPhase = getEvolutionPhase({
      tier: this.cityTier,
      grade: carbonState.cityGrade,
      pollution: this.resources.pollution,
      greenBuildingRatio: this.placed.length > 0 ? greenCount / this.placed.length : 0,
      superCount: this.superPlaced.length,
    });
    const evoLabel = evolutionLabel(evolutionPhase);
    const rhythm = getRhythmMods(this.placed.length + this.superPlaced.length, carbonState.lifetimeIncome);
    const maxLvl = Math.max(1, ...this.placed.map((p) => p.level));
    const milestones = computeMilestones({
      grade: carbonState.cityGrade,
      green: this.resources.green,
      buildingCount: this.placed.length,
      maxBuildingLevel: maxLvl,
      unlockedTechs: this.tech.getUnlockedList(),
      builtSupers: this.superPlaced.map((s) => s.id),
      placedIds: this.placed.map((p) => p.id),
      advancedUnlocked: carbonState.advancedUnlocked,
    });

    this.checkProgressionFx(carbonState.cityGrade, this.cityTier, evolutionPhase);

    const emissionRatio = carbonState.yearEmission / Math.max(1, carbonState.yearLimit);
    const polT = pollutionVisualT(this.resources.pollution, emissionRatio);

    const powerDemand = Math.max(0, -this.lastSim.displayRates.power);
    this.metrics.record({
      pollution: this.resources.pollution,
      power: this.resources.power,
      powerDemand,
      green: this.resources.green,
      gradeScore: gradeToScore(carbonState.cityGrade),
      emissionRatio: emissionRatio * 100,
    });
    const series = this.metrics.getSeries();
    this.carbon.setReportContext({
      greenTrend: this.metrics.getGreenTransitionTrend(),
      pollutionTrend: this.metrics.getPollutionTrend(),
      chartSnapshot: series,
    });

    const guideState = this.guide.getState({
      hasRoute: this.devRoute !== null,
      buildingCount: this.placed.length,
      pollution: this.resources.pollution,
      green: this.resources.green,
      placedGreen: this.placed.some((p) => BUILDINGS[p.id].tier !== 'chain'),
      openedCarbon: false,
    });

    gameBridge.emitPlatform({
      metrics: series,
      guide: guideState,
      demoActive: this.demo.active,
      productTagline: '可交互的工业碳经济模拟平台',
    });

    gameBridge.emitResources({ ...this.resources });
    gameBridge.emitRates({ ...this.lastSim.displayRates });
    gameBridge.emitCarbon(carbonState);
    gameBridge.emitEvent(this.gameEvents.getState());
    gameBridge.emitCity({
      tier: this.cityTier,
      tierLabel: tierLabel(this.cityTier),
      pollutionBand: pollutionBand(polT),
      evolutionPhase,
      evolutionLabel: evoLabel,
    });
    const victory = computeVictoryProgress({
      grade: carbonState.cityGrade,
      pollution: this.resources.pollution,
      green: this.resources.green,
      tier: this.cityTier,
      greenBuildingCount: greenCount,
      devRoute: this.devRoute,
      overLimitYears: carbonState.overLimitYears,
      hasZeroTower: this.superPlaced.some((s) => s.id === 'zero_carbon_tower'),
    });

    gameBridge.emitDemand(this.cityDemand.getState());
    gameBridge.emitVictory(victory);
    gameBridge.emitYearReport(carbonState.pendingReport);
    gameBridge.emitIndustry({
      shortages: this.lastSim.shortages,
      coalEfficiency: this.lastSim.coalEfficiency,
      powerEfficiency: this.lastSim.powerEfficiency,
      devRoute: this.devRoute,
      builtSupers: this.superPlaced.map((s) => s.id),
      milestones,
      evolutionPhase,
      evolutionLabel: evoLabel,
      rhythmLabel: rhythm.label,
      maxBuildingLevel: maxLvl,
      unlockedTechs: this.tech.getUnlockedList(),
      placed: this.placed.map((p) => ({
        uid: p.uid,
        id: p.id,
        name: BUILDINGS[p.id].name,
        level: p.level,
        levelName: getLevelName(p.id, p.level),
        upgradeCost: getUpgradeCost(p.id, p.level),
      })),
    });

    this.mapRenderer?.setEvolutionPhase(evolutionPhase);
    this.mapRenderer?.setPollutionLevel(this.resources.pollution, emissionRatio);
    this.atmosphere.update(this.resources.pollution, emissionRatio);
    this.factoryFx.setPollutionStress(this.resources.pollution, emissionRatio);

  }

  update(_time: number, delta: number) {
    if (ISO_GRASS_TEST_ONLY) return;

    const daysElapsed = this.gameTime.advance(delta);
    for (let i = 0; i < daysElapsed; i++) {
      this.tickEconomy();
    }
    this.emitGameTimeUi();

    this.cameraCtrl?.update();
    if (this.placingId || this.placingSuperId) this.updatePlacementPreview();

    const night = (Math.sin(_time / 5000) + 1) / 2;
    this.factoryFx.setNightFactor(night);
    this.atmosphere.setNightDim(night * 0.28);
    this.cityVisuals.setTier(this.cityTier, night);

  }

  private checkProgressionFx(grade: CityGrade, tier: CityTier, evolution: EvolutionPhase) {
    if (grade !== this.lastGrade) {
      this.unlockFx.playGradePromotion(this, grade);
      gameBridge.emitUnlockToast({ kind: 'grade', title: '评级晋升', subtitle: `${grade} 级` });
      this.lastGrade = grade;
    }
    if (tier !== this.lastTier) {
      this.unlockFx.playCityTierUp(this, tier, tierLabel(tier));
      gameBridge.emitUnlockToast({ kind: 'tier', title: '城市升级', subtitle: tierLabel(tier) });
      this.lastTier = tier;
    }
    if (evolution !== this.lastEvolution) {
      this.unlockFx.playEvolution(this, evolution, evolutionLabel(evolution));
      gameBridge.emitUnlockToast({ kind: 'evolution', title: '城市蜕变', subtitle: evolutionLabel(evolution) });
      this.lastEvolution = evolution;
    }
  }
}
