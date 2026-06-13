import { Scene } from "phaser";
import type { EnemyDeathSoundConfig } from "../entities/Enemy/types";

export class EnemyDeathSoundPlayer {
  private static readonly soundKey = "enemy-death";
  private static readonly soundPath = "assets/audio/enemies/enemy-death.mp3";
  private static readonly volume = 0.9;

  static preload(scene: Scene) {
    scene.load.audio(
      EnemyDeathSoundPlayer.soundKey,
      EnemyDeathSoundPlayer.soundPath,
    );
  }

  constructor(private readonly scene: Scene) {}

  play(deathSound?: EnemyDeathSoundConfig) {
    const selectedSound =
      deathSound && this.scene.cache.audio.exists(deathSound.key)
        ? deathSound
        : undefined;

    this.scene.sound.play(
      selectedSound?.key ?? EnemyDeathSoundPlayer.soundKey,
      {
        volume: selectedSound?.volume ?? EnemyDeathSoundPlayer.volume,
      },
    );
  }
}
