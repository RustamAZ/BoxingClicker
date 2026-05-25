import { Scene, Sound } from "phaser";
import type { GameLevelController } from "../progression/GameLevelController";
import type { BackgroundMusicId } from "../progression/types";

type BackgroundMusicTrack = {
  id: BackgroundMusicId;
  key: string;
  path: string;
};

export class BackgroundMusicController {
  private static readonly menuAndLobbyTrack: BackgroundMusicTrack = {
    id: "menu-and-lobby",
    key: "music-menu-and-lobby",
    path: "assets/audio/music/menu-and-lobby.mp3",
  };
  private static readonly actionTrack: BackgroundMusicTrack = {
    id: "action",
    key: "music-action",
    path: "assets/audio/music/action-music-1.mp3",
  };
  private static readonly bossFightTrack: BackgroundMusicTrack = {
    id: "boss-fight",
    key: "music-boss-fight",
    path: "assets/audio/music/boss-fight.mp3",
  };
  private static readonly hellBossFightTrack: BackgroundMusicTrack = {
    id: "hell-boss-fight",
    key: "music-hell-boss-fight",
    path: "assets/audio/music/hell-boss-ambient.mp3",
  };
  private static readonly tracks = [
    BackgroundMusicController.menuAndLobbyTrack,
    BackgroundMusicController.actionTrack,
    BackgroundMusicController.bossFightTrack,
    BackgroundMusicController.hellBossFightTrack,
  ];
  private static readonly volume = 0.42;

  private currentTrack?: BackgroundMusicTrack;
  private currentSound?: Sound.BaseSound;
  private isPaused = false;

  static preload(scene: Scene) {
    BackgroundMusicController.tracks.forEach((track) => {
      scene.load.audio(track.key, track.path);
    });
  }

  constructor(
    private readonly scene: Scene,
    private readonly levelController: GameLevelController,
  ) {
    this.scene.sound.once("unlocked", () => {
      this.playCurrentSound();
    });
    this.scene.events.once("shutdown", () => {
      this.destroy();
    });
    this.scene.events.once("destroy", () => {
      this.destroy();
    });
  }

  update() {
    if (this.isPaused) {
      return;
    }

    const nextTrack = this.getTrackForCurrentLevel();

    if (this.currentTrack?.key === nextTrack.key) {
      this.playCurrentSound();
      return;
    }

    this.switchTrack(nextTrack);
  }

  destroy() {
    this.stopCurrentSound();
  }

  pause() {
    this.isPaused = true;

    if (this.currentSound?.isPlaying) {
      this.currentSound.pause();
    }
  }

  resume() {
    this.isPaused = false;
    this.playCurrentSound();
  }

  private getTrackForCurrentLevel() {
    const musicId = this.levelController.getCurrentMusicId();

    return (
      BackgroundMusicController.tracks.find((track) => track.id === musicId) ??
      BackgroundMusicController.menuAndLobbyTrack
    );
  }

  private switchTrack(track: BackgroundMusicTrack) {
    this.stopCurrentSound();
    this.currentTrack = track;
    this.currentSound = this.scene.sound.add(track.key, {
      loop: true,
      volume: BackgroundMusicController.volume,
    });
    this.playCurrentSound();
  }

  private playCurrentSound() {
    if (
      !this.currentSound ||
      this.currentSound.isPlaying ||
      this.scene.sound.locked
    ) {
      return;
    }

    this.currentSound.play({
      loop: true,
      volume: BackgroundMusicController.volume,
    });
  }

  private stopCurrentSound() {
    if (!this.currentSound) {
      return;
    }

    this.currentSound.stop();
    this.currentSound.destroy();
    this.currentSound = undefined;
    this.currentTrack = undefined;
  }
}
