import Phaser from 'phaser';

/** 极轻量环境动效：蒸汽、慢速车辆、窗口微光 */
export class ParkAmbientMotion {
  private tweens: Phaser.Tweens.Tween[] = [];

  constructor(private scene: Phaser.Scene) {
    this.spawnSteam(520, 280);
    this.spawnSteam(920, 340);
    this.spawnSteam(680, 520);
    this.spawnSteam(1100, 460);
    this.spawnTruck(180, 780, 1180, 28000);
    this.spawnTruck(240, 640, 1050, 36000);
    this.spawnWindowFlicker(760, 420, 48, 32);
    this.spawnWindowFlicker(980, 310, 36, 24);
  }

  destroy() {
    for (const t of this.tweens) t.stop();
    this.tweens = [];
  }

  private trackTween(tween: Phaser.Tweens.Tween) {
    this.tweens.push(tween);
    return tween;
  }

  private spawnSteam(x: number, y: number) {
    const puff = this.scene.add
      .circle(x, y, 6, 0xd8cfb5, 0.14)
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.trackTween(
      this.scene.tweens.add({
        targets: puff,
        y: y - 28,
        alpha: { from: 0.18, to: 0 },
        scale: { from: 0.8, to: 1.6 },
        duration: 3200 + Math.random() * 800,
        repeat: -1,
        yoyo: false,
        onRepeat: () => {
          puff.setPosition(x + Phaser.Math.Between(-4, 4), y);
          puff.setAlpha(0.16);
          puff.setScale(0.8);
        },
      }),
    );
  }

  private spawnTruck(startX: number, y: number, endX: number, duration: number) {
    const truck = this.scene.add
      .rectangle(startX, y, 22, 10, 0x6b5840, 0.5)
      .setDepth(4)
      .setStrokeStyle(1, 0xb99a5a, 0.35);

    this.trackTween(
      this.scene.tweens.add({
        targets: truck,
        x: endX,
        duration,
        repeat: -1,
        onRepeat: () => truck.setX(startX),
      }),
    );
  }

  private spawnWindowFlicker(x: number, y: number, w: number, h: number) {
    const glow = this.scene.add
      .rectangle(x, y, w, h, 0xe5c97b, 0.035)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.trackTween(
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.025, to: 0.08 },
        duration: 1600 + Math.random() * 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      }),
    );
  }
}
