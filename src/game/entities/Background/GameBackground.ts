import { GameObjects, Scene } from "phaser";
import type { Player } from "../Player/Player";

type BackgroundConfig = {
  minPlayerLevel: number;
  key: string;
  path: string;
};

export class GameBackground {
  private static readonly width = 1024;
  private static readonly height = 768;
  private static readonly backgrounds: BackgroundConfig[] = [
    {
      minPlayerLevel: 1,
      key: "home-background",
      path: "assets/images/backgrounds/home.png",
    },
    {
      minPlayerLevel: 2,
      key: "street-background",
      path: "assets/images/backgrounds/street.png",
    },
  ];

  private readonly image: GameObjects.Image;
  private currentBackgroundKey = "";

  static preload(scene: Scene) {
    GameBackground.backgrounds.forEach((background) => {
      scene.load.image(background.key, background.path);
    });
  }

  constructor(
    private readonly scene: Scene,
    private readonly player: Player,
  ) {
    const background = this.getBackgroundForPlayerLevel();

    this.currentBackgroundKey = background.key;
    this.image = this.scene.add
      .image(GameBackground.width / 2, GameBackground.height / 2, background.key)
      .setDisplaySize(GameBackground.width, GameBackground.height)
      .setDepth(-10);
  }

  update() {
    const background = this.getBackgroundForPlayerLevel();

    if (background.key === this.currentBackgroundKey) {
      return;
    }

    this.currentBackgroundKey = background.key;
    this.image
      .setTexture(background.key)
      .setDisplaySize(GameBackground.width, GameBackground.height);
  }

  private getBackgroundForPlayerLevel() {
    return GameBackground.backgrounds.reduce((current, background) => {
      if (
        background.minPlayerLevel <= this.player.level &&
        background.minPlayerLevel >= current.minPlayerLevel
      ) {
        return background;
      }

      return current;
    }, GameBackground.backgrounds[0]);
  }
}
