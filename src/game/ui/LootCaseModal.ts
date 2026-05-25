import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { LootReward } from "../entities/LootCase/rewards/LootReward";

type LootCaseButton = {
  background: GameObjects.Rectangle;
  label: GameObjects.Text;
};

type LootCaseButtonAction = "continue" | "extra";

type LootCaseModalShowConfig = {
  reward: LootReward;
  rewardsCount: number;
  rollerIconTextureKeys: string[];
  canRollExtra: boolean;
  onContinue: () => void;
  onExtra: () => void;
};

export class LootCaseModal {
  private static readonly depth = 1300;
  private static readonly rollSteps = 17;
  private static readonly minRollStepDelayMs = 45;
  private static readonly maxRollStepDelayMs = 210;
  private static readonly rollingIconSize = 72;
  private static readonly rewardIconSize = 94;
  private static readonly rewardIconStartSize = 28;
  private static readonly buttonWidth = 190;
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
  private isActionLocked = false;

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
      .setDisplaySize(
        LootCaseModal.rewardIconSize,
        LootCaseModal.rewardIconSize,
      )
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
      centerX - 108,
      centerY + 154,
      "Получить",
      "continue",
    );
    this.extraButton = this.createButton(
      centerX + 108,
      centerY + 154,
      "Получить еще",
      "extra",
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
    this.isActionLocked = false;
    this.clearRollTimer();
    this.loaderText.setText("");
    this.loaderText.setVisible(false);
    this.rewardSlot.setFillStyle(0x555555, 0.96);
    this.rewardSlot.setStrokeStyle(2, 0xffffff, 0.48);
    this.setRollingRewardVisible(true);
    this.rewardTitle.setVisible(false);
    this.rewardDescription.setVisible(false);
    this.setButtonsVisible(false, false);
    this.playRollStep(config, 0);
  }

  hide() {
    this.onContinue = undefined;
    this.onExtra = undefined;
    this.isRolling = false;
    this.isActionLocked = false;
    this.clearRollTimer();
    this.setVisible(false);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    action: LootCaseButtonAction,
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

    background.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();

        if (this.isRolling || this.isActionLocked) {
          return;
        }

        UiSoundPlayer.playClick(this.scene);
        this.handleButtonAction(action);
      },
    );
    background.on("pointerover", () => {
      if (this.isRolling || this.isActionLocked) {
        return;
      }

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
    if (this.isActionLocked) {
      return;
    }

    this.isActionLocked = true;
    this.onContinue?.();
  }

  private handleExtra() {
    if (this.isActionLocked) {
      return;
    }

    this.isActionLocked = true;
    this.onExtra?.();
  }

  private handleButtonAction(action: LootCaseButtonAction) {
    if (action === "continue") {
      this.handleContinue();
      return;
    }

    this.handleExtra();
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

  private setRollingRewardVisible(visible: boolean) {
    this.rewardSlot.setVisible(visible);
    this.rewardIcon.setVisible(visible);
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

  private playRollStep(config: LootCaseModalShowConfig, step: number) {
    if (step >= LootCaseModal.rollSteps) {
      this.finishRoll(config);
      return;
    }

    const visualIconKeys = config.rollerIconTextureKeys;
    const iconTextureKey =
      visualIconKeys[Math.floor(Math.random() * visualIconKeys.length)] ??
      config.reward.getIconTextureKey();
    const targetScale = this.getRewardIconScale(
      iconTextureKey,
      LootCaseModal.rewardIconSize,
    );

    this.scene.tweens.killTweensOf(this.rewardIcon);
    this.rewardIcon
      .setTexture(iconTextureKey)
      .setScale(
        this.getRewardIconScale(iconTextureKey, LootCaseModal.rollingIconSize),
      )
      .setAlpha(1)
      .setVisible(true);

    this.scene.tweens.add({
      targets: this.rewardIcon,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 38,
      ease: "Quad.easeOut",
    });

    const progress = step / Math.max(1, LootCaseModal.rollSteps - 1);
    const delay =
      LootCaseModal.minRollStepDelayMs +
      (LootCaseModal.maxRollStepDelayMs - LootCaseModal.minRollStepDelayMs) *
        progress ** 1.75;

    this.rollTimer = this.scene.time.delayedCall(delay, () => {
      this.playRollStep(config, step + 1);
    });
  }

  private finishRoll(config: LootCaseModalShowConfig) {
    this.isRolling = false;
    this.rollTimer = undefined;
    this.scene.tweens.killTweensOf(this.rewardIcon);
    this.setReward(config.reward, config.rewardsCount);
    this.setRewardVisible(true);
    this.rewardIcon
      .setTexture(config.reward.getIconTextureKey())
      .setDisplaySize(
        LootCaseModal.rewardIconSize,
        LootCaseModal.rewardIconSize,
      )
      .setDepth(LootCaseModal.depth + 3)
      .setAlpha(1)
      .setVisible(true);
    this.setButtonsVisible(true, config.canRollExtra);
  }

  private getRewardIconScale(textureKey: string, targetSize: number) {
    const texture = this.scene.textures.get(textureKey);
    const source = texture.getSourceImage() as HTMLImageElement;
    const width = source.width || targetSize;
    const height = source.height || targetSize;

    return Math.min(targetSize / width, targetSize / height);
  }
}
