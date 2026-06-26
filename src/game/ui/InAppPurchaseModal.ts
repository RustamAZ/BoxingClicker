import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { inAppProductPresentation } from "../configs/inAppProducts";
import { languageController } from "../localization/LanguageController";
import type { InAppProduct } from "../platform/yandex/GamePlatform";
import type { PauseController } from "../state/PauseController";
import { LoadingSpinner } from "./LoadingSpinner";

type InAppOpenButton = {
  icon: GameObjects.Image;
  hitArea: GameObjects.Rectangle;
};

type InAppProductSlot = {
  amount: GameObjects.Text;
  name: GameObjects.Text;
  button: GameObjects.Image;
  price: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  product?: InAppProduct;
};

type ProductLoader = () => Promise<InAppProduct[]>;
type ProductSelectHandler = (product: InAppProduct) => void | Promise<void>;

export class InAppPurchaseModal {
  private static readonly depth = 1150;
  private static readonly buttonDepth = 1003;
  private static readonly openButtonX = 554;
  private static readonly openButtonY = 68;
  private static readonly openButtonSize = 94;
  private static readonly openButtonIconSize = 94;
  private static readonly openButtonIconHoverSize = 99;
  private static readonly panelWidth = 720;
  private static readonly panelHeight = 540;
  private static readonly productLimit = 4;
  private static readonly titleOffsetY = -195;
  private static readonly amountOffsetY = -43;
  private static readonly productNameOffsetY = 24;
  private static readonly productButtonOffsetY = 64;
  private static readonly productPriceOffsetY = 63;
  private static readonly productNameWidth = 250;
  private static readonly productButtonWidth = 175;
  private static readonly productButtonHeight = 130;
  private static readonly productButtonHoverScale = 1.06;
  private static readonly productButtonHitWidth = 132;
  private static readonly productButtonHitHeight = 44;
  private static readonly closeHitOffsetX = 260;
  private static readonly closeHitOffsetY = -201;
  private static readonly closeHitSize = 58;
  private static readonly openButtonTextureKey = "in-app-open-icon";
  private static readonly openButtonPath =
    "assets/images/ui/in-app/inapp-icon.png";
  private static readonly panelTextureKey = "in-app-modal-panel";
  private static readonly panelPath =
    "assets/images/ui/in-app/inapp-modal.png";
  private static readonly productButtonTextureKey = "in-app-product-button";
  private static readonly productButtonPath =
    "assets/images/ui/in-app/inapp-button.png";
  private static readonly productPositions = [
    {
      offsetX: -146,
      offsetY: -70,
      amountOffsetX: 28,
      nameOffsetY: 0,
      buttonOffsetY: 0,
    },
    {
      offsetX: 149,
      offsetY: -70,
      amountOffsetX: 49,
      nameOffsetY: 0,
      buttonOffsetY: 0,
    },
    {
      offsetX: -146,
      offsetY: 134,
      amountOffsetX: 36,
      nameOffsetY: -12,
      buttonOffsetY: -14,
    },
    {
      offsetX: 149,
      offsetY: 134,
      amountOffsetX: 56,
      nameOffsetY: -12,
      buttonOffsetY: -14,
    },
  ];

  static preload(scene: Scene) {
    scene.load.image(
      InAppPurchaseModal.openButtonTextureKey,
      InAppPurchaseModal.openButtonPath,
    );
  }

  private readonly openButton: InAppOpenButton;
  private readonly loaderSpinner: LoadingSpinner;
  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private title?: GameObjects.Text;
  private closeHitArea?: GameObjects.Rectangle;
  private productSlots: InAppProductSlot[] = [];
  private products: InAppProduct[] = [];
  private isOpenButtonEnabled = true;
  private isLoading = false;
  private isPurchasePending = false;
  private unsubscribeLanguageChange?: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly loadProducts: ProductLoader,
    private readonly onProductSelected?: ProductSelectHandler,
  ) {
    this.openButton = this.createOpenButton();
    this.loaderSpinner = new LoadingSpinner(
      this.scene,
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      InAppPurchaseModal.depth + 20,
    );
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refresh();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange?.();
      this.loaderSpinner.destroy();
    });
  }

  setButtonVisible(visible: boolean) {
    this.openButton.icon.setVisible(visible);
    this.openButton.hitArea.setVisible(visible);

    if (visible && this.isOpenButtonEnabled) {
      this.openButton.hitArea.setInteractive({ useHandCursor: true });
    } else {
      this.openButton.hitArea.disableInteractive();
      this.openButton.icon.setDisplaySize(
        InAppPurchaseModal.openButtonIconSize,
        InAppPurchaseModal.openButtonIconSize,
      );
    }
  }

  setButtonEnabled(enabled: boolean) {
    if (this.isOpenButtonEnabled === enabled) {
      return;
    }

    this.isOpenButtonEnabled = enabled;
    this.setButtonVisible(this.openButton.icon.visible);
  }

  async open() {
    if (this.pauseController.isPaused || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loaderSpinner.show();

    try {
      const [productsResult] = await Promise.all([
        this.loadProducts()
          .then((products) => ({ products }))
          .catch(() => ({ products: [] })),
        InAppPurchaseModal.loadAssets(this.scene),
      ]);

      this.products = [...productsResult.products]
        .sort(
          (firstProduct, secondProduct) =>
            Number(firstProduct.priceValue) - Number(secondProduct.priceValue),
        )
        .slice(0, InAppPurchaseModal.productLimit);
    } catch {
      this.products = [];
    } finally {
      this.isLoading = false;
      this.loaderSpinner.hide();
    }

    if (this.pauseController.isPaused) {
      return;
    }

    this.ensureCreated();
    this.pauseController.pause("in-app-purchase");
    this.refresh();
    this.setVisible(true);
  }

  close() {
    if (!this.pauseController.has("in-app-purchase")) {
      return;
    }

    this.pauseController.resume("in-app-purchase");
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
      .setDepth(InAppPurchaseModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, InAppPurchaseModal.panelTextureKey)
      .setDisplaySize(
        InAppPurchaseModal.panelWidth,
        InAppPurchaseModal.panelHeight,
      )
      .setDepth(InAppPurchaseModal.depth + 1)
      .setVisible(false);
    this.title = this.scene.add
      .text(
        centerX,
        centerY + InAppPurchaseModal.titleOffsetY,
        languageController.t("inApp.title"),
        {
          fontFamily: "Hardpixel",
          fontSize: 34,
          color: "#ffffff",
          stroke: "#151515",
          strokeThickness: 6,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InAppPurchaseModal.depth + 2)
      .setVisible(false);
    this.productSlots = InAppPurchaseModal.productPositions.map((position) =>
      this.createProductSlot(
        centerX + position.offsetX,
        centerY + position.offsetY,
        position.amountOffsetX,
        position.nameOffsetY,
        position.buttonOffsetY,
      ),
    );
    this.closeHitArea = this.scene.add
      .rectangle(
        centerX + InAppPurchaseModal.closeHitOffsetX,
        centerY + InAppPurchaseModal.closeHitOffsetY,
        InAppPurchaseModal.closeHitSize,
        InAppPurchaseModal.closeHitSize,
        0x000000,
        0,
      )
      .setDepth(InAppPurchaseModal.depth + 5)
      .setVisible(false);

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
    this.closeHitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.close();
    });
  }

  private createOpenButton(): InAppOpenButton {
    const icon = this.scene.add
      .image(
        InAppPurchaseModal.openButtonX,
        InAppPurchaseModal.openButtonY,
        InAppPurchaseModal.openButtonTextureKey,
      )
      .setDisplaySize(
        InAppPurchaseModal.openButtonIconSize,
        InAppPurchaseModal.openButtonIconSize,
      )
      .setDepth(InAppPurchaseModal.buttonDepth + 1)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        InAppPurchaseModal.openButtonX,
        InAppPurchaseModal.openButtonY,
        InAppPurchaseModal.openButtonSize,
        InAppPurchaseModal.openButtonSize,
        0x000000,
        0,
      )
      .setDepth(InAppPurchaseModal.buttonDepth + 2)
      .setVisible(false);

    hitArea.on("pointerdown", () => {
      if (!this.isOpenButtonEnabled) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      void this.open();
    });
    hitArea.on("pointerover", () => {
      if (!this.isOpenButtonEnabled) {
        return;
      }

      icon.setDisplaySize(
        InAppPurchaseModal.openButtonIconHoverSize,
        InAppPurchaseModal.openButtonIconHoverSize,
      );
    });
    hitArea.on("pointerout", () => {
      icon.setDisplaySize(
        InAppPurchaseModal.openButtonIconSize,
        InAppPurchaseModal.openButtonIconSize,
      );
    });

    return { icon, hitArea };
  }

  private createProductSlot(
    x: number,
    y: number,
    amountOffsetX: number,
    nameOffsetY: number,
    buttonOffsetY: number,
  ): InAppProductSlot {
    const amount = this.scene.add
      .text(
        x + amountOffsetX,
        y + InAppPurchaseModal.amountOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 35,
          color: "#43ef55",
          stroke: "#071b09",
          strokeThickness: 6,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InAppPurchaseModal.depth + 3)
      .setVisible(false);
    const name = this.scene.add
      .text(
        x,
        y + InAppPurchaseModal.productNameOffsetY + nameOffsetY,
        "",
        {
        fontFamily: "Hardpixel",
        fontSize: 18,
        color: "#ffe35a",
        stroke: "#151515",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: InAppPurchaseModal.productNameWidth,
        },
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InAppPurchaseModal.depth + 2)
      .setVisible(false);
    const button = this.scene.add
      .image(
        x,
        y + InAppPurchaseModal.productButtonOffsetY + buttonOffsetY,
        InAppPurchaseModal.productButtonTextureKey,
      )
      .setDisplaySize(
        InAppPurchaseModal.productButtonWidth,
        InAppPurchaseModal.productButtonHeight,
      )
      .setDepth(InAppPurchaseModal.depth + 2)
      .setVisible(false);
    const price = this.scene.add
      .text(
        x,
        y + InAppPurchaseModal.productPriceOffsetY + buttonOffsetY,
        "",
        {
        fontFamily: "Hardpixel",
        fontSize: 19,
        color: "#ffffff",
        stroke: "#113411",
        strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InAppPurchaseModal.depth + 3)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        x,
        y + InAppPurchaseModal.productPriceOffsetY + buttonOffsetY,
        InAppPurchaseModal.productButtonHitWidth,
        InAppPurchaseModal.productButtonHitHeight,
        0x000000,
        0,
      )
      .setDepth(InAppPurchaseModal.depth + 4)
      .setVisible(false);
    const slot: InAppProductSlot = {
      amount,
      name,
      button,
      price,
      hitArea,
    };

    hitArea.on("pointerdown", () => {
      if (!slot.product || this.isPurchasePending) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      void this.handleProductSelected(slot.product);
    });
    hitArea.on("pointerover", () => {
      if (!slot.product || this.isPurchasePending) {
        return;
      }

      this.setProductButtonScale(slot, InAppPurchaseModal.productButtonHoverScale);
    });
    hitArea.on("pointerout", () => {
      this.setProductButtonScale(slot, 1);
    });

    return slot;
  }

  private refresh() {
    const isVisible = this.panel?.visible === true;

    this.productSlots.forEach((slot, index) => {
      const product = this.products[index];
      const presentation = inAppProductPresentation[index];

      slot.product = product;
      slot.amount.setText(presentation ? `x${presentation.amount}` : "");
      slot.name.setText(
        presentation ? languageController.t(presentation.titleKey) : "",
      );
      slot.price.setText(product?.price ?? "");
      this.setProductSlotVisible(slot, isVisible && product !== undefined);
    });
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.title?.setVisible(visible);
    this.closeHitArea?.setVisible(visible);

    if (visible) {
      this.closeHitArea?.setInteractive({ useHandCursor: true });
    } else {
      this.closeHitArea?.disableInteractive();
    }

    this.productSlots.forEach((slot) => {
      this.setProductSlotVisible(slot, visible && slot.product !== undefined);
    });
  }

  private setProductSlotVisible(slot: InAppProductSlot, visible: boolean) {
    slot.amount.setVisible(visible);
    slot.name.setVisible(visible);
    slot.button.setVisible(visible);
    slot.price.setVisible(visible);
    slot.hitArea.setVisible(visible);

    if (visible && !this.isPurchasePending) {
      slot.hitArea.setInteractive({ useHandCursor: true });
    } else {
      slot.hitArea.disableInteractive();
      this.setProductButtonScale(slot, 1);
    }
  }

  private async handleProductSelected(product: InAppProduct) {
    if (this.isPurchasePending) {
      return;
    }

    this.isPurchasePending = true;
    this.productSlots.forEach((slot) => {
      slot.hitArea.disableInteractive();
      this.setProductButtonScale(slot, 1);
    });

    try {
      await this.onProductSelected?.(product);
    } finally {
      this.isPurchasePending = false;
      this.refresh();
    }
  }

  private setProductButtonScale(slot: InAppProductSlot, scale: number) {
    slot.button.setDisplaySize(
      InAppPurchaseModal.productButtonWidth * scale,
      InAppPurchaseModal.productButtonHeight * scale,
    );
    slot.price.setScale(scale);
  }

  private static areAssetsLoaded(scene: Scene) {
    return [
      InAppPurchaseModal.panelTextureKey,
      InAppPurchaseModal.productButtonTextureKey,
    ].every((textureKey) => scene.textures.exists(textureKey));
  }

  private static loadAssets(scene: Scene) {
    if (InAppPurchaseModal.areAssetsLoaded(scene)) {
      return Promise.resolve();
    }

    if (!scene.textures.exists(InAppPurchaseModal.panelTextureKey)) {
      scene.load.image(
        InAppPurchaseModal.panelTextureKey,
        InAppPurchaseModal.panelPath,
      );
    }

    if (!scene.textures.exists(InAppPurchaseModal.productButtonTextureKey)) {
      scene.load.image(
        InAppPurchaseModal.productButtonTextureKey,
        InAppPurchaseModal.productButtonPath,
      );
    }

    return new Promise<void>((resolve) => {
      scene.load.once("complete", () => {
        resolve();
      });

      if (!scene.load.isLoading()) {
        scene.load.start();
      }
    });
  }
}
