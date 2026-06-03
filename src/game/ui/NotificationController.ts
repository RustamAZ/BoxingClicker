import { GameObjects, Scene } from "phaser";
import { languageController } from "../localization/LanguageController";

export type NotificationKey =
  | "notification.weaponUnlocked"
  | "notification.newReward";

export class NotificationController {
  private static readonly textureKey = "notification-panel";
  private static readonly texturePath =
    "assets/images/ui/notifications/notification-panel.png";
  private static readonly depth = 1500;
  private static readonly visibleDurationMs = 1800;
  private static readonly bottomOffsetY = 86;
  private static readonly hiddenOffsetY = 90;
  private static readonly slideInDurationMs = 220;
  private static readonly slideOutDurationMs = 220;

  private readonly background: GameObjects.Image;
  private readonly text: GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;
  private currentKey?: NotificationKey;

  static preload(scene: Scene) {
    scene.load.image(
      NotificationController.textureKey,
      NotificationController.texturePath,
    );
  }

  constructor(private readonly scene: Scene) {
    const centerX = this.scene.scale.width / 2;
    const hiddenY = this.getHiddenY();

    this.background = this.scene.add
      .image(centerX, hiddenY, NotificationController.textureKey)
      .setDepth(NotificationController.depth)
      .setVisible(false);
    this.text = this.scene.add
      .text(centerX, hiddenY, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(NotificationController.depth + 1)
      .setVisible(false);
  }

  show(key: NotificationKey) {
    this.currentKey = key;
    this.timer?.remove();
    this.text.setText(languageController.t(key));
    this.background
      .setVisible(true)
      .setAlpha(1)
      .setY(this.getHiddenY());
    this.text
      .setVisible(true)
      .setAlpha(1)
      .setY(this.getHiddenY());

    this.scene.tweens.killTweensOf([this.background, this.text]);
    this.scene.tweens.add({
      targets: [this.background, this.text],
      y: this.getVisibleY(),
      duration: NotificationController.slideInDurationMs,
      ease: "Back.easeOut",
    });

    this.timer = this.scene.time.delayedCall(
      NotificationController.visibleDurationMs,
      () => {
        this.scene.tweens.add({
          targets: [this.background, this.text],
          y: this.getHiddenY(),
          duration: NotificationController.slideOutDurationMs,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.background.setVisible(false);
            this.text.setVisible(false);
            this.timer = undefined;
          },
        });
      },
    );
  }

  refresh() {
    if (!this.currentKey || !this.text.visible) {
      return;
    }

    this.text.setText(languageController.t(this.currentKey));
  }

  destroy() {
    this.timer?.remove();
    this.scene.tweens.killTweensOf([this.background, this.text]);
    this.background.destroy();
    this.text.destroy();
  }

  private getVisibleY() {
    return this.scene.scale.height - NotificationController.bottomOffsetY;
  }

  private getHiddenY() {
    return this.getVisibleY() + NotificationController.hiddenOffsetY;
  }
}
