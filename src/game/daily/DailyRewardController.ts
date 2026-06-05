import {
  dailyRewardsConfig,
  type DailyRewardConfig,
} from "../configs/dailyRewards";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";

export type DailyRewardClaimResult = {
  reward: DailyRewardConfig;
  index: number;
};

export class DailyRewardController {
  constructor(private readonly profile: PlayerProfile) {}

  getRewards() {
    return dailyRewardsConfig;
  }

  getTodayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  getNextRewardIndex() {
    const claimedRewardIndexes = new Set(
      this.profile.getDailyRewardClaimedRewards(),
    );

    return dailyRewardsConfig.findIndex((_, index) => {
      return !claimedRewardIndexes.has(index);
    });
  }

  hasClaimedReward(index: number) {
    return this.profile.hasClaimedDailyReward(index);
  }

  canClaimToday(today = this.getTodayKey()) {
    return (
      this.getNextRewardIndex() >= 0 &&
      this.profile.getDailyRewardLastClaimDate() !== today
    );
  }

  claimToday(today = this.getTodayKey()): DailyRewardClaimResult | undefined {
    if (!this.canClaimToday(today)) {
      return undefined;
    }

    const index = this.getNextRewardIndex();
    const reward = dailyRewardsConfig[index];

    if (!reward) {
      return undefined;
    }

    this.applyReward(reward);

    this.profile.claimDailyReward(index, today);

    return {
      reward,
      index,
    };
  }

  private applyReward(reward: DailyRewardConfig) {
    if (reward.type === "emerald") {
      this.profile.addEmeralds(reward.amount);
      return;
    }

    this.profile.discoverItem(reward.itemId);
    this.profile.purchaseItem(reward.itemId);
    this.profile.equipItem(reward.itemId);
  }
}
