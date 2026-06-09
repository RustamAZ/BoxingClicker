import { GameObjects, Scene } from "phaser";
import type { Wallet } from "../Wallet/Wallet";

export type EmeraldContainerConfig = {
  x: number;
  y: number;
};

export class EmeraldContainer {
  private static readonly iconTextureKey = "money-icon";
  private static readonly iconPath = "assets/images/ui/icons/emerald.png";
  private static readonly takeSoundKey = "take-emerald";
  private static readonly takeSoundPath = "assets/audio/ui/takeEmerald.mp3";
  private static readonly iconDisplayWidth = 44;
  private static readonly iconDisplayHeight = 56;
  private static readonly depth = 902;
  private static readonly textOffsetX = 58;
  private static readonly iconShakeOffsetX = 5;
  private static readonly iconShakeDurationMs = 32;
  private static readonly iconShakeRepeat = 4;
  private static readonly iconPulseScale = 1.12;
  private static readonly iconPulseDurationMs = 120;

  private readonly icon: GameObjects.Image;
  private readonly text: GameObjects.Text;
  private readonly originX: number;
  private readonly originY: number;
  private readonly iconBaseScaleX: number;
  private readonly iconBaseScaleY: number;

  static preload(scene: Scene) {
    scene.load.image(EmeraldContainer.iconTextureKey, EmeraldContainer.iconPath);
    scene.load.audio(EmeraldContainer.takeSoundKey, EmeraldContainer.takeSoundPath);
  }

  constructor(
    private readonly scene: Scene,
    private readonly wallet: Wallet,
    config: EmeraldContainerConfig,
  ) {
    this.originX = config.x;
    this.originY = config.y;
    this.icon = scene.add
      .image(config.x, config.y, EmeraldContainer.iconTextureKey)
      .setOrigin(0, 0.5)
      .setDisplaySize(
        EmeraldContainer.iconDisplayWidth,
        EmeraldContainer.iconDisplayHeight,
      )
      .setDepth(EmeraldContainer.depth);
    this.iconBaseScaleX = this.icon.scaleX;
    this.iconBaseScaleY = this.icon.scaleY;
    this.text = scene.add
      .text(config.x + EmeraldContainer.textOffsetX, config.y, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#7dff76",
        stroke: "#123b12",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(EmeraldContainer.depth + 1);

    this.update();
  }

  add(amount: number) {
    this.wallet.deposit(amount);
    this.update();
    this.scene.sound.play(EmeraldContainer.takeSoundKey, {
      volume: 0.8,
    });
    this.playIconReceiveFeedback();
  }

  update() {
    this.text.setText(String(this.wallet.getBalance()));
  }

  getTargetPoint() {
    return {
      x: this.originX + EmeraldContainer.iconDisplayWidth / 2,
      y: this.originY,
    };
  }

  private playIconReceiveFeedback() {
    this.scene.tweens.killTweensOf(this.icon);
    this.resetIconTransform();

    this.scene.tweens.add({
      targets: this.icon,
      x: this.originX + EmeraldContainer.iconShakeOffsetX,
      duration: EmeraldContainer.iconShakeDurationMs,
      yoyo: true,
      repeat: EmeraldContainer.iconShakeRepeat,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.resetIconPosition();
      },
    });

    this.scene.tweens.add({
      targets: this.icon,
      scaleX: this.iconBaseScaleX * EmeraldContainer.iconPulseScale,
      scaleY: this.iconBaseScaleY * EmeraldContainer.iconPulseScale,
      duration: EmeraldContainer.iconPulseDurationMs,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.resetIconScale();
      },
    });
  }

  private resetIconPosition() {
    this.icon.setPosition(this.originX, this.originY);
  }

  private resetIconScale() {
    this.icon.setScale(this.iconBaseScaleX, this.iconBaseScaleY);
  }

  private resetIconTransform() {
    this.resetIconPosition();
    this.resetIconScale();
  }
}
