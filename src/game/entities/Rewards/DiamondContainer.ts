import type { Scene } from "phaser";
import { RewardContainer, type RewardContainerConfig } from "./RewardContainer";

export class DiamondContainer extends RewardContainer {
  private static readonly defaultDisplaySize = 300;
  private static readonly textureKeys = [
    "diamonds-container-1",
    "diamonds-container-2",
    "diamonds-container-3",
    "diamonds-container-4",
    "diamonds-container-5",
    "diamonds-container-6",
  ];
  private static readonly spritePaths = DiamondContainer.textureKeys.map(
    (textureKey) => ({
      textureKey,
      path: `assets/images/rewards/diamonds-container/${textureKey}.png`,
    }),
  );

  static preload(scene: Scene) {
    for (const frame of DiamondContainer.spritePaths) {
      scene.load.image(frame.textureKey, frame.path);
    }
  }

  constructor(scene: Scene, config: RewardContainerConfig) {
    super(scene, {
      ...config,
      displaySize: config.displaySize ?? DiamondContainer.defaultDisplaySize,
      textureKeys: DiamondContainer.textureKeys,
    });
  }

  protected issueReward(completedRewards: number) {
    return completedRewards;
  }
}
