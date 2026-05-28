import {
  getTrainingItemConfig,
  trainingConfig,
  type TrainingItemConfig,
  type TrainingItemId,
} from "../configs/training";
import type {
  Player,
  PlayerPermanentStatBonuses,
} from "../entities/Player/Player";
import type { Wallet } from "../entities/Wallet/Wallet";

export type TrainingItemState = {
  config: TrainingItemConfig;
  level: number;
  maxLevel: number;
  nextPrice?: number;
  isMaxLevel: boolean;
  canBuy: boolean;
  totalBonus: number;
};

export type TrainingPurchaseResult =
  | {
      success: true;
      state: TrainingItemState;
    }
  | {
      success: false;
      reason: "unknown-item" | "max-level" | "not-enough-emeralds";
      state?: TrainingItemState;
    };

export class TrainingController {
  constructor(
    private readonly player: Player,
    private readonly wallet: Wallet,
  ) {}

  getItems() {
    return trainingConfig.items;
  }

  getBalance() {
    return this.wallet.getBalance();
  }

  getItemStates(): TrainingItemState[] {
    return this.getItems().map((item) => this.getItemState(item.id));
  }

  getItemState(itemId: TrainingItemId): TrainingItemState {
    const item = getTrainingItemConfig(itemId);

    if (!item) {
      throw new Error(`Unknown training item: ${itemId}`);
    }

    const level = this.getSafeTrainingLevel(item);
    const isMaxLevel = level >= item.maxLevel;
    const nextPrice = isMaxLevel ? undefined : item.priceByLevel[level];

    return {
      config: item,
      level,
      maxLevel: item.maxLevel,
      nextPrice,
      isMaxLevel,
      canBuy: nextPrice !== undefined && this.wallet.canWithdraw(nextPrice),
      totalBonus: level * item.valuePerLevel,
    };
  }

  purchase(itemId: TrainingItemId): TrainingPurchaseResult {
    const item = getTrainingItemConfig(itemId);

    if (!item) {
      return {
        success: false,
        reason: "unknown-item",
      };
    }

    const state = this.getItemState(itemId);

    if (state.isMaxLevel || state.nextPrice === undefined) {
      return {
        success: false,
        reason: "max-level",
        state,
      };
    }

    if (!this.wallet.withdraw(state.nextPrice)) {
      return {
        success: false,
        reason: "not-enough-emeralds",
        state,
      };
    }

    this.player.profile.setTrainingLevel(itemId, state.level + 1);
    this.applyTrainingBonuses();

    return {
      success: true,
      state: this.getItemState(itemId),
    };
  }

  applyTrainingBonuses() {
    this.player.setPermanentStatBonuses(this.getTrainingBonuses());
  }

  getTrainingBonuses(): PlayerPermanentStatBonuses {
    return this.getItems().reduce<PlayerPermanentStatBonuses>((bonuses, item) => {
      const level = this.getSafeTrainingLevel(item);
      const value = level * item.valuePerLevel;

      if (value === 0) {
        return bonuses;
      }

      bonuses[item.stat] = (bonuses[item.stat] ?? 0) + value;

      return bonuses;
    }, {});
  }

  private getSafeTrainingLevel(item: TrainingItemConfig) {
    return Math.max(
      0,
      Math.min(item.maxLevel, this.player.profile.getTrainingLevel(item.id)),
    );
  }
}
