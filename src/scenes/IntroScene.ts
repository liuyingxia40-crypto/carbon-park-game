import Phaser from 'phaser';
import { ensureIntroTextures } from '../game/intro/introTextures';
import {
  INTRO_BG_KEY,
  INTRO_BG_URL,
  INTRO_COMPLETE_EVENT,
  INTRO_ENVELOPE_CLOSED_KEY,
  INTRO_ENVELOPE_CLOSED_URL,
  INTRO_ENVELOPE_OPEN_KEY,
  INTRO_ENVELOPE_OPEN_URL,
  INTRO_LETTER_KEY,
  INTRO_LETTER_URL,
  INTRO_SCENE_KEY,
} from '../game/intro/paths';

const FONT = '"PingFang SC", "Microsoft YaHei", "Segoe UI", serif';
const INK = '#3a2a1f';
const INK_SIGN = '#5a4a3a';

type Phase = 'fade' | 'envelope' | 'opening' | 'reading' | 'done';

const LETTER_PARAGRAPHS: { text: string; salutation?: boolean; signature?: boolean }[] = [
  { text: '亲爱的继承者：', salutation: true },
  { text: '你已被选中，接手这座沉寂已久的工业园区。' },
  { text: '这里曾带来收益与繁荣，\n也留下了高耗能与高排放的沉重代价。' },
  { text: '新的目标已经下达，\n而改造的责任，如今落在你的手中。' },
  { text: '接下来的一切，\n将由你来决定。' },
  { text: '—— 一封未署名的通知', signature: true },
];

export class IntroScene extends Phaser.Scene {
  private phase: Phase = 'fade';
  private finished = false;

  private bg!: Phaser.GameObjects.Image;
  private envelopeClosed!: Phaser.GameObjects.Image;
  private envelopeOpen!: Phaser.GameObjects.Image;
  private letter!: Phaser.GameObjects.Image;
  private hintRing!: Phaser.GameObjects.Graphics;
  private hintText!: Phaser.GameObjects.Text;
  private skipBtn!: Phaser.GameObjects.Container;
  private startBtn!: Phaser.GameObjects.Container;
  private startBtnHitZone!: Phaser.GameObjects.Zone;
  private letterTextGroup!: Phaser.GameObjects.Container;
  private ringBreatheTween?: Phaser.Tweens.Tween;
  private donePointerHandler?: (pointer: Phaser.Input.Pointer) => void;

  private readonly startBtnSize = { w: 300, h: 50 };

  private layout = {
    cx: 0,
    cy: 0,
    envelopeScale: 1,
    letterReadScale: 1,
    ringRadius: 36,
  };

  constructor() {
    super({ key: INTRO_SCENE_KEY });
  }

  preload() {
    this.load.image(INTRO_BG_KEY, INTRO_BG_URL);
    this.load.image(INTRO_ENVELOPE_CLOSED_KEY, INTRO_ENVELOPE_CLOSED_URL);
    this.load.image(INTRO_ENVELOPE_OPEN_KEY, INTRO_ENVELOPE_OPEN_URL);
    this.load.image(INTRO_LETTER_KEY, INTRO_LETTER_URL);
  }

  create() {
    ensureIntroTextures(this);
    this.blockInputDebug();
    this.buildScene();
    this.layoutAll();
    this.scale.on('resize', () => this.layoutAll());
    this.cameras.main.fade(1, 0, 0, 0, true);
    this.playOpeningSequence();
  }

  shutdown() {
    if (this.donePointerHandler) {
      this.input.off('pointerdown', this.donePointerHandler);
      this.donePointerHandler = undefined;
    }
  }

  /** 禁止 Phaser 默认 0x00ff00 debug hitbox */
  private blockInputDebug() {
    this.input.enableDebug = () => this.input;
  }

  private bindInvisibleHitZone(
    zone: Phaser.GameObjects.Zone,
    onClick: () => void,
  ) {
    zone.setInteractive();
    this.input.removeDebug(zone);
    zone.removeAllListeners('pointerdown');
    zone.on('pointerdown', (
      _pointer: Phaser.Input.Pointer,
      _lx: number,
      _ly: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      onClick();
    });
  }

  private bindInteractive(obj: Phaser.GameObjects.Image, hitArea: Phaser.Geom.Rectangle) {
    obj.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.input.removeDebug(obj);
    obj.removeAllListeners('pointerdown');
    obj.on('pointerdown', () => this.onEnvelopeClick());
  }

  private buildScene() {
    const { width, height } = this.scale;

    this.bg = this.add.image(width / 2, height / 2, INTRO_BG_KEY).setDepth(0);

    this.envelopeClosed = this.add
      .image(0, 0, INTRO_ENVELOPE_CLOSED_KEY)
      .setDepth(10)
      .setAlpha(1)
      .setVisible(true);

    this.envelopeOpen = this.add
      .image(0, 0, INTRO_ENVELOPE_OPEN_KEY)
      .setDepth(10)
      .setAlpha(0)
      .setVisible(false);

    this.letter = this.add
      .image(0, 0, INTRO_LETTER_KEY)
      .setDepth(20)
      .setAlpha(0)
      .setVisible(false);

    this.hintRing = this.add.graphics().setDepth(12);
    this.hintText = this.add
      .text(0, 0, '轻触开启', {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.65)
      .setDepth(12);

    this.letterTextGroup = this.add.container(0, 0).setDepth(40);

    const skip = this.makeTextButton('跳过', 72, 32, () => this.completeIntro());
    this.skipBtn = skip.container.setDepth(60).setAlpha(0);

    const start = this.makeTextButton(
      '开始第一阶段改造',
      this.startBtnSize.w,
      this.startBtnSize.h,
      () => this.completeIntro(),
      true,
    );
    this.startBtn = start.container.setDepth(100).setAlpha(0).setVisible(false);
    this.startBtnHitZone = start.hitZone;

    this.letter.disableInteractive();

    this.envelopeClosed.setVisible(false);
    this.hintRing.setVisible(false);
    this.hintText.setVisible(false);
  }

  private playOpeningSequence() {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      this.showEnvelope();
    });
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    this.tweens.add({
      targets: this.skipBtn,
      alpha: 0.85,
      duration: 600,
      delay: 400,
    });
  }

  private showEnvelope() {
    this.phase = 'envelope';
    this.layoutAll();

    this.envelopeClosed.setVisible(true).setAlpha(0);
    this.hintRing.setVisible(true).setAlpha(0);
    this.hintText.setVisible(true).setAlpha(0);

    this.tweens.add({
      targets: this.envelopeClosed,
      alpha: 1,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.setupEnvelopeHitArea();
        this.startRingBreathe();
      },
    });

    this.tweens.add({
      targets: this.hintRing,
      alpha: 0.45,
      duration: 700,
      delay: 300,
      ease: 'Sine.easeOut',
    });
    this.tweens.add({
      targets: this.hintText,
      alpha: 0.65,
      duration: 700,
      delay: 300,
      ease: 'Sine.easeOut',
    });
  }

  private setupEnvelopeHitArea() {
    const w = this.envelopeClosed.width;
    const h = this.envelopeClosed.height;
    const pad = 1.12;
    const hit = new Phaser.Geom.Rectangle(-(w * pad) / 2, -(h * pad) / 2, w * pad, h * pad);
    this.envelopeClosed.removeInteractive();
    this.bindInteractive(this.envelopeClosed, hit);
  }

  private layoutHintPosition() {
    const { cx } = this.layout;
    const env = this.envelopeClosed;
    const hintY = env.y - env.displayHeight * 0.15;

    this.drawHintRing(this.layout.ringRadius);
    this.hintRing.setPosition(cx, hintY);
    this.hintText.setPosition(cx, hintY + this.layout.ringRadius + 8);
  }

  private drawHintRing(radius: number) {
    this.hintRing.clear();
    this.hintRing.lineStyle(1.2, 0xffffff, 0.45);
    this.hintRing.strokeCircle(0, 0, radius);
  }

  private startRingBreathe() {
    this.ringBreatheTween?.stop();
    this.hintRing.setScale(1);
    this.hintRing.setAlpha(0.45);
    this.ringBreatheTween = this.tweens.add({
      targets: this.hintRing,
      alpha: { from: 0.35, to: 0.55 },
      scale: { from: 0.95, to: 1.08 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private hideClickHint() {
    this.ringBreatheTween?.stop();
    this.hintRing.setVisible(false);
    this.hintText.setVisible(false);
  }

  private onEnvelopeClick() {
    if (this.phase !== 'envelope') return;
    this.phase = 'opening';
    this.hideClickHint();
    this.envelopeClosed.removeInteractive();

    this.envelopeClosed.setVisible(false);
    this.envelopeOpen.setVisible(true).setAlpha(1).setScale(this.layout.envelopeScale);

    this.letter.setVisible(true);
    const { cx, cy, envelopeScale } = this.layout;
    const pullScale = envelopeScale * 0.38;
    const readScale = this.layout.letterReadScale;

    this.letter.setPosition(cx, cy + 18 * envelopeScale);
    this.letter.setScale(pullScale);
    this.letter.setAlpha(0);

    this.tweens.add({
      targets: this.letter,
      y: cy - 28 * envelopeScale,
      alpha: 1,
      scale: pullScale * 1.35,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => this.expandLetter(readScale),
    });
  }

  private expandLetter(readScale: number) {
    const { cx, cy } = this.layout;

    this.tweens.add({
      targets: this.envelopeOpen,
      alpha: 0.28,
      duration: 800,
      ease: 'Sine.easeOut',
    });

    this.tweens.add({
      targets: this.letter,
      x: cx,
      y: cy - 20,
      scale: readScale,
      duration: 800,
      ease: 'Sine.easeInOut',
      onComplete: () => this.showLetterText(),
    });
  }

  private showLetterText() {
    this.phase = 'reading';
    this.letterTextGroup.removeAll(true);

    const { cx, cy } = this.layout;
    const uiScale = Math.min(this.scale.width / 390, this.scale.height / 844, 1.1);
    const letterW = this.letter.displayWidth * 0.62;
    const lineGap = 10 * uiScale;
    let yOffset = -this.letter.displayHeight * 0.28;

    const blocks: Phaser.GameObjects.Text[] = [];

    for (const para of LETTER_PARAGRAPHS) {
      const isSalutation = para.salutation === true;
      const isSignature = para.signature === true;
      const t = this.add
        .text(0, yOffset, para.text, {
          fontFamily: FONT,
          fontSize: isSalutation
            ? `${Math.round(15 * uiScale)}px`
            : isSignature
              ? `${Math.round(13 * uiScale)}px`
              : `${Math.round(14 * uiScale)}px`,
          color: isSignature ? INK_SIGN : INK,
          fontStyle: isSignature ? 'italic' : 'normal',
          align: 'left',
          wordWrap: { width: letterW },
          lineSpacing: 5 * uiScale,
        })
        .setOrigin(0, 0)
        .setAlpha(0);
      this.letterTextGroup.add(t);
      blocks.push(t);
      yOffset += t.height + (isSalutation ? 12 * uiScale : isSignature ? 6 * uiScale : lineGap);
    }

    this.letterTextGroup.setPosition(cx - letterW / 2, cy - 20);

    blocks.forEach((block, i) => {
      this.time.delayedCall(i * 600, () => {
        this.tweens.add({
          targets: block,
          alpha: 1,
          duration: 600,
          ease: 'Sine.easeOut',
          onComplete: () => {
            if (i === blocks.length - 1) this.showStartButton();
          },
        });
      });
    });
  }

  private showStartButton() {
    this.phase = 'done';
    this.layoutStartButton();
    this.startBtn.setVisible(true).setAlpha(1);
    this.bindStartButtonInput();
    this.enableDonePointerFallback();
  }

  private layoutStartButton() {
    const { cx, cy } = this.layout;
    const letterBottom = cy - 20 + this.letter.displayHeight * 0.5;
    const y = Math.min(letterBottom + 40, this.scale.height - 56);
    this.startBtn.setPosition(cx, y);
  }

  private bindStartButtonInput() {
    this.startBtnHitZone.setSize(this.startBtnSize.w, this.startBtnSize.h);
    this.bindInvisibleHitZone(this.startBtnHitZone, () => this.completeIntro());
  }

  private enableDonePointerFallback() {
    if (this.donePointerHandler) return;
    this.donePointerHandler = (pointer: Phaser.Input.Pointer) => {
      if (this.phase !== 'done' || this.finished || !this.startBtn.visible) return;
      const b = this.startBtn.getBounds();
      if (b.contains(pointer.x, pointer.y)) {
        this.completeIntro();
      }
    };
    this.input.on('pointerdown', this.donePointerHandler);
  }

  private completeIntro() {
    if (this.finished) return;
    this.finished = true;
    this.tweens.killAll();

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.game.events.emit(INTRO_COMPLETE_EVENT);
    });
    this.cameras.main.fadeOut(400, 0, 0, 0);
  }

  private layoutAll() {
    const { width, height } = this.scale;
    this.layout.cx = width / 2;
    this.layout.cy = height / 2;

    this.bg.setPosition(width / 2, height / 2);
    const bgScale = Math.max(width / this.bg.width, height / this.bg.height);
    this.bg.setScale(bgScale);

    const ref = Math.min(width, height);
    this.layout.envelopeScale = Phaser.Math.Clamp((ref * 0.55) / this.envelopeClosed.height, 0.5, 1.35);
    this.layout.letterReadScale = Phaser.Math.Clamp((ref * 0.72) / this.letter.height, 0.45, 1.25);
    this.layout.ringRadius = Phaser.Math.Clamp(ref * 0.048, 26, 44);

    this.envelopeClosed.setPosition(this.layout.cx, this.layout.cy);
    this.envelopeOpen.setPosition(this.layout.cx, this.layout.cy);
    this.envelopeClosed.setScale(this.layout.envelopeScale);
    this.envelopeOpen.setScale(this.layout.envelopeScale);

    this.layoutHintPosition();

    if (this.phase === 'envelope' && this.envelopeClosed.visible) {
      this.setupEnvelopeHitArea();
      if (this.hintRing.visible) this.startRingBreathe();
    }

    this.skipBtn.setPosition(width - 48, 36);
    if (this.phase === 'done' || this.startBtn.visible) {
      this.layoutStartButton();
      if (this.phase === 'done') {
        this.bindStartButtonInput();
      }
    }
  }

  private makeTextButton(
    label: string,
    w: number,
    h: number,
    onClick: () => void,
    primary = false,
  ): { container: Phaser.GameObjects.Container; hitZone: Phaser.GameObjects.Zone } {
    const g = this.add.graphics();
    if (primary) {
      g.fillStyle(0x3a3a36, 0.92);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1.5, 0x6a6a64, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    } else {
      g.fillStyle(0x1a1a18, 0.55);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
      g.lineStyle(1, 0x5a5a54, 0.8);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    }

    const text = this.add
      .text(0, 0, label, {
        fontFamily: FONT,
        fontSize: primary ? '16px' : '13px',
        color: primary ? '#e8e4dc' : '#9a9890',
      })
      .setOrigin(0.5);

    const hitZone = this.add.zone(0, 0, w, h);
    const btn = this.add.container(0, 0, [g, text, hitZone]);
    btn.setSize(w, h);
    this.bindInvisibleHitZone(hitZone, onClick);
    btn.on('pointerover', () => btn.setAlpha(Math.min(1, btn.alpha + 0.12)));
    btn.on('pointerout', () => btn.setAlpha(primary ? 1 : 0.85));
    return { container: btn, hitZone };
  }
}
