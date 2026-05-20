import type { Scene } from "phaser";
import { RewardContainer, type RewardContainerConfig } from "./RewardContainer";

export class DiamondContainer extends RewardContainer {
  private static readonly defaultDisplaySize = 300;
  private static readonly startMaxValue = 35;
  private static readonly maxValueStepPerOpening = 20;
  private static readonly rewardSoundKey = "diamond-reward";
  private static readonly rewardSoundPath = "assets/audio/ui/diamondReward.mp3";
  private static readonly collectSounds = [
    {
      key: "diamond-collect-1",
      path: "assets/audio/ui/diamondCollect-1.mp3",
    },
    {
      key: "diamond-collect-2",
      path: "assets/audio/ui/diamondCollect-2.mp3",
    },
    {
      key: "diamond-collect-3",
      path: "assets/audio/ui/diamondCollect-3.mp3",
    },
  ];
  private static readonly maxCollectSoundsPerBatch = 10;
  private static readonly collectSoundStepMs = 42;
  private static readonly collectSoundJitterMs = 18;
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

    scene.load.audio(
      DiamondContainer.rewardSoundKey,
      DiamondContainer.rewardSoundPath,
    );

    DiamondContainer.collectSounds.forEach((sound) => {
      scene.load.audio(sound.key, sound.path);
    });
  }

  constructor(scene: Scene, config: RewardContainerConfig) {
    super(scene, {
      ...config,
      startMaxValue:
        config.startMaxValue ?? DiamondContainer.startMaxValue,
      maxValueStepPerOpening:
        config.maxValueStepPerOpening ??
        DiamondContainer.maxValueStepPerOpening,
      displaySize: config.displaySize ?? DiamondContainer.defaultDisplaySize,
      textureKeys: DiamondContainer.textureKeys,
    });
  }

  add(amount: number) {
    this.playCollectSoundChain(amount);

    return super.add(amount);
  }

  protected issueReward(completedRewards: number) {
    this.playRewardSound();

    return completedRewards;
  }

  private playRewardSound() {
    this.scene.sound.play(DiamondContainer.rewardSoundKey, {
      volume: 0.8,
    });
  }

  private playCollectSoundChain(amount: number) {
    const soundsCount = Math.min(
      Math.max(0, Math.floor(amount)),
      DiamondContainer.maxCollectSoundsPerBatch,
    );

    for (let i = 0; i < soundsCount; i += 1) {
      this.scene.time.delayedCall(
        i * DiamondContainer.collectSoundStepMs +
          Math.random() * DiamondContainer.collectSoundJitterMs,
        () => {
          this.playRandomCollectSound();
        },
      );
    }
  }

  private playRandomCollectSound() {
    const sound =
      DiamondContainer.collectSounds[
        Math.floor(Math.random() * DiamondContainer.collectSounds.length)
      ];

    this.scene.sound.play(sound.key, {
      volume: 0.24,
    });
  }
}
