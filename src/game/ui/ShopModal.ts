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
  itemIcon: GameObjects.Image;
  lockOverlay: GameObjects.Image;
  buttonHitArea: GameObjects.Rectangle;
  buttonImage: GameObjects.Image;
  priceIcon: GameObjects.Image;
  buttonLabel: GameObjects.Text;
  shouldShowPriceIcon: boolean;
  item?: ShopItemView;
};

type ShopItemSlot = {
  x: number;
  iconY: number;
  buttonY: number;
};

type ShopButtonTextureConfig = {
  textureKey: string;
  texturePath: string;
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
  private static readonly lockedItemTextureKey = "shop-item-locked";
  private static readonly lockedItemPath =
    "assets/images/ui/shop/items/shop-item-locked.png";
  private static readonly unknownItemTextureKey = "shop-item-unknown";
  private static readonly unknownItemPath =
    "assets/images/ui/shop/items/unknown-item-icon.png";
  private static readonly priceIconTextureKey = "shop-price-emerald-icon";
  private static readonly priceIconPath = "assets/images/ui/icons/emerald.png";
  private static readonly buttonTextures: ShopButtonTextureConfig[] = [
    {
      textureKey: "base-shop-button",
      texturePath: "assets/images/ui/shop/base-shop-button.png",
    },
    {
      textureKey: "wooden-shop-button",
      texturePath: "assets/images/ui/shop/wooden-shop-button.png",
    },
    {
      textureKey: "golden-shop-button",
      texturePath: "assets/images/ui/shop/golden-shop-button.png",
    },
    {
      textureKey: "emerald-shop-button",
      texturePath: "assets/images/ui/shop/emerald-shop-button.png",
    },
    {
      textureKey: "diamond-shop-button",
      texturePath: "assets/images/ui/shop/diamond-shop-button.png",
    },
    {
      textureKey: "absidian-shop-button",
      texturePath: "assets/images/ui/shop/absidian-shop-button.png",
    },
  ];
  private static readonly panelWidth = 768;
  private static readonly panelHeight = 640;
  private static readonly buttonSize = 128;
  private static readonly iconSize = 128;
  private static readonly iconHoverSize = 138;
  private static readonly actionLockDurationMs = 300;
  private static readonly itemIconMaxSize = 112;
  private static readonly lockedOverlaySize = 128;
  private static readonly lockedOverlayAlpha = 0.62;
  private static readonly priceIconWidth = 22;
  private static readonly priceIconHeight = 28;
  private static readonly priceIconOffsetX = -32;
  private static readonly priceTextOffsetX = 12;
  private static readonly buttonWidth = 208;
  private static readonly buttonHeight = 72;
  private static readonly balanceOffsetX = -330;
  private static readonly balanceOffsetY = -286;
  private static readonly closeButtonOffsetX = 348;
  private static readonly closeButtonOffsetY = -286;
  private static readonly closeButtonSize = 46;
  private static readonly itemSlots: ShopItemSlot[] = [
    { x: -256, iconY: -192, buttonY: -76 },
    { x: 0, iconY: -192, buttonY: -76 },
    { x: 256, iconY: -192, buttonY: -76 },
    { x: -256, iconY: 56, buttonY: 180 },
    { x: 0, iconY: 56, buttonY: 180 },
    { x: 256, iconY: 56, buttonY: 180 },
  ];

  private readonly shopButton: ShopIconButton;
  private readonly loaderSpinner: LoadingSpinner;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private panelBlocker?: GameObjects.Rectangle;
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
    this.balanceText = this.scene.add
      .text(
        centerX + ShopModal.balanceOffsetX,
        centerY + ShopModal.balanceOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 24,
          color: "#7dff76",
          stroke: "#123b12",
          strokeThickness: 4,
        },
      )
      .setOrigin(0, 0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    this.closeButton = this.createCloseButton(
      centerX + ShopModal.closeButtonOffsetX,
      centerY + ShopModal.closeButtonOffsetY,
    );
    this.cards = ShopModal.itemSlots.map((slot, index) =>
      this.createItemCard(
        centerX + slot.x,
        centerY + slot.iconY,
        centerY + slot.buttonY,
        index,
      ),
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

    this.balanceText.setText(String(this.wallet.getBalance()));

    this.cards.forEach((card, index) => {
      const item = itemViews[index];

      card.item = item;

      if (item) {
        this.setCardText(card, item);
        this.setCardIcon(card, item);
      } else {
        card.buttonLabel.setText("");
        this.hideCardPriceIcon(card);
        this.setEmptyCardIcon(card);
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
      this.hideCardPriceIcon(card);
      card.buttonLabel.setText(languageController.t("shop.noMoney"));
      card.buttonLabel.setColor("#ff5a5a");
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

  private setCardText(card: ShopItemCard, item: ShopItemView) {
    this.hideCardPriceIcon(card);

    if (item.status === "locked") {
      card.buttonLabel.setText(languageController.t("shop.find"));
      card.buttonLabel.setColor("#d4d4d4");
      return;
    }

    if (item.isEquipped) {
      card.buttonLabel.setText(languageController.t("shop.equipped"));
      card.buttonLabel.setColor("#7dff76");
      return;
    }

    if (item.status === "purchased") {
      card.buttonLabel.setText(languageController.t("shop.equip"));
      card.buttonLabel.setColor("#ffffff");
      return;
    }

    if (item.price > 0) {
      this.showCardPriceIcon(card);
      card.buttonLabel.setText(String(item.price));
      card.buttonLabel.setColor("#ffffff");
      return;
    }

    card.buttonLabel.setText(languageController.t("common.free"));
    card.buttonLabel.setColor("#ffffff");
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
      background.setFillStyle(0x4b2020, 0.96);
    });
    hitArea.on("pointerout", () => {
      background.setFillStyle(0x2d1717, 0.92);
    });

    return {
      background,
      hitArea,
      icon,
    };
  }

  private createItemCard(
    x: number,
    iconY: number,
    buttonY: number,
    itemIndex: number,
  ): ShopItemCard {
    const card = {} as ShopItemCard;

    card.itemIcon = this.scene.add
      .image(x, iconY, ShopModal.lockedItemTextureKey)
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    this.fitItemIcon(card.itemIcon);

    card.lockOverlay = this.scene.add
      .image(x, iconY, ShopModal.lockedItemTextureKey)
      .setDisplaySize(ShopModal.lockedOverlaySize, ShopModal.lockedOverlaySize)
      .setAlpha(ShopModal.lockedOverlayAlpha)
      .setDepth(ShopModal.depth + 4)
      .setVisible(false);

    card.buttonImage = this.scene.add
      .image(x, buttonY, ShopModal.getButtonTextureKey(itemIndex))
      .setDepth(ShopModal.depth + 3)
      .setVisible(false);
    card.buttonHitArea = this.scene.add
      .rectangle(x, buttonY, ShopModal.buttonWidth, ShopModal.buttonHeight, 0x000000, 0)
      .setDepth(ShopModal.depth + 4)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    card.priceIcon = this.scene.add
      .image(x + ShopModal.priceIconOffsetX, buttonY, ShopModal.priceIconTextureKey)
      .setDisplaySize(ShopModal.priceIconWidth, ShopModal.priceIconHeight)
      .setDepth(ShopModal.depth + 5)
      .setVisible(false);
    card.buttonLabel = this.scene.add
      .text(x, buttonY, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(ShopModal.depth + 5)
      .setVisible(false);
    card.shouldShowPriceIcon = false;

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

      card.buttonImage.setTint(0xb8b8b8);

      if (!card.item?.isEquipped) {
        card.buttonLabel.setColor("#f3ff9a");
      }
    });
    card.buttonHitArea.on("pointerout", () => {
      card.buttonImage.clearTint();

      if (card.item) {
        this.setCardText(card, card.item);
      }
    });

    return card;
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.panelBlocker?.setVisible(visible);
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
    card.itemIcon.setVisible(visible && Boolean(card.item));
    card.lockOverlay.setVisible(
      visible &&
        (card.item?.status === "locked" ||
          card.item?.status === "not-purchased"),
    );
    card.buttonImage.setVisible(visible);
    card.buttonHitArea.setVisible(visible);
    card.priceIcon.setVisible(visible && card.shouldShowPriceIcon);
    card.buttonLabel.setVisible(visible && Boolean(card.item));

    if (!visible) {
      card.buttonImage.clearTint();
      card.priceIcon.setVisible(false);
    }

    this.setCardInteractive(card, visible && !this.isActionLocked);
  }

  private setCardsInteractive(isInteractive: boolean) {
    this.cards.forEach((card) => {
      this.setCardInteractive(card, isInteractive);
    });
  }

  private showCardPriceIcon(card: ShopItemCard) {
    card.shouldShowPriceIcon = true;
    card.priceIcon.setVisible(card.buttonLabel.visible);
    card.buttonLabel.setX(card.buttonImage.x + ShopModal.priceTextOffsetX);
  }

  private hideCardPriceIcon(card: ShopItemCard) {
    card.shouldShowPriceIcon = false;
    card.priceIcon.setVisible(false);
    card.buttonLabel.setX(card.buttonImage.x);
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

  private setCardIcon(card: ShopItemCard, item: ShopItemView) {
    card.itemIcon.setTexture(
      item.status === "locked"
        ? ShopModal.unknownItemTextureKey
        : item.iconTextureKey,
    );
    this.fitItemIcon(card.itemIcon);
    card.lockOverlay.setTexture(ShopModal.lockedItemTextureKey);
    this.fitLockedOverlay(card.lockOverlay);
  }

  private setEmptyCardIcon(card: ShopItemCard) {
    card.itemIcon.setTexture(ShopModal.lockedItemTextureKey);
    this.fitItemIcon(card.itemIcon);
    card.lockOverlay.setTexture(ShopModal.lockedItemTextureKey);
    this.fitLockedOverlay(card.lockOverlay);
  }

  private fitItemIcon(icon: GameObjects.Image) {
    const source = icon.texture.getSourceImage() as HTMLImageElement;
    const scale = Math.min(
      ShopModal.itemIconMaxSize / source.width,
      ShopModal.itemIconMaxSize / source.height,
    );

    icon.setScale(scale);
  }

  private fitLockedOverlay(icon: GameObjects.Image) {
    icon
      .setDisplaySize(ShopModal.lockedOverlaySize, ShopModal.lockedOverlaySize)
      .setAlpha(ShopModal.lockedOverlayAlpha);
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
        textureKey: ShopModal.lockedItemTextureKey,
        texturePath: ShopModal.lockedItemPath,
      },
      {
        textureKey: ShopModal.unknownItemTextureKey,
        texturePath: ShopModal.unknownItemPath,
      },
      {
        textureKey: ShopModal.priceIconTextureKey,
        texturePath: ShopModal.priceIconPath,
      },
      ...ShopModal.buttonTextures,
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

  private static getButtonTextureKey(itemIndex: number) {
    return (
      ShopModal.buttonTextures[itemIndex]?.textureKey ??
      ShopModal.buttonTextures[0].textureKey
    );
  }
}
