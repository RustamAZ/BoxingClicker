import type { Scene } from "phaser";
import type { Player } from "../Player/Player";
import type { Wallet } from "../Wallet/Wallet";
import type { PauseController } from "../../state/PauseController";
import { LootCaseModal } from "../../ui/LootCaseModal";
import { rollLootCaseDrop } from "./LootCaseConfig";
import {
  LootReward,
  type LootRewardApplyContext,
} from "./rewards/LootReward";
import { LootRewardFactory } from "./rewards/LootRewardFactory";

export class LootCaseController {
  private static readonly maxRewardsPerCase = 2;

  private readonly modal: LootCaseModal;
  private currentRewards: LootReward[] = [];
  private hasPendingOpening = false;
  private isOpen = false;

  static preload(scene: Scene) {
    LootRewardFactory.preload(scene);
  }

  constructor(
    private readonly scene: Scene,
    private readonly player: Player,
    private readonly wallet: Wallet,
    private readonly pauseController: PauseController,
  ) {
    this.modal = new LootCaseModal(this.scene);
  }

  requestOpen() {
    this.hasPendingOpening = true;
  }

  open() {
    if (this.isOpen || this.pauseController.isPaused) {
      this.hasPendingOpening = true;
      return;
    }

    this.openNow();
  }

  update() {
    if (!this.hasPendingOpening || this.isOpen || this.pauseController.isPaused) {
      return;
    }

    this.hasPendingOpening = false;
    this.openNow();
  }

  private openNow() {
    this.isOpen = true;
    this.currentRewards = [this.rollReward()];
    this.pauseController.pause("loot-case");
    this.modal.show(this.getModalConfig());
  }

  private rollExtraReward() {
    if (this.currentRewards.length >= LootCaseController.maxRewardsPerCase) {
      return;
    }

    this.currentRewards.push(this.rollReward());
    this.modal.roll(this.getModalConfig());
  }

  private claimRewards() {
    this.applyRewards(this.currentRewards);
    this.currentRewards = [];
    this.isOpen = false;
    this.modal.hide();
    this.pauseController.resume("loot-case");
  }

  private getModalConfig() {
    return {
      reward: this.currentRewards[this.currentRewards.length - 1],
      rewardsCount: this.currentRewards.length,
      canRollExtra:
        this.currentRewards.length < LootCaseController.maxRewardsPerCase,
      onContinue: () => {
        this.claimRewards();
      },
      onExtra: () => {
        this.rollExtraReward();
      },
    };
  }

  private rollReward() {
    const drop = rollLootCaseDrop();

    return LootRewardFactory.create(drop.rewardId, drop.rarity);
  }

  private applyRewards(rewards: LootReward[]) {
    const context: LootRewardApplyContext = {
      player: this.player,
      wallet: this.wallet,
    };

    rewards.forEach((reward) => {
      reward.playApplySound(this.scene);
      reward.apply(context);
    });
  }
}
