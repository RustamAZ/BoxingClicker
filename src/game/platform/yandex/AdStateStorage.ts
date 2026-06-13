type StoredAdState = {
  lastAdShownAt?: number;
  skipNextLobbyAutoAd?: boolean;
};

export class AdStateStorage {
  private static readonly storageKey = "boxing-clicker-yandex-ad-state";
  private static readonly lobbyAutoAdCooldownMs = 2 * 60 * 1000;
  private static readonly lobbyAutoAdMaxAgeMs = 25 * 60 * 1000;

  canShowLobbyAutoAd() {
    const state = this.load();

    if (state.skipNextLobbyAutoAd) {
      this.save({
        ...state,
        skipNextLobbyAutoAd: false,
      });
      return false;
    }

    const lastAdShownAt =
      typeof state.lastAdShownAt === "number" ? state.lastAdShownAt : 0;

    if (lastAdShownAt <= 0) {
      return false;
    }

    const timeSinceLastAdMs = Date.now() - lastAdShownAt;

    return (
      timeSinceLastAdMs >= AdStateStorage.lobbyAutoAdCooldownMs &&
      timeSinceLastAdMs <= AdStateStorage.lobbyAutoAdMaxAgeMs
    );
  }

  markAdShown(options: { lobbyAuto?: boolean } = {}) {
    const state = this.load();

    this.save({
      ...state,
      lastAdShownAt: Date.now(),
      skipNextLobbyAutoAd: options.lobbyAuto
        ? true
        : state.skipNextLobbyAutoAd === true,
    });
  }

  private load(): StoredAdState {
    try {
      const rawState = localStorage.getItem(AdStateStorage.storageKey);

      if (!rawState) {
        return {};
      }

      const state = JSON.parse(rawState) as StoredAdState;

      return {
        lastAdShownAt:
          typeof state.lastAdShownAt === "number"
            ? Math.max(0, state.lastAdShownAt)
            : undefined,
        skipNextLobbyAutoAd: state.skipNextLobbyAutoAd === true,
      };
    } catch {
      return {};
    }
  }

  private save(state: StoredAdState) {
    try {
      localStorage.setItem(AdStateStorage.storageKey, JSON.stringify(state));
    } catch {
      // Ad timing is a UX improvement. The game can continue without storage.
    }
  }
}
