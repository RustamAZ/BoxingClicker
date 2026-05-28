import { GameObjects, Scene } from "phaser";

export class LoadingSpinner {
  static readonly textureKey = "ui-loading-spinner";
  private static readonly texturePath = "assets/images/ui/loading-spinner.png";
  private static readonly size = 64;
  private static readonly rotationSpeed = 240;

  private readonly image: GameObjects.Image;
  private isRotationActive = false;

  static preload(scene: Scene) {
    scene.load.image(LoadingSpinner.textureKey, LoadingSpinner.texturePath);
  }

  constructor(
    private readonly scene: Scene,
    x: number,
    y: number,
    depth: number,
  ) {
    this.image = this.scene.add
      .image(x, y, LoadingSpinner.textureKey)
      .setDisplaySize(LoadingSpinner.size, LoadingSpinner.size)
      .setDepth(depth)
      .setVisible(false);
  }

  show() {
    this.image.setVisible(true);
    this.startRotation();
  }

  hide() {
    this.image.setVisible(false);
    this.stopRotation();
  }

  destroy() {
    this.stopRotation();
    this.image.destroy();
  }

  private startRotation() {
    if (this.isRotationActive) {
      return;
    }

    this.isRotationActive = true;
    this.scene.events.on("update", this.updateRotation, this);
  }

  private stopRotation() {
    if (!this.isRotationActive) {
      return;
    }

    this.isRotationActive = false;
    this.scene.events.off("update", this.updateRotation, this);
  }

  private updateRotation(_time: number, delta: number) {
    this.image.angle += LoadingSpinner.rotationSpeed * (delta / 1000);
  }
}
