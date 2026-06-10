import { GameObjects, Scene } from "phaser";
import { languageController } from "../localization/LanguageController";

export class LobbyAdCountdownOverlay {
  private static readonly depth = 2400;
  private static readonly panelWidth = 260;
  private static readonly panelHeight = 78;
  private static readonly panelX = 844;
  private static readonly panelY = 180;
  private static readonly seconds = 3;

  private readonly blocker: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly text: GameObjects.Text;
  private timer?: Phaser.Time.TimerEvent;
  private remainingSeconds = LobbyAdCountdownOverlay.seconds;

  constructor(private readonly scene: Scene) {
    this.blocker = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.35)
      .setDepth(LobbyAdCountdownOverlay.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .rectangle(
        LobbyAdCountdownOverlay.panelX,
        LobbyAdCountdownOverlay.panelY,
        LobbyAdCountdownOverlay.panelWidth,
        LobbyAdCountdownOverlay.panelHeight,
        0x151515,
        0.88,
      )
      .setStrokeStyle(3, 0xffd34f, 0.95)
      .setDepth(LobbyAdCountdownOverlay.depth + 1)
      .setVisible(false);
    this.text = this.scene.add
      .text(LobbyAdCountdownOverlay.panelX, LobbyAdCountdownOverlay.panelY, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#151515",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LobbyAdCountdownOverlay.depth + 2)
      .setVisible(false);
  }

  show(onComplete: () => void) {
    this.hide();
    this.remainingSeconds = LobbyAdCountdownOverlay.seconds;
    this.setVisible(true);
    this.refreshText();
    this.scheduleNextTick(onComplete);
  }

  hide() {
    this.timer?.remove(false);
    this.timer = undefined;
    this.setVisible(false);
  }

  destroy() {
    this.hide();
    this.blocker.destroy();
    this.panel.destroy();
    this.text.destroy();
  }

  private scheduleNextTick(onComplete: () => void) {
    this.timer = this.scene.time.delayedCall(1000, () => {
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        this.hide();
        onComplete();
        return;
      }

      this.refreshText();
      this.scheduleNextTick(onComplete);
    });
  }

  private refreshText() {
    this.text.setText(
      languageController.t("ads.countdown", {
        seconds: this.remainingSeconds,
      }),
    );
  }

  private setVisible(visible: boolean) {
    this.blocker.setVisible(visible);
    this.panel.setVisible(visible);
    this.text.setVisible(visible);
  }
}
