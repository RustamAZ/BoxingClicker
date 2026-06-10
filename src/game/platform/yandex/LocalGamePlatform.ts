import type { PlayerProfileSnapshot } from "../../entities/Player/PlayerProfile";
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
}
