import { GameObjects, Scene } from "phaser";
import type { InfinityTowerRewardConfig } from "../configs/infinityTower";
import { getInfinityTowerConsumableConfig } from "../configs/infinityTowerConsumables";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import { languageController } from "../localization/LanguageController";
import { InfinityTowerRewardController } from "../progression/InfinityTowerRewardController";
import type { PauseController } from "../state/PauseController";
import { InfinityTowerRewardsScrollView } from "./InfinityTowerRewardsScrollView";
import { LoadingSpinner } from "./LoadingSpinner";

type InfinityTowerAssetConfig = {
  textureKey: string;
  texturePath: string;
};

type StartRewardButtonLayout = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type StartRewardSlotView = {
  slotX: number;
  slotY: number;
  title: GameObjects.Text;
  item: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  buttonBaseWidth: number;
  buttonBaseHeight: number;
};

type StartEmeraldRewardSlotView = {
  slotX: number;
  slotY: number;
  icon: GameObjects.Image;
  amountText: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  buttonBaseWidth: number;
  buttonBaseHeight: number;
};

type RewardDetailsView = {
  overlay: GameObjects.Rectangle;
  panel: GameObjects.Image;
  title: GameObjects.Text;
  icon: GameObjects.Image;
  amount: GameObjects.Text;
  description: GameObjects.Text;
  closeLabel: GameObjects.Text;
  closeHitArea: GameObjects.Rectangle;
};

export class InfiniteModeModal {
  private static readonly depth = 1140;
  private static readonly buttonDepth = 1004;
  private static readonly openButtonIconTextureKey = "infinite-tower-icon";
  private static readonly openButtonIconPath =
    "assets/images/ui/icons/infinite-tower.png";
  private static readonly panelTextureKey = "infinite-tower-modal-panel";
  private static readonly panelPath =
    "assets/images/ui/infinity-tower/tower-modal-panel.png";
  private static readonly lockedPanelTextureKey = "infinite-tower-locked-panel";
  private static readonly lockedPanelPath =
    "assets/images/ui/infinity-tower/tower-locked-panel.png";
  private static readonly rewardDetailsPanelTextureKey =
    "infinite-tower-reward-details-panel";
  private static readonly rewardDetailsPanelPath =
    "assets/images/ui/infinity-tower/reward-details-panel.png";
  private static readonly rewardButtonOpenTextureKey =
    "infinite-tower-reward-button-open";
  private static readonly rewardButtonOpenPath =
    "assets/images/ui/infinity-tower/reward-button-open.png";
  private static readonly rewardButtonLockedTextureKey =
    "infinite-tower-reward-button-locked";
  private static readonly rewardButtonLockedPath =
    "assets/images/ui/infinity-tower/reward-button-locked.png";
  private static readonly rewardButtonClaimedTextureKey =
    "infinite-tower-reward-button-claimed";
  private static readonly rewardButtonClaimedPath =
    "assets/images/ui/infinity-tower/reward-button-claimed.png";
  private static readonly bottomButtonTextureKey =
    "infinite-tower-bottom-button";
  private static readonly bottomButtonPath =
    "assets/images/ui/infinity-tower/fight-button.png";
  private static readonly emeraldIconTextureKey = "infinite-tower-emerald-icon";
  private static readonly emeraldIconPath =
    "assets/images/ui/icons/emerald.png";
  private static readonly rewiveIconTextureKey = "infinite-tower-rewive-icon";
  private static readonly rewiveIconPath =
    "assets/images/ui/icons/rewiveIcon.png";
  private static readonly startRewardIconTextureKey =
    "infinite-tower-golden-gloves-icon";
  private static readonly startRewardIconPath =
    "assets/images/ui/shop/items/golden-tower-weapon-icon.png";
  private static readonly openButtonX = 820;
  private static readonly openButtonY = 68;
  private static readonly openButtonSize = 96;
  private static readonly openButtonHoverSize = 106;
  private static readonly openButtonIconSize = 86;
  private static readonly openButtonIconHoverSize = 92;
  private static readonly openButtonIconPulseScale = 1.08;
  private static readonly openButtonIconPulseDurationMs = 520;
  private static readonly panelWidth = 900;
  private static readonly panelHeight = 675;
  private static readonly lockedPanelWidth = 640;
  private static readonly lockedPanelHeight = 480;
  private static readonly startRewardContentOffsetX = -20;
  // Left bottom start reward button, relative to the gloves card center.
  private static readonly startGlovesRewardClaimButtonLayout = {
    offsetX: 20,
    offsetY: 40,
    width: 250,
    height: 90,
  };
  private static readonly startGlovesRewardClaimedButtonLayout = {
    offsetX: 20,
    offsetY: 40,
    width: 190,
    height: 95,
  };
  // Right bottom start reward button, relative to the emerald card center.
  private static readonly startEmeraldRewardClaimButtonLayout = {
    offsetX: -20,
    offsetY: 34,
    width: 250,
    height: 90,
  };
  private static readonly startEmeraldRewardClaimedButtonLayout = {
    offsetX: -20,
    offsetY: 34,
    width: 190,
    height: 95,
  };
  private static readonly mainCloseHitOffsetX = 358;
  private static readonly mainCloseHitOffsetY = -310;
  private static readonly lockedCloseHitOffsetX = 150;
  private static readonly lockedCloseHitOffsetY = -112;
  private static readonly closeHitAreaSize = 76;
  private static readonly rewardDetailsCloseOffsetY = 170;
  private static readonly rewardDetailsCloseHitWidth = 220;
  private static readonly rewardDetailsCloseHitHeight = 58;
  private static readonly rewardDetailsIconSize = 92;
  private static readonly bottomCloseOffsetX = 0;
  private static readonly bottomCloseOffsetY = 314;
  private static readonly bottomButtonDisplayWidth = 300;
  private static readonly bottomButtonDisplayHeight = 90;
  private static readonly bottomCloseHitWidth = 260;
  private static readonly bottomCloseHitHeight = 82;
  private static readonly buttonHoverScale = 1.04;
  private static readonly startRewardLeftOffsetX = -190;
  private static readonly startRewardRightOffsetX = 190;
  private static readonly startRewardOffsetY = 236;
  private static readonly startEmeraldRewardId =
    "infinite-tower-start-emeralds";
  private static readonly startEmeraldRewardAmount = 350;
  // Reward scroll viewport position and size inside the modal panel.
  private static readonly rewardsScrollViewport = {
    offsetX: 0,
    offsetY: -30,
    width: 665,
    height: 440,
  };
  private static readonly startRewardItemId = "golden-tower-gloves";

  private readonly openButtonIcon: GameObjects.Image;
  private readonly openButtonHitArea: GameObjects.Rectangle;
  private readonly loaderSpinner: LoadingSpinner;
  private readonly rewardController: InfinityTowerRewardController;
  private readonly unsubscribeLanguageChange: () => void;
  private readonly openButtonIconBaseScaleX: number;
  private readonly openButtonIconBaseScaleY: number;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private panelBlocker?: GameObjects.Rectangle;
  private title?: GameObjects.Text;
  private subtitle?: GameObjects.Text;
  private bottomButton?: GameObjects.Image;
  private closeLabel?: GameObjects.Text;
  private closeHitArea?: GameObjects.Rectangle;
  private topCloseHitArea?: GameObjects.Rectangle;
  private lockedOverlay?: GameObjects.Rectangle;
  private lockedPanel?: GameObjects.Image;
  private lockedTitle?: GameObjects.Text;
  private lockedDescription?: GameObjects.Text;
  private lockedHint?: GameObjects.Text;
  private lockedCloseHitArea?: GameObjects.Rectangle;
  private startReward?: StartRewardSlotView;
  private startEmeraldReward?: StartEmeraldRewardSlotView;
  private rewardDetails?: RewardDetailsView;
  private rewardsScrollView?: InfinityTowerRewardsScrollView;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;
  private isOpenButtonEnabled = true;
  private isOpenButtonIconPulsing = false;

  static preload(scene: Scene) {
    scene.load.image(
      InfiniteModeModal.openButtonIconTextureKey,
      InfiniteModeModal.openButtonIconPath,
    );
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly profile: PlayerProfile,
    private readonly onStart: () => void,
    private readonly onClaimGlovesReward: (itemId: string) => void,
    private readonly onRewardsChanged?: () => void,
    private readonly onEmeraldRewardClaimed?: (
      amount: number,
      from: { x: number; y: number },
    ) => void,
  ) {
    this.openButtonIcon = this.scene.add
      .image(
        InfiniteModeModal.openButtonX,
        InfiniteModeModal.openButtonY,
        InfiniteModeModal.openButtonIconTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.openButtonIconSize,
        InfiniteModeModal.openButtonIconSize,
      )
      .setOrigin(0.5)
      .setDepth(InfiniteModeModal.buttonDepth + 1);
    this.openButtonIconBaseScaleX = this.openButtonIcon.scaleX;
    this.openButtonIconBaseScaleY = this.openButtonIcon.scaleY;
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
    this.loaderSpinner = new LoadingSpinner(
      this.scene,
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      InfiniteModeModal.depth + 30,
    );
    this.rewardController = new InfinityTowerRewardController(this.profile);

    this.openButtonHitArea.on("pointerdown", () => {
      if (!this.isOpenButtonEnabled) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    this.openButtonHitArea.on("pointerover", () => {
      if (!this.isOpenButtonEnabled) {
        return;
      }

      this.setOpenButtonSize(InfiniteModeModal.openButtonHoverSize);
      if (this.isOpenButtonIconPulsing) {
        return;
      }

      this.openButtonIcon.setDisplaySize(
        InfiniteModeModal.openButtonIconHoverSize,
        InfiniteModeModal.openButtonIconHoverSize,
      );
    });
    this.openButtonHitArea.on("pointerout", () => {
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
      if (this.isOpenButtonIconPulsing) {
        return;
      }

      this.openButtonIcon.setDisplaySize(
        InfiniteModeModal.openButtonIconSize,
        InfiniteModeModal.openButtonIconSize,
      );
    });
    this.scene.input.keyboard?.on("keydown-ESC", this.handleEsc, this);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.scene.input.keyboard?.off("keydown-ESC", this.handleEsc, this);
      this.unsubscribeLanguageChange();
      this.setOpenButtonIconPulsing(false);
      this.rewardsScrollView?.destroy();
      this.loaderSpinner.destroy();
    });
  }

  setButtonVisible(visible: boolean) {
    this.openButtonIcon.setVisible(visible);
    this.openButtonHitArea.setVisible(visible);

    if (visible && this.isOpenButtonEnabled) {
      this.openButtonHitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButtonHitArea.disableInteractive();
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
      this.openButtonIcon.setDisplaySize(
        InfiniteModeModal.openButtonIconSize,
        InfiniteModeModal.openButtonIconSize,
      );
    }

    this.updateOpenButtonPulse();
  }

  setButtonEnabled(enabled: boolean) {
    if (this.isOpenButtonEnabled === enabled) {
      return;
    }

    this.isOpenButtonEnabled = enabled;
    this.setButtonVisible(this.openButtonIcon.visible);
  }

  open() {
    if (this.pauseController.isPaused || this.isLoadingAssets) {
      return;
    }

    this.pauseController.pause("infinite-mode");

    if (
      !this.isAssetsLoaded &&
      !InfiniteModeModal.areAssetsLoaded(this.scene)
    ) {
      this.isLoadingAssets = true;
      this.loaderSpinner.show();
      InfiniteModeModal.loadAssets(this.scene, () => {
        this.isLoadingAssets = false;
        this.isAssetsLoaded = true;
        this.loaderSpinner.hide();
        this.ensureCreated();
        this.refresh();
        this.setVisible(true);
      });
      return;
    }

    this.isAssetsLoaded = true;
    this.ensureCreated();
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

  private ensureCreated() {
    if (this.panel) {
      return;
    }

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(InfiniteModeModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, InfiniteModeModal.panelTextureKey)
      .setDisplaySize(
        InfiniteModeModal.panelWidth,
        InfiniteModeModal.panelHeight,
      )
      .setDepth(InfiniteModeModal.depth + 1)
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
      .text(centerX, centerY - 310, "", {
        fontFamily: "Hardpixel",
        fontSize: 30,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.subtitle = this.scene.add
      .text(centerX, centerY - 270, "", {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffe85a",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.bottomButton = this.scene.add
      .image(
        centerX + InfiniteModeModal.bottomCloseOffsetX,
        centerY + InfiniteModeModal.bottomCloseOffsetY,
        InfiniteModeModal.bottomButtonTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.bottomButtonDisplayWidth,
        InfiniteModeModal.bottomButtonDisplayHeight,
      )
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    this.closeLabel = this.scene.add
      .text(
        centerX + InfiniteModeModal.bottomCloseOffsetX,
        centerY + InfiniteModeModal.bottomCloseOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 26,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    this.closeHitArea = this.scene.add
      .rectangle(
        centerX + InfiniteModeModal.bottomCloseOffsetX,
        centerY + InfiniteModeModal.bottomCloseOffsetY,
        InfiniteModeModal.bottomCloseHitWidth,
        InfiniteModeModal.bottomCloseHitHeight,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.topCloseHitArea = this.scene.add
      .rectangle(
        centerX + InfiniteModeModal.mainCloseHitOffsetX,
        centerY + InfiniteModeModal.mainCloseHitOffsetY,
        InfiniteModeModal.closeHitAreaSize,
        InfiniteModeModal.closeHitAreaSize,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 11)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.rewardsScrollView = new InfinityTowerRewardsScrollView({
      scene: this.scene,
      x: centerX + InfiniteModeModal.rewardsScrollViewport.offsetX,
      y: centerY + InfiniteModeModal.rewardsScrollViewport.offsetY,
      width: InfiniteModeModal.rewardsScrollViewport.width,
      height: InfiniteModeModal.rewardsScrollViewport.height,
      depth: InfiniteModeModal.depth + 3,
      profile: this.profile,
      rewardController: this.rewardController,
      onClaimGlovesReward: this.onClaimGlovesReward,
      onShowRewardDetails: (reward) => this.showRewardDetailsForReward(reward),
      onRewardsChanged: this.onRewardsChanged,
      onEmeraldRewardClaimed: this.onEmeraldRewardClaimed,
    });
    this.startReward = this.createStartRewardSlot(
      centerX + InfiniteModeModal.startRewardLeftOffsetX,
      centerY + InfiniteModeModal.startRewardOffsetY,
    );
    this.startEmeraldReward = this.createStartEmeraldRewardSlot(
      centerX + InfiniteModeModal.startRewardRightOffsetX,
      centerY + InfiniteModeModal.startRewardOffsetY,
    );
    this.createLockedPanel(centerX, centerY);
    this.createRewardDetails(centerX, centerY);

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
    this.closeHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => this.handleBottomButtonClick(event),
    );
    this.closeHitArea.on("pointerover", () => {
      if (this.profile.isInfinityTowerAvailable()) {
        this.setBottomButtonHovered(true);
      }
    });
    this.closeHitArea.on("pointerout", () => {
      this.setBottomButtonHovered(false);
    });
    this.topCloseHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => this.handleCloseClick(event),
    );
    this.startReward.hitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.handleStartRewardClick();
      },
    );
    this.startReward.hitArea.on("pointerover", () => {
      this.setStartRewardButtonHovered(true);
    });
    this.startReward.hitArea.on("pointerout", () => {
      this.setStartRewardButtonHovered(false);
    });
    this.startEmeraldReward.hitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.handleStartEmeraldRewardClick();
      },
    );
    this.startEmeraldReward.hitArea.on("pointerover", () => {
      this.setStartEmeraldRewardButtonHovered(true);
    });
    this.startEmeraldReward.hitArea.on("pointerout", () => {
      this.setStartEmeraldRewardButtonHovered(false);
    });
  }

  private createStartRewardSlot(x: number, y: number): StartRewardSlotView {
    const claimButtonLayout =
      InfiniteModeModal.startGlovesRewardClaimButtonLayout;
    const buttonX = x + claimButtonLayout.offsetX;
    const buttonY = y + claimButtonLayout.offsetY;
    const contentX = x + 30 + InfiniteModeModal.startRewardContentOffsetX;

    const title = this.scene.add
      .text(contentX, y - 22, "", {
        fontFamily: "Hardpixel",
        fontSize: 16,
        color: "#ffe85a",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const item = this.scene.add
      .text(contentX, y + 2, "", {
        fontFamily: "Hardpixel",
        fontSize: 14,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const button = this.scene.add
      .image(buttonX, buttonY, InfiniteModeModal.rewardButtonOpenTextureKey)
      .setDisplaySize(claimButtonLayout.width, claimButtonLayout.height)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const buttonLabel = this.scene.add
      .text(buttonX, buttonY, "", {
        fontFamily: "Hardpixel",
        fontSize: 15,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        buttonX,
        buttonY,
        claimButtonLayout.width,
        claimButtonLayout.height,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    return {
      slotX: x,
      slotY: y,
      title,
      item,
      button,
      buttonLabel,
      hitArea,
      buttonBaseWidth: claimButtonLayout.width,
      buttonBaseHeight: claimButtonLayout.height,
    };
  }

  private createStartEmeraldRewardSlot(
    x: number,
    y: number,
  ): StartEmeraldRewardSlotView {
    const claimButtonLayout =
      InfiniteModeModal.startEmeraldRewardClaimButtonLayout;
    const buttonX = x + claimButtonLayout.offsetX;
    const buttonY = y + claimButtonLayout.offsetY;
    const contentX = x + InfiniteModeModal.startRewardContentOffsetX;
    const icon = this.scene.add
      .image(contentX - 42, y - 8, InfiniteModeModal.emeraldIconTextureKey)
      .setDisplaySize(42, 42)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const amountText = this.scene.add
      .text(
        contentX - 2,
        y - 8,
        `x${InfiniteModeModal.startEmeraldRewardAmount}`,
        {
          fontFamily: "Hardpixel",
          fontSize: 22,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 4,
        },
      )
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const button = this.scene.add
      .image(buttonX, buttonY, InfiniteModeModal.rewardButtonOpenTextureKey)
      .setDisplaySize(claimButtonLayout.width, claimButtonLayout.height)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const buttonLabel = this.scene.add
      .text(buttonX, buttonY, "", {
        fontFamily: "Hardpixel",
        fontSize: 15,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        buttonX,
        buttonY,
        claimButtonLayout.width,
        claimButtonLayout.height,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    return {
      slotX: x,
      slotY: y,
      icon,
      amountText,
      button,
      buttonLabel,
      hitArea,
      buttonBaseWidth: claimButtonLayout.width,
      buttonBaseHeight: claimButtonLayout.height,
    };
  }

  private createLockedPanel(centerX: number, centerY: number) {
    this.lockedOverlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.58)
      .setDepth(InfiniteModeModal.depth + 7)
      .setInteractive()
      .setVisible(false);
    this.lockedPanel = this.scene.add
      .image(centerX, centerY, InfiniteModeModal.lockedPanelTextureKey)
      .setDisplaySize(
        InfiniteModeModal.lockedPanelWidth,
        InfiniteModeModal.lockedPanelHeight,
      )
      .setDepth(InfiniteModeModal.depth + 8)
      .setVisible(false);
    this.lockedTitle = this.scene.add
      .text(centerX, centerY - 132, "", {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffe85a",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 9)
      .setVisible(false);
    this.lockedDescription = this.scene.add
      .text(centerX, centerY + 10, "", {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
        wordWrap: {
          width: 300,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 9)
      .setVisible(false);
    this.lockedHint = this.scene.add
      .text(centerX, centerY + 90, "", {
        fontFamily: "Hardpixel",
        fontSize: 16,
        color: "#b6abb7",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: 300,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 9)
      .setVisible(false);
    this.lockedCloseHitArea = this.scene.add
      .rectangle(
        centerX + InfiniteModeModal.lockedCloseHitOffsetX,
        centerY + InfiniteModeModal.lockedCloseHitOffsetY,
        InfiniteModeModal.closeHitAreaSize,
        InfiniteModeModal.closeHitAreaSize,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 10)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.lockedOverlay.on(
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
    this.lockedCloseHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => this.handleCloseClick(event),
    );
  }

  private createRewardDetails(centerX: number, centerY: number) {
    const overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.42)
      .setDepth(InfiniteModeModal.depth + 18)
      .setInteractive()
      .setVisible(false);
    const panel = this.scene.add
      .image(centerX, centerY, InfiniteModeModal.rewardDetailsPanelTextureKey)
      .setDepth(InfiniteModeModal.depth + 19)
      .setVisible(false);
    const title = this.scene.add
      .text(centerX, centerY - 174, "", {
        fontFamily: "Hardpixel",
        fontSize: 28,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 20)
      .setVisible(false);
    const icon = this.scene.add
      .image(
        centerX - 28,
        centerY - 42,
        InfiniteModeModal.emeraldIconTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.rewardDetailsIconSize,
        InfiniteModeModal.rewardDetailsIconSize,
      )
      .setDepth(InfiniteModeModal.depth + 20)
      .setVisible(false);
    const amount = this.scene.add
      .text(centerX + 42, centerY - 40, "", {
        fontFamily: "Hardpixel",
        fontSize: 26,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 20)
      .setVisible(false);
    const description = this.scene.add
      .text(centerX, centerY + 66, "", {
        fontFamily: "Hardpixel",
        fontSize: 25,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
        wordWrap: {
          width: 420,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 20)
      .setVisible(false);
    const closeLabel = this.scene.add
      .text(
        centerX,
        centerY + InfiniteModeModal.rewardDetailsCloseOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 23,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 20)
      .setVisible(false);
    const closeHitArea = this.scene.add
      .rectangle(
        centerX,
        centerY + InfiniteModeModal.rewardDetailsCloseOffsetY,
        InfiniteModeModal.rewardDetailsCloseHitWidth,
        InfiniteModeModal.rewardDetailsCloseHitHeight,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 21)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    overlay.on(
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
    closeHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        UiSoundPlayer.playClick(this.scene);
        this.setRewardDetailsVisible(false);
      },
    );

    this.rewardDetails = {
      overlay,
      panel,
      title,
      icon,
      amount,
      description,
      closeLabel,
      closeHitArea,
    };
  }

  private refresh() {
    this.title?.setText(languageController.t("infinite.unlockedTitle"));
    this.subtitle?.setText(languageController.t("infinite.subtitle"));
    this.closeLabel?.setText(
      languageController.t(
        this.profile.isInfinityTowerAvailable()
          ? "infinite.fight"
          : "infinite.close",
      ),
    );
    this.lockedTitle?.setText(languageController.t("infinite.sealedTitle"));
    this.lockedDescription?.setText(
      languageController.t("infinite.sealedDescription"),
    );
    this.lockedHint?.setText(languageController.t("infinite.sealedHint"));
    this.startReward?.title.setText(
      languageController.t("infinite.startRewardTitle"),
    );
    this.startReward?.item.setText(
      languageController.t("infinite.startRewardItem"),
    );
    this.rewardsScrollView?.refresh();
    this.refreshStartReward();
    this.refreshStartEmeraldReward();
    this.updateOpenButtonPulse();
  }

  private refreshStartReward() {
    if (!this.startReward) {
      return;
    }

    const isClaimed = this.profile.hasPurchasedItem(
      InfiniteModeModal.startRewardItemId,
    );

    this.startReward.buttonLabel.setText(
      languageController.t(
        isClaimed ? "infinite.rewardClaimed" : "infinite.rewardClaim",
      ),
    );
    this.startReward.button.setTexture(
      isClaimed
        ? InfiniteModeModal.rewardButtonClaimedTextureKey
        : InfiniteModeModal.rewardButtonOpenTextureKey,
    );
    InfiniteModeModal.applyStartRewardButtonLayout(
      this.startReward,
      isClaimed,
      InfiniteModeModal.startGlovesRewardClaimButtonLayout,
      InfiniteModeModal.startGlovesRewardClaimedButtonLayout,
    );

    if (isClaimed) {
      this.startReward.hitArea.disableInteractive();
    } else if (this.startReward.hitArea.visible) {
      this.startReward.hitArea.setInteractive({ useHandCursor: true });
    }
  }

  private refreshStartEmeraldReward() {
    if (!this.startEmeraldReward) {
      return;
    }

    const isClaimed = this.profile.hasClaimedInfinityTowerReward(
      InfiniteModeModal.startEmeraldRewardId,
    );

    this.startEmeraldReward.buttonLabel.setText(
      languageController.t(
        isClaimed ? "infinite.rewardClaimed" : "infinite.rewardClaim",
      ),
    );
    this.startEmeraldReward.button.setTexture(
      isClaimed
        ? InfiniteModeModal.rewardButtonClaimedTextureKey
        : InfiniteModeModal.rewardButtonOpenTextureKey,
    );
    InfiniteModeModal.applyStartRewardButtonLayout(
      this.startEmeraldReward,
      isClaimed,
      InfiniteModeModal.startEmeraldRewardClaimButtonLayout,
      InfiniteModeModal.startEmeraldRewardClaimedButtonLayout,
    );

    if (isClaimed) {
      this.startEmeraldReward.hitArea.disableInteractive();
    } else if (this.startEmeraldReward.hitArea.visible) {
      this.startEmeraldReward.hitArea.setInteractive({ useHandCursor: true });
    }
  }

  private static applyStartRewardButtonLayout(
    slot: {
      slotX: number;
      slotY: number;
      button: GameObjects.Image;
      buttonLabel: GameObjects.Text;
      hitArea: GameObjects.Rectangle;
      buttonBaseWidth: number;
      buttonBaseHeight: number;
    },
    isClaimed: boolean,
    claimLayout: StartRewardButtonLayout,
    claimedLayout: StartRewardButtonLayout,
  ) {
    const layout = isClaimed ? claimedLayout : claimLayout;
    const buttonX = slot.slotX + layout.offsetX;
    const buttonY = slot.slotY + layout.offsetY;

    slot.button
      .setPosition(buttonX, buttonY)
      .setDisplaySize(layout.width, layout.height);
    slot.buttonLabel.setPosition(buttonX, buttonY);
    slot.hitArea
      .setPosition(buttonX, buttonY)
      .setSize(layout.width, layout.height);
    slot.buttonBaseWidth = layout.width;
    slot.buttonBaseHeight = layout.height;
  }

  private setVisible(visible: boolean) {
    const isTowerAvailable = this.profile.isInfinityTowerAvailable();

    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.panelBlocker?.setVisible(visible);
    this.title?.setVisible(visible);
    this.subtitle?.setVisible(visible);
    this.bottomButton?.setVisible(visible);
    this.closeLabel?.setVisible(visible);
    this.closeHitArea?.setVisible(visible);
    this.topCloseHitArea?.setVisible(visible);
    this.rewardsScrollView?.setVisible(visible);
    this.startReward?.title.setVisible(visible);
    this.startReward?.item.setVisible(visible);
    this.startReward?.button.setVisible(visible);
    this.startReward?.buttonLabel.setVisible(visible);
    this.startReward?.hitArea.setVisible(visible);
    this.startEmeraldReward?.icon.setVisible(visible);
    this.startEmeraldReward?.amountText.setVisible(visible);
    this.startEmeraldReward?.button.setVisible(visible);
    this.startEmeraldReward?.buttonLabel.setVisible(visible);
    this.startEmeraldReward?.hitArea.setVisible(visible);
    this.setLockedPanelVisible(visible && !isTowerAvailable);

    if (visible) {
      this.overlay?.setInteractive();
      this.panelBlocker?.setInteractive();
      this.closeHitArea?.setInteractive({ useHandCursor: true });
      this.topCloseHitArea?.setInteractive({ useHandCursor: true });
      this.refreshStartReward();
      this.refreshStartEmeraldReward();
    } else {
      this.overlay?.disableInteractive();
      this.panelBlocker?.disableInteractive();
      this.setBottomButtonHovered(false);
      this.closeHitArea?.disableInteractive();
      this.topCloseHitArea?.disableInteractive();
      this.startReward?.hitArea.disableInteractive();
      this.startEmeraldReward?.hitArea.disableInteractive();
      this.setRewardDetailsVisible(false);
    }

    if (visible) {
      this.rewardsScrollView?.refresh();
    }
  }

  private setLockedPanelVisible(visible: boolean) {
    this.lockedOverlay?.setVisible(visible);
    this.lockedPanel?.setVisible(visible);
    this.lockedTitle?.setVisible(visible);
    this.lockedDescription?.setVisible(visible);
    this.lockedHint?.setVisible(visible);
    this.lockedCloseHitArea?.setVisible(visible);

    if (visible) {
      this.lockedOverlay?.setInteractive();
      this.lockedCloseHitArea?.setInteractive({ useHandCursor: true });
    } else {
      this.lockedOverlay?.disableInteractive();
      this.lockedCloseHitArea?.disableInteractive();
    }
  }

  private setRewardDetailsVisible(visible: boolean) {
    if (!this.rewardDetails) {
      return;
    }

    this.rewardDetails.overlay.setVisible(visible);
    this.rewardDetails.panel.setVisible(visible);
    this.rewardDetails.title.setVisible(visible);
    this.rewardDetails.icon.setVisible(visible);
    this.rewardDetails.amount.setVisible(visible);
    this.rewardDetails.description.setVisible(visible);
    this.rewardDetails.closeLabel.setVisible(visible);
    this.rewardDetails.closeHitArea.setVisible(visible);

    if (visible) {
      this.rewardDetails.overlay.setInteractive();
      this.rewardDetails.closeHitArea.setInteractive({ useHandCursor: true });
    } else {
      this.rewardDetails.overlay.disableInteractive();
      this.rewardDetails.closeHitArea.disableInteractive();
    }
  }

  private showStartRewardDetails() {
    this.showRewardDetails({
      iconTextureKey: InfiniteModeModal.startRewardIconTextureKey,
      amount: 1,
      descriptionKey: "infinite.rewardDetails.gloves",
    });
  }

  private showRewardDetailsForReward(reward: InfinityTowerRewardConfig) {
    if (reward.type === "gloves") {
      this.showRewardDetails({
        iconTextureKey: reward.iconTextureKey,
        amount: 1,
        descriptionKey: "infinite.rewardDetails.gloves",
      });
      return;
    }

    if (reward.type === "rewive") {
      this.showRewardDetails({
        iconTextureKey: InfiniteModeModal.rewiveIconTextureKey,
        amount: reward.amount,
        descriptionKey: "infinite.rewardDetails.rewive",
      });
      return;
    }

    if (reward.type === "consumable") {
      const consumableConfig = getInfinityTowerConsumableConfig(
        reward.consumableId,
      );

      if (!consumableConfig) {
        return;
      }

      this.showRewardDetails({
        iconTextureKey: consumableConfig.iconTextureKey,
        amount: reward.amount,
        descriptionKey:
          reward.consumableId === "attack-speed-potion"
            ? "infinite.rewardDetails.attackSpeedPotion"
            : "infinite.rewardDetails.attackPowerPotion",
      });
      return;
    }

    this.showRewardDetails({
      iconTextureKey: InfiniteModeModal.emeraldIconTextureKey,
      amount: reward.amount,
      descriptionKey: "infinite.rewardDetails.emerald",
    });
  }

  private showRewardDetails(config: {
    iconTextureKey: string;
    amount: number;
    descriptionKey: string;
  }) {
    if (!this.rewardDetails) {
      return;
    }

    this.rewardDetails.title.setText(
      languageController.t("infinite.rewardDetails.title"),
    );
    this.rewardDetails.icon
      .setTexture(config.iconTextureKey)
      .setDisplaySize(
        InfiniteModeModal.rewardDetailsIconSize,
        InfiniteModeModal.rewardDetailsIconSize,
      );
    this.rewardDetails.amount.setText(`x${config.amount}`);
    this.rewardDetails.description.setText(
      languageController.t(config.descriptionKey),
    );
    this.rewardDetails.closeLabel.setText(
      languageController.t("infinite.close"),
    );
    this.setRewardDetailsVisible(true);
  }

  private handleCloseClick(event?: Phaser.Types.Input.EventData) {
    event?.stopPropagation();
    UiSoundPlayer.playClick(this.scene);
    this.close();
  }

  private handleBottomButtonClick(event?: Phaser.Types.Input.EventData) {
    event?.stopPropagation();
    UiSoundPlayer.playClick(this.scene);

    if (!this.profile.isInfinityTowerAvailable()) {
      this.close();
      return;
    }

    this.close();
    this.onStart();
  }

  private handleStartRewardClick() {
    if (this.profile.hasPurchasedItem(InfiniteModeModal.startRewardItemId)) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.onClaimGlovesReward(InfiniteModeModal.startRewardItemId);
    this.showStartRewardDetails();
    this.refresh();
  }

  private handleStartEmeraldRewardClick() {
    if (
      this.profile.hasClaimedInfinityTowerReward(
        InfiniteModeModal.startEmeraldRewardId,
      )
    ) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.profile.claimInfinityTowerReward(
      InfiniteModeModal.startEmeraldRewardId,
    );
    if (this.onEmeraldRewardClaimed) {
      this.onEmeraldRewardClaimed(
        InfiniteModeModal.startEmeraldRewardAmount,
        {
          x: this.startEmeraldReward?.icon.x ?? this.scene.scale.width / 2,
          y: this.startEmeraldReward?.icon.y ?? this.scene.scale.height / 2,
        },
      );
    } else {
      this.profile.addEmeralds(InfiniteModeModal.startEmeraldRewardAmount);
      this.onRewardsChanged?.();
    }
    this.showRewardDetails({
      iconTextureKey: InfiniteModeModal.emeraldIconTextureKey,
      amount: InfiniteModeModal.startEmeraldRewardAmount,
      descriptionKey: "infinite.rewardDetails.emerald",
    });
    this.refresh();
  }

  private updateOpenButtonPulse() {
    const shouldPulse =
      this.isOpenButtonEnabled &&
      this.openButtonIcon.visible &&
      this.profile.isInfinityTowerAvailable() &&
      this.hasClaimableReward();

    this.setOpenButtonIconPulsing(shouldPulse);
  }

  private hasClaimableReward() {
    if (
      !this.profile.hasPurchasedItem(InfiniteModeModal.startRewardItemId) ||
      !this.profile.hasClaimedInfinityTowerReward(
        InfiniteModeModal.startEmeraldRewardId,
      )
    ) {
      return true;
    }

    const currentFloor = this.profile.getInfinityTowerCurrentLevel();

    return InfinityTowerRewardController.getRewards().some((reward) => {
      return (
        reward.level <= currentFloor &&
        this.rewardController.getRewardView(reward).state === "claimable"
      );
    });
  }

  private setOpenButtonIconPulsing(shouldPulse: boolean) {
    if (this.isOpenButtonIconPulsing === shouldPulse) {
      return;
    }

    this.isOpenButtonIconPulsing = shouldPulse;
    this.scene.tweens.killTweensOf(this.openButtonIcon);
    this.openButtonIcon.setScale(
      this.openButtonIconBaseScaleX,
      this.openButtonIconBaseScaleY,
    );

    if (!shouldPulse) {
      return;
    }

    this.scene.tweens.add({
      targets: this.openButtonIcon,
      scaleX:
        this.openButtonIconBaseScaleX *
        InfiniteModeModal.openButtonIconPulseScale,
      scaleY:
        this.openButtonIconBaseScaleY *
        InfiniteModeModal.openButtonIconPulseScale,
      duration: InfiniteModeModal.openButtonIconPulseDurationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private setBottomButtonHovered(isHovered: boolean) {
    if (!this.bottomButton || !this.closeLabel) {
      return;
    }

    const scale = isHovered ? InfiniteModeModal.buttonHoverScale : 1;

    this.bottomButton.setDisplaySize(
      InfiniteModeModal.bottomButtonDisplayWidth * scale,
      InfiniteModeModal.bottomButtonDisplayHeight * scale,
    );
    this.closeLabel.setScale(scale);
  }

  private setStartRewardButtonHovered(isHovered: boolean) {
    if (!this.startReward) {
      return;
    }

    const scale = isHovered ? InfiniteModeModal.buttonHoverScale : 1;

    this.startReward.button.setDisplaySize(
      this.startReward.buttonBaseWidth * scale,
      this.startReward.buttonBaseHeight * scale,
    );
    this.startReward.buttonLabel.setScale(scale);
  }

  private setStartEmeraldRewardButtonHovered(isHovered: boolean) {
    if (!this.startEmeraldReward) {
      return;
    }

    const scale = isHovered ? InfiniteModeModal.buttonHoverScale : 1;

    this.startEmeraldReward.button.setDisplaySize(
      this.startEmeraldReward.buttonBaseWidth * scale,
      this.startEmeraldReward.buttonBaseHeight * scale,
    );
    this.startEmeraldReward.buttonLabel.setScale(scale);
  }

  private setOpenButtonSize(size: number) {
    this.openButtonHitArea.setDisplaySize(size, size);
  }

  private handleEsc() {
    if (!this.pauseController.has("infinite-mode")) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.close();
  }

  private static getAssets(): InfinityTowerAssetConfig[] {
    const configuredRewards = InfinityTowerRewardController.getRewards();
    const rewardIconAssets = configuredRewards
      .filter((reward) => reward.type === "gloves")
      .map((reward) => ({
        textureKey: reward.iconTextureKey,
        texturePath: reward.iconTexturePath,
      }));
    const consumableIconAssets = configuredRewards
      .filter((reward) => reward.type === "consumable")
      .map((reward) => getInfinityTowerConsumableConfig(reward.consumableId))
      .filter(
        (
          consumable,
        ): consumable is NonNullable<
          ReturnType<typeof getInfinityTowerConsumableConfig>
        > => Boolean(consumable),
      )
      .map((consumable) => ({
        textureKey: consumable.iconTextureKey,
        texturePath: consumable.iconTexturePath,
      }));

    const assets = [
      {
        textureKey: InfiniteModeModal.panelTextureKey,
        texturePath: InfiniteModeModal.panelPath,
      },
      {
        textureKey: InfiniteModeModal.lockedPanelTextureKey,
        texturePath: InfiniteModeModal.lockedPanelPath,
      },
      {
        textureKey: InfiniteModeModal.rewardDetailsPanelTextureKey,
        texturePath: InfiniteModeModal.rewardDetailsPanelPath,
      },
      {
        textureKey: InfiniteModeModal.rewardButtonOpenTextureKey,
        texturePath: InfiniteModeModal.rewardButtonOpenPath,
      },
      {
        textureKey: InfiniteModeModal.rewardButtonLockedTextureKey,
        texturePath: InfiniteModeModal.rewardButtonLockedPath,
      },
      {
        textureKey: InfiniteModeModal.rewardButtonClaimedTextureKey,
        texturePath: InfiniteModeModal.rewardButtonClaimedPath,
      },
      {
        textureKey: InfiniteModeModal.bottomButtonTextureKey,
        texturePath: InfiniteModeModal.bottomButtonPath,
      },
      {
        textureKey: InfiniteModeModal.emeraldIconTextureKey,
        texturePath: InfiniteModeModal.emeraldIconPath,
      },
      {
        textureKey: InfiniteModeModal.rewiveIconTextureKey,
        texturePath: InfiniteModeModal.rewiveIconPath,
      },
      {
        textureKey: InfiniteModeModal.startRewardIconTextureKey,
        texturePath: InfiniteModeModal.startRewardIconPath,
      },
      ...InfinityTowerRewardsScrollView.getAssets(),
      ...rewardIconAssets,
      ...consumableIconAssets,
    ];

    return InfiniteModeModal.dedupeAssets(assets);
  }

  private static dedupeAssets(assets: InfinityTowerAssetConfig[]) {
    return [
      ...new Map(assets.map((asset) => [asset.textureKey, asset])).values(),
    ];
  }

  private static areAssetsLoaded(scene: Scene) {
    return InfiniteModeModal.getAssets().every((asset) =>
      scene.textures.exists(asset.textureKey),
    );
  }

  private static loadAssets(scene: Scene, onComplete: () => void) {
    InfiniteModeModal.getAssets().forEach((asset) => {
      if (!scene.textures.exists(asset.textureKey)) {
        scene.load.image(asset.textureKey, asset.texturePath);
      }
    });

    scene.load.once("complete", onComplete);

    if (!scene.load.isLoading()) {
      scene.load.start();
    }
  }
}
