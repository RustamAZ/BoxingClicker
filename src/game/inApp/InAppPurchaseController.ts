import {
  inAppProductPresentation,
} from "../configs/inAppProducts";
import type { Wallet } from "../entities/Wallet/Wallet";
import type {
  GamePlatform,
  InAppProduct,
  InAppPurchase,
} from "../platform/yandex/GamePlatform";

export type InAppPurchaseApplyResult = {
  amount: number;
  productId: string;
  purchaseToken: string;
  wasGranted: boolean;
  wasConsumed: boolean;
};

export type PendingInAppPurchasesResult = {
  processed: number;
  granted: number;
  emeralds: number;
};

export class InAppPurchaseController {
  private productsPromise?: Promise<InAppProduct[]>;
  private pendingPurchasesPromise?: Promise<PendingInAppPurchasesResult>;
  private purchasePromise?: Promise<InAppPurchaseApplyResult | undefined>;

  constructor(
    private readonly platform: GamePlatform,
    private readonly wallet: Wallet,
    private readonly onEmeraldsChanged?: () => void,
  ) {}

  getProducts() {
    this.productsPromise ??= this.platform.getInAppProducts().then((products) =>
      InAppPurchaseController.sortProducts(products).slice(
        0,
        inAppProductPresentation.length,
      ),
    );

    return this.productsPromise;
  }

  processPendingPurchases() {
    this.pendingPurchasesPromise ??= this.processPendingPurchasesOnce().finally(
      () => {
        this.pendingPurchasesPromise = undefined;
      },
    );

    return this.pendingPurchasesPromise;
  }

  purchaseProduct(product: InAppProduct) {
    if (this.purchasePromise) {
      return this.purchasePromise;
    }

    this.purchasePromise = this.purchaseProductOnce(product).finally(() => {
      this.purchasePromise = undefined;
    });

    return this.purchasePromise;
  }

  private async purchaseProductOnce(product: InAppProduct) {
    const purchase = await this.platform.purchaseInAppProduct(product.id);

    if (!purchase) {
      return undefined;
    }

    return this.applyPurchase(purchase);
  }

  private async processPendingPurchasesOnce(): Promise<PendingInAppPurchasesResult> {
    const purchases = await this.platform.getInAppPurchases();
    let granted = 0;
    let emeralds = 0;

    for (const purchase of purchases) {
      const result = await this.applyPurchase(purchase);

      if (!result) {
        continue;
      }

      if (result.wasGranted) {
        granted += 1;
        emeralds += result.amount;
      }
    }

    return {
      processed: purchases.length,
      granted,
      emeralds,
    };
  }

  private async applyPurchase(
    purchase: InAppPurchase,
  ): Promise<InAppPurchaseApplyResult | undefined> {
    const purchaseToken = purchase.purchaseToken.trim();

    if (!purchaseToken) {
      return undefined;
    }

    const amount = await this.getPurchaseEmeraldAmount(purchase.productId);

    if (amount <= 0) {
      return undefined;
    }

    const profile = this.wallet.getPlayer().profile;
    const wasGranted = profile.grantInAppPurchase(
      purchaseToken,
      amount,
    );

    if (wasGranted) {
      this.onEmeraldsChanged?.();
    }

    const wasConsumed = await this.platform.consumeInAppPurchase(
      purchaseToken,
    );

    if (wasConsumed) {
      profile.completeInAppPurchase(purchaseToken);
    }

    return {
      amount,
      productId: purchase.productId,
      purchaseToken,
      wasGranted,
      wasConsumed,
    };
  }

  private async getPurchaseEmeraldAmount(productId: string) {
    const products = await this.getProducts();
    const productIndex = products.findIndex((product) => product.id === productId);
    const presentation = inAppProductPresentation[productIndex];

    return presentation?.amount ?? 0;
  }

  private static sortProducts(products: InAppProduct[]) {
    return [...products].sort((firstProduct, secondProduct) => {
      const firstPrice = Number(firstProduct.priceValue);
      const secondPrice = Number(secondProduct.priceValue);

      if (Number.isFinite(firstPrice) && Number.isFinite(secondPrice)) {
        return firstPrice - secondPrice;
      }

      return firstProduct.id.localeCompare(secondProduct.id);
    });
  }
}
