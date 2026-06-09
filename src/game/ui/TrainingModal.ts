import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import {
  trainingConfig,
  type TrainingItemConfig,
  type TrainingItemId,
} from "../configs/training";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";
import {
  TrainingController,
  type TrainingItemState,
} from "../training/TrainingController";
import { LoadingSpinner } from "./LoadingSpinner";

type TrainingButton = {
  background: GameObjects.Image | GameObjects.Rectangle;
  icon?: GameObjects.Image;
  label: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
};

type TrainingRow = {
  baseX: number;
  baseY: number;
  background: GameObjects.Rectangle;
  iconFrame: GameObjects.Rectangle;
  icon: GameObjects.Image;
  iconBaseScaleX: number;
  iconBaseScaleY: number;
  isIconPulsing: boolean;
  title: GameObjects.Text;
  description: GameObjects.Text;
  level: GameObjects.Text;
  priceIcon: GameObjects.Image;
  price: GameObjects.Text;
  buyButton: TrainingButton;
  maxOverlay: GameObjects.Rectangle;
  maxLabelBackground: GameObjects.Image;
  maxLabel: GameObjects.Text;
  lockedOverlay: GameObjects.Rectangle;
  lockedLabel: GameObjects.Text;
  itemId?: TrainingItemId;
  state?: TrainingItemState;
};

type TrainingAssetConfig = {
  key: string;
  path: string;
};

type TrainingUnlockAnnouncementView = {
  overlay: GameObjects.Rectangle;
  panel: GameObjects.Image;
  message: GameObjects.Text;
  closeLabel: GameObjects.Text;
  closeHitArea: GameObjects.Rectangle;
};

export class TrainingModal {
  private static readonly depth = 1130;
  private static readonly buttonDepth = 1002;
  private static readonly actionLockDurationMs = 220;
  private static readonly openButtonX = 644;
  private static readonly openButtonY = 68;
  private static readonly openButtonSize = 100;
  private static readonly openButtonIconSize = 108;
  private static readonly openButtonIconHoverSize = 112;
  private static readonly openButtonIconPulseScale = 1.08;
  private static readonly panelWidth = 760;
  private static readonly panelHeight = 560;
  private static readonly rowWidth = 650;
  private static readonly rowHeight = 70;
  private static readonly rowIconSize = 42;
  private static readonly rowIconPulseScale = 1.14;
  private static readonly rowGap = 12;
  private static readonly rowStartY = -166;
  private static readonly rowsScrollViewport = {
    offsetX: 0,
    offsetY: 4,
    width: 690,
    height: 410,
  };
  private static readonly scrollStep = 62;
  private static readonly maxOverlayAlpha = 0.58;
  private static readonly maxLabelBackgroundWidth = 260;
  private static readonly maxLabelBackgroundHeight = 70;
  private static readonly maxLabelBackgroundTextureKey =
    "training-maximum-background";
  private static readonly maxLabelBackgroundPath =
    "assets/images/ui/infinity-tower/fight-button.png";
  private static readonly unlockAnnouncementPanelTextureKey =
    "training-unlock-announcement-panel";
  private static readonly unlockAnnouncementPanelPath =
    "assets/images/ui/infinity-tower/reward-details-panel.png";
  private static readonly unlockAnnouncementCloseOffsetY = 170;
  private static readonly unlockAnnouncementCloseHitWidth = 220;
  private static readonly unlockAnnouncementCloseHitHeight = 58;
  private static readonly unlockAnnouncementMessageWrapWidth = 420;
  private static readonly lockedLabelWrapWidth = 520;
  private static readonly iconPulseDurationMs = 520;
  private static readonly openButtonColor = 0x3a2a43;
  private static readonly openButtonHoverColor = 0x4a3a53;
  private static readonly openButtonAlpha = 0.95;
  private static readonly openButtonIconTextureKey = "training-button-icon";
  private static readonly openButtonIconPath =
    "assets/images/ui/training/training-button-icon.png";
  private static readonly emeraldIconTextureKey = "training-emerald-icon";
  private static readonly emeraldIconPath = "assets/images/ui/icons/emerald.png";
  private static readonly assets: TrainingAssetConfig[] = [
    {
      key: "training-panel-background",
      path: "assets/images/ui/training/background-training.png",
    },
    {
      key: "training-buy-button",
      path: "assets/images/ui/training/buy-button.png",
    },
    {
      key: "training-close-button",
      path: "assets/images/ui/training/close-button.png",
    },
    {
      key: "training-logo-background",
      path: "assets/images/ui/training/logo.png",
    },
    {
      key: TrainingModal.emeraldIconTextureKey,
      path: TrainingModal.emeraldIconPath,
    },
    {
      key: TrainingModal.maxLabelBackgroundTextureKey,
      path: TrainingModal.maxLabelBackgroundPath,
    },
    {
      key: TrainingModal.unlockAnnouncementPanelTextureKey,
      path: TrainingModal.unlockAnnouncementPanelPath,
    },
  ];

  static preload(scene: Scene) {
    scene.load.image(
      TrainingModal.openButtonIconTextureKey,
      TrainingModal.openButtonIconPath,
    );
  }

  private readonly openButton: TrainingButton;
  private readonly loaderSpinner: LoadingSpinner;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private logo?: GameObjects.Image;
  private title?: GameObjects.Text;
  private rowsViewportHitArea?: GameObjects.Rectangle;
  private unlockAnnouncement?: TrainingUnlockAnnouncementView;
  private rows: TrainingRow[] = [];
  private closeButton?: TrainingButton;
  private unsubscribeLanguageChange?: () => void;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;
  private isActionLocked = false;
  private scrollOffsetY = 0;
  private maxScrollOffsetY = 0;
  private isDraggingScroll = false;
  private dragStartY = 0;
  private dragStartScrollOffsetY = 0;
  private openButtonIconBaseScaleX = 1;
  private openButtonIconBaseScaleY = 1;
  private isOpenButtonIconPulsing = false;
  private isUnlockAnnouncementDismissedForOpen = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly trainingController: TrainingController,
    private readonly onPurchase?: () => void,
  ) {
    this.openButton = this.createOpenButton();
    this.loaderSpinner = new LoadingSpinner(
      this.scene,
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      TrainingModal.depth + 20,
    );

    this.scene.input.keyboard?.on("keydown-ESC", this.handleEsc, this);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.scene.input.keyboard?.off("keydown-ESC", this.handleEsc, this);
      this.scene.input.off("wheel", this.handleWheel, this);
      this.unsubscribeLanguageChange?.();
      this.setOpenButtonIconPulsing(false);
      this.rows.forEach((row) => {
        this.setRowIconPulsing(row, false);
      });
      this.loaderSpinner.destroy();
    });
    this.scene.input.on("wheel", this.handleWheel, this);
  }

  setButtonVisible(visible: boolean) {
    this.openButton.background.setVisible(false);
    this.openButton.icon?.setVisible(visible);
    this.openButton.label.setVisible(false);
    this.openButton.hitArea.setVisible(visible);

    if (visible) {
      this.openButton.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButton.hitArea.disableInteractive();
      this.openButton.icon?.setDisplaySize(
        TrainingModal.openButtonIconSize,
        TrainingModal.openButtonIconSize,
      );
    }

    this.updateOpenButtonPulse();
  }

  open() {
    if (this.pauseController.isPaused || this.isLoadingAssets) {
      return;
    }

    if (this.isAssetsLoaded || TrainingModal.areAssetsLoaded(this.scene)) {
      this.isAssetsLoaded = true;
      this.ensureCreated();
      this.show();
      return;
    }

    this.showLoader();
    this.isLoadingAssets = true;
    TrainingModal.loadAssets(this.scene, () => {
      this.isLoadingAssets = false;
      this.hideLoader();
      this.isAssetsLoaded = true;
      this.ensureCreated();
      this.show();
    });
  }

  close() {
    if (!this.pauseController.has("training")) {
      return;
    }

    this.pauseController.resume("training");
    this.setVisible(false);
    this.setUnlockAnnouncementVisible(false);
    this.clearUnlockActionTimer();
    this.isActionLocked = false;
  }

  private show() {
    this.pauseController.pause("training");
    this.isUnlockAnnouncementDismissedForOpen = false;
    this.refresh();
    this.setVisible(true);
    this.isActionLocked = true;
    this.setRowsInteractive(false);
    this.unlockActionTimer = this.scene.time.delayedCall(
      TrainingModal.actionLockDurationMs,
      () => {
        this.isActionLocked = false;
        this.unlockActionTimer = undefined;
        this.setRowsInteractive(true);
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
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.6)
      .setDepth(TrainingModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, "training-panel-background")
      .setDisplaySize(TrainingModal.panelWidth, TrainingModal.panelHeight)
      .setDepth(TrainingModal.depth + 1)
      .setVisible(false);
    this.logo = this.scene.add
      .image(centerX, centerY - 246, "training-logo-background")
      .setDisplaySize(420, 74)
      .setDepth(TrainingModal.depth + 2)
      .setVisible(false);
    this.title = this.scene.add
      .text(centerX, centerY - 250, languageController.t("training.title"), {
        fontFamily: "Hardpixel",
        fontSize: 30,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 3)
      .setVisible(false);
    this.rowsViewportHitArea = this.scene.add
      .rectangle(
        centerX + TrainingModal.rowsScrollViewport.offsetX,
        centerY + TrainingModal.rowsScrollViewport.offsetY,
        TrainingModal.rowsScrollViewport.width,
        TrainingModal.rowsScrollViewport.height,
        0x000000,
        0,
      )
      .setDepth(TrainingModal.depth + 3)
      .setInteractive({ useHandCursor: false })
      .setVisible(false);
    this.rows = this.trainingController
      .getItems()
      .map((item, index) => this.createRow(item, index, centerX, centerY));
    this.closeButton = this.createImageButton(
      centerX,
      centerY + 246,
      230,
      58,
      "training-close-button",
      languageController.t("training.close"),
      () => {
        UiSoundPlayer.playClick(this.scene);
        this.close();
      },
    );
    this.unlockAnnouncement = this.createUnlockAnnouncement(centerX, centerY);

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
    this.rowsViewportHitArea.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.handleScrollPointerDown(pointer);
      },
    );
    this.rowsViewportHitArea.on("pointermove", this.handleScrollPointerMove, this);
    this.rowsViewportHitArea.on("pointerup", this.handleScrollPointerUp, this);
    this.rowsViewportHitArea.on("pointerout", this.handleScrollPointerUp, this);
  }

  private createOpenButton() {
    const background = this.scene.add
      .rectangle(
        TrainingModal.openButtonX,
        TrainingModal.openButtonY,
        TrainingModal.openButtonSize,
        TrainingModal.openButtonSize,
        TrainingModal.openButtonColor,
        TrainingModal.openButtonAlpha,
      )
      .setDepth(TrainingModal.buttonDepth)
      .setVisible(false);
    const icon = this.scene.add
      .image(
        TrainingModal.openButtonX,
        TrainingModal.openButtonY,
        TrainingModal.openButtonIconTextureKey,
      )
      .setDisplaySize(
        TrainingModal.openButtonIconSize,
        TrainingModal.openButtonIconSize,
      )
      .setDepth(TrainingModal.buttonDepth + 1);
    this.openButtonIconBaseScaleX = icon.scaleX;
    this.openButtonIconBaseScaleY = icon.scaleY;
    const label = this.scene.add
      .text(
        TrainingModal.openButtonX,
        TrainingModal.openButtonY + 38,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 18,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 4,
          align: "center",
          wordWrap: {
            width: TrainingModal.openButtonSize - 14,
          },
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.buttonDepth + 1)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        TrainingModal.openButtonX,
        TrainingModal.openButtonY,
        TrainingModal.openButtonSize,
        TrainingModal.openButtonSize,
        0x000000,
        0,
      )
      .setDepth(TrainingModal.buttonDepth + 2)
      .setInteractive({ useHandCursor: true });

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    hitArea.on("pointerover", () => {
      if (this.isOpenButtonIconPulsing) {
        return;
      }

      icon.setDisplaySize(
        TrainingModal.openButtonIconHoverSize,
        TrainingModal.openButtonIconHoverSize,
      );
    });
    hitArea.on("pointerout", () => {
      if (this.isOpenButtonIconPulsing) {
        return;
      }

      icon.setDisplaySize(
        TrainingModal.openButtonIconSize,
        TrainingModal.openButtonIconSize,
      );
    });

    return {
      background,
      icon,
      label,
      hitArea,
    };
  }

  private createRow(
    item: TrainingItemConfig,
    index: number,
    centerX: number,
    centerY: number,
  ): TrainingRow {
    const y =
      centerY +
      TrainingModal.rowStartY +
      index * (TrainingModal.rowHeight + TrainingModal.rowGap);
    const background = this.scene.add
      .rectangle(
        centerX,
        y,
        TrainingModal.rowWidth - 42,
        TrainingModal.rowHeight,
        0x1d1d1d,
        0.9,
      )
      .setDepth(TrainingModal.depth + 2)
      .setStrokeStyle(3, 0x070707, 0.95)
      .setVisible(false);
    const iconFrame = this.scene.add
      .rectangle(centerX - 270, y, 52, 52, 0x2f2f2f, 0.98)
      .setDepth(TrainingModal.depth + 3)
      .setStrokeStyle(2, 0x070707, 0.95)
      .setVisible(false);
    const icon = this.scene.add
      .image(centerX - 270, y, item.iconTextureKey)
      .setDisplaySize(TrainingModal.rowIconSize, TrainingModal.rowIconSize)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const title = this.scene.add
      .text(centerX - 220, y - 13, "", {
        fontFamily: "Hardpixel",
        fontSize: 21,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const description = this.scene.add
      .text(centerX - 220, y + 15, "", {
        fontFamily: "Hardpixel",
        fontSize: 19,
        color: "#f6e36b",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const level = this.scene.add
      .text(centerX + 32, y, "", {
        fontFamily: "Hardpixel",
        fontSize: 21,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const priceIcon = this.scene.add
      .image(centerX + 105, y, TrainingModal.emeraldIconTextureKey)
      .setDisplaySize(30, 38)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const price = this.scene.add
      .text(centerX + 129, y, "", {
        fontFamily: "Hardpixel",
        fontSize: 25,
        color: "#7dff76",
        stroke: "#123b12",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 4)
      .setVisible(false);
    const buyButton = this.createImageButton(
      centerX + 246,
      y,
      128,
      52,
      "training-buy-button",
      "",
      () => {
        this.handleBuy(item.id);
      },
    );
    const maxOverlay = this.scene.add
      .rectangle(
        centerX,
        y,
        TrainingModal.rowWidth - 42,
        TrainingModal.rowHeight,
        0x000000,
        TrainingModal.maxOverlayAlpha,
      )
      .setDepth(TrainingModal.depth + 8)
      .setVisible(false);
    const maxLabelBackground = this.scene.add
      .image(
        centerX,
        y,
        TrainingModal.maxLabelBackgroundTextureKey,
      )
      .setDepth(TrainingModal.depth + 9)
      .setDisplaySize(
        TrainingModal.maxLabelBackgroundWidth,
        TrainingModal.maxLabelBackgroundHeight,
      )
      .setVisible(false);
    const maxLabel = this.scene.add
      .text(centerX, y, languageController.t("training.maximum"), {
        fontFamily: "Hardpixel",
        fontSize: 21,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 10)
      .setVisible(false);
    const lockedOverlay = this.scene.add
      .rectangle(
        centerX,
        y,
        TrainingModal.rowWidth - 42,
        TrainingModal.rowHeight,
        0x000000,
        TrainingModal.maxOverlayAlpha,
      )
      .setDepth(TrainingModal.depth + 8)
      .setVisible(false);
    const lockedLabel = this.scene.add
      .text(centerX, y, languageController.t("training.locked.infinityTower"), {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
        wordWrap: {
          width: TrainingModal.lockedLabelWrapWidth,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 10)
      .setVisible(false);

    return {
      baseX: centerX,
      baseY: y,
      background,
      iconFrame,
      icon,
      iconBaseScaleX: icon.scaleX,
      iconBaseScaleY: icon.scaleY,
      isIconPulsing: false,
      title,
      description,
      level,
      priceIcon,
      price,
      buyButton,
      maxOverlay,
      maxLabelBackground,
      maxLabel,
      lockedOverlay,
      lockedLabel,
      itemId: item.id,
    };
  }

  private createImageButton(
    x: number,
    y: number,
    width: number,
    height: number,
    textureKey: string,
    labelText: string,
    onClick: () => void,
  ): TrainingButton {
    const background = this.scene.add
      .image(x, y, textureKey)
      .setDisplaySize(width, height)
      .setDepth(TrainingModal.depth + 5)
      .setVisible(false);
    const label = this.scene.add
      .text(x, y, labelText, {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 6)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(x, y, width, height, 0x000000, 0)
      .setDepth(TrainingModal.depth + 7)
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
      TrainingModal.setButtonBackgroundTint(background);
    });
    hitArea.on("pointerout", () => {
      TrainingModal.clearButtonBackgroundTint(background);
    });

    return {
      background,
      label,
      hitArea,
    };
  }

  private createUnlockAnnouncement(
    centerX: number,
    centerY: number,
  ): TrainingUnlockAnnouncementView {
    const overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.42)
      .setDepth(TrainingModal.depth + 30)
      .setInteractive()
      .setVisible(false);
    const panel = this.scene.add
      .image(
        centerX,
        centerY,
        TrainingModal.unlockAnnouncementPanelTextureKey,
      )
      .setDepth(TrainingModal.depth + 31)
      .setVisible(false);
    const message = this.scene.add
      .text(centerX, centerY - 20, "", {
        fontFamily: "Hardpixel",
        fontSize: 25,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
        wordWrap: {
          width: TrainingModal.unlockAnnouncementMessageWrapWidth,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 32)
      .setVisible(false);
    const closeLabel = this.scene.add
      .text(
        centerX,
        centerY + TrainingModal.unlockAnnouncementCloseOffsetY,
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
      .setDepth(TrainingModal.depth + 32)
      .setVisible(false);
    const closeHitArea = this.scene.add
      .rectangle(
        centerX,
        centerY + TrainingModal.unlockAnnouncementCloseOffsetY,
        TrainingModal.unlockAnnouncementCloseHitWidth,
        TrainingModal.unlockAnnouncementCloseHitHeight,
        0x000000,
        0,
      )
      .setDepth(TrainingModal.depth + 33)
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
      ) => this.handleUnlockAnnouncementClose(event),
    );

    return {
      overlay,
      panel,
      message,
      closeLabel,
      closeHitArea,
    };
  }

  private handleBuy(itemId: TrainingItemId) {
    if (this.isActionLocked) {
      return;
    }

    const result = this.trainingController.purchase(itemId);

    if (result.success) {
      this.onPurchase?.();
    }

    this.refresh();
  }

  private refresh() {
    this.openButton.label.setText(languageController.t("training.button"));

    if (!this.panel) {
      return;
    }

    this.title?.setText(languageController.t("training.title"));
    this.closeButton?.label.setText(languageController.t("training.close"));
    this.updateMaxScrollOffset();
    this.rows.forEach((row) => {
      if (!row.itemId) {
        return;
      }

      const state = this.trainingController.getItemState(row.itemId);

      this.setRowState(row, state);
      this.setRowVisible(row, this.panel?.visible === true);
    });
    this.setRowsInteractive(!this.isActionLocked);
    this.updateOpenButtonPulse();
    this.refreshUnlockAnnouncement();
  }

  private setRowState(row: TrainingRow, state: TrainingItemState) {
    const isPanelVisible = this.panel?.visible === true;
    const showTowerUnlockHint = TrainingModal.shouldShowTowerUnlockHint(state);
    const showMaxOverlay =
      state.isUnlocked && state.isMaxLevel && !showTowerUnlockHint;
    const showLockedOverlay = !state.isUnlocked || showTowerUnlockHint;

    row.state = state;
    row.title.setText(languageController.t(state.titleKey));
    row.description.setText(
      state.isUnlocked
        ? languageController.t(state.descriptionKey, {
            value: TrainingModal.getDisplayValue(state),
          })
        : "",
    );
    row.title.setColor("#ffffff");
    row.description.setColor("#f6e36b");
    row.level.setText(
      state.isInfinite
        ? String(state.displayLevel)
        : `${state.displayLevel}/${state.maxLevel}`,
    );
    row.priceIcon.setVisible(state.isUnlocked && !state.isMaxLevel && isPanelVisible);
    row.price.setVisible(state.isUnlocked && !state.isMaxLevel && isPanelVisible);
    row.price.setText(String(state.nextPrice ?? ""));
    row.buyButton.background.setVisible(
      state.isUnlocked && !state.isMaxLevel && isPanelVisible,
    );
    row.buyButton.label.setVisible(
      state.isUnlocked && !state.isMaxLevel && isPanelVisible,
    );
    row.buyButton.hitArea.setVisible(
      state.isUnlocked && !state.isMaxLevel && isPanelVisible,
    );
    row.buyButton.label.setText(
      languageController.t("training.buy"),
    );
    row.buyButton.label.setColor(
      state.canBuy || state.isMaxLevel ? "#ffffff" : "#ff8f8f",
    );
    row.maxLabel.setText(languageController.t("training.maximum"));
    row.maxOverlay.setVisible(showMaxOverlay && isPanelVisible);
    row.maxLabelBackground.setVisible(showMaxOverlay && isPanelVisible);
    row.maxLabel.setVisible(showMaxOverlay && isPanelVisible);
    row.lockedLabel.setText(
      languageController.t(
        state.lockedReasonKey ?? "training.locked.infinityTower",
      ),
    );
    row.lockedOverlay.setVisible(showLockedOverlay && isPanelVisible);
    row.lockedLabel.setVisible(showLockedOverlay && isPanelVisible);
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.logo?.setVisible(visible);
    this.title?.setVisible(visible);
    this.rowsViewportHitArea?.setVisible(visible);

    if (visible) {
      this.overlay?.setInteractive();
      this.rowsViewportHitArea?.setInteractive({ useHandCursor: false });
      this.updateMaxScrollOffset();
    } else {
      this.overlay?.disableInteractive();
      this.rowsViewportHitArea?.disableInteractive();
      this.isDraggingScroll = false;
    }

    this.rows.forEach((row) => {
      this.setRowVisible(row, visible);
    });
    this.setButtonVisibleState(this.closeButton, visible);

    if (visible) {
      this.refreshUnlockAnnouncement();
    } else {
      this.setUnlockAnnouncementVisible(false);
    }
  }

  private setRowVisible(row: TrainingRow, visible: boolean) {
    this.applyRowPosition(row);

    const state = row.state;
    const canShowRow = visible && this.isRowOverlappingViewport(row);
    const canShowAction = canShowRow && Boolean(state?.isUnlocked) && !state?.isMaxLevel;
    const canShowTowerUnlockHint =
      state !== undefined && TrainingModal.shouldShowTowerUnlockHint(state);
    const canShowMaxOverlay =
      canShowRow &&
      Boolean(state?.isUnlocked) &&
      Boolean(state?.isMaxLevel) &&
      !canShowTowerUnlockHint;
    const canShowLockedOverlay =
      canShowRow &&
      Boolean(state) &&
      (!state?.isUnlocked || canShowTowerUnlockHint);

    row.background.setVisible(canShowRow);
    row.iconFrame.setVisible(canShowRow);
    row.icon.setVisible(canShowRow);
    row.title.setVisible(canShowRow);
    row.description.setVisible(canShowRow && row.description.text.length > 0);
    row.level.setVisible(canShowRow);
    row.buyButton.background.setVisible(canShowAction);
    row.buyButton.label.setVisible(canShowAction);
    row.buyButton.hitArea.setVisible(canShowAction);
    row.priceIcon.setVisible(canShowAction && row.price.text.length > 0);
    row.price.setVisible(canShowAction && row.price.text.length > 0);
    row.maxOverlay.setVisible(canShowMaxOverlay);
    row.maxLabelBackground.setVisible(canShowMaxOverlay);
    row.maxLabel.setVisible(canShowMaxOverlay);
    row.lockedOverlay.setVisible(canShowLockedOverlay);
    row.lockedLabel.setVisible(canShowLockedOverlay);
    this.updateRowIconPulse(row, canShowAction && Boolean(state?.canBuy));

    this.applyViewportClip(row);
  }

  private setRowsInteractive(isInteractive: boolean) {
    this.rows.forEach((row) => {
      const state = row.itemId
        ? this.trainingController.getItemState(row.itemId)
        : undefined;
      const canInteract =
        isInteractive &&
        Boolean(state) &&
        Boolean(state?.isUnlocked) &&
        !state?.isMaxLevel &&
        Boolean(state?.canBuy) &&
        this.isPointInsideRowsViewport(
          row.buyButton.hitArea.x,
          row.buyButton.hitArea.y,
        );

      if (canInteract) {
        row.buyButton.hitArea.setInteractive({ useHandCursor: true });
      } else {
        row.buyButton.hitArea.disableInteractive();
      }
    });
  }

  private refreshUnlockAnnouncement() {
    const announcement = this.unlockAnnouncement;

    if (!announcement) {
      return;
    }

    announcement.message.setText(
      languageController.t("training.infinityUnlocked.message"),
    );
    announcement.closeLabel.setText(languageController.t("training.close"));

    const shouldShow =
      this.panel?.visible === true &&
      !this.isUnlockAnnouncementDismissedForOpen &&
      this.trainingController.shouldShowInfinityTowerTrainingAnnouncement();

    this.setUnlockAnnouncementVisible(shouldShow);
  }

  private setUnlockAnnouncementVisible(visible: boolean) {
    const announcement = this.unlockAnnouncement;

    if (!announcement) {
      return;
    }

    announcement.overlay.setVisible(visible);
    announcement.panel.setVisible(visible);
    announcement.message.setVisible(visible);
    announcement.closeLabel.setVisible(visible);
    announcement.closeHitArea.setVisible(visible);

    if (visible) {
      announcement.overlay.setInteractive();
      announcement.closeHitArea.setInteractive({ useHandCursor: true });
    } else {
      announcement.overlay.disableInteractive();
      announcement.closeHitArea.disableInteractive();
    }
  }

  private handleUnlockAnnouncementClose(
    event?: Phaser.Types.Input.EventData,
  ) {
    event?.stopPropagation();
    UiSoundPlayer.playClick(this.scene);
    this.isUnlockAnnouncementDismissedForOpen = true;
    this.setUnlockAnnouncementVisible(false);
  }

  private updateOpenButtonPulse() {
    const shouldPulse =
      this.openButton.icon?.visible === true &&
      this.trainingController.getItemStates().some((state) => state.canBuy);

    this.setOpenButtonIconPulsing(shouldPulse);
  }

  private setOpenButtonIconPulsing(shouldPulse: boolean) {
    const icon = this.openButton.icon;

    if (!icon || this.isOpenButtonIconPulsing === shouldPulse) {
      return;
    }

    this.isOpenButtonIconPulsing = shouldPulse;
    this.scene.tweens.killTweensOf(icon);
    icon.setScale(
      this.openButtonIconBaseScaleX,
      this.openButtonIconBaseScaleY,
    );

    if (!shouldPulse) {
      return;
    }

    this.scene.tweens.add({
      targets: icon,
      scaleX:
        this.openButtonIconBaseScaleX *
        TrainingModal.openButtonIconPulseScale,
      scaleY:
        this.openButtonIconBaseScaleY *
        TrainingModal.openButtonIconPulseScale,
      duration: TrainingModal.iconPulseDurationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private updateRowIconPulse(row: TrainingRow, shouldPulse: boolean) {
    if (row.isIconPulsing === shouldPulse) {
      return;
    }

    this.setRowIconPulsing(row, shouldPulse);
  }

  private setRowIconPulsing(row: TrainingRow, shouldPulse: boolean) {
    row.isIconPulsing = shouldPulse;
    this.scene.tweens.killTweensOf(row.icon);
    row.icon.setScale(row.iconBaseScaleX, row.iconBaseScaleY);

    if (!shouldPulse) {
      return;
    }

    this.scene.tweens.add({
      targets: row.icon,
      scaleX: row.iconBaseScaleX * TrainingModal.rowIconPulseScale,
      scaleY: row.iconBaseScaleY * TrainingModal.rowIconPulseScale,
      duration: TrainingModal.iconPulseDurationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private setButtonVisibleState(
    button: TrainingButton | undefined,
    visible: boolean,
  ) {
    if (!button) {
      return;
    }

    button.background.setVisible(visible);
    button.icon?.setVisible(visible);
    button.label.setVisible(visible);
    button.hitArea.setVisible(visible);

    if (visible) {
      button.hitArea.setInteractive({ useHandCursor: true });
    } else {
      button.hitArea.disableInteractive();
    }
  }

  private showLoader() {
    this.loaderSpinner.show();
  }

  private hideLoader() {
    this.loaderSpinner.hide();
  }

  private handleWheel(
    _pointer: Phaser.Input.Pointer,
    _gameObjects: GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ) {
    if (!this.pauseController.has("training") || !this.panel?.visible) {
      return;
    }

    this.setScrollOffset(
      this.scrollOffsetY + Math.sign(deltaY) * TrainingModal.scrollStep,
    );
  }

  private handleScrollPointerDown(pointer: Phaser.Input.Pointer) {
    if (!this.panel?.visible) {
      return;
    }

    this.isDraggingScroll = true;
    this.dragStartY = pointer.y;
    this.dragStartScrollOffsetY = this.scrollOffsetY;
  }

  private handleScrollPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDraggingScroll) {
      return;
    }

    this.setScrollOffset(
      this.dragStartScrollOffsetY + this.dragStartY - pointer.y,
    );
  }

  private handleScrollPointerUp() {
    this.isDraggingScroll = false;
  }

  private updateMaxScrollOffset() {
    const rowStride = TrainingModal.rowHeight + TrainingModal.rowGap;
    const contentHeight =
      this.rows.length === 0
        ? 0
        : (this.rows.length - 1) * rowStride + TrainingModal.rowHeight;

    this.maxScrollOffsetY = Math.max(
      0,
      contentHeight - TrainingModal.rowsScrollViewport.height,
    );
    this.setScrollOffset(Math.min(this.scrollOffsetY, this.maxScrollOffsetY));
  }

  private setScrollOffset(offsetY: number) {
    const nextOffset = TrainingModal.clamp(
      offsetY,
      0,
      this.maxScrollOffsetY,
    );

    if (nextOffset === this.scrollOffsetY) {
      this.applyScrollOffset();
      return;
    }

    this.scrollOffsetY = nextOffset;
    this.applyScrollOffset();
  }

  private applyScrollOffset() {
    this.rows.forEach((row) => {
      this.applyRowPosition(row);
      this.setRowVisible(row, this.panel?.visible === true);
    });
    this.setRowsInteractive(!this.isActionLocked);
  }

  private applyRowPosition(row: TrainingRow) {
    const x = row.baseX;
    const y = row.baseY - this.scrollOffsetY;

    row.background
      .setPosition(x, y)
      .setDisplaySize(TrainingModal.rowWidth - 42, TrainingModal.rowHeight);
    row.iconFrame.setPosition(x - 270, y).setDisplaySize(52, 52);
    row.icon.setPosition(x - 270, y);
    row.title.setPosition(x - 220, y - 13);
    row.description.setPosition(x - 220, y + 15);
    row.level.setPosition(x + 32, y);
    row.priceIcon.setPosition(x + 105, y);
    row.price.setPosition(x + 129, y);
    row.buyButton.background.setPosition(x + 246, y);
    row.buyButton.label.setPosition(x + 246, y);
    row.buyButton.hitArea.setPosition(x + 246, y);
    row.maxOverlay
      .setPosition(x, y)
      .setDisplaySize(TrainingModal.rowWidth - 42, TrainingModal.rowHeight);
    row.maxLabelBackground
      .setPosition(x, y)
      .setDisplaySize(
        TrainingModal.maxLabelBackgroundWidth,
        TrainingModal.maxLabelBackgroundHeight,
      );
    row.maxLabel.setPosition(x, y);
    row.lockedOverlay
      .setPosition(x, y)
      .setDisplaySize(TrainingModal.rowWidth - 42, TrainingModal.rowHeight);
    row.lockedLabel.setPosition(x, y);
  }

  private isRowOverlappingViewport(row: TrainingRow) {
    const y = row.baseY - this.scrollOffsetY;
    const viewport = this.getRowsViewport();
    const halfHeight = TrainingModal.rowHeight / 2;

    return y + halfHeight >= viewport.top && y - halfHeight <= viewport.bottom;
  }

  private applyViewportClip(row: TrainingRow) {
    this.cropRectangleToRowsViewport(row.background);
    this.cropRectangleToRowsViewport(row.iconFrame);
    this.cropImageToRowsViewport(row.icon);
    this.cropImageToRowsViewport(row.priceIcon);
    if (row.buyButton.background instanceof GameObjects.Image) {
      this.cropImageToRowsViewport(row.buyButton.background);
    }
    this.cropRectangleToRowsViewport(row.maxOverlay);
    this.cropImageToRowsViewport(row.maxLabelBackground);
    this.cropRectangleToRowsViewport(row.lockedOverlay);
    this.setTextVisibleInRowsViewport(row.title);
    this.setTextVisibleInRowsViewport(row.description);
    this.setTextVisibleInRowsViewport(row.level);
    this.setTextVisibleInRowsViewport(row.price);
    this.setTextVisibleInRowsViewport(row.buyButton.label);
    this.setTextVisibleInRowsViewport(row.maxLabel);
    this.setTextVisibleInRowsViewport(row.lockedLabel);
  }

  private cropImageToRowsViewport(image: GameObjects.Image | undefined) {
    if (!image?.visible) {
      return;
    }

    const viewport = this.getRowsViewport();
    const displayWidth = image.displayWidth;
    const displayHeight = image.displayHeight;
    const left = image.x - displayWidth * image.originX;
    const top = image.y - displayHeight * image.originY;
    const right = left + displayWidth;
    const bottom = top + displayHeight;
    const visibleLeft = TrainingModal.clamp(left, viewport.left, viewport.right);
    const visibleTop = TrainingModal.clamp(top, viewport.top, viewport.bottom);
    const visibleRight = TrainingModal.clamp(right, viewport.left, viewport.right);
    const visibleBottom = TrainingModal.clamp(bottom, viewport.top, viewport.bottom);
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;

    if (visibleWidth <= 0 || visibleHeight <= 0) {
      image.setVisible(false);
      return;
    }

    const source = image.texture.getSourceImage() as HTMLImageElement;
    const cropX = ((visibleLeft - left) / displayWidth) * source.width;
    const cropY = ((visibleTop - top) / displayHeight) * source.height;
    const cropWidth = (visibleWidth / displayWidth) * source.width;
    const cropHeight = (visibleHeight / displayHeight) * source.height;

    image.setCrop(cropX, cropY, cropWidth, cropHeight);
  }

  private cropRectangleToRowsViewport(rectangle: GameObjects.Rectangle) {
    if (!rectangle.visible) {
      return;
    }

    const viewport = this.getRowsViewport();
    const displayWidth = rectangle.displayWidth;
    const displayHeight = rectangle.displayHeight;
    const left = rectangle.x - displayWidth * rectangle.originX;
    const top = rectangle.y - displayHeight * rectangle.originY;
    const right = left + displayWidth;
    const bottom = top + displayHeight;
    const visibleLeft = TrainingModal.clamp(left, viewport.left, viewport.right);
    const visibleTop = TrainingModal.clamp(top, viewport.top, viewport.bottom);
    const visibleRight = TrainingModal.clamp(right, viewport.left, viewport.right);
    const visibleBottom = TrainingModal.clamp(bottom, viewport.top, viewport.bottom);
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;

    if (visibleWidth <= 0 || visibleHeight <= 0) {
      rectangle.setVisible(false);
      return;
    }

    rectangle
      .setPosition(visibleLeft + visibleWidth / 2, visibleTop + visibleHeight / 2)
      .setDisplaySize(visibleWidth, visibleHeight);
  }

  private setTextVisibleInRowsViewport(text: GameObjects.Text) {
    if (!text.visible) {
      return;
    }

    text.setVisible(this.isPointInsideRowsViewport(text.x, text.y));
  }

  private isPointInsideRowsViewport(x: number, y: number) {
    const viewport = this.getRowsViewport();

    return (
      x >= viewport.left &&
      x <= viewport.right &&
      y >= viewport.top &&
      y <= viewport.bottom
    );
  }

  private getRowsViewport() {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;
    const viewportX = centerX + TrainingModal.rowsScrollViewport.offsetX;
    const viewportY = centerY + TrainingModal.rowsScrollViewport.offsetY;

    return {
      left: viewportX - TrainingModal.rowsScrollViewport.width / 2,
      right: viewportX + TrainingModal.rowsScrollViewport.width / 2,
      top: viewportY - TrainingModal.rowsScrollViewport.height / 2,
      bottom: viewportY + TrainingModal.rowsScrollViewport.height / 2,
    };
  }

  private handleEsc() {
    if (!this.pauseController.has("training")) {
      return;
    }

    if (this.unlockAnnouncement?.overlay.visible) {
      this.handleUnlockAnnouncementClose();
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.close();
  }

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove();
    this.unlockActionTimer = undefined;
  }

  private static getDisplayValue(state: TrainingItemState) {
    if (
      state.config.stat === "punch-speed" ||
      state.config.stat === "critical-hit-chance"
    ) {
      return Math.round(Math.abs(state.valuePerLevel) * 100);
    }

    return Math.abs(state.valuePerLevel);
  }

  private static clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  private static shouldShowTowerUnlockHint(state: TrainingItemState) {
    return (
      state.isUnlocked &&
      state.isMaxLevel &&
      !state.isInfinite &&
      state.config.canExceedMaxLevelInInfinityTower !== false
    );
  }

  private static areAssetsLoaded(scene: Scene) {
    return TrainingModal.assets.every((asset) =>
      scene.textures.exists(asset.key),
    );
  }

  private static setButtonBackgroundTint(
    background: GameObjects.Image | GameObjects.Rectangle,
  ) {
    if (background instanceof GameObjects.Rectangle) {
      background.setFillStyle(
        TrainingModal.openButtonHoverColor,
        TrainingModal.openButtonAlpha,
      );
      return;
    }

    background.setTint(0xb8b8b8);
  }

  private static clearButtonBackgroundTint(
    background: GameObjects.Image | GameObjects.Rectangle,
  ) {
    if (background instanceof GameObjects.Rectangle) {
      background.setFillStyle(
        TrainingModal.openButtonColor,
        TrainingModal.openButtonAlpha,
      );
      return;
    }

    background.clearTint();
  }

  private static loadAssets(scene: Scene, onComplete: () => void) {
    TrainingModal.assets.forEach((asset) => {
      if (!scene.textures.exists(asset.key)) {
        scene.load.image(asset.key, asset.path);
      }
    });
    trainingConfig.items.forEach((item) => {
      if (!scene.textures.exists(item.iconTextureKey)) {
        scene.load.image(item.iconTextureKey, item.iconPath);
      }
    });

    scene.load.once("complete", onComplete);

    if (!scene.load.isLoading()) {
      scene.load.start();
    }
  }
}
