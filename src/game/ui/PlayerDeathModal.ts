import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";

type PlayerDeathButton = {
  background: GameObjects.Image;
  label: GameObjects.Text;
  priceIcon: GameObjects.Image;
  enabled: boolean;
  showPriceIcon: boolean;
};

export type PlayerDeathContinueOption = {
  label: string;
  isEnabled: boolean;
  showEmeraldPrice?: boolean;
  onContinue: () => void;
};

export class PlayerDeathModal {
  private static readonly depth = 1400;
  private static readonly actionLockDurationMs = 300;
  private static readonly soundKey = "player-death";
  private static readonly soundPath = "assets/audio/ui/player-death.mp3";
  private static readonly deathSoundVolume = 0.8;
  private static readonly backgroundTextureKey = "player-death-menu-background";
  private static readonly backgroundPath =
    "assets/images/ui/buttons/settings-menu-bg.png";
  private static readonly buttonTextureKey = "player-death-button-background";
  private static readonly buttonPath =
    "assets/images/ui/buttons/settings-button-bg.png";
  private static readonly emeraldIconTextureKey = "player-death-emerald-icon";
  private static readonly emeraldIconPath = "assets/images/ui/icons/emerald.png";
  private static readonly priceIconSize = 22;
  private static readonly priceIconGap = 8;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Image;
  private readonly title: GameObjects.Text;
  private readonly subtitle: GameObjects.Text;
  private readonly restartButton: PlayerDeathButton;
  private readonly continueButton: PlayerDeathButton;
  private readonly unsubscribeLanguageChange: () => void;
  private onContinue?: () => void;
  private isActionLocked = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;

  static preload(scene: Scene) {
    scene.load.audio(PlayerDeathModal.soundKey, PlayerDeathModal.soundPath);
    scene.load.image(
      PlayerDeathModal.backgroundTextureKey,
      PlayerDeathModal.backgroundPath,
    );
    scene.load.image(
      PlayerDeathModal.buttonTextureKey,
      PlayerDeathModal.buttonPath,
    );
    scene.load.image(
      PlayerDeathModal.emeraldIconTextureKey,
      PlayerDeathModal.emeraldIconPath,
    );
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly onRestart: () => void,
  ) {
    this.overlay = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.68)
      .setDepth(PlayerDeathModal.depth)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .image(512, 384, PlayerDeathModal.backgroundTextureKey)
      .setDepth(PlayerDeathModal.depth + 1)
      .setVisible(false);

    this.title = this.scene.add
      .text(512, 286, languageController.t("death.title"), {
        fontFamily: "Hardpixel",
        fontSize: 34,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PlayerDeathModal.depth + 2)
      .setVisible(false);

    this.subtitle = this.scene.add
      .text(512, 324, languageController.t("death.subtitle"), {
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
      languageController.t("death.restart"),
      () => this.restart(),
    );
    this.continueButton = this.createButton(
      512,
      456,
      280,
      48,
      languageController.t("death.continue"),
      () => this.onContinue?.(),
    );

    this.hide();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
  }

  get isShown() {
    return this.pauseController.has("player-death");
  }

  show(continueOption: PlayerDeathContinueOption) {
    if (this.isShown) {
      this.setContinueOption(continueOption);
      return;
    }

    this.setContinueOption(continueOption);
    this.pauseController.pause("player-death");
    this.playDeathSound();
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
    this.onContinue = undefined;
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
      .image(x, y, PlayerDeathModal.buttonTextureKey)
      .setDisplaySize(width, height)
      .setDepth(PlayerDeathModal.depth + 2)
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
    const priceIcon = this.scene.add
      .image(x, y, PlayerDeathModal.emeraldIconTextureKey)
      .setDisplaySize(
        PlayerDeathModal.priceIconSize,
        PlayerDeathModal.priceIconSize,
      )
      .setDepth(PlayerDeathModal.depth + 3)
      .setVisible(false);

    const button: PlayerDeathButton = {
      background,
      label,
      priceIcon,
      enabled: true,
      showPriceIcon: false,
    };

    background.on("pointerdown", () => {
      if (this.isActionLocked || !button.enabled) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      onClick();
    });
    background.on("pointerover", () => {
      if (!button.enabled) {
        return;
      }

      background.setTint(0xb8b8b8);
    });
    background.on("pointerout", () => {
      this.applyButtonFill(button);
    });

    return button;
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.subtitle.setVisible(visible);
    this.setButtonVisible(this.restartButton, visible);
    this.setButtonVisible(this.continueButton, visible);

    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
    }
  }

  private setButtonVisible(button: PlayerDeathButton, visible: boolean) {
    button.background.setVisible(visible);
    button.label.setVisible(visible);
    button.priceIcon.setVisible(visible && button.showPriceIcon);

    if (visible && button.enabled) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private setButtonsInteractive(isInteractive: boolean) {
    this.setButtonInteractive(this.restartButton, isInteractive);
    this.setButtonInteractive(this.continueButton, isInteractive);
  }

  private setButtonInteractive(
    button: PlayerDeathButton,
    isInteractive: boolean,
  ) {
    if (isInteractive && button.enabled && button.background.visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove();
    this.unlockActionTimer = undefined;
  }

  private playDeathSound() {
    this.scene.sound.play(PlayerDeathModal.soundKey, {
      volume: PlayerDeathModal.deathSoundVolume,
    });
  }

  private setContinueOption(option: PlayerDeathContinueOption) {
    this.onContinue = option.onContinue;
    this.continueButton.label.setText(option.label);
    this.continueButton.enabled = option.isEnabled;
    this.continueButton.showPriceIcon = Boolean(option.showEmeraldPrice);
    this.layoutButton(this.continueButton);
    this.continueButton.label.setAlpha(option.isEnabled ? 1 : 0.55);
    this.applyButtonFill(this.continueButton);
  }

  private refreshTexts() {
    this.title.setText(languageController.t("death.title"));
    this.subtitle.setText(languageController.t("death.subtitle"));
    this.restartButton.label.setText(languageController.t("death.restart"));
  }

  private layoutButton(button: PlayerDeathButton) {
    if (!button.showPriceIcon) {
      button.label.setX(button.background.x);
      button.priceIcon.setVisible(false);
      return;
    }

    const iconX =
      button.background.x +
      button.label.width / 2 +
      PlayerDeathModal.priceIconGap +
      PlayerDeathModal.priceIconSize / 2;

    button.priceIcon
      .setPosition(iconX, button.background.y)
      .setVisible(button.background.visible);
  }

  private applyButtonFill(button: PlayerDeathButton) {
    button.background.clearTint();
    button.background.setAlpha(button.enabled ? 1 : 0.62);
    button.priceIcon.setAlpha(button.enabled ? 1 : 0.55);
  }
}
