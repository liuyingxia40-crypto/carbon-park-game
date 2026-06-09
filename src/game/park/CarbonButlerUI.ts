import Phaser from 'phaser';
import { FACTORIES } from '../story/phase1Script';
import {
  CARBON_BUTLER_KEY,
  INITIAL_TOTAL_EMISSION,
  TARGET_EMISSION,
} from './paths';

const FONT = '"PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif';
const INK = '#f4f0e6';
const PANEL_FILL = 0x1a2820;
const PANEL_BORDER = 0x6b9a78;
const BTN_FILL = 0x2d4a38;
const BTN_BORDER = 0x8ab896;
const BTN_HOVER = 0x3a5c48;

type Step = 'intro' | 'emission' | 'done';

type Options = {
  onComplete: () => void;
};

const INTRO_TEXT =
  '你好，我是 Carbon Butler。你的工业园区当前碳排放已经超过年度配额，我们需要先进行碳排放核算。';

export class CarbonButlerUI {
  private root: Phaser.GameObjects.Container;
  private dialogBg: Phaser.GameObjects.Graphics;
  private dialogShadow: Phaser.GameObjects.Graphics;
  private bodyText: Phaser.GameObjects.Text;
  private actionBtn: Phaser.GameObjects.Container;
  private actionBtnBg: Phaser.GameObjects.Graphics;
  private actionBtnLabel: Phaser.GameObjects.Text;
  private actionHit: Phaser.GameObjects.Zone;
  private butlerSprite: Phaser.GameObjects.Image;
  private step: Step = 'intro';
  private readonly btnSize = { w: 132, h: 40 };

  constructor(
    private scene: Phaser.Scene,
    private options: Options,
  ) {
    this.root = scene.add.container(0, 0).setDepth(2500).setScrollFactor(0);

    this.dialogShadow = scene.add.graphics();
    this.dialogBg = scene.add.graphics();
    this.bodyText = scene.add
      .text(0, 0, INTRO_TEXT, {
        fontFamily: FONT,
        fontSize: '15px',
        color: INK,
        wordWrap: { width: 420 },
        lineSpacing: 6,
      })
      .setOrigin(0, 0);

    this.actionBtnBg = scene.add.graphics();
    this.actionBtnLabel = scene.add
      .text(0, 0, '开始核算', {
        fontFamily: FONT,
        fontSize: '14px',
        fontStyle: '800',
        color: INK,
      })
      .setOrigin(0.5);
    this.actionHit = scene.add.zone(0, 0, this.btnSize.w, this.btnSize.h);
    this.actionBtn = scene.add.container(0, 0, [this.actionBtnBg, this.actionBtnLabel, this.actionHit]);

    this.butlerSprite = scene.add.image(0, 0, CARBON_BUTLER_KEY).setOrigin(0, 0);

    this.root.add([
      this.dialogShadow,
      this.dialogBg,
      this.bodyText,
      this.actionBtn,
      this.butlerSprite,
    ]);

    this.bindButton(this.actionHit, () => this.handleAction());
    scene.scale.on('resize', this.layout, this);
    this.layout();
  }

  reset() {
    this.step = 'intro';
    this.bodyText.setText(INTRO_TEXT);
    this.bodyText.setColor(INK);
    this.actionBtnLabel.setText('开始核算');
    this.dialogShadow.setVisible(true);
    this.dialogBg.setVisible(true);
    this.bodyText.setVisible(true);
    this.actionBtn.setVisible(true);
    this.root.setVisible(true);
    this.layout();
  }

  destroy() {
    this.scene.scale.off('resize', this.layout, this);
    this.root.destroy(true);
  }

  private bindButton(zone: Phaser.GameObjects.Zone, onClick: () => void) {
    zone.setInteractive();
    this.scene.input.removeDebug(zone);
    zone.removeAllListeners('pointerover');
    zone.removeAllListeners('pointerout');
    zone.removeAllListeners('pointerdown');
    zone.on('pointerover', () => {
      this.actionBtnBg.clear();
      this.paintButton(BTN_HOVER);
      this.scene.input.manager.canvas.style.cursor = 'pointer';
    });
    zone.on('pointerout', () => {
      this.actionBtnBg.clear();
      this.paintButton(BTN_FILL);
      this.scene.input.manager.canvas.style.cursor = 'default';
    });
    zone.on('pointerdown', (_p: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      onClick();
    });
  }

  private handleAction() {
    if (this.step === 'intro') {
      this.showEmissionData();
      return;
    }
    this.finish();
  }

  private showEmissionData() {
    this.step = 'emission';
    const over = INITIAL_TOTAL_EMISSION - TARGET_EMISSION;
    const factoryLines = FACTORIES.map((f) => `· ${f.title}：${f.emission} tCO₂e`).join('\n');
    this.bodyText.setText(
      [
        '碳排放核算结果',
        '',
        `当前园区总排放：${INITIAL_TOTAL_EMISSION} tCO₂e`,
        `年度配额上限：${TARGET_EMISSION} tCO₂e`,
        `超出配额：${over} tCO₂e`,
        '',
        factoryLines,
      ].join('\n'),
    );
    this.actionBtnLabel.setText('继续诊断');
    this.layout();
  }

  private finish() {
    this.step = 'done';
    this.dialogShadow.setVisible(false);
    this.dialogBg.setVisible(false);
    this.bodyText.setVisible(false);
    this.actionBtn.setVisible(false);
    this.options.onComplete();
    this.layout();
  }

  private paintButton(fill: number) {
    const { w, h } = this.btnSize;
    this.actionBtnBg.fillStyle(fill, 0.96);
    this.actionBtnBg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.actionBtnBg.lineStyle(2, BTN_BORDER, 0.85);
    this.actionBtnBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
  }

  private layout = () => {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const pad = Math.max(16, Math.round(w * 0.022));

    if (this.step === 'done') {
      const idleH = Math.min(200, Math.max(120, h * 0.22));
      const idleScale = this.butlerSprite.height > 0 ? idleH / this.butlerSprite.height : 1;
      this.butlerSprite.setScale(idleScale);
      this.butlerSprite.setOrigin(0, 1);
      this.butlerSprite.setPosition(pad, h - pad);
      return;
    }

    const dialogLeft = pad;
    const dialogWidth = w - pad * 2;
    const dialogHeight = this.step === 'intro' ? Math.max(148, h * 0.17) : Math.max(230, h * 0.26);
    const dialogTop = h - pad - dialogHeight;

    const butlerTargetH = Math.min(148, Math.max(112, dialogHeight * 0.92));
    const butlerScale = this.butlerSprite.height > 0 ? butlerTargetH / this.butlerSprite.height : 1;
    this.butlerSprite.setScale(butlerScale);
    this.butlerSprite.setOrigin(0, 0);
    this.butlerSprite.setPosition(dialogLeft + 12, dialogTop + 10);

    const butlerW = this.butlerSprite.displayWidth;
    const textLeft = dialogLeft + butlerW + pad * 0.8;
    const textWidth = Math.max(180, dialogWidth - butlerW - pad * 2.6);

    this.bodyText.setWordWrapWidth(textWidth, true);

    this.dialogShadow.clear();
    this.dialogShadow.fillStyle(0x000000, 0.28);
    this.dialogShadow.fillRoundedRect(dialogLeft + 3, dialogTop + 5, dialogWidth, dialogHeight, 14);

    this.dialogBg.clear();
    this.dialogBg.fillStyle(PANEL_FILL, 0.9);
    this.dialogBg.fillRoundedRect(dialogLeft, dialogTop, dialogWidth, dialogHeight, 14);
    this.dialogBg.lineStyle(2, PANEL_BORDER, 0.55);
    this.dialogBg.strokeRoundedRect(dialogLeft, dialogTop, dialogWidth, dialogHeight, 14);

    this.bodyText.setPosition(textLeft, dialogTop + pad);

    this.actionBtnBg.clear();
    this.paintButton(BTN_FILL);
    const btnX = dialogLeft + dialogWidth - pad - this.btnSize.w / 2;
    const btnY = dialogTop + dialogHeight - pad - this.btnSize.h / 2;
    this.actionBtn.setPosition(btnX, btnY);
    this.actionHit.setSize(this.btnSize.w, this.btnSize.h);
  };
}
