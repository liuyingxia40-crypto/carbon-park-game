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
  | 'deep_done';

type ZoneVisual = {
  factory: RetrofitFactory;
  highlight: Phaser.GameObjects.Graphics;
  badge: Phaser.GameObjects.Text;
  pendingLabel: Phaser.GameObjects.Text;
  nameLabel: Phaser.GameObjects.Text;
};

export class FactoryZoneManager {
  private readonly factories: RetrofitFactory[] = [];
  private readonly visuals = new Map<string, ZoneVisual>();
  private hoveredId: string | null = null;
  private mapConfig: MapVisualConfig = {
    stageId: 'diagnosis',
    initialDone: [],
    deepDone: null,
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

  private createVisual(factory: RetrofitFactory): ZoneVisual {
    const highlight = this.scene.add.graphics().setDepth(20);
    const badge = this.scene.add
      .text(factory.centerX, factory.centerY - 8, '', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#dcfce7',
        backgroundColor: '#166534cc',
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(26)
      .setVisible(false);

    const pendingLabel = this.scene.add
      .text(factory.centerX, factory.centerY + 6, '', {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '12px',
        color: '#fef3c7',
        backgroundColor: '#78350fcc',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(24);

    const nameLabel = this.scene.add
      .text(factory.centerX, factory.centerY - 28, factory.displayName, {
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#f8fafc',
        stroke: '#1e293b',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(27)
      .setVisible(false);

    return { factory, highlight, badge, pendingLabel, nameLabel };
  }

  private resolveMode(id: string): VisualMode {
    const { stageId, initialDone, deepDone } = this.mapConfig;
    const isHover = this.hoveredId === id;

    if (stageId === 'diagnosis') {
      return isHover ? 'diagnosis_hover' : 'diagnosis';
    }

    if (deepDone === id) return 'deep_done';

    if (stageId === 'deep_opt' && !deepDone) {
      if (!initialDone.includes(id)) return 'retrofit_pending';
      return isHover ? 'deep_hover' : 'deep_available';
    }

    if (initialDone.includes(id)) return 'initial_done';

    if (stageId === 'retrofit') {
      return isHover ? 'retrofit_hover' : 'retrofit_pending';
    }

    return 'retrofit_pending';
  }

  private redrawAll() {
    for (const factory of this.factories) {
      this.drawZone(factory.id, this.resolveMode(factory.id));
    }
  }

  private drawZone(id: string, mode: VisualMode) {
    const visual = this.visuals.get(id);
    if (!visual) return;
    const { factory, highlight, badge, pendingLabel, nameLabel } = visual;
    highlight.clear();

    const palette = {
      diagnosis: { stroke: 0x94a3b8, fill: 0.1, line: 1 },
      diagnosis_hover: { stroke: 0xcbd5e1, fill: 0.14, line: 2 },
      retrofit_pending: { stroke: 0x000000, fill: 0, line: 0 },
      retrofit_hover: { stroke: 0xfbbf24, fill: 0.18, line: 2 },
      initial_done: { stroke: 0x22c55e, fill: 0.14, line: 2 },
      deep_available: { stroke: 0x38bdf8, fill: 0.12, line: 2 },
      deep_hover: { stroke: 0x7dd3fc, fill: 0.2, line: 3 },
      deep_done: { stroke: 0x15803d, fill: 0.18, line: 3 },
    }[mode];

    if (factory.hitArea.kind === 'polygon') {
      const pts = factory.hitArea.polygon.points;
      highlight.fillStyle(palette.stroke, palette.fill);
      highlight.lineStyle(palette.line, palette.stroke, palette.line > 0 ? 0.92 : 0);
      highlight.beginPath();
      highlight.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) highlight.lineTo(pts[i].x, pts[i].y);
      highlight.closePath();
      if (palette.fill > 0) highlight.fillPath();
      if (palette.line > 0) highlight.strokePath();
    } else {
      const r = factory.hitArea.rect;
      highlight.fillStyle(palette.stroke, palette.fill);
      highlight.lineStyle(palette.line, palette.stroke, palette.line > 0 ? 0.92 : 0);
      if (palette.fill > 0) highlight.fillRect(r.x, r.y, r.width, r.height);
      if (palette.line > 0) highlight.strokeRect(r.x, r.y, r.width, r.height);
    }

    badge.setVisible(false);
    pendingLabel.setVisible(false);
    nameLabel.setVisible(false);

    switch (mode) {
      case 'diagnosis':
        pendingLabel.setText('?');
        pendingLabel.setColor('#e2e8f0');
        pendingLabel.setBackgroundColor('#475569cc');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.85);
        break;
      case 'diagnosis_hover':
        pendingLabel.setText('?');
        pendingLabel.setColor('#f8fafc');
        pendingLabel.setBackgroundColor('#64748bcc');
        pendingLabel.setVisible(true);
        nameLabel.setVisible(true);
        break;
      case 'retrofit_pending':
        pendingLabel.setText('待改造');
        pendingLabel.setColor('#fef3c7');
        pendingLabel.setBackgroundColor('#78350fcc');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.78);
        break;
      case 'retrofit_hover':
        pendingLabel.setText('待改造');
        pendingLabel.setColor('#fef3c7');
        pendingLabel.setBackgroundColor('#78350fcc');
        pendingLabel.setVisible(true);
        nameLabel.setVisible(true);
        break;
      case 'initial_done':
        badge.setText('已初改');
        badge.setBackgroundColor('#166534cc');
        badge.setVisible(true);
        break;
      case 'deep_available':
        pendingLabel.setText('可深改');
        pendingLabel.setColor('#e0f2fe');
        pendingLabel.setBackgroundColor('#0369a1cc');
        pendingLabel.setVisible(true);
        pendingLabel.setAlpha(0.9);
        break;
      case 'deep_hover':
        pendingLabel.setText('可深改');
        pendingLabel.setColor('#e0f2fe');
        pendingLabel.setBackgroundColor('#0369a1cc');
        pendingLabel.setVisible(true);
        nameLabel.setVisible(true);
        break;
      case 'deep_done':
        badge.setText('已深改');
        badge.setBackgroundColor('#14532dcc');
        badge.setVisible(true);
        break;
    }
  }
}
