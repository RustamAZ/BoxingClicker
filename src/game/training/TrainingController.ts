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
  titleKey: string;
  descriptionKey: string;
  level: number;
  displayLevel: number;
  maxLevel: number;
  isInfinite: boolean;
  isUnlocked: boolean;
  lockedReasonKey?: string;
  nextPrice?: number;
  isMaxLevel: boolean;
  canBuy: boolean;
  valuePerLevel: number;
  totalBonus: number;
};

export type TrainingPurchaseResult =
  | {
      success: true;
      state: TrainingItemState;
    }
  | {
      success: false;
      reason: "unknown-item" | "locked" | "max-level" | "not-enough-emeralds";
      state?: TrainingItemState;
    };

export class TrainingController {
  constructor(
    private readonly player: Player,
    private readonly wallet: Wallet,
  ) {}

  getItems() {
    if (!this.isInfiniteTrainingUnlocked()) {
      return trainingConfig.items;
    }

    return [...trainingConfig.items].sort((firstItem, secondItem) => {
      return (
        this.getInfinityTowerSortOrder(firstItem) -
        this.getInfinityTowerSortOrder(secondItem)
      );
    });
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

    const isUnlocked = this.isItemUnlocked(item);
    const isTowerUpgrade = this.isTowerUpgradeActive(item);
    const isInfinite = this.canExceedMaxLevel(item);
    const level = this.getSafeTrainingLevel(item);
    const towerLevel = Math.max(0, level - item.maxLevel);
    const displayLevel = isTowerUpgrade ? towerLevel : level;
    const isMaxLevel = !isInfinite && level >= item.maxLevel;
    const nextPrice =
      !isUnlocked || isMaxLevel
        ? undefined
        : isTowerUpgrade
          ? item.infinityTowerUpgrade?.price
          : (item.priceByLevel[level] ?? trainingConfig.infinityTowerLevelPrice);
    const valuePerLevel =
      isTowerUpgrade && item.infinityTowerUpgrade
        ? item.infinityTowerUpgrade.valuePerLevel
        : item.valuePerLevel;

    return {
      config: item,
      titleKey:
        isTowerUpgrade && item.infinityTowerUpgrade
          ? item.infinityTowerUpgrade.titleKey
          : item.titleKey,
      descriptionKey:
        isTowerUpgrade && item.infinityTowerUpgrade
          ? item.infinityTowerUpgrade.descriptionKey
          : item.descriptionKey,
      level,
      displayLevel,
      maxLevel: item.maxLevel,
      isInfinite,
      isUnlocked,
      lockedReasonKey: isUnlocked
        ? undefined
        : "training.locked.infinityTower",
      nextPrice,
      isMaxLevel,
      canBuy:
        isUnlocked && nextPrice !== undefined && this.wallet.canWithdraw(nextPrice),
      valuePerLevel,
      totalBonus: this.getTotalBonus(item, level),
    };
  }

  completeBaseTrainingForInfinityTower() {
    if (!this.isInfiniteTrainingUnlocked()) {
      return false;
    }

    let hasChanged = false;

    this.getItems().forEach((item) => {
      if (item.requiresInfinityTower) {
        return;
      }

      const currentLevel = this.player.profile.getTrainingLevel(item.id);

      if (currentLevel >= item.maxLevel) {
        return;
      }

      this.player.profile.setTrainingLevel(item.id, item.maxLevel);
      hasChanged = true;
    });

    if (hasChanged) {
      this.applyTrainingBonuses();
    }

    return hasChanged;
  }

  shouldShowInfinityTowerTrainingAnnouncement() {
    if (!this.isInfiniteTrainingUnlocked()) {
      return false;
    }

    const heroPower = getTrainingItemConfig("punch-power");

    if (!heroPower) {
      return false;
    }

    return this.getTowerUpgradeLevel(heroPower) <= 0;
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

    if (!state.isUnlocked) {
      return {
        success: false,
        reason: "locked",
        state,
      };
    }

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
    this.player.setPermanentStatBonuses(this.getTrainingBonuses(), "training");
  }

  getTrainingBonuses(): PlayerPermanentStatBonuses {
    return this.getItems().reduce<PlayerPermanentStatBonuses>((bonuses, item) => {
      if (!this.isItemUnlocked(item)) {
        return bonuses;
      }

      const level = this.getSafeTrainingLevel(item);
      const value = this.getTotalBonus(item, level);

      if (value === 0) {
        return bonuses;
      }

      bonuses[item.stat] = (bonuses[item.stat] ?? 0) + value;

      return bonuses;
    }, {});
  }

  private getSafeTrainingLevel(item: TrainingItemConfig) {
    const level = Math.max(0, this.player.profile.getTrainingLevel(item.id));

    if (!this.isItemUnlocked(item)) {
      return 0;
    }

    if (this.canExceedMaxLevel(item)) {
      return level;
    }

    return Math.min(item.maxLevel, level);
  }

  private isItemUnlocked(item: TrainingItemConfig) {
    return !item.requiresInfinityTower || this.isInfiniteTrainingUnlocked();
  }

  private canExceedMaxLevel(item: TrainingItemConfig) {
    return (
      this.isInfiniteTrainingUnlocked() &&
      item.canExceedMaxLevelInInfinityTower !== false
    );
  }

  private isInfiniteTrainingUnlocked() {
    return this.player.profile.isInfinityTowerAvailable();
  }

  private getInfinityTowerSortOrder(item: TrainingItemConfig) {
    if (item.infinityTowerUpgrade) {
      return 0;
    }

    if (item.id === "critical-hit") {
      return 1;
    }

    return 2;
  }

  private isTowerUpgradeActive(item: TrainingItemConfig) {
    return (
      this.isInfiniteTrainingUnlocked() &&
      item.infinityTowerUpgrade !== undefined
    );
  }

  private getTowerUpgradeLevel(item: TrainingItemConfig) {
    return Math.max(0, this.getSafeTrainingLevel(item) - item.maxLevel);
  }

  private getTotalBonus(item: TrainingItemConfig, level: number) {
    if (!this.isTowerUpgradeActive(item) || !item.infinityTowerUpgrade) {
      return level * item.valuePerLevel;
    }

    const baseLevel = Math.min(level, item.maxLevel);
    const towerLevel = Math.max(0, level - item.maxLevel);

    return (
      baseLevel * item.valuePerLevel +
      towerLevel * item.infinityTowerUpgrade.valuePerLevel
    );
  }
}
