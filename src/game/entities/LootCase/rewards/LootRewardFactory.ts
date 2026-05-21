import type { Scene } from "phaser";
import { EmeraldLootReward } from "./EmeraldLootReward";
import { PlaceholderLootReward } from "./PlaceholderLootReward";
import type {
  LootReward,
  LootRewardId,
  LootRewardRarity,
} from "./LootReward";

type LootRewardFactoryFn = (rarity: LootRewardRarity) => LootReward;

export class LootRewardFactory {
  private static readonly placeholderRewardId = "placeholder-reward";
  private static readonly factories = new Map<
    LootRewardId,
    LootRewardFactoryFn
  >([["emerald", (rarity) => new EmeraldLootReward(rarity)]]);

  static preload(scene: Scene) {
    const preloadedAssetKeys = new Set<string>();
    const rewardsToPreload = [
      LootRewardFactory.create(
        LootRewardFactory.placeholderRewardId,
        "wooden",
      ),
      ...Array.from(LootRewardFactory.factories.values()).map((create) =>
        create("wooden"),
      ),
    ];

    rewardsToPreload.forEach((reward) => {
      if (!preloadedAssetKeys.has(reward.iconTextureKey)) {
        scene.load.image(reward.iconTextureKey, reward.iconTexturePath);
        preloadedAssetKeys.add(reward.iconTextureKey);
      }

      if (!preloadedAssetKeys.has(reward.applySoundKey)) {
        scene.load.audio(reward.applySoundKey, reward.applySoundPath);
        preloadedAssetKeys.add(reward.applySoundKey);
      }
    });
  }

  static register(
    rewardId: LootRewardId,
    create: LootRewardFactoryFn,
  ) {
    LootRewardFactory.factories.set(rewardId, create);
  }

  static create(
    rewardId: LootRewardId,
    rarity: LootRewardRarity,
  ) {
    const create = LootRewardFactory.factories.get(rewardId);

    return create?.(rarity) ?? new PlaceholderLootReward(rewardId, rarity);
  }
}
