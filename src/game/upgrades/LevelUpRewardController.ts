import type { Scene } from "phaser";
import type { Player } from "../entities/Player/Player";
import type { PauseController } from "../state/PauseController";
import { LevelUpRewardModal } from "../ui/LevelUpRewardModal";
import { RewardChoiceController } from "./RewardChoiceController";
import type { RewardChoice } from "./types";

export class LevelUpRewardController {
  private static isAssetsLoaded = false;
  private static isAssetsLoading = false;
  private static readonly assetLoadCallbacks: Array<() => void> = [];

  private modal?: LevelUpRewardModal;
  private rewardsToChoose = 0;
  private isShowingReward = false;

  static preload(scene: Scene) {
    LevelUpRewardModal.preload(scene);
    RewardChoiceController.preload(scene);
    LevelUpRewardController.isAssetsLoaded = true;
  }

  static loadAssets(scene: Scene, onComplete?: () => void) {
    if (LevelUpRewardController.isAssetsLoaded) {
      onComplete?.();
      return;
    }

    if (onComplete) {
      LevelUpRewardController.assetLoadCallbacks.push(onComplete);
    }

    if (LevelUpRewardController.isAssetsLoading) {
      return;
    }

    if (scene.load.isLoading()) {
      scene.load.once("complete", () => {
        LevelUpRewardController.loadAssets(scene);
      });
      return;
    }

    LevelUpRewardController.isAssetsLoading = true;
    LevelUpRewardModal.preload(scene);
    RewardChoiceController.preload(scene);
    scene.load.once("complete", () => {
      LevelUpRewardController.isAssetsLoaded = true;
      LevelUpRewardController.isAssetsLoading = false;
      const callbacks = LevelUpRewardController.assetLoadCallbacks.splice(0);

      callbacks.forEach((callback) => {
        callback();
      });
    });
    scene.load.start();
  }

  constructor(
    private readonly scene: Scene,
    private readonly player: Player,
    private readonly pauseController: PauseController,
  ) {
  }

  preloadAssets() {
    LevelUpRewardController.loadAssets(this.scene, () => {
      this.ensureModalCreated();
    });
  }

  enqueueRewards(count: number) {
    this.rewardsToChoose += Math.max(0, Math.floor(count));
  }

  update(canShowReward: boolean) {
    if (
      this.isShowingReward ||
      this.pauseController.isPaused ||
      !canShowReward
    ) {
      return;
    }

    if (this.rewardsToChoose > 0) {
      if (!LevelUpRewardController.isAssetsLoaded) {
        this.preloadAssets();
        return;
      }

      this.showNextReward();
    }
  }

  private showNextReward() {
    if (this.rewardsToChoose <= 0) {
      this.pauseController.resume("level-up-reward");
      return;
    }

    const choices = RewardChoiceController.getRandomChoices(3);

    if (choices.length === 0) {
      this.rewardsToChoose = 0;
      this.pauseController.resume("level-up-reward");
      return;
    }

    const modal = this.ensureModalCreated();

    this.isShowingReward = true;
    this.pauseController.pause("level-up-reward");
    modal.show(choices, (upgrade) => {
      this.selectUpgrade(upgrade);
    });
  }

  private selectUpgrade(choice: RewardChoice) {
    choice.apply(this.player);
    this.modal?.hide();
    this.isShowingReward = false;
    this.rewardsToChoose -= 1;

    if (this.rewardsToChoose > 0) {
      this.showNextReward();
      return;
    }

    this.pauseController.resume("level-up-reward");
  }

  private ensureModalCreated() {
    this.modal ??= new LevelUpRewardModal(this.scene);

    return this.modal;
  }
}
