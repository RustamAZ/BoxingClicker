import type { Scene } from "phaser";
import {
  ResourceContainer,
  type ResourceContainerConfig,
} from "./ResourceContainer";

export type CoinContainerConfig = ResourceContainerConfig & {
  onFilled?: () => void;
};

export class CoinContainer extends ResourceContainer {
  private static readonly defaultDisplaySize = 300;
  private static readonly startMaxValue = 40;
  private static readonly maxValueStepPerOpening = 20;
  private static readonly textureKeys = [
    "coin-container-1",
    "coin-container-2",
    "coin-container-3",
    "coin-container-4",
    "coin-container-5",
    "coin-container-6",
  ];
  private static readonly spritePaths = CoinContainer.textureKeys.map(
    (textureKey) => ({
      textureKey,
      path: `assets/images/rewards/coin-container/${textureKey}.png`,
    }),
  );

  static preload(scene: Scene) {
    for (const frame of CoinContainer.spritePaths) {
      scene.load.image(frame.textureKey, frame.path);
    }
  }

  constructor(
    scene: Scene,
    private readonly config: CoinContainerConfig,
  ) {
    super(scene, {
      ...config,
      startMaxValue: config.startMaxValue ?? CoinContainer.startMaxValue,
      maxValueStepPerOpening:
        config.maxValueStepPerOpening ??
        CoinContainer.maxValueStepPerOpening,
      displaySize: config.displaySize ?? CoinContainer.defaultDisplaySize,
      textureKeys: CoinContainer.textureKeys,
    });
  }

  protected issueCompletion(_completedCount: number) {
    this.config.onFilled?.();

    return 0;
  }
}
