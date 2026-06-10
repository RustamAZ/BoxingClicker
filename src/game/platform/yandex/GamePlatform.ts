import type { Language } from "../../localization/types";
import type { PlayerProfileSnapshot } from "../../entities/Player/PlayerProfile";

export type ProfileSaveOptions = {
  flush?: boolean;
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
}

export const mapYandexLanguage = (language: string | undefined): Language => {
  return language === "ru" ? "ru" : "en";
};
