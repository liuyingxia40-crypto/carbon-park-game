import Phaser from 'phaser';
import type { StageId } from '../story/phase1Script';
import {
  factoryContainsPoint,
  parseRetrofitFactory,
  type RetrofitFactory,
} from './parseRetrofitFactory';

export type MapVisualConfig = {
  stageId: StageId;
  initialDone: string[];
  deepDone: string | null;
};

type VisualMode =
  | 'diagnosis'
  | 'diagnosis_hover'
  | 'retrofit_pending'
  | 'retrofit_hover'
  | 'initial_done'
  | 'deep_available'
  | 'deep_hover'
  | 'deep_done'
  | 'idle';

type ZoneVisual = {
  factory: RetrofitFactory;
  highlight: Phaser.GameObjects.Graphics;
  badge: Phaser.GameObjects.Text;
  pendingLabel: Phaser.GameObjects.Text;
  recommendTag: Phaser.GameObjects.Text;
  nameLabel: Phaser.GameObjects.Text;
  statusTag: Phaser.GameObjects.Text;
};

const ACTIONABLE_MODES: VisualMode[] = [
  'diagnosis',
  'diagnosis_hover',
  'retrofit_pending',
  'retrofit_hover',
  'deep_available',
  'deep_hover',
];

export class FactoryZoneManager {
  private readonly factories: RetrofitFactory[] = [];
  private readonly visuals = new Map<string, ZoneVisual>();
  private hoveredId: string | null = null;
  private breathPhase = 0;
  private mapConfig: MapVisualConfig = {
    stageId: 'diagnosis',
    initialDone: [],
    deepDone: null,
  };

  private readonly updateHandler = () => {
    this.breathPhase = 0.5 + 0.5 * Math.sin(Date.now() / 780);
    if (this.hasActionableFactory()) {
      this.redrawAll();
    }
  };

  constructor(
    private scene: Phaser.Scene,
    objectLayer: Phaser.Tilemaps.ObjectLayer | null,
  ) {
    for (const obj of objectLayer?.objects ?? []) {
      const factory = parseRetrofitFactory(obj);
      if (factory) {
        this.factories.push(factory);
        this.visuals.set(factory.id, this.createVisual(factory));
      }
    }

    scene.events.on('update', this.updateHandler);

    this.redrawAll();
  }

  getFactories(): RetrofitFactory[] {
    return this.factories;
  }

  getCount(): number {
    return this.factories.length;
  }

  findAt(worldX: number, worldY: number): RetrofitFactory | null {
    for (let i = this.factories.length - 1; i >= 0; i--) {
      const f = this.factories[i];
      if (factoryContainsPoint(f, worldX, worldY)) return f;
    }
    return null;
  }

  setHovered(id: string | null) {
    if (this.hoveredId === id) return;
    this.hoveredId = id;
    this.redrawAll();
  }

  getFactory(id: string): RetrofitFactory | undefined {
    return this.factories.find((f) => f.id === id);
  }

  syncVisuals(config: MapVisualConfig) {
    this.mapConfig = config;
    this.redrawAll();
  }

  resetAll() {
    this.mapConfig = { stageId: 'diagnosis', initialDone: [], deepDone: null };
    this.hoveredId = null;
    this.redrawAll();
  }

  destroy() {
    this.scene.events.off('update', this.updateHandler);
  }

  private hasActionableFactory(): boolean {
    for (const factory of this.factories) {
      if (ACTIONABLE_MODES.includes(this.resolveMode(factory.id))) return true;
    }
    return false;
  }

  private getRecommendedId(): string | null {
    const { stageId, initialDone, deepDone } = this.mapConfig;

    if (stageId === 'diagnosis') {
      return this.factories[0]?.id ?? null;
    }

    if (stageId === 'retrofit') {
      for (const factory of this.factories) {
        if (!initialDone.includes(factory.id)) return factory.id;
      }
    }

    if (stageId === 'deep_opt' && !deepDone) {
      for (const factory of this.factories) {
        if (initialDone.includes(factory.id)) return factory.id;
      }
    }

    return null;
  }

  private createVisual(factory: RetrofitFactory): ZoneVisual {
    const highlight = this.scene.add.graphics().setDepth(20);
    const badge = this.scene.add
      .text(factory.centerX, factory.centerY - 8, '', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#dde8d1',
        backgroundColor: '#4c6b4fcc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(26)
      .setVisible(false);

    const pendingLabel = this.scene.add
      .text(factory.centerX, factory.centerY + 8, '', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f0e1b8',
        backgroundColor: '#3a3020cc',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(24);

    const recommendTag = this.scene.add
      .text(factory.centerX, factory.centerY - 22, '推荐操作', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f0e1b8',
        backgroundColor: '#6b4a28cc',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(29)
      .setVisible(false);

    const nameLabel = this.scene.add
      .text(factory.centerX, factory.centerY - 42, factory.displayName, {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#e5c97b',
        stroke: '#1a1410',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);

    const statusTag = this.scene.add
      .text(factory.centerX, factory.centerY - 24, '', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#d8cfb5',
        backgroundColor: '#2a2418dd',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(28)
      .setVisible(false);

    return { factory, highlight, badge, pendingLabel, recommendTag, nameLabel, statusTag };
  }

  private resolveMode(id: string): VisualMode {
    const { stageId, initialDone, deepDone } = this.mapConfig;
    const isHover = this.hoveredId === id;

    if (stageId === 'diagnosis') {
      return isHover ? 'diagnosis_hover' : 'diagnosis';
    }

    if (deepDone === id) return 'deep_done';

    if (stageId === 'deep_opt' && !deepDone) {
      if (!initialDone.includes(id)) return 'idle';
      return isHover ? 'deep_hover' : 'deep_available';
    }

    if (initialDone.includes(id)) return 'initial_done';

    if (stageId === 'retrofit') {
      return isHover ? 'retrofit_hover' : 'retrofit_pending';
    }

    return 'idle';
  }

  private getStatusTag(mode: VisualMode, factory: RetrofitFactory): string {
    switch (mode) {
      case 'diagnosis':
      case 'diagnosis_hover':
        return '点击了解排放情况';
      case 'retrofit_pending':
      case 'retrofit_hover':
        return '点击选择初改方案';
      case 'deep_available':
      case 'deep_hover':
        return '点击进行深度优化';
      default:
        return `${factory.emission} tCO₂e`;
    }
  }

  private isActionable(mode: VisualMode): boolean {
    return ACTIONABLE_MODES.includes(mode);
  }

  private redrawAll() {
    for (const factory of this.factories) {
      this.drawZone(factory.id, this.resolveMode(factory.id));
    }
  }

  private drawZone(id: string, mode: VisualMode) {
    const visual = this.visuals.get(id);
    if (!visual) return;
    const { factory, highlight, badge, pendingLabel, recommendTag, nameLabel, statusTag } = visual;
    highlight.clear();

    const isRecommended = id === this.getRecommendedId();
    const actionable = this.isActionable(mode);
    const breathBoost =
      actionable && !mode.includes('hover') ? this.breathPhase * 0.32 : 0;
    const recommendBoost = isRecommended && actionable ? this.breathPhase * 0.14 : 0;
    const totalBreath = breathBoost + recommendBoost;

    const palette = {
      diagnosis: {
        stroke: 0xb99a5a,
        fill: 0.05 + totalBreath,
        line: 1.6 + totalBreath * 2.8,
        alpha: 0.78 + totalBreath,
      },
      diagnosis_hover: { stroke: 0xe5c97b, fill: 0.1, line: 3, alpha: 1 },
      retrofit_pending: {
        stroke: isRecommended ? 0xe5c97b : 0xb88945,
        fill: 0.05 + totalBreath,
        line: (isRecommended ? 2 : 1.6) + totalBreath * 2.8,
        alpha: 0.8 + totalBreath,
      },
      retrofit_hover: { stroke: 0xe5c97b, fill: 0.1, line: 3, alpha: 1 },
      initial_done: { stroke: 0x6b8a72, fill: 0.06, line: 2, alpha: 0.82 },
      deep_available: {
        stroke: isRecommended ? 0xe5c97b : 0x8fbf8e,
        fill: 0.05 + totalBreath,
        line: (isRecommended ? 2 : 1.6) + totalBreath * 2.8,
        alpha: 0.8 + totalBreath,
      },
      deep_hover: { stroke: 0xe5c97b, fill: 0.1, line: 3, alpha: 1 },
      deep_done: { stroke: 0x5a7a62, fill: 0.06, line: 2, alpha: 0.82 },
      idle: { stroke: 0x000000, fill: 0, line: 0, alpha: 0 },
    }[mode];

    if (factory.hitArea.kind === 'polygon') {
      const pts = factory.hitArea.polygon.points;
      highlight.fillStyle(palette.stroke, palette.fill);
      highlight.lineStyle(palette.line, palette.stroke, palette.line > 0 ? palette.alpha : 0);
      highlight.beginPath();
      highlight.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) highlight.lineTo(pts[i].x, pts[i].y);
      highlight.closePath();
      if (palette.fill > 0) highlight.fillPath();
      if (palette.line > 0) highlight.strokePath();
    } else {
      const r = factory.hitArea.rect;
      highlight.fillStyle(palette.stroke, palette.fill);
      highlight.lineStyle(palette.line, palette.stroke, palette.line > 0 ? palette.alpha : 0);
      if (palette.fill > 0) highlight.fillRect(r.x, r.y, r.width, r.height);
      if (palette.line > 0) highlight.strokeRect(r.x, r.y, r.width, r.height);
    }

    badge.setVisible(false);
    pendingLabel.setVisible(false);
    recommendTag.setVisible(false);
    nameLabel.setVisible(false);
    statusTag.setVisible(false);

    const showHoverInfo = mode.includes('hover');
    const showRecommend = isRecommended && actionable && !showHoverInfo;

    switch (mode) {
      case 'diagnosis':
        pendingLabel.setText('待诊断');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.92);
        if (showRecommend) recommendTag.setVisible(true);
        break;
      case 'diagnosis_hover':
        nameLabel.setVisible(true);
        statusTag.setText(this.getStatusTag(mode, factory));
        statusTag.setVisible(true);
        break;
      case 'retrofit_pending':
        pendingLabel.setText('待改造');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.92);
        if (showRecommend) recommendTag.setVisible(true);
        break;
      case 'retrofit_hover':
        nameLabel.setVisible(true);
        statusTag.setText(this.getStatusTag(mode, factory));
        statusTag.setVisible(true);
        break;
      case 'initial_done':
        badge.setText('已初改');
        badge.setVisible(true);
        if (showHoverInfo) {
          nameLabel.setVisible(true);
          statusTag.setText('初改完成');
          statusTag.setVisible(true);
        }
        break;
      case 'deep_available':
        pendingLabel.setText('可深改');
        pendingLabel.setColor('#dde8d1');
        pendingLabel.setBackgroundColor('#3e5a42cc');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.94);
        if (showRecommend) recommendTag.setVisible(true);
        break;
      case 'deep_hover':
        nameLabel.setVisible(true);
        statusTag.setText(this.getStatusTag(mode, factory));
        statusTag.setVisible(true);
        break;
      case 'deep_done':
        badge.setText('已深改');
        badge.setVisible(true);
        break;
      case 'idle':
        break;
    }
  }
}
