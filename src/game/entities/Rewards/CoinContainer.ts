import type { Scene } from "phaser";
import { RewardContainer, type RewardContainerConfig } from "./RewardContainer";

export class CoinContainer extends RewardContainer {
  private static readonly defaultDisplaySize = 300;
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

  constructor(scene: Scene, config: RewardContainerConfig) {
    super(scene, {
      ...config,
      displaySize: config.displaySize ?? CoinContainer.defaultDisplaySize,
      textureKeys: CoinContainer.textureKeys,
    });
  }

  protected issueReward(completedRewards: number) {
    return completedRewards;
  }
}
