import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type {
  LootReward,
  LootRewardRarity,
} from "../entities/LootCase/rewards/LootReward";
import { languageController } from "../localization/LanguageController";

type LootCaseButton = {
  background: GameObjects.Image;
  label: GameObjects.Text;
};

type LootCaseButtonAction = "continue" | "extra";

type LootCaseGlowLayer = "large" | "medium" | "small";

type LootCaseGlowAsset = {
  key: string;
  path: string;
};

type LootCaseModalShowConfig = {
  reward: LootReward;
  previousRewards: LootReward[];
  rewardsCount: number;
  rollerIconTextureKeys: string[];
  canRollExtra: boolean;
  onContinue: () => void;
  onExtra: () => void;
};

export class LootCaseModal {
  private static readonly depth = 1300;
  private static readonly lootContainerTextureKey = "loot-case-container";
  private static readonly lootContainerPath =
    "assets/images/loot-case/loot-container.png";
  private static readonly glowTextureSets: Record<
    LootRewardRarity,
    Record<LootCaseGlowLayer, LootCaseGlowAsset>
  > = {
    s: {
      large: {
        key: "loot-case-glow-iron-large",
        path: "assets/images/loot-case/iron-bright-l.png",
      },
      medium: {
        key: "loot-case-glow-iron-medium",
        path: "assets/images/loot-case/iron-bright-m.png",
      },
      small: {
        key: "loot-case-glow-iron-small",
        path: "assets/images/loot-case/iron-bright-s.png",
      },
    },
    m: {
      large: {
        key: "loot-case-glow-golden-large",
        path: "assets/images/loot-case/golden-bright-l.png",
      },
      medium: {
        key: "loot-case-glow-golden-medium",
        path: "assets/images/loot-case/golden-bright-m.png",
      },
      small: {
        key: "loot-case-glow-golden-small",
        path: "assets/images/loot-case/golden-bright-s.png",
      },
    },
    l: {
      large: {
        key: "loot-case-glow-diamond-large",
        path: "assets/images/loot-case/diamonds-l-bright.png",
      },
      medium: {
        key: "loot-case-glow-diamond-medium",
        path: "assets/images/loot-case/diamonds-m-bright.png",
      },
      small: {
        key: "loot-case-glow-diamond-small",
        path: "assets/images/loot-case/diamonds-s-bright.png",
      },
    },
  };
  private static readonly goldenButtonTextureKey = "loot-case-golden-button";
  private static readonly goldenButtonPath =
    "assets/images/loot-case/buttons/golden-shop-button.png";
  private static readonly absidianButtonTextureKey = "loot-case-absidian-button";
  private static readonly absidianButtonPath =
    "assets/images/loot-case/buttons/absidian-shop-button.png";
  private static readonly openSoundKey = "loot-case-open-sound";
  private static readonly openSoundPath = "assets/audio/ui/loot-case-open.mp3";
  private static readonly openSoundVolume = 3;
  private static readonly rollSteps = 17;
  private static readonly minRollStepDelayMs = 45;
  private static readonly maxRollStepDelayMs = 210;
  private static readonly rollingIconSize = 128;
  private static readonly rewardSlotSize = 128;
  private static readonly rewardIconSize = 128;
  private static readonly lootContainerSize = 560;
  private static readonly glowSize = 980;
  private static readonly modalOffsetY = -70;
  private static readonly lootContainerOffsetY = 54;
  private static readonly rewardIconStartOffsetY = 72;
  private static readonly rewardIconTargetOffsetY = -92;
  private static readonly buttonOffsetX = 220;
  private static readonly buttonOffsetY = 350;
  private static readonly buttonWidth = 380;
  private static readonly buttonHeight = 96;
  private static readonly rewardTextOffsetY = 188;
  private static readonly rewardTextStackOffsetY = -32;
  private static readonly rewardTextLineHeight = 26;

  private readonly overlay: GameObjects.Rectangle;
  private readonly loaderText: GameObjects.Text;
  private readonly glowLarge: GameObjects.Image;
  private readonly glowMedium: GameObjects.Image;
  private readonly glowSmall: GameObjects.Image;
  private readonly lootContainer: GameObjects.Image;
  private readonly rewardSlot: GameObjects.Rectangle;
  private readonly rewardIcon: GameObjects.Image;
  private readonly previousRewardTitle: GameObjects.Text;
  private readonly rewardTitle: GameObjects.Text;
  private readonly rewardDescription: GameObjects.Text;
  private readonly continueButton: LootCaseButton;
  private readonly extraButton: LootCaseButton;
  private readonly unsubscribeLanguageChange: () => void;
  private rollTimer?: Phaser.Time.TimerEvent;
  private isGlowRotationActive = false;
  private onContinue?: () => void;
  private onExtra?: () => void;
  private isRolling = false;
  private isActionLocked = false;

  static preload(scene: Scene) {
    scene.load.image(
      LootCaseModal.lootContainerTextureKey,
      LootCaseModal.lootContainerPath,
    );
    Object.values(LootCaseModal.glowTextureSets).forEach((glowTextureSet) => {
      Object.values(glowTextureSet).forEach((glowAsset) => {
        scene.load.image(glowAsset.key, glowAsset.path);
      });
    });
    scene.load.image(
      LootCaseModal.goldenButtonTextureKey,
      LootCaseModal.goldenButtonPath,
    );
    scene.load.image(
      LootCaseModal.absidianButtonTextureKey,
      LootCaseModal.absidianButtonPath,
    );
    scene.load.audio(LootCaseModal.openSoundKey, LootCaseModal.openSoundPath);
  }

  constructor(private readonly scene: Scene) {
    const centerX = this.scene.scale.width / 2;
    const screenCenterY = this.scene.scale.height / 2;
    const centerY = screenCenterY + LootCaseModal.modalOffsetY;
    const lootContainerY = centerY + LootCaseModal.lootContainerOffsetY;
    const rewardTargetY = centerY + LootCaseModal.rewardIconTargetOffsetY;
    const defaultGlowTextures = LootCaseModal.glowTextureSets.l;

    this.overlay = this.scene.add
      .rectangle(centerX, screenCenterY, 1024, 768, 0x000000, 0.62)
      .setDepth(LootCaseModal.depth)
      .setInteractive()
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
      .setDepth(LootCaseModal.depth + 8)
      .setVisible(false);

    this.glowLarge = this.scene.add
      .image(
        centerX,
        lootContainerY,
        defaultGlowTextures.large.key,
      )
      .setDisplaySize(LootCaseModal.glowSize, LootCaseModal.glowSize)
      .setDepth(LootCaseModal.depth + 2)
      .setVisible(false);

    this.glowMedium = this.scene.add
      .image(
        centerX,
        lootContainerY,
        defaultGlowTextures.medium.key,
      )
      .setDisplaySize(LootCaseModal.glowSize, LootCaseModal.glowSize)
      .setDepth(LootCaseModal.depth + 3)
      .setVisible(false);

    this.glowSmall = this.scene.add
      .image(
        centerX,
        lootContainerY,
        defaultGlowTextures.small.key,
      )
      .setDisplaySize(LootCaseModal.glowSize, LootCaseModal.glowSize)
      .setDepth(LootCaseModal.depth + 4)
      .setVisible(false);

    this.lootContainer = this.scene.add
      .image(centerX, lootContainerY, LootCaseModal.lootContainerTextureKey)
      .setDisplaySize(
        LootCaseModal.lootContainerSize,
        LootCaseModal.lootContainerSize,
      )
      .setDepth(LootCaseModal.depth + 5)
      .setVisible(false);

    this.rewardSlot = this.scene.add
      .rectangle(
        centerX,
        rewardTargetY,
        LootCaseModal.rewardSlotSize,
        LootCaseModal.rewardSlotSize,
        0x111111,
        0.18,
      )
      .setDepth(LootCaseModal.depth + 6)
      .setStrokeStyle(2, 0xffd05a, 0.45)
      .setVisible(false);

    this.rewardIcon = this.scene.add
      .image(centerX, rewardTargetY, "loot-case-placeholder-icon")
      .setDisplaySize(
        LootCaseModal.rewardIconSize,
        LootCaseModal.rewardIconSize,
      )
      .setDepth(LootCaseModal.depth + 7)
      .setVisible(false);

    this.previousRewardTitle = this.scene.add
      .text(centerX, centerY + LootCaseModal.rewardTextOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 12)
      .setVisible(false);

    this.rewardTitle = this.scene.add
      .text(centerX, centerY + LootCaseModal.rewardTextOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 12)
      .setVisible(false);

    this.rewardDescription = this.scene.add
      .text(
        centerX,
        centerY +
          LootCaseModal.rewardTextOffsetY +
          LootCaseModal.rewardTextLineHeight,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 17,
          color: "#d2d2d2",
          stroke: "#1f1f1f",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 12)
      .setVisible(false);

    this.continueButton = this.createButton(
      centerX - LootCaseModal.buttonOffsetX,
      centerY + LootCaseModal.buttonOffsetY,
      languageController.t("lootCase.continue"),
      "continue",
    );
    this.extraButton = this.createButton(
      centerX + LootCaseModal.buttonOffsetX,
      centerY + LootCaseModal.buttonOffsetY,
      languageController.t("lootCase.extra"),
      "extra",
    );
    this.hide();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
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
    this.setGlowTextures(config.reward.getRarity());
    this.resetRollVisuals();
    this.rewardSlot.setFillStyle(0x111111, 0.18);
    this.rewardSlot.setStrokeStyle(2, 0xffd05a, 0.45);
    this.setRollingRewardVisible(true);
    this.rewardTitle.setVisible(false);
    this.rewardDescription.setVisible(false);
    this.previousRewardTitle.setVisible(false);
    this.setButtonsVisible(false, false);
    this.playOpenSound();
    this.playRollStep(config, 0);
  }

  hide() {
    this.onContinue = undefined;
    this.onExtra = undefined;
    this.isRolling = false;
    this.isActionLocked = false;
    this.clearRollTimer();
    this.stopGlowRotation();
    this.setVisible(false);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    action: LootCaseButtonAction,
  ): LootCaseButton {
    const textureKey =
      action === "continue"
        ? LootCaseModal.goldenButtonTextureKey
        : LootCaseModal.absidianButtonTextureKey;
    const background = this.scene.add
      .image(x, y, textureKey)
      .setDisplaySize(LootCaseModal.buttonWidth, LootCaseModal.buttonHeight)
      .setDepth(LootCaseModal.depth + 9)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "Hardpixel",
        fontSize: 28,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LootCaseModal.depth + 10)
      .setVisible(false);

    background.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        LootCaseModal.stopPropagation(event);

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

      background.setDisplaySize(
        LootCaseModal.buttonWidth * 1.03,
        LootCaseModal.buttonHeight * 1.03,
      );
    });
    background.on("pointerout", () => {
      background.setDisplaySize(
        LootCaseModal.buttonWidth,
        LootCaseModal.buttonHeight,
      );
    });

    return {
      background,
      label,
    };
  }

  private setReward(config: LootCaseModalShowConfig) {
    const reward = config.reward;
    const previousReward =
      config.previousRewards[config.previousRewards.length - 1];
    const hasPreviousReward = Boolean(previousReward);
    const rewardTitleY =
      this.scene.scale.height / 2 +
      LootCaseModal.modalOffsetY +
      LootCaseModal.rewardTextOffsetY +
      (hasPreviousReward ? LootCaseModal.rewardTextStackOffsetY : 0) +
      (hasPreviousReward ? LootCaseModal.rewardTextLineHeight : 0);
    const rewardDescriptionY =
      rewardTitleY + LootCaseModal.rewardTextLineHeight;

    this.rewardSlot.setFillStyle(reward.getRarityColor(), 0.24);
    this.rewardIcon.setTexture(reward.getIconTextureKey());
    this.previousRewardTitle
      .setText(previousReward ? `${previousReward.getTitle()} x1` : "")
      .setY(rewardTitleY - LootCaseModal.rewardTextLineHeight);
    this.rewardTitle
      .setText(`${reward.getTitle()} x1`)
      .setY(rewardTitleY);
    this.rewardDescription.setText(reward.getDescription());
    this.rewardDescription.setY(rewardDescriptionY);
  }

  private refreshTexts() {
    this.continueButton.label.setText(languageController.t("lootCase.continue"));
    this.extraButton.label.setText(languageController.t("lootCase.extra"));
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

  private playOpenSound() {
    this.scene.sound.play(LootCaseModal.openSoundKey, {
      volume: LootCaseModal.openSoundVolume,
    });
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.loaderText.setVisible(false);
    this.setCaseVisible(visible);
    this.setRewardVisible(false);

    if (visible) {
      this.overlay.setInteractive();
      this.startGlowRotation();
    } else {
      this.overlay.disableInteractive();
      this.stopGlowRotation();
      this.setButtonsVisible(false, false);
    }
  }

  private setButtonsVisible(showContinue: boolean, showExtra: boolean) {
    this.setButtonVisible(this.continueButton, showContinue);
    this.setButtonVisible(this.extraButton, showExtra);
  }

  private setRewardVisible(visible: boolean) {
    this.rewardSlot.setVisible(false);
    this.rewardIcon.setVisible(visible);
    this.previousRewardTitle.setVisible(
      visible && this.previousRewardTitle.text.length > 0,
    );
    this.rewardTitle.setVisible(visible);
    this.rewardDescription.setVisible(visible);
  }

  private setRollingRewardVisible(visible: boolean) {
    this.rewardSlot.setVisible(false);
    this.rewardIcon.setVisible(visible);
  }

  private setCaseVisible(visible: boolean) {
    this.glowLarge.setVisible(visible);
    this.glowMedium.setVisible(visible);
    this.glowSmall.setVisible(visible);
    this.lootContainer.setVisible(visible);
  }

  private setGlowTextures(rarity: LootRewardRarity) {
    const glowTextures = LootCaseModal.glowTextureSets[rarity];

    this.glowLarge.setTexture(glowTextures.large.key);
    this.glowMedium.setTexture(glowTextures.medium.key);
    this.glowSmall.setTexture(glowTextures.small.key);
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

    this.rewardIcon
      .setTexture(iconTextureKey)
      .setScale(
        this.getRewardIconScale(iconTextureKey, LootCaseModal.rollingIconSize),
      )
      .setAlpha(1)
      .setY(
        this.getRewardIconRollY(
          step / Math.max(1, LootCaseModal.rollSteps - 1),
        ),
      )
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
    this.setReward(config);
    this.setRewardVisible(true);
    this.rewardIcon
      .setTexture(config.reward.getIconTextureKey())
      .setDisplaySize(
        LootCaseModal.rewardIconSize,
        LootCaseModal.rewardIconSize,
      )
      .setY(this.getRewardIconTargetY())
      .setDepth(LootCaseModal.depth + 7)
      .setAlpha(1)
      .setVisible(true);
    this.setButtonsVisible(true, config.canRollExtra);
  }

  private resetRollVisuals() {
    this.scene.tweens.killTweensOf([
      this.rewardIcon,
    ]);
    this.glowLarge.setAngle(0).setAlpha(0.85);
    this.glowMedium.setAngle(32).setAlpha(0.8);
    this.glowSmall.setAngle(-24).setAlpha(0.8);
    this.rewardIcon
      .setY(this.getRewardIconStartY())
      .setDepth(LootCaseModal.depth + 7);
  }

  private startGlowRotation() {
    if (this.isGlowRotationActive) {
      return;
    }

    this.isGlowRotationActive = true;
    this.scene.events.on("update", this.updateGlowRotation, this);
  }

  private stopGlowRotation() {
    if (!this.isGlowRotationActive) {
      return;
    }

    this.isGlowRotationActive = false;
    this.scene.events.off("update", this.updateGlowRotation, this);
  }

  private updateGlowRotation(_time: number, delta: number) {
    const deltaSeconds = delta / 1000;

    this.glowLarge.angle += 40 * deltaSeconds;
    this.glowMedium.angle -= 30 * deltaSeconds;
    this.glowSmall.angle += 22 * deltaSeconds;
  }

  private getRewardIconRollY(progress: number) {
    return (
      this.getRewardIconStartY() +
      (this.getRewardIconTargetY() - this.getRewardIconStartY()) *
        Math.min(1, Math.max(0, progress)) ** 0.85
    );
  }

  private getRewardIconStartY() {
    return (
      this.scene.scale.height / 2 +
      LootCaseModal.modalOffsetY +
      LootCaseModal.rewardIconStartOffsetY
    );
  }

  private getRewardIconTargetY() {
    return (
      this.scene.scale.height / 2 +
      LootCaseModal.modalOffsetY +
      LootCaseModal.rewardIconTargetOffsetY
    );
  }

  private getRewardIconScale(textureKey: string, targetSize: number) {
    const texture = this.scene.textures.get(textureKey);
    const source = texture.getSourceImage() as HTMLImageElement;
    const width = source.width || targetSize;
    const height = source.height || targetSize;

    return Math.min(targetSize / width, targetSize / height);
  }

  private static stopPropagation(event: Phaser.Types.Input.EventData) {
    try {
      event.stopPropagation();
    } catch {
      // Some mobile browsers throw when Phaser touches readonly event fields.
    }
  }
}
