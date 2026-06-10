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
import { EmeraldLootReward } from "./rewards/EmeraldLootReward";
import { LootRewardFactory } from "./rewards/LootRewardFactory";

export class LootCaseController {
  private static readonly maxRewardsPerCase = 2;
  private static isAssetsLoaded = false;
  private static isAssetsLoading = false;
  private static readonly assetLoadCallbacks: Array<() => void> = [];

  private modal?: LootCaseModal;
  private currentRewards: LootReward[] = [];
  private hasPendingOpening = false;
  private isOpen = false;
  private isExtraRewardAdPending = false;

  static preload(scene: Scene) {
    LootCaseModal.preload(scene);
    LootRewardFactory.preload(scene);
    LootCaseController.isAssetsLoaded = true;
  }

  static loadAssets(scene: Scene, onComplete?: () => void) {
    if (LootCaseController.isAssetsLoaded) {
      onComplete?.();
      return;
    }

    if (onComplete) {
      LootCaseController.assetLoadCallbacks.push(onComplete);
    }

    if (LootCaseController.isAssetsLoading) {
      return;
    }

    if (scene.load.isLoading()) {
      scene.load.once("complete", () => {
        LootCaseController.loadAssets(scene);
      });
      return;
    }

    LootCaseController.isAssetsLoading = true;
    LootCaseModal.preload(scene);
    LootRewardFactory.preload(scene);
    scene.load.once("complete", () => {
      LootCaseController.isAssetsLoaded = true;
      LootCaseController.isAssetsLoading = false;
      const callbacks = LootCaseController.assetLoadCallbacks.splice(0);

      callbacks.forEach((callback) => {
        callback();
      });
    });
    scene.load.start();
  }

  constructor(
    private readonly scene: Scene,
    private readonly player: Player,
    private readonly wallet: Wallet,
    private readonly pauseController: PauseController,
    private readonly isInfinityTowerRun = () => false,
    private readonly onEmeraldRewardClaimed?: (
      amount: number,
      from: { x: number; y: number },
    ) => void,
    private readonly showRewardedAd: () => Promise<boolean> = async () => true,
  ) {
  }

  preloadAssets() {
    LootCaseController.loadAssets(this.scene, () => {
      this.ensureModalCreated();
    });
  }

  requestOpen() {
    this.hasPendingOpening = true;
  }

  reset() {
    this.hasPendingOpening = false;
    this.currentRewards = [];
    this.isOpen = false;
    this.isExtraRewardAdPending = false;
    this.modal?.hide();
    this.pauseController.resume("loot-case");
  }

  open() {
    if (this.isOpen || this.pauseController.isPaused) {
      this.hasPendingOpening = true;
      return;
    }

    this.openNow();
  }

  update(canOpen = true) {
    if (
      !this.hasPendingOpening ||
      this.isOpen ||
      this.pauseController.isPaused ||
      !canOpen
    ) {
      return;
    }

    if (!LootCaseController.isAssetsLoaded) {
      this.preloadAssets();
      return;
    }

    this.hasPendingOpening = false;
    this.openNow();
  }

  private openNow() {
    if (!LootCaseController.isAssetsLoaded) {
      this.hasPendingOpening = true;
      this.preloadAssets();
      return;
    }

    const modal = this.ensureModalCreated();

    this.isOpen = true;
    this.currentRewards = [this.rollReward()];
    this.pauseController.pause("loot-case");
    modal.show(this.getModalConfig());
  }

  private rollExtraReward() {
    if (this.currentRewards.length >= LootCaseController.maxRewardsPerCase) {
      return;
    }

    this.currentRewards.push(this.rollReward());
    this.modal?.roll(this.getModalConfig());
  }

  private async rollExtraRewardAfterAd() {
    if (
      this.isExtraRewardAdPending ||
      this.currentRewards.length >= LootCaseController.maxRewardsPerCase
    ) {
      return;
    }

    this.isExtraRewardAdPending = true;
    const isRewarded = await this.showRewardedAd().catch(() => false);
    this.isExtraRewardAdPending = false;

    if (!isRewarded) {
      this.modal?.unlockActions();
      return;
    }

    this.rollExtraReward();
  }

  private claimRewards() {
    this.applyRewards(
      this.currentRewards,
      this.modal?.getRewardParticleOrigin() ?? {
        x: this.scene.scale.width / 2,
        y: this.scene.scale.height / 2,
      },
    );
    this.currentRewards = [];
    this.isOpen = false;
    this.isExtraRewardAdPending = false;
    this.modal?.hide();
    this.pauseController.resume("loot-case");
  }

  private ensureModalCreated() {
    this.modal ??= new LootCaseModal(this.scene);

    return this.modal;
  }

  private getModalConfig() {
    return {
      reward: this.currentRewards[this.currentRewards.length - 1],
      previousRewards: this.currentRewards.slice(0, -1),
      rewardsCount: this.currentRewards.length,
      rollerIconTextureKeys: LootRewardFactory.getVisualRewardIconKeys(),
      canRollExtra:
        this.currentRewards.length < LootCaseController.maxRewardsPerCase,
      onContinue: () => {
        this.claimRewards();
      },
      onExtra: () => {
        void this.rollExtraRewardAfterAd();
      },
    };
  }

  private rollReward() {
    const drop = rollLootCaseDrop();

    return LootRewardFactory.create(drop.rewardId, drop.rarity, {
      isInfinityTowerRun: this.isInfinityTowerRun(),
    });
  }

  private applyRewards(rewards: LootReward[], from: { x: number; y: number }) {
    const context: LootRewardApplyContext = {
      player: this.player,
      wallet: this.wallet,
    };

    rewards.forEach((reward) => {
      if (reward instanceof EmeraldLootReward && this.onEmeraldRewardClaimed) {
        this.onEmeraldRewardClaimed(reward.value, from);
        return;
      }

      reward.playApplySound(this.scene);
      reward.apply(context);
    });
  }
}
