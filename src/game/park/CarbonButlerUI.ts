import Phaser from 'phaser';

import { FACTORIES } from '../story/phase1Script';

import {
  CARBON_BUTLER_KEY,
  INITIAL_TOTAL_EMISSION,
  TARGET_EMISSION,
} from './paths';

const FONT = '"Microsoft YaHei UI", "Noto Sans SC", "PingFang SC", sans-serif';
const INK = '#e7d6b0';
const INK_GOLD = '#f3d58a';
const INK_MUTED = 'rgba(231, 214, 176, 0.65)';
const PANEL_FILL = 0x1e1812;
const PANEL_BORDER = 0x8a5a36;
const BTN_FILL = 0x3a2618;
const BTN_BORDER = 0xc99a4a;
const BTN_HOVER = 0x4a3224;

type Step = 'intro' | 'emission' | 'notice' | 'hidden';

type Options = {
  onComplete: () => void;
};

const NPC_NAME = 'Carbon Butler';

export class CarbonButlerUI {
  private root: Phaser.GameObjects.Container;
  private dialogBg: Phaser.GameObjects.Graphics;
  private dialogShadow: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private roleText: Phaser.GameObjects.Text;
  private problemLabel: Phaser.GameObjects.Text;
  private problemText: Phaser.GameObjects.Text;
  private taskLabel: Phaser.GameObjects.Text;
  private taskText: Phaser.GameObjects.Text;
  private nextLabel: Phaser.GameObjects.Text;
  private nextText: Phaser.GameObjects.Text;
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

    this.nameText = scene.add
      .text(0, 0, NPC_NAME, {
        fontFamily: FONT,
        fontSize: '16px',
        fontStyle: 'bold',
        color: INK_GOLD,
      })
      .setOrigin(0, 0);

    this.roleText = scene.add
      .text(0, 0, '园区碳管家', {
        fontFamily: FONT,
        fontSize: '12px',
        color: INK_MUTED,
      })
      .setOrigin(0, 0);

    const labelStyle = {
      fontFamily: FONT,
      fontSize: '11px',
      fontStyle: 'bold' as const,
      color: INK_MUTED,
    };

    const bodyStyle = {
      fontFamily: FONT,
      fontSize: '13px',
      color: INK,
      wordWrap: { width: 380 },
      lineSpacing: 3,
    };

    this.problemLabel = scene.add.text(0, 0, '当前问题', labelStyle).setOrigin(0, 0);
    this.problemText = scene.add.text(0, 0, '', bodyStyle).setOrigin(0, 0);
    this.taskLabel = scene.add.text(0, 0, '当前任务', labelStyle).setOrigin(0, 0);
    this.taskText = scene.add
      .text(0, 0, '', { ...bodyStyle, color: INK_GOLD, fontStyle: 'bold' })
      .setOrigin(0, 0);
    this.nextLabel = scene.add.text(0, 0, '下一步', labelStyle).setOrigin(0, 0);
    this.nextText = scene.add
      .text(0, 0, '', { ...bodyStyle, color: '#b8e6c8' })
      .setOrigin(0, 0);

    this.actionBtnBg = scene.add.graphics();
    this.actionBtnLabel = scene.add
      .text(0, 0, '开始核算', {
        fontFamily: FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: INK_GOLD,
      })
      .setOrigin(0.5);
    this.actionHit = scene.add.zone(0, 0, this.btnSize.w, this.btnSize.h);
    this.actionBtn = scene.add.container(0, 0, [this.actionBtnBg, this.actionBtnLabel, this.actionHit]);

    this.butlerSprite = scene.add.image(0, 0, CARBON_BUTLER_KEY).setOrigin(0, 0);

    this.root.add([
      this.dialogShadow,
      this.dialogBg,
      this.nameText,
      this.roleText,
      this.problemLabel,
      this.problemText,
      this.taskLabel,
      this.taskText,
      this.nextLabel,
      this.nextText,
      this.actionBtn,
      this.butlerSprite,
    ]);

    this.bindButton(this.actionHit, () => this.handleAction());
    scene.scale.on('resize', this.layout, this);
    this.setIntroContent();
    this.layout();
  }

  reset() {
    this.step = 'intro';
    this.setIntroContent();
    this.actionBtnLabel.setText('开始核算');
    this.setStructuredVisible(true);
    this.actionBtn.setVisible(true);
    this.root.setVisible(true);
    this.layout();
  }

  showNotice(text: string) {
    this.step = 'notice';
    this.setStructuredVisible(false);
    this.problemText.setText(text);
    this.problemText.setVisible(true);
    this.problemLabel.setVisible(false);
    this.actionBtnLabel.setText('');
    this.actionBtn.setVisible(false);
    this.root.setVisible(true);
    this.layout();
  }

  hide() {
    this.step = 'hidden';
    this.root.setVisible(false);
  }

  destroy() {
    this.scene.scale.off('resize', this.layout, this);
    this.root.destroy(true);
  }

  private setStructuredVisible(visible: boolean) {
    this.nameText.setVisible(visible);
    this.roleText.setVisible(visible);
    this.problemLabel.setVisible(visible);
    this.problemText.setVisible(visible);
    this.taskLabel.setVisible(visible);
    this.taskText.setVisible(visible);
    this.nextLabel.setVisible(visible);
    this.nextText.setVisible(visible);
    this.dialogShadow.setVisible(true);
    this.dialogBg.setVisible(true);
    this.butlerSprite.setVisible(true);
  }

  private setIntroContent() {
    const over = INITIAL_TOTAL_EMISSION - TARGET_EMISSION;
    this.problemText.setText(
      `园区总排放 ${INITIAL_TOTAL_EMISSION} tCO₂e，超出年度配额 ${over} 吨，合规风险较高。`,
    );
    this.taskText.setText('完成园区碳排放核算，摸清三座工厂的主要排放来源。');
    this.nextText.setText('点击下方按钮开始核算，随后进入诊断阶段。');
  }

  private setEmissionContent() {
    const over = INITIAL_TOTAL_EMISSION - TARGET_EMISSION;
    const factoryLines = FACTORIES.map((f) => `${f.title} ${f.emission} tCO₂e`).join(' · ');
    this.problemText.setText(`核算完成：总排放 ${INITIAL_TOTAL_EMISSION}，超出配额 ${over} 吨。`);
    this.taskText.setText('确认排放结构，准备对高排放工厂逐一诊断。');
    this.nextText.setText(`主要来源：${factoryLines}`);
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
      this.actionBtn.setScale(0.96);
      this.scene.time.delayedCall(80, () => this.actionBtn.setScale(1));
      onClick();
    });
  }

  private handleAction() {
    if (this.step === 'intro') {
      this.showEmissionData();
      return;
    }
    if (this.step === 'emission') {
      this.finish();
    }
  }

  private showEmissionData() {
    this.step = 'emission';
    this.setEmissionContent();
    this.actionBtnLabel.setText('继续诊断');
    this.layout();
  }

  private finish() {
    this.step = 'hidden';
    this.root.setVisible(false);
    this.options.onComplete();
  }

  private paintButton(fill: number) {
    const { w, h } = this.btnSize;
    this.actionBtnBg.fillStyle(fill, 0.96);
    this.actionBtnBg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    this.actionBtnBg.lineStyle(2, BTN_BORDER, 0.9);
    this.actionBtnBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
  }

  private layout = () => {
    if (this.step === 'hidden') return;

    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const pad = Math.max(14, Math.round(w * 0.02));

    const dialogLeft = pad;
    const dialogWidth = w - pad * 2;
    const dialogHeight =
      this.step === 'notice'
        ? Math.max(120, h * 0.14)
        : this.step === 'intro'
          ? Math.max(168, h * 0.19)
          : Math.max(188, h * 0.21);
    const dialogTop = h - pad - dialogHeight;

    const butlerTargetH = Math.min(140, Math.max(100, dialogHeight * 0.88));
    const butlerScale = this.butlerSprite.height > 0 ? butlerTargetH / this.butlerSprite.height : 1;
    this.butlerSprite.setScale(butlerScale);
    this.butlerSprite.setOrigin(0, 0);
    this.butlerSprite.setPosition(dialogLeft + 10, dialogTop + 8);

    const butlerW = this.butlerSprite.displayWidth;
    const textLeft = dialogLeft + butlerW + pad * 0.7;
    const textWidth = Math.max(200, dialogWidth - butlerW - pad * 2.4);
    const fieldGap = 6;

    this.dialogShadow.clear();
    this.dialogShadow.fillStyle(0x000000, 0.35);
    this.dialogShadow.fillRoundedRect(dialogLeft + 3, dialogTop + 5, dialogWidth, dialogHeight, 10);

    this.dialogBg.clear();
    this.dialogBg.fillStyle(PANEL_FILL, 0.94);
    this.dialogBg.fillRoundedRect(dialogLeft, dialogTop, dialogWidth, dialogHeight, 10);
    this.dialogBg.lineStyle(2, PANEL_BORDER, 0.85);
    this.dialogBg.strokeRoundedRect(dialogLeft, dialogTop, dialogWidth, dialogHeight, 10);

    if (this.step === 'notice') {
      this.problemText.setWordWrapWidth(textWidth, true);
      this.problemText.setPosition(textLeft, dialogTop + pad);
      return;
    }

    this.nameText.setPosition(textLeft, dialogTop + pad * 0.6);
    this.roleText.setPosition(textLeft + this.nameText.width + 10, dialogTop + pad * 0.6 + 4);

    let y = dialogTop + pad + 22;
    const placeField = (label: Phaser.GameObjects.Text, body: Phaser.GameObjects.Text) => {
      label.setPosition(textLeft, y);
      body.setWordWrapWidth(textWidth, true);
      body.setPosition(textLeft, y + 14);
      y += body.height + fieldGap + 14;
    };

    placeField(this.problemLabel, this.problemText);
    placeField(this.taskLabel, this.taskText);
    placeField(this.nextLabel, this.nextText);

    if (this.actionBtn.visible) {
      this.actionBtnBg.clear();
      this.paintButton(BTN_FILL);
      const btnX = dialogLeft + dialogWidth - pad - this.btnSize.w / 2;
      const btnY = dialogTop + dialogHeight - pad - this.btnSize.h / 2;
      this.actionBtn.setPosition(btnX, btnY);
      this.actionHit.setSize(this.btnSize.w, this.btnSize.h);
    }
  };
}
