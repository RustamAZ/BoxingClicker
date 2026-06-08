import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type {
  DailyRewardClaimResult,
  DailyRewardController,
} from "../daily/DailyRewardController";
import {
  dailyRewardsConfig,
  type DailyRewardConfig,
} from "../configs/dailyRewards";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";

type DailyRewardOpenButton = {
  icon: GameObjects.Image;
  hitArea: GameObjects.Rectangle;
};

type DailyRewardSlot = {
  background: GameObjects.Image;
  dayLabel: GameObjects.Text;
  icon: GameObjects.Image;
  amount: GameObjects.Text;
  status: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
};

export class DailyRewardModal {
  private static readonly depth = 1140;
  private static readonly buttonDepth = 1001;
  private static readonly openButtonX = 900;
  private static readonly openButtonY = 68;
  private static readonly openButtonSize = 100;
  private static readonly openButtonIconSize = 100;
  private static readonly openButtonIconHoverSize = 105;
  private static readonly openButtonIconTextureKey = "daily-reward-open-icon";
  private static readonly openButtonIconPath =
    "assets/images/ui/daily-rewards/daily-reward-icon.png";
  private static readonly panelTextureKey = "daily-reward-panel";
  private static readonly panelPath =
    "assets/images/ui/daily-rewards/panel.png";
  private static readonly cardActiveTextureKey = "daily-reward-card-active";
  private static readonly cardActivePath =
    "assets/images/ui/daily-rewards/card-active.png";
  private static readonly cardLockedTextureKey = "daily-reward-card-locked";
  private static readonly cardLockedPath =
    "assets/images/ui/daily-rewards/card-locked.png";
  private static readonly cardFinalTextureKey = "daily-reward-card-final";
  private static readonly cardFinalPath =
    "assets/images/ui/daily-rewards/final-card.png";
  private static readonly buttonTextureKey = "daily-reward-claim-button";
  private static readonly buttonPath =
    "assets/images/ui/infinity-tower/reward-button-open.png";
  private static readonly emeraldIconTextureKey = "daily-reward-emerald-icon";
  private static readonly emeraldIconPath = "assets/images/ui/icons/emerald.png";
  private static readonly panelWidth = 820;
  private static readonly panelHeight = 600;
  private static readonly slotWidth = 136;
  private static readonly slotHeight = 168;
  private static readonly slotPositions = [
    { offsetX: -200, offsetY: -60 },
    { offsetX: -65, offsetY: -60 },
    { offsetX: 70, offsetY: -60 },
    { offsetX: 205, offsetY: -60 },
    { offsetX: -140, offsetY: 105 },
    { offsetX: -5, offsetY: 105 },
    { offsetX: 145, offsetY: 105 },
  ];
  private static readonly cardTitleOffsetY = -65;
  private static readonly cardIconOffsetY = -12;
  private static readonly cardAmountOffsetY = 28;
  private static readonly cardStatusOffsetY = 55;
  private static readonly finalCardTitleOffsetY = -60;
  private static readonly finalCardIconOffsetY = -5;
  private static readonly finalCardAmountOffsetY = 28;
  private static readonly finalCardStatusOffsetY = 47;
  private static readonly cardButtonWidth = 150;
  private static readonly cardButtonHeight = 80;
  private static readonly closeHitOffsetX = 260;
  private static readonly closeHitOffsetY = -190;
  private static readonly closeHitWidth = 70;
  private static readonly closeHitHeight = 70;
  private static readonly actionLockDurationMs = 220;

  static preload(scene: Scene) {
    scene.load.image(
      DailyRewardModal.openButtonIconTextureKey,
      DailyRewardModal.openButtonIconPath,
    );
  }

  private readonly openButton: DailyRewardOpenButton;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private title?: GameObjects.Text;
  private hint?: GameObjects.Text;
  private slots: DailyRewardSlot[] = [];
  private closeHitArea?: GameObjects.Rectangle;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;
  private isActionLocked = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;
  private unsubscribeLanguageChange?: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly controller: DailyRewardController,
    private readonly onClaim?: (result: DailyRewardClaimResult) => void,
  ) {
    this.openButton = this.createOpenButton();
    this.scene.input.keyboard?.on("keydown-ESC", this.handleEsc, this);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.scene.input.keyboard?.off("keydown-ESC", this.handleEsc, this);
      this.unsubscribeLanguageChange?.();
    });
  }

  setButtonVisible(visible: boolean) {
    this.openButton.icon.setVisible(visible);
    this.openButton.hitArea.setVisible(visible);

    if (visible) {
      this.openButton.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButton.hitArea.disableInteractive();
      this.openButton.icon.setDisplaySize(
        DailyRewardModal.openButtonIconSize,
        DailyRewardModal.openButtonIconSize,
      );
    }
  }

  open() {
    if (this.pauseController.isPaused || this.isLoadingAssets) {
      return;
    }

    if (this.isAssetsLoaded || DailyRewardModal.areAssetsLoaded(this.scene)) {
      this.isAssetsLoaded = true;
      this.ensureCreated();
      this.show();
      return;
    }

    this.isLoadingAssets = true;
    DailyRewardModal.loadAssets(this.scene, () => {
      this.isLoadingAssets = false;
      this.isAssetsLoaded = true;
      this.ensureCreated();
      this.show();
    });
  }

  close() {
    if (!this.pauseController.has("daily-reward")) {
      return;
    }

    this.pauseController.resume("daily-reward");
    this.setVisible(false);
    this.clearUnlockActionTimer();
    this.isActionLocked = false;
  }

  hasAvailableReward() {
    return this.controller.canClaimToday();
  }

  private show() {
    this.pauseController.pause("daily-reward");
    this.refresh();
    this.setVisible(true);
    this.isActionLocked = true;
    this.setClaimButtonInteractive(false);
    this.unlockActionTimer = this.scene.time.delayedCall(
      DailyRewardModal.actionLockDurationMs,
      () => {
        this.isActionLocked = false;
        this.unlockActionTimer = undefined;
        this.setClaimButtonInteractive(true);
      },
    );
  }

  private ensureCreated() {
    if (this.panel) {
      return;
    }

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(DailyRewardModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, DailyRewardModal.panelTextureKey)
      .setDisplaySize(
        DailyRewardModal.panelWidth,
        DailyRewardModal.panelHeight,
      )
      .setDepth(DailyRewardModal.depth + 1)
      .setVisible(false);
    this.title = this.scene.add
      .text(centerX, centerY - 215, languageController.t("daily.title"), {
        fontFamily: "Hardpixel",
        fontSize: 27,
        color: "#ffffff",
        stroke: "#191919",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 2)
      .setVisible(false);
    this.hint = this.scene.add
      .text(centerX, centerY - 164, "", {
        fontFamily: "Hardpixel",
        fontSize: 16,
        color: "#ffe96b",
        stroke: "#151515",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: 610,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 2)
      .setVisible(false);
    this.slots = this.controller.getRewards().map((_, index) => {
      return this.createSlot(index, centerX, centerY);
    });
    this.closeHitArea = this.scene.add
      .rectangle(
        centerX + DailyRewardModal.closeHitOffsetX,
        centerY + DailyRewardModal.closeHitOffsetY,
        DailyRewardModal.closeHitWidth,
        DailyRewardModal.closeHitHeight,
        0x000000,
        0,
      )
      .setDepth(DailyRewardModal.depth + 20)
      .setVisible(false);
    this.closeHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        UiSoundPlayer.playClick(this.scene);
        this.close();
      },
    );
    this.overlay.on(
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
  }

  private createOpenButton(): DailyRewardOpenButton {
    const icon = this.scene.add
      .image(
        DailyRewardModal.openButtonX,
        DailyRewardModal.openButtonY,
        DailyRewardModal.openButtonIconTextureKey,
      )
      .setDisplaySize(
        DailyRewardModal.openButtonIconSize,
        DailyRewardModal.openButtonIconSize,
      )
      .setDepth(DailyRewardModal.buttonDepth + 1)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        DailyRewardModal.openButtonX,
        DailyRewardModal.openButtonY,
        DailyRewardModal.openButtonSize,
        DailyRewardModal.openButtonSize,
        0x000000,
        0,
      )
      .setDepth(DailyRewardModal.buttonDepth + 2)
      .setVisible(false);

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    hitArea.on("pointerover", () => {
      icon.setDisplaySize(
        DailyRewardModal.openButtonIconHoverSize,
        DailyRewardModal.openButtonIconHoverSize,
      );
    });
    hitArea.on("pointerout", () => {
      icon.setDisplaySize(
        DailyRewardModal.openButtonIconSize,
        DailyRewardModal.openButtonIconSize,
      );
    });

    return { icon, hitArea };
  }

  private createSlot(index: number, centerX: number, centerY: number) {
    const { x, y } = DailyRewardModal.getSlotPosition(index, centerX, centerY);
    const background = this.scene.add
      .image(
        x,
        y,
        DailyRewardModal.cardLockedTextureKey,
      )
      .setDisplaySize(DailyRewardModal.slotWidth, DailyRewardModal.slotHeight)
      .setDepth(DailyRewardModal.depth + 2)
      .setVisible(false);
    const dayLabel = this.scene.add
      .text(x, y + DailyRewardModal.cardTitleOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 15,
        color: "#ffffff",
        stroke: "#151515",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 3)
      .setVisible(false);
    const icon = this.scene.add
      .image(
        x,
        y + DailyRewardModal.cardIconOffsetY,
        DailyRewardModal.emeraldIconTextureKey,
      )
      .setDisplaySize(48, 48)
      .setDepth(DailyRewardModal.depth + 3)
      .setVisible(false);
    const amount = this.scene.add
      .text(x, y + DailyRewardModal.cardAmountOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#151515",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 3)
      .setVisible(false);
    const status = this.scene.add
      .text(x + 3, y + DailyRewardModal.cardStatusOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 12,
        color: "#cfcfcf",
        stroke: "#151515",
        strokeThickness: 3,
        align: "center",
        wordWrap: {
          width: DailyRewardModal.cardButtonWidth - 12,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 3)
      .setVisible(false);
    const button = this.scene.add
      .image(
        x,
        y + DailyRewardModal.cardStatusOffsetY,
        DailyRewardModal.buttonTextureKey,
      )
      .setDisplaySize(
        DailyRewardModal.cardButtonWidth,
        DailyRewardModal.cardButtonHeight,
      )
      .setDepth(DailyRewardModal.depth + 3)
      .setVisible(false);
    const buttonLabel = this.scene.add
      .text(x, y + DailyRewardModal.cardStatusOffsetY, "", {
        fontFamily: "Hardpixel",
        fontSize: 14,
        color: "#ffffff",
        stroke: "#151515",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(DailyRewardModal.depth + 4)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        x,
        y + DailyRewardModal.cardStatusOffsetY,
        DailyRewardModal.cardButtonWidth,
        DailyRewardModal.cardButtonHeight,
        0x000000,
        0,
      )
      .setDepth(DailyRewardModal.depth + 5)
      .setVisible(false);

    hitArea.on("pointerdown", () => {
      if (this.isActionLocked) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      this.handleClaim(index);
    });

    return {
      background,
      dayLabel,
      icon,
      amount,
      status,
      button,
      buttonLabel,
      hitArea,
    };
  }

  private static getSlotPosition(index: number, centerX: number, centerY: number) {
    const position = DailyRewardModal.slotPositions[index];

    return {
      x: centerX + (position?.offsetX ?? 0),
      y: centerY + (position?.offsetY ?? 0),
    };
  }

  private static getRewardIconTextureKey(reward: DailyRewardConfig) {
    return reward.type === "gloves"
      ? reward.iconTextureKey
      : DailyRewardModal.emeraldIconTextureKey;
  }

  private static getRewardIconSize(reward: DailyRewardConfig) {
    return reward.type === "gloves" ? 82 : 48;
  }

  private static setSlotElementPositions(
    slot: DailyRewardSlot,
    isFinalReward: boolean,
  ) {
    const x = slot.background.x;
    const y = slot.background.y;

    slot.dayLabel.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardTitleOffsetY
          : DailyRewardModal.cardTitleOffsetY),
    );
    slot.icon.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardIconOffsetY
          : DailyRewardModal.cardIconOffsetY),
    );
    slot.amount.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardAmountOffsetY
          : DailyRewardModal.cardAmountOffsetY),
    );
    slot.status.setPosition(
      x + 3,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardStatusOffsetY
          : DailyRewardModal.cardStatusOffsetY),
    );
    slot.button.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardStatusOffsetY
          : DailyRewardModal.cardStatusOffsetY),
    );
    slot.buttonLabel.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardStatusOffsetY
          : DailyRewardModal.cardStatusOffsetY),
    );
    slot.hitArea.setPosition(
      x,
      y +
        (isFinalReward
          ? DailyRewardModal.finalCardStatusOffsetY
          : DailyRewardModal.cardStatusOffsetY),
    );
  }

  private handleClaim(index: number) {
    if (index !== this.controller.getNextRewardIndex()) {
      return;
    }

    const result = this.controller.claimToday();

    if (!result) {
      return;
    }

    this.onClaim?.(result);
    this.refresh();
  }

  private refresh() {
    if (!this.panel) {
      return;
    }

    const nextRewardIndex = this.controller.getNextRewardIndex();
    const canClaimToday = this.controller.canClaimToday();
    const isPanelVisible = this.panel.visible;

    this.title?.setText(languageController.t("daily.title"));
    this.hint?.setText(
      nextRewardIndex < 0
        ? languageController.t("daily.done")
        : canClaimToday
          ? languageController.t("daily.available")
          : languageController.t("daily.todayClaimed"),
    );
    this.controller.getRewards().forEach((reward, index) => {
      const slot = this.slots[index];

      if (!slot) {
        return;
      }

      const claimed = this.isRewardClaimed(index);
      const isNext = index === nextRewardIndex;
      const isFinalReward = index === this.controller.getRewards().length - 1;
      const canClaimSlot = isNext && canClaimToday;
      const daysUntil = Math.max(
        1,
        index - nextRewardIndex + (canClaimToday ? 0 : 1),
      );

      slot.background.setTexture(
        canClaimSlot
          ? DailyRewardModal.cardActiveTextureKey
          : isFinalReward
            ? DailyRewardModal.cardFinalTextureKey
            : DailyRewardModal.cardLockedTextureKey,
      );
      DailyRewardModal.setSlotElementPositions(slot, isFinalReward);
      slot.dayLabel.setText(
        languageController.t("daily.day", { day: index + 1 }),
      );
      slot.icon.setTexture(DailyRewardModal.getRewardIconTextureKey(reward));
      slot.icon.setDisplaySize(
        DailyRewardModal.getRewardIconSize(reward),
        DailyRewardModal.getRewardIconSize(reward),
      );
      slot.amount.setText(
        reward.type === "emerald" ? String(reward.amount) : "",
      );
      slot.status.setText(
        claimed
          ? languageController.t("daily.claimed")
          : canClaimSlot
            ? ""
            : daysUntil === 1
              ? languageController.t("daily.tomorrow")
              : languageController.t("daily.afterDays", { days: daysUntil }),
      );
      slot.status.setColor("#cfcfcf");
      slot.button.setVisible(canClaimSlot && isPanelVisible);
      slot.buttonLabel.setText(languageController.t("daily.claim"));
      slot.buttonLabel.setVisible(canClaimSlot && isPanelVisible);
      slot.hitArea.setVisible(canClaimSlot && isPanelVisible);
    });
    this.setClaimButtonInteractive(!this.isActionLocked);
  }

  private isRewardClaimed(index: number) {
    return this.controller.hasClaimedReward(index);
  }

  private setClaimButtonInteractive(interactive: boolean) {
    const canClaim = this.controller.canClaimToday();

    this.slots.forEach((slot) => {
      if (interactive && canClaim && slot.hitArea.visible) {
        slot.hitArea.setInteractive({ useHandCursor: true });
      } else {
        slot.hitArea.disableInteractive();
      }
    });
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.title?.setVisible(visible);
    this.hint?.setVisible(visible);
    this.slots.forEach((slot) => {
      slot.background.setVisible(visible);
      slot.dayLabel.setVisible(visible);
      slot.icon.setVisible(visible);
      slot.amount.setVisible(visible);
      slot.status.setVisible(visible);
      slot.button.setVisible(false);
      slot.buttonLabel.setVisible(false);
      slot.hitArea.setVisible(false);
      slot.hitArea.disableInteractive();
    });
    this.closeHitArea?.setVisible(visible);

    if (visible) {
      this.closeHitArea?.setInteractive({ useHandCursor: true });
      this.refresh();
    } else {
      this.closeHitArea?.disableInteractive();
    }
  }

  private readonly handleEsc = () => {
    this.close();
  };

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove(false);
    this.unlockActionTimer = undefined;
  }

  private static areAssetsLoaded(scene: Scene) {
    return [
      DailyRewardModal.panelTextureKey,
      DailyRewardModal.cardActiveTextureKey,
      DailyRewardModal.cardLockedTextureKey,
      DailyRewardModal.cardFinalTextureKey,
      DailyRewardModal.buttonTextureKey,
      DailyRewardModal.emeraldIconTextureKey,
      ...DailyRewardModal.getRewardAssetTextureKeys(),
    ].every((textureKey) => scene.textures.exists(textureKey));
  }

  private static loadAssets(scene: Scene, onComplete: () => void) {
    const loader = scene.load;

    if (!scene.textures.exists(DailyRewardModal.panelTextureKey)) {
      loader.image(DailyRewardModal.panelTextureKey, DailyRewardModal.panelPath);
    }

    if (!scene.textures.exists(DailyRewardModal.cardActiveTextureKey)) {
      loader.image(
        DailyRewardModal.cardActiveTextureKey,
        DailyRewardModal.cardActivePath,
      );
    }

    if (!scene.textures.exists(DailyRewardModal.cardLockedTextureKey)) {
      loader.image(
        DailyRewardModal.cardLockedTextureKey,
        DailyRewardModal.cardLockedPath,
      );
    }

    if (!scene.textures.exists(DailyRewardModal.cardFinalTextureKey)) {
      loader.image(
        DailyRewardModal.cardFinalTextureKey,
        DailyRewardModal.cardFinalPath,
      );
    }

    if (!scene.textures.exists(DailyRewardModal.buttonTextureKey)) {
      loader.image(
        DailyRewardModal.buttonTextureKey,
        DailyRewardModal.buttonPath,
      );
    }

    if (!scene.textures.exists(DailyRewardModal.emeraldIconTextureKey)) {
      loader.image(
        DailyRewardModal.emeraldIconTextureKey,
        DailyRewardModal.emeraldIconPath,
      );
    }

    DailyRewardModal.getRewardAssets().forEach((asset) => {
      if (!scene.textures.exists(asset.textureKey)) {
        loader.image(asset.textureKey, asset.texturePath);
      }
    });

    loader.once("complete", onComplete);
    loader.start();
  }

  private static getRewardAssetTextureKeys() {
    return DailyRewardModal.getRewardAssets().map((asset) => asset.textureKey);
  }

  private static getRewardAssets() {
    return DailyRewardModal.getDailyRewards()
      .filter((reward) => reward.type === "gloves")
      .map((reward) => ({
        textureKey: reward.iconTextureKey,
        texturePath: reward.iconTexturePath,
      }));
  }

  private static getDailyRewards() {
    return dailyRewardsConfig;
  }
}
