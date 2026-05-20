import { GameObjects, Scene } from "phaser";

export type RewardContainerConfig = {
  x: number;
  y: number;
  startMaxValue?: number;
  maxValueStepPerOpening?: number;
  displaySize?: number;
};

type RewardContainerViewConfig = RewardContainerConfig & {
  color?: number;
  textureKeys?: string[];
};

export abstract class RewardContainer {
  static readonly rewardIssueAnimationDelayMs = 420;
  protected static readonly defaultStartMaxValue = 30;
  protected static readonly defaultMaxValueStepPerOpening = 20;
  protected static readonly depth = 30;
  protected static readonly fallbackSize = 76;

  protected readonly scene: Scene;
  private readonly view: GameObjects.Image | GameObjects.Rectangle;
  private readonly sprite?: GameObjects.Image;
  private readonly textureKeys: string[];
  private readonly originX: number;
  private readonly originY: number;
  private readonly startMaxValue: number;
  private readonly maxValueStepPerOpening: number;
  protected value = 0;
  protected openingsCount = 0;

  constructor(scene: Scene, config: RewardContainerViewConfig) {
    this.scene = scene;
    this.startMaxValue = Math.max(
      1,
      Math.floor(config.startMaxValue ?? RewardContainer.defaultStartMaxValue),
    );
    this.maxValueStepPerOpening = Math.max(
      0,
      Math.floor(
        config.maxValueStepPerOpening ??
          RewardContainer.defaultMaxValueStepPerOpening,
      ),
    );
    this.textureKeys = config.textureKeys ?? [];

    if (this.textureKeys.length > 0) {
      this.sprite = scene.add
        .image(config.x, config.y, this.textureKeys[0])
        .setDisplaySize(
          config.displaySize ?? RewardContainer.fallbackSize,
          config.displaySize ?? RewardContainer.fallbackSize,
        )
        .setDepth(RewardContainer.depth);
      this.view = this.sprite;
    } else {
      this.view = scene.add
        .rectangle(
          config.x,
          config.y,
          config.displaySize ?? RewardContainer.fallbackSize,
          config.displaySize ?? RewardContainer.fallbackSize,
          config.color ?? 0xffffff,
          0.92,
        )
        .setDepth(RewardContainer.depth)
        .setStrokeStyle(2, 0xffffff, 0.65);
    }

    this.originX = config.x;
    this.originY = config.y;
    this.updateVisualState();
  }

  add(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return 0;
    }

    this.value += safeAmount;

    let issuedRewards = 0;

    while (this.value >= this.getCurrentMaxValue()) {
      this.value -= this.getCurrentMaxValue();
      this.openingsCount += 1;
      issuedRewards += this.issueReward(1);
    }

    if (issuedRewards > 0) {
      const nextValue = this.value;

      this.value = this.getCurrentMaxValue();
      this.updateVisualState();
      this.playRewardIssuedAnimation(() => {
        this.resetAfterReward(nextValue);
        this.updateVisualState();
      });

      return issuedRewards;
    }

    this.updateVisualState();
    this.playHitAnimation();

    return issuedRewards;
  }

  getTargetPoint() {
    return {
      x: this.originX,
      y: this.originY,
    };
  }

  setVisible(visible: boolean) {
    this.view.setVisible(visible);
  }

  protected abstract issueReward(completedRewards: number): number;

  protected resetAfterReward(nextValue = this.value % this.getCurrentMaxValue()) {
    this.value = nextValue;
  }

  protected getCurrentMaxValue() {
    return (
      this.startMaxValue +
      this.openingsCount * this.maxValueStepPerOpening
    );
  }

  private playHitAnimation() {
    this.scene.tweens.killTweensOf(this.view);
    this.resetViewPosition();

    this.scene.tweens.add({
      targets: this.view,
      x: {
        from: this.originX - 7,
        to: this.originX + 7,
      },
      duration: 35,
      repeat: 3,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.resetViewPosition();
      },
    });
  }

  private playRewardIssuedAnimation(onComplete: () => void) {
    this.scene.tweens.killTweensOf(this.view);
    this.resetViewPosition();

    this.scene.tweens.add({
      targets: this.view,
      x: {
        from: this.originX - 10,
        to: this.originX + 10,
      },
      duration: 35,
      repeat: 5,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.view.x = this.originX;
      },
    });

    this.scene.tweens.add({
      targets: this.view,
      y: this.originY - 42,
      duration: 130,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.resetViewPosition();
        onComplete();
      },
    });
  }

  private resetViewPosition() {
    this.view.setPosition(this.originX, this.originY);
  }

  private updateVisualState() {
    if (!this.sprite || this.textureKeys.length === 0) {
      return;
    }

    this.sprite.setTexture(this.textureKeys[this.getCurrentTextureIndex()]);
  }

  private getCurrentTextureIndex() {
    if (this.value <= 0) {
      return 0;
    }

    const maxIndex = this.textureKeys.length - 1;
    const fillProgress = this.value / this.getCurrentMaxValue();

    return Math.min(maxIndex, Math.ceil(fillProgress * maxIndex));
  }
}
