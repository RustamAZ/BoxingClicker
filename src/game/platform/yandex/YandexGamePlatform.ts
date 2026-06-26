import type {
  Payments as YandexPayments,
  Player as YandexPlayer,
  SDK as YandexSDK,
} from "ysdk";
import type { PlayerProfileSnapshot } from "../../entities/Player/PlayerProfile";
import {
  mapYandexLanguage,
  type GamePlatform,
  type InAppPurchase,
  type InAppProduct,
  type ProfileSaveOptions,
} from "./GamePlatform";
import { AdStateStorage } from "./AdStateStorage";

export class YandexGamePlatform implements GamePlatform {
  private static readonly profileDataKey = "profile";
  private static readonly profileSaveDebounceMs = 1200;
  private static readonly infinityTowerLeaderboardName = "InfinityTower";

  private readonly adStateStorage = new AdStateStorage();
  private playerPromise?: Promise<YandexPlayer | undefined>;
  private pendingProfile?: PlayerProfileSnapshot;
  private pendingProfileFlush = false;
  private profileSaveTimer?: number;
  private leaderboardSetScoreAvailablePromise?: Promise<boolean>;
  private paymentsPromise?: Promise<YandexPayments | undefined>;
  private inAppProductsPromise?: Promise<InAppProduct[]>;

  constructor(private readonly sdk: YandexSDK) {}

  getLanguage() {
    return mapYandexLanguage(this.sdk.environment.i18n.lang);
  }

  async loadProfile() {
    const player = await this.getPlayer();

    if (!player) {
      return undefined;
    }

    try {
      const data = await player.getData([YandexGamePlatform.profileDataKey]);

      return data[YandexGamePlatform.profileDataKey];
    } catch {
      return undefined;
    }
  }

  saveProfile(
    profile: PlayerProfileSnapshot,
    options: ProfileSaveOptions = {},
  ) {
    this.pendingProfile = profile;
    this.pendingProfileFlush = this.pendingProfileFlush || options.flush === true;

    if (options.flush) {
      void this.flushProfileSave();
      return;
    }

    window.clearTimeout(this.profileSaveTimer);
    this.profileSaveTimer = window.setTimeout(() => {
      void this.flushProfileSave();
    }, YandexGamePlatform.profileSaveDebounceMs);
  }

  loadingReady() {
    try {
      this.sdk.features.LoadingAPI.ready();
    } catch {
      // The game is playable even if the host does not accept the ready signal.
    }
  }

  async showRewardedAd() {
    return new Promise<boolean>((resolve) => {
      let isResolved = false;
      let isRewarded = false;

      const resolveOnce = (value: boolean) => {
        if (isResolved) {
          return;
        }

        isResolved = true;
        resolve(value);
      };

      try {
        this.sdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              // The game is already paused by the caller before rewarded ads.
            },
            onRewarded: () => {
              isRewarded = true;
              this.adStateStorage.markAdShown();
            },
            onClose: () => {
              resolveOnce(isRewarded);
            },
            onError: () => {
              resolveOnce(false);
            },
          },
        });
      } catch {
        resolveOnce(false);
      }
    });
  }

  async showFullscreenAd(options: { lobbyAuto?: boolean } = {}) {
    if (options.lobbyAuto) {
      this.adStateStorage.markLobbyAutoAdAttempted();
    }

    return new Promise<boolean>((resolve) => {
      let isResolved = false;

      const resolveOnce = (wasShown: boolean) => {
        if (isResolved) {
          return;
        }

        isResolved = true;

        if (wasShown) {
          this.adStateStorage.markAdShown({
            lobbyAuto: options.lobbyAuto,
          });
        }

        resolve(wasShown);
      };

      try {
        this.sdk.adv.showFullscreenAdv({
          callbacks: {
            onOpen: () => {
              // The game is already paused by the caller before fullscreen ads.
            },
            onClose: (wasShown) => {
              resolveOnce(wasShown);
            },
            onError: () => {
              resolveOnce(false);
            },
            onOffline: () => {
              resolveOnce(false);
            },
          },
        });
      } catch {
        resolveOnce(false);
      }
    });
  }

  async showStickyBanner() {
    try {
      await this.sdk.adv.showBannerAdv();
    } catch {
      // Sticky banner availability depends on the host and device.
    }
  }

  async hideStickyBanner() {
    try {
      await this.sdk.adv.hideBannerAdv();
    } catch {
      // Sticky banner availability depends on the host and device.
    }
  }

  canShowLobbyAutoAd() {
    return this.adStateStorage.canShowLobbyAutoAd();
  }

  submitInfinityTowerScore(score: number) {
    const safeScore = Math.max(0, Math.floor(score));

    if (safeScore <= 0) {
      return;
    }

    void this.setInfinityTowerScore(safeScore);
  }

  getInAppProducts() {
    this.inAppProductsPromise ??= this.loadInAppProducts();

    return this.inAppProductsPromise;
  }

  async getInAppPurchases() {
    const payments = await this.getPayments();

    if (!payments) {
      return [];
    }

    try {
      const purchases = await payments.getPurchases();

      return purchases.map((purchase) =>
        YandexGamePlatform.mapPurchase(purchase),
      );
    } catch {
      return [];
    }
  }

  async purchaseInAppProduct(productId: string) {
    const payments = await this.getPayments();

    if (!payments) {
      return undefined;
    }

    try {
      return YandexGamePlatform.mapPurchase(
        await payments.purchase({ id: productId }),
      );
    } catch {
      return undefined;
    }
  }

  async consumeInAppPurchase(purchaseToken: string) {
    const payments = await this.getPayments();

    if (!payments) {
      return false;
    }

    try {
      await payments.consumePurchase(purchaseToken);

      return true;
    } catch {
      return false;
    }
  }

  private getPlayer() {
    this.playerPromise ??= this.sdk
      .getPlayer({ scopes: false })
      .catch(() => undefined);

    return this.playerPromise;
  }

  private async flushProfileSave() {
    const profile = this.pendingProfile;
    const flush = this.pendingProfileFlush;

    if (!profile) {
      return;
    }

    this.pendingProfile = undefined;
    this.pendingProfileFlush = false;
    window.clearTimeout(this.profileSaveTimer);

    const player = await this.getPlayer();

    if (!player) {
      return;
    }

    try {
      await player.setData(
        {
          [YandexGamePlatform.profileDataKey]: profile,
        },
        flush,
      );
    } catch {
      this.pendingProfile ??= profile;
      this.pendingProfileFlush = this.pendingProfileFlush || flush;
      window.clearTimeout(this.profileSaveTimer);
      this.profileSaveTimer = window.setTimeout(() => {
        void this.flushProfileSave();
      }, YandexGamePlatform.profileSaveDebounceMs);
    }
  }

  private async setInfinityTowerScore(score: number) {
    try {
      if (!(await this.canSetLeaderboardScore())) {
        return;
      }

      await this.sdk.leaderboards.setScore(
        YandexGamePlatform.infinityTowerLeaderboardName,
        score,
      );
    } catch {
      // Anonymous players and unavailable leaderboards cannot accept scores.
    }
  }

  private canSetLeaderboardScore() {
    this.leaderboardSetScoreAvailablePromise ??= this.sdk
      .isAvailableMethod("leaderboards.setScore")
      .catch(() => false);

    return this.leaderboardSetScoreAvailablePromise;
  }

  private async loadInAppProducts(): Promise<InAppProduct[]> {
    const payments = await this.getPayments();

    if (!payments) {
      return [];
    }

    try {
      const products = await payments.getCatalog();
      const inAppProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        imageUri: product.imageURI,
        price: product.price,
        priceValue: product.priceValue,
        priceCurrencyCode: product.priceCurrencyCode,
        priceCurrencyImage: {
          small: product.getPriceCurrencyImage("small"),
          medium: product.getPriceCurrencyImage("medium"),
          svg: product.getPriceCurrencyImage("svg"),
        },
      }));

      console.info("[YandexPayments] Products:", inAppProducts);

      return inAppProducts;
    } catch {
      return [];
    }
  }

  private getPayments() {
    this.paymentsPromise ??= this.sdk.getPayments().catch(() => undefined);

    return this.paymentsPromise;
  }

  private static mapPurchase(purchase: {
    developerPayload?: string;
    productID: string;
    purchaseToken: string;
  }): InAppPurchase {
    return {
      developerPayload: purchase.developerPayload,
      productId: purchase.productID,
      purchaseToken: purchase.purchaseToken,
    };
  }

}
