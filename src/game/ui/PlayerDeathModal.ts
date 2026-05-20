import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { PauseController } from "../state/PauseController";

type PlayerDeathButton = {
  background: GameObjects.Rectangle;
  label: GameObjects.Text;
};

export class PlayerDeathModal {
  private static readonly depth = 1400;
  private static readonly actionLockDurationMs = 300;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly subtitle: GameObjects.Text;
  private readonly restartButton: PlayerDeathButton;
  private readonly continueForAdButton: PlayerDeathButton;
  private isActionLocked = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly onRestart: () => void,
    private readonly onRestoreFromAd: () => void,
  ) {
    this.overlay = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.68)
      .setDepth(PlayerDeathModal.depth)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .rectangle(512, 384, 430, 310, 0x1b1b1b, 0.98)
      .setDepth(PlayerDeathModal.depth + 1)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setVisible(false);

    this.title = this.scene.add
      .text(512, 286, "Ты проиграл", {
        fontFamily: "Hardpixel",
        fontSize: 34,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PlayerDeathModal.depth + 2)
      .setVisible(false);

    this.subtitle = this.scene.add
      .text(512, 324, "Попробуй еще раз", {
        fontFamily: "Hardpixel",
        fontSize: 19,
        color: "#d2d2d2",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PlayerDeathModal.depth + 2)
      .setVisible(false);

    this.restartButton = this.createButton(
      512,
      390,
      280,
      48,
      "Начать заново",
      () => this.restart(),
    );
    this.continueForAdButton = this.createButton(
      512,
      456,
      280,
      48,
      "Продолжить за рекламу",
      () => this.onRestoreFromAd(),
    );

    this.hide();
  }

  get isShown() {
    return this.pauseController.has("player-death");
  }

  show() {
    if (this.isShown) {
      return;
    }

    this.pauseController.pause("player-death");
    this.isActionLocked = true;
    this.clearUnlockActionTimer();
    this.setVisible(true);
    this.setButtonsInteractive(false);
    this.unlockActionTimer = this.scene.time.delayedCall(
      PlayerDeathModal.actionLockDurationMs,
      () => {
        this.isActionLocked = false;
        this.unlockActionTimer = undefined;
        this.setButtonsInteractive(true);
      },
    );
  }

  hide() {
    this.isActionLocked = false;
    this.clearUnlockActionTimer();
    this.setVisible(false);
  }

  private restart() {
    if (this.isActionLocked) {
      return;
    }

    this.pauseController.resume("player-death");
    this.onRestart();
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onClick: () => void,
  ): PlayerDeathButton {
    const background = this.scene.add
      .rectangle(x, y, width, height, 0x2d2d2d, 0.95)
      .setDepth(PlayerDeathModal.depth + 2)
      .setStrokeStyle(2, 0xffffff, 0.45)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "Hardpixel",
        fontSize: 19,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PlayerDeathModal.depth + 3);

    background.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      onClick();
    });
    background.on("pointerover", () => {
      background.setFillStyle(0x3a3a3a, 0.98);
    });
    background.on("pointerout", () => {
      background.setFillStyle(0x2d2d2d, 0.95);
    });

    return {
      background,
      label,
    };
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.subtitle.setVisible(visible);
    this.setButtonVisible(this.restartButton, visible);
    this.setButtonVisible(this.continueForAdButton, visible);

    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
    }
  }

  private setButtonVisible(button: PlayerDeathButton, visible: boolean) {
    button.background.setVisible(visible);
    button.label.setVisible(visible);

    if (visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private setButtonsInteractive(isInteractive: boolean) {
    this.setButtonInteractive(this.restartButton, isInteractive);
    this.setButtonInteractive(this.continueForAdButton, isInteractive);
  }

  private setButtonInteractive(
    button: PlayerDeathButton,
    isInteractive: boolean,
  ) {
    if (isInteractive && button.background.visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove();
    this.unlockActionTimer = undefined;
  }
}
