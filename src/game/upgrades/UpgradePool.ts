import type { Scene } from "phaser";
import { RewardChoiceController } from "./RewardChoiceController";

export class UpgradePool {
  static preload(scene: Scene) {
    RewardChoiceController.preload(scene);
  }

  static getRandomChoices(count = 3) {
    return RewardChoiceController.getRandomChoices(count);
  }
}
