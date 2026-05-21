import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { LootReward } from "../entities/LootCase/rewards/LootReward";

type LootCaseButton = {
  background: GameObjects.Rectangle;
  label: GameObjects.Text;
};

type LootCaseModalShowConfig = {
  reward: LootReward;
  rewardsCount: number;
  canRollExtra: boolean;
  onContinue: () => void;
  onExtra: () => void;
};

export class LootCaseModal {
  private static readonly depth = 1300;
  private static readonly rollDurationMs = 1200;
  private static readonly buttonWidth = 176;
  private static readonly buttonHeight = 48;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly loaderText: GameObjects.Text;
  private readonly rewardSlot: GameObjects.Rectangle;
  private readonly rewardIcon: GameObjects.Image;
  private readonly rewardTitle: GameObjects.Text;
  private readonly rewardDescription: GameObjects.Text;
  private readonly continueButton: LootCaseButton;
  private readonly extraButton: LootCaseButton;
  private rollTimer?: Phaser.Time.TimerEvent;
  private onContinue?: () => void;
  private onExtra?: () => void;
  private isRolling = false;

  constructor(private readonly scene: Scene) {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(LootCaseModal.depth)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .rectangle(centerX, centerY, 500, 360, 0x1d1d1d, 0.98)
      .setDepth(LootCaseModal.depth + 1)
      .setStrokeStyle(2, 0xffd05a, 0.72)
      .setVisible(false);

    this.title = this.scene.add
      .text(centerX, centerY - 136, "Loot Case", {
        fontFamily: "Hardpixel",
        fontSize: 32,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 2)
      .setVisible(false);

    this.loaderText = this.scene.add
      .text(centerX, centerY - 82, "", {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffd05a",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 2)
      .setVisible(false);

    this.rewardSlot = this.scene.add
      .rectangle(centerX, centerY - 8, 96, 96, 0xffffff, 0.96)
      .setDepth(LootCaseModal.depth + 2)
      .setStrokeStyle(2, 0xffffff, 0.72)
      .setVisible(false);

    this.rewardIcon = this.scene.add
      .image(centerX, centerY - 8, "loot-case-placeholder-icon")
      .setDisplaySize(64, 64)
      .setDepth(LootCaseModal.depth + 3)
      .setVisible(false);

    this.rewardTitle = this.scene.add
      .text(centerX, centerY + 68, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 2)
      .setVisible(false);

    this.rewardDescription = this.scene.add
      .text(centerX, centerY + 98, "", {
        fontFamily: "Hardpixel",
        fontSize: 17,
        color: "#d2d2d2",
        stroke: "#1f1f1f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 2)
      .setVisible(false);

    this.continueButton = this.createButton(
      centerX - 102,
      centerY + 154,
      "Продолжить",
      () => this.handleContinue(),
    );
    this.extraButton = this.createButton(
      centerX + 102,
      centerY + 154,
      "Еще",
      () => this.handleExtra(),
    );

    this.hide();
  }

  show(config: LootCaseModalShowConfig) {
    this.onContinue = config.onContinue;
    this.onExtra = config.onExtra;
    this.setVisible(true);
    this.roll(config);
  }

  roll(config: LootCaseModalShowConfig) {
    this.onContinue = config.onContinue;
    this.onExtra = config.onExtra;
    this.isRolling = true;
    this.clearRollTimer();
    this.setReward(config.reward, config.rewardsCount);
    this.loaderText.setText("Rolling...");
    this.loaderText.setVisible(true);
    this.setRewardVisible(false);
    this.setButtonsVisible(false, false);

    this.rollTimer = this.scene.time.delayedCall(
      LootCaseModal.rollDurationMs,
      () => {
        this.isRolling = false;
        this.rollTimer = undefined;
        this.loaderText.setText("");
        this.loaderText.setVisible(false);
        this.setRewardVisible(true);
        this.setButtonsVisible(true, config.canRollExtra);
      },
    );
  }

  hide() {
    this.onContinue = undefined;
    this.onExtra = undefined;
    this.isRolling = false;
    this.clearRollTimer();
    this.setVisible(false);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
  ): LootCaseButton {
    const background = this.scene.add
      .rectangle(
        x,
        y,
        LootCaseModal.buttonWidth,
        LootCaseModal.buttonHeight,
        0x2d2d2d,
        0.95,
      )
      .setDepth(LootCaseModal.depth + 2)
      .setStrokeStyle(2, 0xffffff, 0.45)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 3)
      .setVisible(false);

    background.on("pointerdown", () => {
      if (this.isRolling) {
        return;
      }

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

  private setReward(reward: LootReward, rewardsCount: number) {
    this.rewardSlot.setFillStyle(reward.getRarityColor(), 0.96);
    this.rewardIcon.setTexture(reward.getIconTextureKey());
    this.rewardTitle.setText(`${reward.getTitle()} x${rewardsCount}`);
    this.rewardDescription.setText(reward.getDescription());
  }

  private handleContinue() {
    this.onContinue?.();
  }

  private handleExtra() {
    this.onExtra?.();
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.loaderText.setVisible(false);
    this.setRewardVisible(false);

    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
      this.setButtonsVisible(false, false);
    }
  }

  private setButtonsVisible(showContinue: boolean, showExtra: boolean) {
    this.setButtonVisible(this.continueButton, showContinue);
    this.setButtonVisible(this.extraButton, showExtra);
  }

  private setRewardVisible(visible: boolean) {
    this.rewardSlot.setVisible(visible);
    this.rewardIcon.setVisible(visible);
    this.rewardTitle.setVisible(visible);
    this.rewardDescription.setVisible(visible);
  }

  private setButtonVisible(button: LootCaseButton, visible: boolean) {
    button.background.setVisible(visible);
    button.label.setVisible(visible);

    if (visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private clearRollTimer() {
    this.rollTimer?.remove();
    this.rollTimer = undefined;
  }
}
