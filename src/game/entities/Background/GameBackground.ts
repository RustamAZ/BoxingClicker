import { GameObjects, Scene } from "phaser";
import { GameLevelController } from "../../progression/GameLevelController";

export class GameBackground {
  private static readonly width = 1024;
  private static readonly height = 768;

  private readonly image: GameObjects.Image;
  private currentBackgroundKey = "";

  static preload(scene: Scene) {
    GameLevelController.preloadBackgrounds(scene);
  }

  constructor(
    private readonly scene: Scene,
    private readonly levelController: GameLevelController,
  ) {
    const background = this.levelController.getCurrentBackground();

    this.currentBackgroundKey = background.key;
    this.image = this.scene.add
      .image(GameBackground.width / 2, GameBackground.height / 2, background.key)
      .setDisplaySize(GameBackground.width, GameBackground.height)
      .setDepth(-10);
  }

  update() {
    const background = this.levelController.getCurrentBackground();

    if (background.key === this.currentBackgroundKey) {
      return;
    }

    this.currentBackgroundKey = background.key;
    this.image
      .setTexture(background.key)
      .setDisplaySize(GameBackground.width, GameBackground.height);
  }
}
