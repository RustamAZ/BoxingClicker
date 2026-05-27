import { Scene } from "phaser";

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

  play() {
    this.scene.sound.play(EnemyDeathSoundPlayer.soundKey, {
      volume: EnemyDeathSoundPlayer.volume,
    });
  }
}
