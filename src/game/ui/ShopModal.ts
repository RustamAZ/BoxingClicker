import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import type { GlovesEquipmentController } from "../entities/Gloves/GlovesEquipmentController";
import type { Wallet } from "../entities/Wallet/Wallet";
import { languageController } from "../localization/LanguageController";
import { ShopCatalog } from "../shop/ShopCatalog";
import type { ShopItemView } from "../shop/types";
import type { PauseController } from "../state/PauseController";
import { LoadingSpinner } from "./LoadingSpinner";

type ShopIconButton = {
  hitArea: GameObjects.Rectangle;
  icon: GameObjects.Image;
};

type ShopCloseButton = {
  background: GameObjects.Rectangle;
  hitArea: GameObjects.Rectangle;
  icon: GameObjects.Text;
};

type ShopItemCard = {
  background: GameObjects.Image;
  itemIcon: GameObjects.Image;
  attackText: GameObjects.Text;
  speedText: GameObjects.Text;
  buttonHitArea: GameObjects.Rectangle;
  buttonImage: GameObjects.Image;
  priceIcon: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  item?: ShopItemView;
};

type ShopItemSlot = {
  x: number;
  y: number;
};

type ShopAssetConfig = {
  textureKey: string;
  texturePath: string;
};

export class ShopModal {
  private static readonly depth = 1120;
  private static readonly shopIconTextureKey = "shop-icon";
  private static readonly shopIconPath = "assets/images/ui/icons/shop.png";
  private static readonly panelTextureKey = "shop-container";
  private static readonly panelPath = "assets/images/ui/shop/shop-container.png";
  private static readonly cardTextureKey = "shop-glove-card";
  private static readonly cardPath =
    "assets/images/ui/shop/cards/glove-card.png";
  private static readonly lockedCardTextureKey = "shop-glove-card-locked";
  private static readonly lockedCardPath =
    "assets/images/ui/shop/cards/glove-card-locked.png";
  private static readonly titlePlateTextureKey = "shop-title-plate";
  private static readonly titlePlatePath =
    "assets/images/ui/shop/shop-title-plate.png";
  private static readonly currencyPlateTextureKey = "shop-currency-plate";
  private static readonly currencyPlatePath =
    "assets/images/ui/shop/shop-currency-plate.png";
  private static readonly equippedButtonTextureKey = "shop-button-equipped";
  private static readonly equippedButtonPath =
    "assets/images/ui/shop/buttons/shop-button-equipped.png";
  private static readonly buyButtonTextureKey = "shop-button-buy";
  private static readonly buyButtonPath =
    "assets/images/ui/shop/buttons/shop-button-buy.png";
  private static readonly lockedButtonTextureKey = "shop-button-locked";
  private static readonly lockedButtonPath =
    "assets/images/ui/shop/buttons/shop-button-locked.png";
  private static readonly priceIconTextureKey = "shop-price-emerald-icon";
  private static readonly priceIconPath = "assets/images/ui/icons/emerald.png";
  private static readonly panelWidth = 900;
  private static readonly panelHeight = 680;
  private static readonly buttonSize = 128;
  private static readonly iconSize = 128;
  private static readonly iconHoverSize = 138;
  private static readonly actionLockDurationMs = 300;
  private static readonly normalCardWidth = 260;
  private static readonly normalCardHeight = 306;
  private static readonly lockedCardWidth = 275;
  private static readonly lockedCardHeight = 321;
  private static readonly itemIconMaxSize = 146;
  private static readonly cardButtonWidth = 232;
  private static readonly cardButtonHeight = 67;
  private static readonly cardButtonHoverScale = 1.06;
  private static readonly priceIconSize = 25;
  private static readonly closeButtonOffsetX = 410;
  private static readonly closeButtonOffsetY = -300;
  private static readonly closeButtonSize = 46;
  private static readonly itemSlots: ShopItemSlot[] = [
    { x: -260, y: -115 },
    { x: 0, y: -115 },
    { x: 260, y: -115 },
    { x: -260, y: 185 },
    { x: 0, y: 185 },
    { x: 260, y: 185 },
  ];

  private readonly shopButton: ShopIconButton;
  private readonly loaderSpinner: LoadingSpinner;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private panelBlocker?: GameObjects.Rectangle;
  private titlePlate?: GameObjects.Image;
  private titleText?: GameObjects.Text;
  private currencyPlate?: GameObjects.Image;
  private balanceText?: GameObjects.Text;
  private closeButton?: ShopCloseButton;
  private cards: ShopItemCard[] = [];
  private readonly unsubscribeLanguageChange: () => void;
  private isActionLocked = false;
  private isAssetsLoaded = false;
  private isLoadingAssets = false;
  private unlockActionTimer?: Phaser.Time.TimerEvent;

  static preload(scene: Scene) {
    scene.load.image(ShopModal.shopIconTextureKey, ShopModal.shopIconPath);
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly wallet: Wallet,
    private readonly glovesEquipmentController: GlovesEquipmentController,
  ) {
    this.shopButton = this.createShopButton(82, 240);
    this.loaderSpinner = new LoadingSpinner(
      this.scene,
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      ShopModal.depth + 20,
    );

    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
      this.loaderSpinner.destroy();
      this.scene.input.keyboard?.off("keydown-ESC", this.handleEsc, this);
    });
    this.scene.input.keyboard?.on("keydown-ESC", this.handleEsc, this);
  }

  open() {
    if (this.pauseController.isPaused || this.isLoadingAssets) {
      return;
    }

    if (!this.isAssetsLoaded && !ShopModal.areAssetsLoaded(this.scene)) {
      this.showLoader();
      this.isLoadingAssets = true;
      ShopModal.loadAssets(this.scene, () => {
        this.isLoadingAssets = false;
        this.hideLoader();
        this.isAssetsLoaded = true;
        this.ensureCreated();
        this.show();
      });
      return;
    }

    this.isAssetsLoaded = true;
    this.ensureCreated();
    this.show();
  }

  close() {
    if (!this.pauseController.has("shop")) {
      return;
    }

    this.pauseController.resume("shop");
    this.isActionLocked = false;
    this.clearUnlockActionTimer();
    this.setVisible(false);
  }

  setButtonVisible(visible: boolean) {
    this.shopButton.hitArea.setVisible(visible);
    this.shopButton.icon.setVisible(visible);

    if (visible) {
      this.shopButton.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.shopButton.icon.setDisplaySize(ShopModal.iconSize, ShopModal.iconSize);
      this.shopButton.hitArea.disableInteractive();
    }
  }

  private show() {
    this.pauseController.pause("shop");
    this.isActionLocked = true;
    this.clearUnlockActionTimer();
    this.refresh();
    this.setVisible(true);
    this.setCardsInteractive(false);
    this.unlockActionTimer = this.scene.time.delayedCall(
      ShopModal.actionLockDurationMs,
      () => {
        this.isActionLocked = false;
        this.unlockActionTimer = undefined;
        this.setCardsInteractive(true);
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
      .setDepth(ShopModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, ShopModal.panelTextureKey)
      .setDisplaySize(ShopModal.panelWidth, ShopModal.panelHeight)
      .setDepth(ShopModal.depth + 1)
      .setVisible(false);
    this.panelBlocker = this.scene.add
      .rectangle(
        centerX,
        centerY,
        ShopModal.panelWidth,
        ShopModal.panelHeight,
        0x000000,
        0,
      )
      .setDepth(ShopModal.depth + 2)
      .setInteractive()
      .setVisible(false);
    this.titlePlate = this.scene.add
      .image(centerX, centerY - 300, ShopModal.titlePlateTextureKey)
      .setDisplaySize(512, 128)
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    this.titleText = this.scene.add
      .text(centerX, centerY - 302, "", {
        fontFamily: "Hardpixel",
        fontSize: 29,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 4)
      .setVisible(false);
    this.currencyPlate = this.scene.add
      .image(centerX - 365, centerY - 300, ShopModal.currencyPlateTextureKey)
      .setDisplaySize(184, 96)
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    this.balanceText = this.scene.add
      .text(centerX - 366, centerY - 300, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 4)
      .setVisible(false);
    this.closeButton = this.createCloseButton(
      centerX + ShopModal.closeButtonOffsetX,
      centerY + ShopModal.closeButtonOffsetY,
    );
    this.cards = ShopModal.itemSlots.map((slot) =>
      this.createItemCard(centerX + slot.x, centerY + slot.y),
    );

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
  }

  private refresh() {
    if (!this.panel || !this.balanceText) {
      return;
    }

    const profile = this.wallet.getPlayer().profile;
    const itemViews = ShopCatalog.getItemViews(profile);

    this.titleText?.setText(languageController.t("shop.title"));
    this.balanceText.setText(String(this.wallet.getBalance()));

    this.cards.forEach((card, index) => {
      const item = itemViews[index];

      card.item = item;

      if (item) {
        this.setCardState(card, item);
      } else {
        this.setEmptyCard(card);
      }

      this.setCardVisible(card, this.panel?.visible === true);
    });
  }

  private handleItemAction(card: ShopItemCard) {
    if (this.isActionLocked || !card.item) {
      return;
    }

    const item = card.item;
    const profile = this.wallet.getPlayer().profile;

    if (item.isEquipped || item.status === "locked") {
      return;
    }

    if (profile.hasPurchasedItem(item.id)) {
      this.equipItem(item);
      return;
    }

    if (!this.wallet.withdraw(item.price)) {
      card.buttonLabel.setText(languageController.t("shop.noMoney"));
      card.buttonLabel.setColor("#ff5a5a");
      card.priceIcon.setVisible(false);
      return;
    }

    profile.purchaseItem(item.id);
    this.equipItem(item);
  }

  private equipItem(item: ShopItemView) {
    this.isActionLocked = true;
    this.showLoader();
    this.setCardsInteractive(false);
    this.glovesEquipmentController.loadAndEquipShopItem(
      this.scene,
      item.id,
      (isEquipped) => {
        this.hideLoader();
        this.isActionLocked = false;

        if (isEquipped) {
          this.refresh();
        }

        this.setCardsInteractive(true);
      },
    );
  }

  private setCardState(card: ShopItemCard, item: ShopItemView) {
    const isLocked = item.status === "locked";

    card.background.setTexture(
      isLocked ? ShopModal.lockedCardTextureKey : ShopModal.cardTextureKey,
    );
    this.setCardBackgroundSize(card.background, isLocked);
    card.itemIcon.setTexture(item.iconTextureKey);
    this.fitItemIcon(card.itemIcon);
    card.itemIcon.setVisible(!isLocked && card.background.visible);
    card.attackText.setText(ShopModal.formatAttackBonus(item.attackBonus));
    card.speedText.setText(ShopModal.formatSpeedBonus(item.attackSpeedBonus));
    card.buttonLabel.setColor("#ffffff");
    card.buttonLabel.setFontSize(21);

    if (isLocked) {
      this.setCardButtonTexture(card, ShopModal.lockedButtonTextureKey);
      card.attackText.setText("");
      card.speedText.setText("");
      card.buttonLabel.setText(languageController.t("shop.reachBoss"));
      card.buttonLabel.setFontSize(18);
      card.priceIcon.setVisible(false);
      card.buttonLabel.setX(card.buttonImage.x);
      return;
    }

    if (item.isEquipped) {
      this.setCardButtonTexture(card, ShopModal.equippedButtonTextureKey);
      card.buttonLabel.setText(languageController.t("shop.equipped"));
      card.priceIcon.setVisible(false);
      card.buttonLabel.setX(card.buttonImage.x);
      return;
    }

    this.setCardButtonTexture(card, ShopModal.buyButtonTextureKey);

    if (item.status === "purchased") {
      card.buttonLabel.setText(languageController.t("shop.equip"));
      card.priceIcon.setVisible(false);
      card.buttonLabel.setX(card.buttonImage.x);
      return;
    }

    if (item.price > 0) {
      card.buttonLabel.setText(String(item.price));
      card.priceIcon.setVisible(card.buttonImage.visible);
      card.buttonLabel.setX(card.buttonImage.x + 18);
      return;
    }

    card.buttonLabel.setText(languageController.t("common.free"));
    card.priceIcon.setVisible(false);
    card.buttonLabel.setX(card.buttonImage.x);
  }

  private setEmptyCard(card: ShopItemCard) {
    card.background.setTexture(ShopModal.lockedCardTextureKey);
    this.setCardBackgroundSize(card.background, true);
    card.itemIcon.setVisible(false);
    card.attackText.setText("");
    card.speedText.setText("");
    this.setCardButtonTexture(card, ShopModal.lockedButtonTextureKey);
    card.buttonLabel.setText("");
    card.buttonLabel.setFontSize(21);
    card.priceIcon.setVisible(false);
  }

  private createShopButton(x: number, y: number): ShopIconButton {
    const hitArea = this.scene.add
      .rectangle(x, y, ShopModal.buttonSize, ShopModal.buttonSize, 0x000000, 0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });
    const icon = this.scene.add
      .image(x, y, ShopModal.shopIconTextureKey)
      .setDisplaySize(ShopModal.iconSize, ShopModal.iconSize)
      .setDepth(1001);

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.open();
    });
    hitArea.on("pointerover", () => {
      icon.setDisplaySize(ShopModal.iconHoverSize, ShopModal.iconHoverSize);
    });
    hitArea.on("pointerout", () => {
      icon.setDisplaySize(ShopModal.iconSize, ShopModal.iconSize);
    });

    return {
      hitArea,
      icon,
    };
  }

  private createCloseButton(x: number, y: number): ShopCloseButton {
    const background = this.scene.add
      .rectangle(x, y, ShopModal.closeButtonSize, ShopModal.closeButtonSize, 0x2d1717, 0.92)
      .setDepth(ShopModal.depth + 6)
      .setStrokeStyle(2, 0xffd05a, 0.85)
      .setVisible(false);
    const icon = this.scene.add
      .text(x, y - 1, "X", {
        fontFamily: "Hardpixel",
        fontSize: 26,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 7)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(x, y, ShopModal.closeButtonSize, ShopModal.closeButtonSize, 0x000000, 0)
      .setDepth(ShopModal.depth + 8)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.close();
    });
    hitArea.on("pointerover", () => {
      background.setScale(1.06);
      icon.setScale(1.06);
    });
    hitArea.on("pointerout", () => {
      background.setScale(1);
      icon.setScale(1);
    });

    return {
      background,
      hitArea,
      icon,
    };
  }

  private createItemCard(x: number, y: number): ShopItemCard {
    const buttonY = y + 110;
    const card = {} as ShopItemCard;

    card.background = this.scene.add
      .image(x, y, ShopModal.cardTextureKey)
      .setDisplaySize(ShopModal.normalCardWidth, ShopModal.normalCardHeight)
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    card.itemIcon = this.scene.add
      .image(x, y - 70, ShopModal.cardTextureKey)
      .setDepth(ShopModal.depth + 4)
      .setVisible(false);
    card.attackText = this.createBonusText(x - 52, y + 33);
    card.speedText = this.createBonusText(x - 52, y + 63);
    card.buttonImage = this.scene.add
      .image(x, buttonY, ShopModal.buyButtonTextureKey)
      .setDisplaySize(ShopModal.cardButtonWidth, ShopModal.cardButtonHeight)
      .setDepth(ShopModal.depth + 4)
      .setVisible(false);
    card.priceIcon = this.scene.add
      .image(x - 20, buttonY, ShopModal.priceIconTextureKey)
      .setDisplaySize(ShopModal.priceIconSize, ShopModal.priceIconSize)
      .setDepth(ShopModal.depth + 5)
      .setVisible(false);
    card.buttonLabel = this.scene.add
      .text(x, buttonY, "", {
        fontFamily: "Hardpixel",
        fontSize: 21,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 5)
      .setVisible(false);
    card.buttonHitArea = this.scene.add
      .rectangle(
        x,
        buttonY,
        ShopModal.cardButtonWidth,
        ShopModal.cardButtonHeight,
        0x000000,
        0,
      )
      .setDepth(ShopModal.depth + 6)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    card.buttonHitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        UiSoundPlayer.playClick(this.scene);
        this.handleItemAction(card);
      },
    );
    card.buttonHitArea.on("pointerover", () => {
      if (card.item?.status === "locked") {
        return;
      }

      this.setCardButtonSize(card, ShopModal.cardButtonHoverScale);
      card.buttonLabel.setScale(1.06);
      card.priceIcon.setDisplaySize(
        ShopModal.priceIconSize * ShopModal.cardButtonHoverScale,
        ShopModal.priceIconSize * ShopModal.cardButtonHoverScale,
      );
    });
    card.buttonHitArea.on("pointerout", () => {
      this.setCardButtonSize(card);
      card.buttonLabel.setScale(1);
      card.priceIcon.setDisplaySize(
        ShopModal.priceIconSize,
        ShopModal.priceIconSize,
      );
    });

    return card;
  }

  private createBonusText(x: number, y: number) {
    return this.scene.add
      .text(x, y, "", {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 5)
      .setVisible(false);
  }

  private setCardBackgroundSize(
    background: GameObjects.Image,
    isLocked: boolean,
  ) {
    background.setDisplaySize(
      isLocked ? ShopModal.lockedCardWidth : ShopModal.normalCardWidth,
      isLocked ? ShopModal.lockedCardHeight : ShopModal.normalCardHeight,
    );
  }

  private setCardButtonTexture(card: ShopItemCard, textureKey: string) {
    card.buttonImage.setTexture(textureKey);
    this.setCardButtonSize(card);
  }

  private setCardButtonSize(card: ShopItemCard, scale = 1) {
    card.buttonImage.setDisplaySize(
      ShopModal.cardButtonWidth * scale,
      ShopModal.cardButtonHeight * scale,
    );
    card.buttonHitArea.setSize(
      ShopModal.cardButtonWidth * scale,
      ShopModal.cardButtonHeight * scale,
    );
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.panelBlocker?.setVisible(visible);
    this.titlePlate?.setVisible(visible);
    this.titleText?.setVisible(visible);
    this.currencyPlate?.setVisible(visible);
    this.balanceText?.setVisible(visible);
    this.setCloseButtonVisible(visible);

    if (visible) {
      this.overlay?.setInteractive();
      this.panelBlocker?.setInteractive();
    } else {
      this.overlay?.disableInteractive();
      this.panelBlocker?.disableInteractive();
    }

    this.cards.forEach((card) => {
      this.setCardVisible(card, visible);
    });
  }

  private setCloseButtonVisible(visible: boolean) {
    if (!this.closeButton) {
      return;
    }

    this.closeButton.background.setVisible(visible);
    this.closeButton.icon.setVisible(visible);
    this.closeButton.hitArea.setVisible(visible);

    if (visible) {
      this.closeButton.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.closeButton.hitArea.disableInteractive();
    }
  }

  private setCardVisible(card: ShopItemCard, visible: boolean) {
    const isLocked = card.item?.status === "locked";

    card.background.setVisible(visible && Boolean(card.item));
    card.itemIcon.setVisible(visible && Boolean(card.item) && !isLocked);
    card.attackText.setVisible(visible && Boolean(card.item) && !isLocked);
    card.speedText.setVisible(visible && Boolean(card.item) && !isLocked);
    card.buttonImage.setVisible(visible && Boolean(card.item) && !isLocked);
    card.buttonHitArea.setVisible(visible && Boolean(card.item) && !isLocked);
    card.buttonLabel.setVisible(visible && Boolean(card.item));
    card.priceIcon.setVisible(
      visible &&
        Boolean(card.item) &&
        card.item?.status === "not-purchased" &&
        card.item.price > 0,
    );

    if (!visible) {
      this.setCardButtonSize(card);
      card.buttonLabel.setScale(1);
      card.priceIcon.setDisplaySize(
        ShopModal.priceIconSize,
        ShopModal.priceIconSize,
      );
    }

    this.setCardInteractive(card, visible && !this.isActionLocked);
  }

  private setCardsInteractive(isInteractive: boolean) {
    this.cards.forEach((card) => {
      this.setCardInteractive(card, isInteractive);
    });
  }

  private setCardInteractive(card: ShopItemCard, isInteractive: boolean) {
    if (isInteractive && card.item?.status !== "locked") {
      card.buttonHitArea.setInteractive({ useHandCursor: true });
    } else {
      card.buttonHitArea.disableInteractive();
    }
  }

  private clearUnlockActionTimer() {
    this.unlockActionTimer?.remove();
    this.unlockActionTimer = undefined;
  }

  private showLoader() {
    this.loaderSpinner.show();
  }

  private hideLoader() {
    this.loaderSpinner.hide();
  }

  private fitItemIcon(icon: GameObjects.Image) {
    const source = icon.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.min(
      ShopModal.itemIconMaxSize / source.width,
      ShopModal.itemIconMaxSize / source.height,
    );

    icon.setScale(scale);
  }

  private handleEsc() {
    if (!this.pauseController.has("shop")) {
      return;
    }

    UiSoundPlayer.playClick(this.scene);
    this.close();
  }

  private static getAssets(): ShopAssetConfig[] {
    return [
      {
        textureKey: ShopModal.panelTextureKey,
        texturePath: ShopModal.panelPath,
      },
      {
        textureKey: ShopModal.cardTextureKey,
        texturePath: ShopModal.cardPath,
      },
      {
        textureKey: ShopModal.lockedCardTextureKey,
        texturePath: ShopModal.lockedCardPath,
      },
      {
        textureKey: ShopModal.titlePlateTextureKey,
        texturePath: ShopModal.titlePlatePath,
      },
      {
        textureKey: ShopModal.currencyPlateTextureKey,
        texturePath: ShopModal.currencyPlatePath,
      },
      {
        textureKey: ShopModal.equippedButtonTextureKey,
        texturePath: ShopModal.equippedButtonPath,
      },
      {
        textureKey: ShopModal.buyButtonTextureKey,
        texturePath: ShopModal.buyButtonPath,
      },
      {
        textureKey: ShopModal.lockedButtonTextureKey,
        texturePath: ShopModal.lockedButtonPath,
      },
      {
        textureKey: ShopModal.priceIconTextureKey,
        texturePath: ShopModal.priceIconPath,
      },
      ...ShopCatalog.getItems().map((item) => ({
        textureKey: item.iconTextureKey,
        texturePath: item.iconTexturePath,
      })),
    ];
  }

  private static areAssetsLoaded(scene: Scene) {
    return ShopModal.getAssets().every((asset) =>
      scene.textures.exists(asset.textureKey),
    );
  }

  private static loadAssets(scene: Scene, onComplete: () => void) {
    ShopModal.getAssets().forEach((asset) => {
      if (!scene.textures.exists(asset.textureKey)) {
        scene.load.image(asset.textureKey, asset.texturePath);
      }
    });

    scene.load.once("complete", onComplete);

    if (!scene.load.isLoading()) {
      scene.load.start();
    }
  }

  private static formatAttackBonus(value: number) {
    return `+${ShopModal.formatNumber(value)}`;
  }

  private static formatSpeedBonus(value: number) {
    return `+${Math.round(value * 100)}%`;
  }

  private static formatNumber(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
}
