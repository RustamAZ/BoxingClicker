import type { Scene } from "phaser";
import type { Player } from "../entities/Player/Player";
import type { PauseController } from "../state/PauseController";
import { LevelUpRewardModal } from "../ui/LevelUpRewardModal";
import { RewardChoiceController } from "./RewardChoiceController";
import type { RewardChoice } from "./types";

export class LevelUpRewardController {
  private readonly modal: LevelUpRewardModal;
  private rewardsToChoose = 0;
  private isShowingReward = false;

  static preload(scene: Scene) {
    LevelUpRewardModal.preload(scene);
    RewardChoiceController.preload(scene);
  }

  constructor(
    scene: Scene,
    private readonly player: Player,
    private readonly pauseController: PauseController,
  ) {
    this.modal = new LevelUpRewardModal(scene);
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

    this.isShowingReward = true;
    this.pauseController.pause("level-up-reward");
    this.modal.show(choices, (upgrade) => {
      this.selectUpgrade(upgrade);
    });
  }

  private selectUpgrade(choice: RewardChoice) {
    choice.apply(this.player);
    this.modal.hide();
    this.isShowingReward = false;
    this.rewardsToChoose -= 1;

    if (this.rewardsToChoose > 0) {
      this.showNextReward();
      return;
    }

    this.pauseController.resume("level-up-reward");
  }
}
