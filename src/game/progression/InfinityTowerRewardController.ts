import {
  infinityTowerRewardsConfig,
  type InfinityTowerRewardConfig,
} from "../configs/infinityTower";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";

export type InfinityTowerRewardState = "locked" | "claimable" | "claimed";

export type InfinityTowerRewardView = {
  reward: InfinityTowerRewardConfig;
  state: InfinityTowerRewardState;
};

export type InfinityTowerRewardClaimResult = {
  reward: InfinityTowerRewardConfig;
  glovesItemId?: string;
};

export type InfinityTowerRewardFeedOptions = {
  futureLockedCount?: number;
  pastClaimedCount?: number;
  excludeRewardIds?: string[];
};

type InfinityTowerRewardLevelGroup = {
  level: number;
  rewards: InfinityTowerRewardView[];
};

export class InfinityTowerRewardController {
  constructor(private readonly profile: PlayerProfile) {}

  static getRewards() {
    return [...infinityTowerRewardsConfig].sort((left, right) => {
      if (left.level !== right.level) {
        return left.level - right.level;
      }

      return left.id.localeCompare(right.id);
    });
  }

  getVisibleRewards(limit: number): InfinityTowerRewardView[] {
    const safeLimit = Math.max(1, Math.floor(limit));
    const rewards = InfinityTowerRewardController.getRewards();
    const anchorIndex = this.getVisibleRewardsAnchorIndex(rewards);
    const pageStart = Math.floor(anchorIndex / safeLimit) * safeLimit;

    return rewards
      .slice(pageStart, pageStart + safeLimit)
      .map((reward) => this.getRewardView(reward));
  }

  getRewardView(reward: InfinityTowerRewardConfig): InfinityTowerRewardView {
    return {
      reward,
      state: this.getRewardState(reward),
    };
  }

  getRewardFeedViews(options: InfinityTowerRewardFeedOptions = {}) {
    const futureLockedCount = Math.max(
      0,
      Math.floor(options.futureLockedCount ?? 4),
    );
    const pastClaimedCount = Math.max(
      0,
      Math.floor(options.pastClaimedCount ?? 4),
    );
    const excludedRewardIds = new Set(options.excludeRewardIds ?? []);
    const rewards = InfinityTowerRewardController.getRewards().filter(
      (reward) => !excludedRewardIds.has(reward.id),
    );
    const rewardViews = rewards.map((reward) => this.getRewardView(reward));
    const rewardGroups = this.groupRewardViewsByLevel(rewardViews);
    const claimableGroups = rewardGroups.filter((group) =>
      group.rewards.some((rewardView) => rewardView.state === "claimable"),
    );
    const claimedGroups = rewardGroups.filter((group) =>
      group.rewards.every((rewardView) => rewardView.state === "claimed"),
    );
    const lockedGroups = rewardGroups.filter((group) =>
      group.rewards.every((rewardView) => rewardView.state === "locked"),
    );

    if (claimableGroups.length === 0 && claimedGroups.length === 0) {
      return InfinityTowerRewardController.flattenRewardGroups(
        InfinityTowerRewardController.takeGroupsByRewardCount(
          lockedGroups,
          futureLockedCount + pastClaimedCount,
        ),
      );
    }

    if (claimableGroups.length > 0) {
      const lowestClaimableLevel = claimableGroups[0].level;
      const highestClaimableLevel =
        claimableGroups[claimableGroups.length - 1].level;
      const pastClaimedGroups = InfinityTowerRewardController.takeLastGroupsByRewardCount(
        claimedGroups.filter((group) => group.level < lowestClaimableLevel),
        pastClaimedCount,
      );
      const futureLockedGroups = InfinityTowerRewardController.takeGroupsByRewardCount(
        lockedGroups.filter((group) => group.level > highestClaimableLevel),
        futureLockedCount,
      );

      return InfinityTowerRewardController.flattenRewardGroups([
        ...pastClaimedGroups,
        ...claimableGroups,
        ...futureLockedGroups,
      ]);
    }

    const pastClaimedGroups = InfinityTowerRewardController.takeLastGroupsByRewardCount(
      claimedGroups,
      pastClaimedCount,
    );
    const highestClaimedLevel =
      pastClaimedGroups[pastClaimedGroups.length - 1]?.level ?? 0;
    const futureLockedGroups = InfinityTowerRewardController.takeGroupsByRewardCount(
      lockedGroups.filter((group) => group.level > highestClaimedLevel),
      futureLockedCount,
    );

    return InfinityTowerRewardController.flattenRewardGroups([
      ...pastClaimedGroups,
      ...futureLockedGroups,
    ]);
  }

  hasClaimableRewardForFloor(floor: number) {
    const safeFloor = Math.max(0, Math.floor(floor));

    return InfinityTowerRewardController.getRewards().some((reward) => {
      return (
        reward.level === safeFloor &&
        this.getRewardState(reward) === "claimable"
      );
    });
  }

  claimReward(rewardId: string): InfinityTowerRewardClaimResult | undefined {
    const reward = InfinityTowerRewardController.getRewards().find(
      (configuredReward) => configuredReward.id === rewardId,
    );

    if (!reward || this.getRewardState(reward) !== "claimable") {
      return undefined;
    }

    if (reward.type === "gloves") {
      return {
        reward,
        glovesItemId: reward.itemId,
      };
    }

    if (reward.type === "rewive") {
      this.profile.addRewiveCount(reward.amount);
    } else if (reward.type === "consumable") {
      this.profile.addTowerConsumable(reward.consumableId, reward.amount);
    } else {
      this.profile.addEmeralds(reward.amount);
    }

    this.profile.claimInfinityTowerReward(reward.id);

    return { reward };
  }

  private getVisibleRewardsAnchorIndex(
    rewards: readonly InfinityTowerRewardConfig[],
  ) {
    const firstClaimableIndex = rewards.findIndex((reward) => {
      return this.getRewardState(reward) === "claimable";
    });

    if (firstClaimableIndex >= 0) {
      return firstClaimableIndex;
    }

    const towerLevel = this.profile.getInfinityTowerCurrentLevel();
    const firstFutureIndex = rewards.findIndex((reward) => {
      return reward.level > towerLevel;
    });

    if (firstFutureIndex >= 0) {
      return firstFutureIndex;
    }

    return Math.max(0, rewards.length - 1);
  }

  private groupRewardViewsByLevel(
    rewardViews: InfinityTowerRewardView[],
  ): InfinityTowerRewardLevelGroup[] {
    const groupsByLevel = new Map<number, InfinityTowerRewardView[]>();

    rewardViews.forEach((rewardView) => {
      const levelRewards = groupsByLevel.get(rewardView.reward.level) ?? [];

      levelRewards.push(rewardView);
      groupsByLevel.set(rewardView.reward.level, levelRewards);
    });

    return [...groupsByLevel.entries()]
      .map(([level, rewards]) => ({ level, rewards }))
      .sort((left, right) => left.level - right.level);
  }

  private static takeGroupsByRewardCount(
    groups: InfinityTowerRewardLevelGroup[],
    rewardCount: number,
  ) {
    const selectedGroups: InfinityTowerRewardLevelGroup[] = [];
    let selectedRewardCount = 0;

    for (const group of groups) {
      if (selectedRewardCount >= rewardCount) {
        break;
      }

      selectedGroups.push(group);
      selectedRewardCount += group.rewards.length;
    }

    return selectedGroups;
  }

  private static takeLastGroupsByRewardCount(
    groups: InfinityTowerRewardLevelGroup[],
    rewardCount: number,
  ) {
    const selectedGroups: InfinityTowerRewardLevelGroup[] = [];
    let selectedRewardCount = 0;

    for (let index = groups.length - 1; index >= 0; index -= 1) {
      if (selectedRewardCount >= rewardCount) {
        break;
      }

      const group = groups[index];

      selectedGroups.unshift(group);
      selectedRewardCount += group.rewards.length;
    }

    return selectedGroups;
  }

  private static flattenRewardGroups(groups: InfinityTowerRewardLevelGroup[]) {
    return groups.flatMap((group) => group.rewards);
  }

  private getRewardState(
    reward: InfinityTowerRewardConfig,
  ): InfinityTowerRewardState {
    if (this.isRewardClaimed(reward)) {
      return "claimed";
    }

    return this.profile.getInfinityTowerCurrentLevel() >= reward.level
      ? "claimable"
      : "locked";
  }

  private isRewardClaimed(reward: InfinityTowerRewardConfig) {
    if (reward.type === "gloves") {
      return this.profile.hasPurchasedItem(reward.itemId);
    }

    return this.profile.hasClaimedInfinityTowerReward(reward.id);
  }
}
