import type { Scene } from "phaser";

type StoredGameSettings = {
  masterVolume?: number;
  isMuted?: boolean;
};

type NormalizedGameSettings = {
  masterVolume: number;
  isMuted: boolean;
};

export class GameSettings {
  private static readonly storageKey = "boxing-clicker-settings";
  private static readonly defaultMasterVolume = 1;
  private static readonly pauseVolumeMultiplier = 0.45;

  private masterVolume = GameSettings.defaultMasterVolume;
  private isMuted = false;
  private isAudioPaused = false;

  constructor(private readonly scene: Scene) {
    const settings = this.loadSettings();

    this.masterVolume = settings.masterVolume;
    this.isMuted = settings.isMuted;
    this.applyMasterVolume();
  }

  getMasterVolume() {
    return this.masterVolume;
  }

  getIsMuted() {
    return this.isMuted;
  }

  setMasterVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.applyMasterVolume();
    this.save();
  }

  setMuted(isMuted: boolean) {
    this.isMuted = isMuted;
    this.applyMasterVolume();
    this.save();
  }

  toggleMuted() {
    this.setMuted(!this.isMuted);
  }

  setAudioPaused(isPaused: boolean) {
    this.isAudioPaused = isPaused;
    this.applyMasterVolume();
  }

  private applyMasterVolume() {
    if (this.isMuted) {
      this.scene.sound.volume = 0;
      return;
    }

    const pauseMultiplier = this.isAudioPaused
      ? GameSettings.pauseVolumeMultiplier
      : 1;

    this.scene.sound.volume = this.masterVolume * pauseMultiplier;
  }

  private loadSettings(): NormalizedGameSettings {
    try {
      const rawSettings = localStorage.getItem(GameSettings.storageKey);

      if (!rawSettings) {
        return this.getDefaultSettings();
      }

      const settings = JSON.parse(rawSettings) as StoredGameSettings;

      return {
        masterVolume:
          typeof settings.masterVolume === "number"
            ? Math.max(0, Math.min(1, settings.masterVolume))
            : GameSettings.defaultMasterVolume,
        isMuted: settings.isMuted === true,
      };
    } catch {
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): NormalizedGameSettings {
    return {
      masterVolume: GameSettings.defaultMasterVolume,
      isMuted: false,
    };
  }

  private save() {
    const settings: StoredGameSettings = {
      masterVolume: this.masterVolume,
      isMuted: this.isMuted,
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
