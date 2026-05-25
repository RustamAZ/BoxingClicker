import type { Scene } from "phaser";

export class ScreenFilterController {
  private grayscaleTimer?: Phaser.Time.TimerEvent;
  private previousFilter = "";
  private isGrayscaleActive = false;

  constructor(private readonly scene: Scene) {
    this.scene.events.once("shutdown", () => this.destroy());
    this.scene.events.once("destroy", () => this.destroy());
  }

  playGrayscale(durationMs: number) {
    const canvas = this.scene.game.canvas;

    if (!this.isGrayscaleActive) {
      this.previousFilter = canvas.style.filter;
      this.isGrayscaleActive = true;
    }

    canvas.style.filter = this.previousFilter
      ? `${this.previousFilter} grayscale(1)`
      : "grayscale(1)";

    this.grayscaleTimer?.remove();
    this.grayscaleTimer = this.scene.time.delayedCall(durationMs, () => {
      this.clearGrayscale();
    });
  }

  destroy() {
    this.grayscaleTimer?.remove();
    this.clearGrayscale();
  }

  private clearGrayscale() {
    if (!this.isGrayscaleActive) {
      return;
    }

    this.scene.game.canvas.style.filter = this.previousFilter;
    this.previousFilter = "";
    this.isGrayscaleActive = false;
    this.grayscaleTimer = undefined;
  }
}
