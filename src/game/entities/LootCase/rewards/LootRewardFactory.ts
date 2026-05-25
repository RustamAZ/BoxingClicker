import type { Scene } from "phaser";
import { AttackPotionLootReward } from "./AttackPotionLootReward";
import { EmeraldLootReward } from "./EmeraldLootReward";
import { HealthPotionLootReward } from "./HealthPotionLootReward";
import { PlaceholderLootReward } from "./PlaceholderLootReward";
import { SpeedPotionLootReward } from "./SpeedPotionLootReward";
import { StaminaPotionLootReward } from "./StaminaPotionLootReward";
import type {
  LootReward,
  LootRewardId,
  LootRewardRarity,
} from "./LootReward";

type LootRewardFactoryFn = (rarity: LootRewardRarity) => LootReward;

export class LootRewardFactory {
  private static readonly placeholderRewardId = "placeholder-reward";
  private static readonly rarities: LootRewardRarity[] = ["s", "m", "l"];
  private static readonly factories = new Map<
    LootRewardId,
    LootRewardFactoryFn
  >([
    ["emerald", (rarity) => new EmeraldLootReward(rarity)],
    ["health-potion", (rarity) => new HealthPotionLootReward(rarity)],
    ["stamina-potion", (rarity) => new StaminaPotionLootReward(rarity)],
    ["speed-potion", (rarity) => new SpeedPotionLootReward(rarity)],
    ["attack-potion", (rarity) => new AttackPotionLootReward(rarity)],
  ]);

  static preload(scene: Scene) {
    const preloadedAssetKeys = new Set<string>();
    const rewardsToPreload = [
      LootRewardFactory.create(
        LootRewardFactory.placeholderRewardId,
        "s",
      ),
      ...Array.from(LootRewardFactory.factories.values()).flatMap((create) =>
        LootRewardFactory.rarities.map((rarity) => create(rarity)),
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

  static getVisualRewardIconKeys() {
    return Array.from(
      new Set(
        Array.from(LootRewardFactory.factories.values())
          .flatMap((create) =>
            LootRewardFactory.rarities.map((rarity) => create(rarity)),
          )
          .map((reward) => reward.getIconTextureKey()),
      ),
    );
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
