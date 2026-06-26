import type { Language } from "../../localization/types";
import type { PlayerProfileSnapshot } from "../../entities/Player/PlayerProfile";

export type ProfileSaveOptions = {
  flush?: boolean;
};

export type InAppProduct = {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  price: string;
  priceValue: string;
  priceCurrencyCode: string;
  priceCurrencyImage: {
    small: string;
    medium: string;
    svg: string;
  };
};

export type InAppPurchase = {
  productId: string;
  purchaseToken: string;
  developerPayload?: string;
};

export interface GamePlatform {
  getLanguage(): Language;
  loadProfile(): Promise<unknown | undefined>;
  saveProfile(
    profile: PlayerProfileSnapshot,
    options?: ProfileSaveOptions,
  ): void;
  loadingReady(): void;
  showRewardedAd(): Promise<boolean>;
  showFullscreenAd(options?: { lobbyAuto?: boolean }): Promise<boolean>;
  showStickyBanner(): Promise<void>;
  hideStickyBanner(): Promise<void>;
  canShowLobbyAutoAd(): boolean;
  submitInfinityTowerScore(score: number): void;
  getInAppProducts(): Promise<InAppProduct[]>;
  getInAppPurchases(): Promise<InAppPurchase[]>;
  purchaseInAppProduct(productId: string): Promise<InAppPurchase | undefined>;
  consumeInAppPurchase(purchaseToken: string): Promise<boolean>;
}

export const mapYandexLanguage = (language: string | undefined): Language => {
  return language === "ru" ? "ru" : "en";
};
