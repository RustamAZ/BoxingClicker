import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";

type ModalButton = {
  background: GameObjects.Rectangle;
  label: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
};

export class InfiniteModeModal {
  private static readonly depth = 1140;
  private static readonly buttonDepth = 1004;
  private static readonly openButtonX = 82;
  private static readonly openButtonY = 524;
  private static readonly openButtonSize = 96;
  private static readonly openButtonHoverSize = 106;
  private static readonly panelWidth = 560;
  private static readonly panelHeight = 340;

  private readonly openButtonBackground: GameObjects.Rectangle;
  private readonly openButtonIcon: GameObjects.Text;
  private readonly openButtonLabel: GameObjects.Text;
  private readonly openButtonHitArea: GameObjects.Rectangle;
  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly panelBlocker: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly description: GameObjects.Text;
  private readonly rewardHint: GameObjects.Text;
  private readonly startButton: ModalButton;
  private readonly closeButton: ModalButton;
  private readonly unsubscribeLanguageChange: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly profile: PlayerProfile,
    private readonly onStart: () => void,
  ) {
    this.openButtonBackground = this.scene.add
      .rectangle(
        InfiniteModeModal.openButtonX,
        InfiniteModeModal.openButtonY,
        InfiniteModeModal.openButtonSize,
        InfiniteModeModal.openButtonSize,
        0x2f243a,
        0.95,
      )
      .setDepth(InfiniteModeModal.buttonDepth)
      .setStrokeStyle(3, 0xd6b04a, 0.9);
    this.openButtonIcon = this.scene.add
      .text(
        InfiniteModeModal.openButtonX,
        InfiniteModeModal.openButtonY - 8,
        "\u221E",
        {
          fontFamily: "Hardpixel",
          fontSize: 48,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 6,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.buttonDepth + 1);
    this.openButtonLabel = this.scene.add
      .text(
        InfiniteModeModal.openButtonX,
        InfiniteModeModal.openButtonY + 31,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 16,
          color: "#f5e38f",
          stroke: "#1f1f1f",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.buttonDepth + 1);
    this.openButtonHitArea = this.scene.add
      .rectangle(
        InfiniteModeModal.openButtonX,
        InfiniteModeModal.openButtonY,
        InfiniteModeModal.openButtonSize,
        InfiniteModeModal.openButtonSize,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.buttonDepth + 2)
      .setInteractive({ useHandCursor: true });

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(InfiniteModeModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .rectangle(
        centerX,
        centerY,
        InfiniteModeModal.panelWidth,
        InfiniteModeModal.panelHeight,
        0x262626,
        0.96,
      )
      .setDepth(InfiniteModeModal.depth + 1)
      .setStrokeStyle(4, 0xd6b04a, 0.95)
      .setVisible(false);
    this.panelBlocker = this.scene.add
      .rectangle(
        centerX,
        centerY,
        InfiniteModeModal.panelWidth,
        InfiniteModeModal.panelHeight,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 2)
      .setInteractive()
      .setVisible(false);
    this.title = this.scene.add
      .text(centerX, centerY - 112, "", {
        fontFamily: "Hardpixel",
        fontSize: 32,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.description = this.scene.add
      .text(centerX, centerY - 42, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: InfiniteModeModal.panelWidth - 88,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.rewardHint = this.scene.add
      .text(centerX, centerY + 42, "", {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#f5e38f",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: InfiniteModeModal.panelWidth - 88,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.startButton = this.createButton(centerX + 132, centerY + 120, () => {
      this.close();
      this.onStart();
    });
    this.closeButton = this.createButton(centerX - 132, centerY + 120, () => {
      this.close();
    });

    this.openButtonHitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    this.openButtonHitArea.on("pointerover", () => {
      this.setOpenButtonSize(InfiniteModeModal.openButtonHoverSize);
    });
    this.openButtonHitArea.on("pointerout", () => {
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
    });
    this.overlay.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.close();
    });
    this.panelBlocker.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
      },
    );

    this.scene.input.keyboard?.on("keydown-ESC", this.handleEsc, this);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.scene.input.keyboard?.off("keydown-ESC", this.handleEsc, this);
      this.unsubscribeLanguageChange();
    });

    this.refresh();
  }

  setButtonVisible(visible: boolean) {
    this.openButtonBackground.setVisible(visible);
    this.openButtonIcon.setVisible(visible);
    this.openButtonLabel.setVisible(visible);
    this.openButtonHitArea.setVisible(visible);

    if (visible) {
      this.openButtonHitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButtonHitArea.disableInteractive();
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
    }
  }

  open() {
    if (this.pauseController.isPaused) {
      return;
    }

    this.pauseController.pause("infinite-mode");
    this.refresh();
    this.setVisible(true);
  }

  close() {
    if (!this.pauseController.has("infinite-mode")) {
      return;
    }

    this.pauseController.resume("infinite-mode");
    this.setVisible(false);
  }

  private createButton(x: number, y: number, onClick: () => void): ModalButton {
    const background = this.scene.add
      .rectangle(x, y, 190, 58, 0x3a2a43, 0.98)
      .setDepth(InfiniteModeModal.depth + 4)
      .setStrokeStyle(3, 0xd6b04a, 0.92)
      .setVisible(false);
    const label = this.scene.add
      .text(x, y, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 5)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(x, y, 190, 58, 0x000000, 0)
      .setDepth(InfiniteModeModal.depth + 6)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    hitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        UiSoundPlayer.playClick(this.scene);
        onClick();
      },
    );
    hitArea.on("pointerover", () => {
      background.setScale(1.05);
      label.setScale(1.05);
    });
    hitArea.on("pointerout", () => {
      background.setScale(1);
      label.setScale(1);
    });

    return {
      background,
      label,
      hitArea,
    };
  }

  private refresh() {
    this.openButtonLabel.setText(languageController.t("infinite.button"));
    this.closeButton.label.setText(languageController.t("infinite.close"));
    this.startButton.label.setText(languageController.t("infinite.start"));

    if (this.profile.hasCompletedCampaign()) {
      this.title.setText(languageController.t("infinite.unlockedTitle"));
      this.description.setText(
        languageController.t("infinite.unlockedDescription"),
      );
      this.rewardHint.setText(languageController.t("infinite.lockedRewards"));
      this.setButtonState(this.startButton, this.panel.visible);
      return;
    }

    this.title.setText(languageController.t("infinite.lockedTitle"));
    this.description.setText(
      languageController.t("infinite.lockedDescription"),
    );
    this.rewardHint.setText(languageController.t("infinite.lockedRewards"));
    this.setButtonState(this.startButton, false);
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.panelBlocker.setVisible(visible);
    this.title.setVisible(visible);
    this.description.setVisible(visible);
    this.rewardHint.setVisible(visible);
    this.setButtonState(this.closeButton, visible);
    this.setButtonState(
      this.startButton,
      visible && this.profile.hasCompletedCampaign(),
    );

    if (visible) {
      this.overlay.setInteractive();
      this.panelBlocker.setInteractive();
    } else {
      this.overlay.disableInteractive();
      this.panelBlocker.disableInteractive();
    }
  }

  private setButtonState(button: ModalButton, visible: boolean) {
    button.background.setVisible(visible);
    button.label.setVisible(visible);
    button.hitArea.setVisible(visible);

    if (visible) {
      button.hitArea.setInteractive({ useHandCursor: true });
    } else {
      button.hitArea.disableInteractive();
      button.background.setScale(1);
      button.label.setScale(1);
    }
  }

  private setOpenButtonSize(size: number) {
    this.openButtonBackground.setDisplaySize(size, size);
    this.openButtonHitArea.setDisplaySize(size, size);
  }

  private handleEsc() {
    if (!this.pauseController.has("infinite-mode")) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.close();
  }
}
