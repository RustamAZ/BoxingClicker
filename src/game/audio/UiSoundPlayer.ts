import { Scene } from "phaser";

export class UiSoundPlayer {
  private static readonly clickSoundKey = "ui-click";
  private static readonly clickSoundPath = "assets/audio/ui/click.mp3";
  private static readonly clickVolume = 0.65;

  static preload(scene: Scene) {
    scene.load.audio(UiSoundPlayer.clickSoundKey, UiSoundPlayer.clickSoundPath);
  }

  static playClick(scene: Scene) {
    scene.sound.play(UiSoundPlayer.clickSoundKey, {
      volume: UiSoundPlayer.clickVolume,
    });
  }
}
