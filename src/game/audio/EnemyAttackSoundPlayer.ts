import { Scene } from "phaser";

export class EnemyAttackSoundPlayer {
  private static readonly soundKey = "enemy-attack-hit-2";
  private static readonly soundPath = "assets/audio/enemies/enemy-hit-2.mp3";
  private static readonly volume = 0.75;

  static preload(scene: Scene) {
    scene.load.audio(
      EnemyAttackSoundPlayer.soundKey,
      EnemyAttackSoundPlayer.soundPath,
    );
  }

  constructor(private readonly scene: Scene) {}

  play() {
    this.scene.sound.play(EnemyAttackSoundPlayer.soundKey, {
      volume: EnemyAttackSoundPlayer.volume,
    });
  }
}
