import { GameObjects, Scene } from "phaser";
import {
  infinityTowerRewardsConfig,
  type InfinityTowerRewardConfig,
} from "../configs/infinityTower";
import { getInfinityTowerConsumableConfig } from "../configs/infinityTowerConsumables";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";
import { LoadingSpinner } from "./LoadingSpinner";

type InfinityTowerAssetConfig = {
  textureKey: string;
  texturePath: string;
};

type RewardSlotView = {
  icon: GameObjects.Image;
  amountText: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  buttonBaseWidth: number;
  buttonBaseHeight: number;
};

type StartRewardSlotView = {
  title: GameObjects.Text;
  item: GameObjects.Text;
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
  private static readonly panelTextureKey = "infinite-tower-panel";
  private static readonly panelPath =
    "assets/images/ui/infinity-tower/tower-panel.png";
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
  private static readonly openButtonX = 805;
  private static readonly openButtonY = 68;
  private static readonly openButtonSize = 96;
  private static readonly openButtonHoverSize = 106;
  private static readonly openButtonIconSize = 86;
  private static readonly openButtonIconHoverSize = 92;
  private static readonly panelWidth = 900;
  private static readonly panelHeight = 675;
  private static readonly lockedPanelWidth = 640;
  private static readonly lockedPanelHeight = 480;
  private static readonly rewardIconSize = 36;
  private static readonly rewardButtonDisplayWidth = 222;
  private static readonly rewardButtonDisplayHeight = 75;
  private static readonly rewardButtonClaimedDisplayWidth = 170;
  private static readonly rewardButtonClaimedDisplayHeight = 80;
  private static readonly startRewardButtonDisplayWidth = 250;
  private static readonly startRewardButtonDisplayHeight = 90;
  private static readonly startRewardButtonClaimedDisplayWidth = 190;
  private static readonly startRewardButtonClaimedDisplayHeight = 95;
  private static readonly rewardIconOffsetX = -52;
  private static readonly rewardAmountOffsetX = -30;
  private static readonly rewardTitleWrapWidth = 130;
  private static readonly rewardButtonOffsetY = 31;
  private static readonly rewardButtonOffsetX = -3;
  private static readonly startRewardButtonOffsetY = 34;
  private static readonly startRewardButtonOffsetX = -20;
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
  private static readonly startRewardSlotIndex = 11;
  private static readonly startRewardItemId = "golden-tower-gloves";
  private static readonly baseRewardSlotIndexes = [10, 11];
  private static readonly rewardSlots = [
    { x: -185, y: -216 },
    { x: 185, y: -216 },
    { x: -185, y: -126 },
    { x: 185, y: -126 },
    { x: -185, y: -36 },
    { x: 185, y: -36 },
    { x: -185, y: 55 },
    { x: 185, y: 55 },
    { x: -185, y: 150 },
    { x: 185, y: 150 },
    { x: -185, y: 240 },
    { x: 185, y: 240 },
  ];

  private readonly openButtonIcon: GameObjects.Image;
  private readonly openButtonHitArea: GameObjects.Rectangle;
  private readonly loaderSpinner: LoadingSpinner;
  private readonly unsubscribeLanguageChange: () => void;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private panelBlocker?: GameObjects.Rectangle;
  private title?: GameObjects.Text;
  private subtitle?: GameObjects.Text;
  private bottomButton?: GameObjects.Image;
  private closeLabel?: GameObjects.Text;
  private closeHitArea?: GameObjects.Rectangle;
  private topCloseHitArea?: GameObjects.Rectangle;
  private rewardSlots: RewardSlotView[] = [];
  private lockedOverlay?: GameObjects.Rectangle;
  private lockedPanel?: GameObjects.Image;
  private lockedTitle?: GameObjects.Text;
  private lockedDescription?: GameObjects.Text;
  private lockedHint?: GameObjects.Text;
  private lockedCloseHitArea?: GameObjects.Rectangle;
  private startReward?: StartRewardSlotView;
  private rewardDetails?: RewardDetailsView;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;

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

    this.openButtonHitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    this.openButtonHitArea.on("pointerover", () => {
      this.setOpenButtonSize(InfiniteModeModal.openButtonHoverSize);
      this.openButtonIcon.setDisplaySize(
        InfiniteModeModal.openButtonIconHoverSize,
        InfiniteModeModal.openButtonIconHoverSize,
      );
    });
    this.openButtonHitArea.on("pointerout", () => {
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
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
      this.loaderSpinner.destroy();
    });
  }

  setButtonVisible(visible: boolean) {
    this.openButtonIcon.setVisible(visible);
    this.openButtonHitArea.setVisible(visible);

    if (visible) {
      this.openButtonHitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButtonHitArea.disableInteractive();
      this.setOpenButtonSize(InfiniteModeModal.openButtonSize);
      this.openButtonIcon.setDisplaySize(
        InfiniteModeModal.openButtonIconSize,
        InfiniteModeModal.openButtonIconSize,
      );
    }
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
    this.rewardSlots = InfiniteModeModal.rewardSlots.map((slot, index) =>
      this.createRewardSlot(centerX + slot.x, centerY + slot.y, index),
    );
    const startRewardSlot =
      InfiniteModeModal.rewardSlots[InfiniteModeModal.startRewardSlotIndex];
    this.startReward = this.createStartRewardSlot(
      centerX + startRewardSlot.x,
      centerY + startRewardSlot.y,
    );
    this.createLockedPanel(centerX, centerY);
    this.createRewardDetails(centerX, centerY);

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
    this.rewardSlots.forEach((slot, index) => {
      slot.hitArea.on(
        "pointerdown",
        (
          _pointer: Phaser.Input.Pointer,
          _localX: number,
          _localY: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          this.handleRewardSlotClick(index);
        },
      );
      slot.hitArea.on("pointerover", () => {
        this.setRewardSlotButtonHovered(slot, true);
      });
      slot.hitArea.on("pointerout", () => {
        this.setRewardSlotButtonHovered(slot, false);
      });
    });
  }

  private createRewardSlot(
    x: number,
    y: number,
    index: number,
  ): RewardSlotView {
    const icon = this.scene.add
      .image(
        x + InfiniteModeModal.rewardIconOffsetX,
        y - 4,
        InfiniteModeModal.emeraldIconTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.rewardIconSize,
        InfiniteModeModal.rewardIconSize,
      )
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const amountText = this.scene.add
      .text(x + InfiniteModeModal.rewardAmountOffsetX, y - 5, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        wordWrap: {
          width: InfiniteModeModal.rewardTitleWrapWidth,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const button = this.scene.add
      .image(
        x + InfiniteModeModal.rewardButtonOffsetX,
        y + InfiniteModeModal.rewardButtonOffsetY,
        InfiniteModeModal.rewardButtonLockedTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.rewardButtonDisplayWidth,
        InfiniteModeModal.rewardButtonDisplayHeight,
      )
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const buttonLabel = this.scene.add
      .text(x, y + InfiniteModeModal.rewardButtonOffsetY, "", {
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
        x + InfiniteModeModal.rewardButtonOffsetX,
        y + InfiniteModeModal.rewardButtonOffsetY,
        InfiniteModeModal.rewardButtonDisplayWidth,
        InfiniteModeModal.rewardButtonDisplayHeight,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    const reward = infinityTowerRewardsConfig[index];
    amountText.setText(
      reward?.type === "emerald" ||
        reward?.type === "rewive" ||
        reward?.type === "consumable"
        ? `x${reward.amount}`
        : "",
    );

    return {
      icon,
      amountText,
      button,
      buttonLabel,
      hitArea,
      buttonBaseWidth: InfiniteModeModal.rewardButtonDisplayWidth,
      buttonBaseHeight: InfiniteModeModal.rewardButtonDisplayHeight,
    };
  }

  private createStartRewardSlot(x: number, y: number): StartRewardSlotView {
    const contentX = x + InfiniteModeModal.startRewardButtonOffsetX;

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
      .image(
        contentX,
        y + InfiniteModeModal.startRewardButtonOffsetY,
        InfiniteModeModal.rewardButtonOpenTextureKey,
      )
      .setDisplaySize(
        InfiniteModeModal.startRewardButtonDisplayWidth,
        InfiniteModeModal.startRewardButtonDisplayHeight,
      )
      .setDepth(InfiniteModeModal.depth + 3)
      .setVisible(false);
    const buttonLabel = this.scene.add
      .text(
        contentX,
        y + InfiniteModeModal.startRewardButtonOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 15,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        contentX,
        y + InfiniteModeModal.startRewardButtonOffsetY,
        InfiniteModeModal.startRewardButtonDisplayWidth,
        InfiniteModeModal.startRewardButtonDisplayHeight,
        0x000000,
        0,
      )
      .setDepth(InfiniteModeModal.depth + 5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    return {
      title,
      item,
      button,
      buttonLabel,
      hitArea,
      buttonBaseWidth: InfiniteModeModal.startRewardButtonDisplayWidth,
      buttonBaseHeight: InfiniteModeModal.startRewardButtonDisplayHeight,
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
      .image(centerX - 28, centerY - 42, InfiniteModeModal.emeraldIconTextureKey)
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
    this.refreshRewards();
  }

  private refreshRewards() {
    const towerLevel = this.profile.getInfinityTowerCurrentLevel();

    this.rewardSlots.forEach((slot, index) => {
      if (InfiniteModeModal.isBaseRewardSlot(index)) {
        return;
      }

      const reward = infinityTowerRewardsConfig[index];
      const isOpen = Boolean(reward && towerLevel >= reward.level);
      const isClaimed =
        reward?.type === "gloves"
          ? this.profile.hasPurchasedItem(reward.itemId)
          : Boolean(
              reward && this.profile.hasClaimedInfinityTowerReward(reward.id),
            );
      const canClaim = Boolean(reward && isOpen && !isClaimed);

      if (reward?.type === "gloves") {
        slot.icon
          .setTexture(reward.iconTextureKey)
          .setDisplaySize(
            InfiniteModeModal.rewardIconSize + 16,
            InfiniteModeModal.rewardIconSize + 16,
          );
        slot.amountText
          .setText(languageController.t(reward.titleKey))
          .setFontSize(15)
          .setColor("#ffe85a")
          .setWordWrapWidth(InfiniteModeModal.rewardTitleWrapWidth, true)
          .setAlign("center");
      } else {
        const isRewiveReward = reward?.type === "rewive";
        const consumableConfig =
          reward?.type === "consumable"
            ? getInfinityTowerConsumableConfig(reward.consumableId)
            : undefined;

        slot.icon
          .setTexture(
            isRewiveReward
              ? InfiniteModeModal.rewiveIconTextureKey
              : consumableConfig
                ? consumableConfig.iconTextureKey
              : InfiniteModeModal.emeraldIconTextureKey,
          )
          .setDisplaySize(
            isRewiveReward || consumableConfig
              ? InfiniteModeModal.rewardIconSize - 4
              : InfiniteModeModal.rewardIconSize,
            isRewiveReward || consumableConfig
              ? InfiniteModeModal.rewardIconSize - 4
              : InfiniteModeModal.rewardIconSize,
          );
        slot.amountText
          .setText(
            reward?.type === "emerald" ||
              reward?.type === "rewive" ||
              reward?.type === "consumable"
              ? `x${reward.amount}`
              : "",
          )
          .setFontSize(22)
          .setColor("#ffffff")
          .setWordWrapWidth(InfiniteModeModal.rewardTitleWrapWidth, true)
          .setAlign("left");
      }

      slot.button.setTexture(
        isClaimed
          ? InfiniteModeModal.rewardButtonClaimedTextureKey
          : isOpen
            ? InfiniteModeModal.rewardButtonOpenTextureKey
            : InfiniteModeModal.rewardButtonLockedTextureKey,
      );
      InfiniteModeModal.applyRewardButtonDisplaySize(slot.button, isClaimed);
      slot.buttonBaseWidth = slot.button.displayWidth;
      slot.buttonBaseHeight = slot.button.displayHeight;
      slot.buttonLabel.setText(
        languageController.t(
          isClaimed
            ? "infinite.rewardClaimed"
            : isOpen
              ? "infinite.rewardClaim"
              : "infinite.rewardLocked",
        ),
      );

    if (canClaim && slot.hitArea.visible) {
      slot.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.setRewardSlotButtonHovered(slot, false);
      slot.hitArea.disableInteractive();
    }
    });
    this.refreshStartReward();
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
    this.startReward.button.setDisplaySize(
      isClaimed
        ? InfiniteModeModal.startRewardButtonClaimedDisplayWidth
        : InfiniteModeModal.startRewardButtonDisplayWidth,
      isClaimed
        ? InfiniteModeModal.startRewardButtonClaimedDisplayHeight
        : InfiniteModeModal.startRewardButtonDisplayHeight,
    );
    this.startReward.buttonBaseWidth = this.startReward.button.displayWidth;
    this.startReward.buttonBaseHeight = this.startReward.button.displayHeight;

    if (isClaimed) {
      this.startReward.hitArea.disableInteractive();
    } else if (this.startReward.hitArea.visible) {
      this.startReward.hitArea.setInteractive({ useHandCursor: true });
    }
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
    this.rewardSlots.forEach((slot, index) => {
      const slotVisible = visible && !InfiniteModeModal.isBaseRewardSlot(index);

      slot.icon.setVisible(slotVisible);
      slot.amountText.setVisible(slotVisible);
      slot.button.setVisible(slotVisible);
      slot.buttonLabel.setVisible(slotVisible);
      slot.hitArea.setVisible(slotVisible);
    });
    this.startReward?.title.setVisible(visible);
    this.startReward?.item.setVisible(visible);
    this.startReward?.button.setVisible(visible);
    this.startReward?.buttonLabel.setVisible(visible);
    this.startReward?.hitArea.setVisible(visible);
    this.setLockedPanelVisible(visible && !isTowerAvailable);

    if (visible) {
      this.overlay?.setInteractive();
      this.panelBlocker?.setInteractive();
      this.closeHitArea?.setInteractive({ useHandCursor: true });
      this.topCloseHitArea?.setInteractive({ useHandCursor: true });
      this.refreshStartReward();
    } else {
      this.overlay?.disableInteractive();
      this.panelBlocker?.disableInteractive();
      this.setBottomButtonHovered(false);
      this.closeHitArea?.disableInteractive();
      this.topCloseHitArea?.disableInteractive();
      this.startReward?.hitArea.disableInteractive();
      this.rewardSlots.forEach((slot) => {
        slot.hitArea.disableInteractive();
      });
      this.setRewardDetailsVisible(false);
    }

    if (visible) {
      this.refreshRewards();
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

  private handleRewardSlotClick(index: number) {
    const reward = infinityTowerRewardsConfig[index];

    if (
      !reward ||
      this.profile.getInfinityTowerCurrentLevel() < reward.level ||
      (reward.type === "gloves"
        ? this.profile.hasPurchasedItem(reward.itemId)
        : this.profile.hasClaimedInfinityTowerReward(reward.id))
    ) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);

    if (reward.type === "gloves") {
      this.onClaimGlovesReward(reward.itemId);
    } else if (reward.type === "rewive") {
      this.profile.addRewiveCount(reward.amount);
      this.profile.claimInfinityTowerReward(reward.id);
    } else if (reward.type === "consumable") {
      this.profile.addTowerConsumable(reward.consumableId, reward.amount);
      this.profile.claimInfinityTowerReward(reward.id);
    } else {
      this.profile.addEmeralds(reward.amount);
      this.profile.claimInfinityTowerReward(reward.id);
    }

    this.showRewardDetailsForReward(reward);
    this.refresh();
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

  private setRewardSlotButtonHovered(
    slot: RewardSlotView,
    isHovered: boolean,
  ) {
    const scale = isHovered ? InfiniteModeModal.buttonHoverScale : 1;

    slot.button.setDisplaySize(
      slot.buttonBaseWidth * scale,
      slot.buttonBaseHeight * scale,
    );
    slot.buttonLabel.setScale(scale);
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
    const rewardIconAssets = infinityTowerRewardsConfig
      .filter((reward) => reward.type === "gloves")
      .map((reward) => ({
        textureKey: reward.iconTextureKey,
        texturePath: reward.iconTexturePath,
      }));
    const consumableIconAssets = infinityTowerRewardsConfig
      .filter((reward) => reward.type === "consumable")
      .map((reward) => getInfinityTowerConsumableConfig(reward.consumableId))
      .filter(
        (
          consumable,
        ): consumable is NonNullable<ReturnType<typeof getInfinityTowerConsumableConfig>> =>
          Boolean(consumable),
      )
      .map((consumable) => ({
        textureKey: consumable.iconTextureKey,
        texturePath: consumable.iconTexturePath,
      }));

    return [
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
      ...rewardIconAssets,
      ...consumableIconAssets,
    ];
  }

  private static isBaseRewardSlot(index: number) {
    return InfiniteModeModal.baseRewardSlotIndexes.includes(index);
  }

  private static applyRewardButtonDisplaySize(
    button: GameObjects.Image,
    isClaimed = false,
  ) {
    button.setDisplaySize(
      isClaimed
        ? InfiniteModeModal.rewardButtonClaimedDisplayWidth
        : InfiniteModeModal.rewardButtonDisplayWidth,
      isClaimed
        ? InfiniteModeModal.rewardButtonClaimedDisplayHeight
        : InfiniteModeModal.rewardButtonDisplayHeight,
    );
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
