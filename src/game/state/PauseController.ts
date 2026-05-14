import type { Scene } from "phaser";

export type PauseReason = "settings" | "level-up-reward" | "player-death";

export class PauseController {
  private readonly activeReasons = new Set<PauseReason>();

  constructor(private readonly scene: Scene) {}

  get isPaused() {
    return this.activeReasons.size > 0;
  }

  has(reason: PauseReason) {
    return this.activeReasons.has(reason);
  }

  pause(reason: PauseReason) {
    const wasPaused = this.isPaused;

    this.activeReasons.add(reason);

    if (!wasPaused) {
      this.scene.tweens.pauseAll();
    }
  }

  resume(reason: PauseReason) {
    if (!this.activeReasons.delete(reason)) {
      return;
    }

    if (!this.isPaused) {
      this.scene.tweens.resumeAll();
    }
  }
}
