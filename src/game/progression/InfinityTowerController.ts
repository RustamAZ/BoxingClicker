import {
  infinityTowerDifficultyConfig,
  infinityTowerFloorRequirementsConfig,
  type InfinityTowerEnemyStats,
} from "../configs/infinityTower";
import {
  getInfinityTowerEnemyPackById,
  initialInfinityTowerEnemyPackId,
  infinityTowerEnemyPacks,
  type InfinityTowerEnemyPackConfig,
  type InfinityTowerEnemyVariantConfig,
} from "../configs/infinityTowerEnemies";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import { randomItem } from "../utils/randomItem";
import { InfinityTowerRewardController } from "./InfinityTowerRewardController";

type RewardUnlockedCallback = (floor: number) => void;

export class InfinityTowerController {
  private isActive = false;
  private currentFloor = 1;
  private killsOnFloor = 0;
  private currentEnemyPack: InfinityTowerEnemyPackConfig =
    infinityTowerEnemyPacks[0];
  private readonly rewardUnlockedCallbacks: RewardUnlockedCallback[] = [];
  private readonly rewardController: InfinityTowerRewardController;

  constructor(private readonly profile: PlayerProfile) {
    this.rewardController = new InfinityTowerRewardController(profile);
  }

  startRun() {
    this.isActive = true;
    this.currentFloor = 1;
    this.killsOnFloor = 0;
    this.currentEnemyPack =
      getInfinityTowerEnemyPackById(initialInfinityTowerEnemyPackId) ??
      infinityTowerEnemyPacks[0];
    this.saveMaxFloor();
  }

  stopRun() {
    this.isActive = false;
    this.currentFloor = 1;
    this.killsOnFloor = 0;
  }

  isRunActive() {
    return this.isActive;
  }

  getCurrentFloor() {
    return this.currentFloor;
  }

  getKillsOnFloor() {
    return this.killsOnFloor;
  }

  getEnemiesRequiredForCurrentFloor() {
    return InfinityTowerController.getEnemiesRequiredForFloor(
      this.currentFloor,
    );
  }

  registerEnemyDefeated() {
    if (!this.isActive) {
      return;
    }

    this.killsOnFloor += 1;

    if (this.killsOnFloor < this.getEnemiesRequiredForCurrentFloor()) {
      return;
    }

    this.currentFloor += 1;
    this.killsOnFloor = 0;
    this.currentEnemyPack = this.rollEnemyPack();
    this.saveMaxFloor();
    this.emitRewardUnlockedIfNeeded();
  }

  getCurrentEnemyStats(): InfinityTowerEnemyStats {
    return InfinityTowerController.getEnemyStatsForFloor(this.currentFloor);
  }

  getCurrentEnemyVariant(): InfinityTowerEnemyVariantConfig {
    return randomItem(this.currentEnemyPack.variants);
  }

  getCurrentEnemyPack() {
    return this.currentEnemyPack;
  }

  getRemainingEnemyPacks() {
    return infinityTowerEnemyPacks.filter(
      (pack) => pack.id !== this.currentEnemyPack.id,
    );
  }

  onRewardUnlocked(callback: RewardUnlockedCallback) {
    this.rewardUnlockedCallbacks.push(callback);

    return () => {
      const index = this.rewardUnlockedCallbacks.indexOf(callback);

      if (index >= 0) {
        this.rewardUnlockedCallbacks.splice(index, 1);
      }
    };
  }

  private saveMaxFloor() {
    if (this.currentFloor > this.profile.getInfinityTowerCurrentLevel()) {
      this.profile.setInfinityTowerCurrentLevel(this.currentFloor);
    }
  }

  private rollEnemyPack() {
    return randomItem(infinityTowerEnemyPacks);
  }

  private emitRewardUnlockedIfNeeded() {
    if (!this.rewardController.hasClaimableRewardForFloor(this.currentFloor)) {
      return;
    }

    this.rewardUnlockedCallbacks.forEach((callback) => {
      callback(this.currentFloor);
    });
  }

  private static getEnemiesRequiredForFloor(floor: number) {
    const safeFloor = Math.max(1, Math.floor(floor));
    let result = infinityTowerFloorRequirementsConfig[0]?.enemies ?? 3;

    infinityTowerFloorRequirementsConfig.forEach((requirement) => {
      if (safeFloor >= requirement.fromFloor) {
        result = requirement.enemies;
      }
    });

    return result;
  }

  private static getEnemyStatsForFloor(floor: number): InfinityTowerEnemyStats {
    const safeFloor = Math.max(1, Math.floor(floor));
    const floorIndex = safeFloor - 1;
    const { base, scalingPerFloor, limits } = infinityTowerDifficultyConfig;

    return {
      maxHealth: Math.round(
        base.maxHealth * (1 + scalingPerFloor.maxHealth * floorIndex),
      ),
      damagePerHit: Math.round(
        base.damagePerHit * (1 + scalingPerFloor.damagePerHit * floorIndex),
      ),
      attackCooldownSeconds: Math.max(
        limits.minAttackCooldownSeconds,
        Number(
          (
            base.attackCooldownSeconds +
            scalingPerFloor.attackCooldownSeconds * floorIndex
          ).toFixed(2),
        ),
      ),
      initialAttackDelaySeconds: base.initialAttackDelaySeconds,
      xpReward: base.xpReward,
      diamondsReward: base.diamondsReward,
      coinsReward: base.coinsReward,
      emeraldDropChance: base.emeraldDropChance,
    };
  }
}
