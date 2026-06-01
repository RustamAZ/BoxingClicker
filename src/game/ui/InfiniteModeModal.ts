import { GameObjects, Scene } from "phaser";
import { infinityTowerRewardsConfig } from "../configs/infinityTower";
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
};

type StartRewardSlotView = {
  title: GameObjects.Text;
  item: GameObjects.Text;
  button: GameObjects.Image;
  buttonLabel: GameObjects.Text;
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
  private static readonly rewardButtonOpenTextureKey =
    "infinite-tower-reward-button-open";
  private static readonly rewardButtonOpenPath =
    "assets/images/ui/infinity-tower/reward-button-open.png";
  private static readonly rewardButtonLockedTextureKey =
    "infinite-tower-reward-button-locked";
  private static readonly rewardButtonLockedPath =
    "assets/images/ui/infinity-tower/reward-button-locked.png";
  private static readonly emeraldIconTextureKey = "infinite-tower-emerald-icon";
  private static readonly emeraldIconPath =
    "assets/images/ui/icons/emerald.png";
  private static readonly openButtonX = 82;
  private static readonly openButtonY = 524;
  private static readonly openButtonSize = 96;
  private static readonly openButtonHoverSize = 106;
  private static readonly openButtonIconSize = 78;
  private static readonly openButtonIconHoverSize = 86;
  private static readonly panelWidth = 900;
  private static readonly panelHeight = 675;
  private static readonly lockedPanelWidth = 640;
  private static readonly lockedPanelHeight = 480;
  private static readonly rewardIconSize = 36;
  private static readonly rewardButtonDisplayWidth = 290;
  private static readonly rewardButtonDisplayHeight = 110;
  private static readonly startRewardButtonDisplayWidth = 250;
  private static readonly startRewardButtonDisplayHeight = 90;
  private static readonly rewardIconOffsetX = -52;
  private static readonly rewardAmountOffsetX = -10;
  private static readonly rewardButtonOffsetY = 31;
  private static readonly rewardButtonOffsetX = -3;
  private static readonly startRewardButtonOffsetY = 34;
  private static readonly startRewardButtonOffsetX = -20;
  private static readonly mainCloseHitOffsetX = 358;
  private static readonly mainCloseHitOffsetY = -310;
  private static readonly lockedCloseHitOffsetX = 150;
  private static readonly lockedCloseHitOffsetY = -112;
  private static readonly closeHitAreaSize = 76;
  private static readonly bottomCloseOffsetX = 0;
  private static readonly bottomCloseOffsetY = 314;
  private static readonly bottomCloseHitWidth = 220;
  private static readonly bottomCloseHitHeight = 56;
  private static readonly startRewardSlotIndex = 11;
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
      ) => this.handleCloseClick(event),
    );
    this.topCloseHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => this.handleCloseClick(event),
    );
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
        fontSize: 13,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);

    const reward = infinityTowerRewardsConfig[index];
    amountText.setText(`x${reward?.amount ?? 0}`);

    return {
      icon,
      amountText,
      button,
      buttonLabel,
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
          fontSize: 14,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 3,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfiniteModeModal.depth + 4)
      .setVisible(false);

    return {
      title,
      item,
      button,
      buttonLabel,
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

  private refresh() {
    this.title?.setText(languageController.t("infinite.unlockedTitle"));
    this.subtitle?.setText(languageController.t("infinite.subtitle"));
    this.closeLabel?.setText(languageController.t("infinite.close"));
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
    this.startReward?.buttonLabel.setText(
      languageController.t("infinite.rewardClaim"),
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

      slot.button.setTexture(
        isOpen
          ? InfiniteModeModal.rewardButtonOpenTextureKey
          : InfiniteModeModal.rewardButtonLockedTextureKey,
      );
      InfiniteModeModal.applyRewardButtonDisplaySize(slot.button);
      slot.buttonLabel.setText(
        languageController.t(
          isOpen ? "infinite.rewardOpen" : "infinite.rewardLocked",
        ),
      );
    });
  }

  private setVisible(visible: boolean) {
    const isTowerAvailable = this.profile.isInfinityTowerAvailable();

    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.panelBlocker?.setVisible(visible);
    this.title?.setVisible(visible);
    this.subtitle?.setVisible(visible);
    this.closeLabel?.setVisible(visible);
    this.closeHitArea?.setVisible(visible);
    this.topCloseHitArea?.setVisible(visible);
    this.rewardSlots.forEach((slot, index) => {
      const slotVisible = visible && !InfiniteModeModal.isBaseRewardSlot(index);

      slot.icon.setVisible(slotVisible);
      slot.amountText.setVisible(slotVisible);
      slot.button.setVisible(slotVisible);
      slot.buttonLabel.setVisible(slotVisible);
    });
    this.startReward?.title.setVisible(visible);
    this.startReward?.item.setVisible(visible);
    this.startReward?.button.setVisible(visible);
    this.startReward?.buttonLabel.setVisible(visible);
    this.setLockedPanelVisible(visible && !isTowerAvailable);

    if (visible) {
      this.overlay?.setInteractive();
      this.panelBlocker?.setInteractive();
      this.closeHitArea?.setInteractive({ useHandCursor: true });
      this.topCloseHitArea?.setInteractive({ useHandCursor: true });
    } else {
      this.overlay?.disableInteractive();
      this.panelBlocker?.disableInteractive();
      this.closeHitArea?.disableInteractive();
      this.topCloseHitArea?.disableInteractive();
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

  private handleCloseClick(event?: Phaser.Types.Input.EventData) {
    event?.stopPropagation();
    UiSoundPlayer.playClick(this.scene);
    this.close();
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
        textureKey: InfiniteModeModal.rewardButtonOpenTextureKey,
        texturePath: InfiniteModeModal.rewardButtonOpenPath,
      },
      {
        textureKey: InfiniteModeModal.rewardButtonLockedTextureKey,
        texturePath: InfiniteModeModal.rewardButtonLockedPath,
      },
      {
        textureKey: InfiniteModeModal.emeraldIconTextureKey,
        texturePath: InfiniteModeModal.emeraldIconPath,
      },
    ];
  }

  private static isBaseRewardSlot(index: number) {
    return InfiniteModeModal.baseRewardSlotIndexes.includes(index);
  }

  private static applyRewardButtonDisplaySize(button: GameObjects.Image) {
    button.setDisplaySize(
      InfiniteModeModal.rewardButtonDisplayWidth,
      InfiniteModeModal.rewardButtonDisplayHeight,
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
