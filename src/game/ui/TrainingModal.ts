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
  background: GameObjects.Rectangle;
  iconFrame: GameObjects.Rectangle;
  icon: GameObjects.Image;
  title: GameObjects.Text;
  description: GameObjects.Text;
  level: GameObjects.Text;
  priceIcon: GameObjects.Image;
  price: GameObjects.Text;
  buyButton: TrainingButton;
  itemId?: TrainingItemId;
};

type TrainingAssetConfig = {
  key: string;
  path: string;
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
  private static readonly panelWidth = 760;
  private static readonly panelHeight = 560;
  private static readonly rowWidth = 650;
  private static readonly rowHeight = 70;
  private static readonly rowGap = 12;
  private static readonly rowStartY = -166;
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
  private balanceText?: GameObjects.Text;
  private rows: TrainingRow[] = [];
  private closeButton?: TrainingButton;
  private unsubscribeLanguageChange?: () => void;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;
  private isActionLocked = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly trainingController: TrainingController,
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
      this.unsubscribeLanguageChange?.();
      this.loaderSpinner.destroy();
    });
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
    this.clearUnlockActionTimer();
    this.isActionLocked = false;
  }

  private show() {
    this.pauseController.pause("training");
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
    this.balanceText = this.scene.add
      .text(centerX - 314, centerY - 248, "", {
        fontFamily: "Hardpixel",
        fontSize: 29,
        color: "#7dff76",
        stroke: "#123b12",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(TrainingModal.depth + 3)
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
      icon.setDisplaySize(
        TrainingModal.openButtonIconHoverSize,
        TrainingModal.openButtonIconHoverSize,
      );
    });
    hitArea.on("pointerout", () => {
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
      .setDisplaySize(42, 42)
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

    return {
      background,
      iconFrame,
      icon,
      title,
      description,
      level,
      priceIcon,
      price,
      buyButton,
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

  private handleBuy(itemId: TrainingItemId) {
    if (this.isActionLocked) {
      return;
    }

    this.trainingController.purchase(itemId);
    this.refresh();
  }

  private refresh() {
    this.openButton.label.setText(languageController.t("training.button"));

    if (!this.panel) {
      return;
    }

    this.title?.setText(languageController.t("training.title"));
    this.balanceText?.setText(String(this.trainingController.getBalance()));
    this.closeButton?.label.setText(languageController.t("training.close"));
    this.rows.forEach((row) => {
      if (!row.itemId) {
        return;
      }

      const state = this.trainingController.getItemState(row.itemId);

      this.setRowState(row, state);
    });
  }

  private setRowState(row: TrainingRow, state: TrainingItemState) {
    const isPanelVisible = this.panel?.visible === true;

    row.title.setText(languageController.t(state.config.titleKey));
    row.description.setText(
      languageController.t(state.config.descriptionKey, {
        value: TrainingModal.getDisplayValue(state.config),
      }),
    );
    row.level.setText(
      state.isInfinite ? String(state.level) : `${state.level}/${state.maxLevel}`,
    );
    row.priceIcon.setVisible(!state.isMaxLevel && isPanelVisible);
    row.price.setVisible(!state.isMaxLevel && isPanelVisible);
    row.price.setText(String(state.nextPrice ?? ""));
    row.buyButton.label.setText(
      state.isMaxLevel
        ? languageController.t("training.max")
        : languageController.t("training.buy"),
    );
    row.buyButton.label.setColor(
      state.canBuy || state.isMaxLevel ? "#ffffff" : "#ff8f8f",
    );
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.logo?.setVisible(visible);
    this.title?.setVisible(visible);
    this.balanceText?.setVisible(visible);

    if (visible) {
      this.overlay?.setInteractive();
    } else {
      this.overlay?.disableInteractive();
    }

    this.rows.forEach((row) => {
      this.setRowVisible(row, visible);
    });
    this.setButtonVisibleState(this.closeButton, visible);
  }

  private setRowVisible(row: TrainingRow, visible: boolean) {
    row.background.setVisible(visible);
    row.iconFrame.setVisible(visible);
    row.icon.setVisible(visible);
    row.title.setVisible(visible);
    row.description.setVisible(visible);
    row.level.setVisible(visible);
    row.buyButton.background.setVisible(visible);
    row.buyButton.label.setVisible(visible);
    row.buyButton.hitArea.setVisible(visible);
    row.priceIcon.setVisible(visible && row.price.text.length > 0);
    row.price.setVisible(visible && row.price.text.length > 0);
  }

  private setRowsInteractive(isInteractive: boolean) {
    this.rows.forEach((row) => {
      const state = row.itemId
        ? this.trainingController.getItemState(row.itemId)
        : undefined;
      const canInteract =
        isInteractive && Boolean(state) && !state?.isMaxLevel;

      if (canInteract) {
        row.buyButton.hitArea.setInteractive({ useHandCursor: true });
      } else {
        row.buyButton.hitArea.disableInteractive();
      }
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

  private handleEsc() {
    if (!this.pauseController.has("training")) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.close();
  }

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove();
    this.unlockActionTimer = undefined;
  }

  private static getDisplayValue(config: TrainingItemConfig) {
    if (config.stat === "punch-speed") {
      return Math.round(config.valuePerLevel * 100);
    }

    return Math.abs(config.valuePerLevel);
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
