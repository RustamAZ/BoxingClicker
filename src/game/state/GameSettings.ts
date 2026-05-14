import type { Scene } from "phaser";

type StoredGameSettings = {
  masterVolume?: number;
};

export class GameSettings {
  private static readonly storageKey = "boxing-clicker-settings";
  private static readonly defaultMasterVolume = 1;

  private masterVolume = GameSettings.defaultMasterVolume;

  constructor(private readonly scene: Scene) {
    this.masterVolume = this.loadMasterVolume();
    this.applyMasterVolume();
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  setMasterVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.applyMasterVolume();
    this.save();
  }

  private applyMasterVolume() {
    this.scene.sound.volume = this.masterVolume;
  }

  private loadMasterVolume() {
    try {
      const rawSettings = localStorage.getItem(GameSettings.storageKey);

      if (!rawSettings) {
        return GameSettings.defaultMasterVolume;
      }

      const settings = JSON.parse(rawSettings) as StoredGameSettings;

      if (typeof settings.masterVolume !== "number") {
        return GameSettings.defaultMasterVolume;
      }

      return Math.max(0, Math.min(1, settings.masterVolume));
    } catch {
      return GameSettings.defaultMasterVolume;
    }
  }

  private save() {
    const settings: StoredGameSettings = {
      masterVolume: this.masterVolume,
    };

    try {
      localStorage.setItem(
        GameSettings.storageKey,
        JSON.stringify(settings),
      );
    } catch {
      // Settings are optional. If storage is unavailable, the current session still works.
    }
  }
}
