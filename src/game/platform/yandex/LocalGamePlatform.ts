import type { PlayerProfileSnapshot } from "../../entities/Player/PlayerProfile";
import { mockInAppProducts } from "../../configs/inAppProducts";
import type { GamePlatform, ProfileSaveOptions } from "./GamePlatform";

export class LocalGamePlatform implements GamePlatform {
  getLanguage() {
    return "ru" as const;
  }

  async loadProfile() {
    return undefined;
  }

  saveProfile(
    _profile: PlayerProfileSnapshot,
    _options: ProfileSaveOptions = {},
  ) {
    // Local profile persistence is handled by PlayerProfile through localStorage.
  }

  loadingReady() {
    // LoadingAPI exists only on Yandex Games.
  }

  async showRewardedAd() {
    return true;
  }

  async showFullscreenAd() {
    return false;
  }

  async showStickyBanner() {
    // Sticky banners are available only on Yandex Games.
  }

  async hideStickyBanner() {
    // Sticky banners are available only on Yandex Games.
  }

  canShowLobbyAutoAd() {
    return false;
  }

  submitInfinityTowerScore(_score: number) {
    // Leaderboards are available only on Yandex Games.
  }

  async getInAppProducts() {
    return mockInAppProducts.map((product) => ({
      ...product,
      priceCurrencyImage: { ...product.priceCurrencyImage },
    }));
  }

  async getInAppPurchases() {
    return [];
  }

  async purchaseInAppProduct(productId: string) {
    return {
      productId,
      purchaseToken: `local-${productId}-${Date.now()}`,
    };
  }

  async consumeInAppPurchase(_purchaseToken: string) {
    return true;
  }
}
