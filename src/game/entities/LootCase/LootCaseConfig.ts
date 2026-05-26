import {
  lootBoxConfig,
  lootBoxRarityToRewardRarity,
  type LootBoxRarity,
  type LootBoxRewardId,
} from "../../configs/lootBox";
import type {
  LootRewardId,
  LootRewardRarity,
} from "./rewards/LootReward";

export type LootCaseDropConfig = {
  rewardId: LootRewardId;
  rarity: LootRewardRarity;
};

const lootBoxRewardIdToRewardId: Record<LootBoxRewardId, LootRewardId> = {
  health_potion: "health-potion",
  stamina_potion: "stamina-potion",
  attack_speed_potion: "speed-potion",
  attack_power_potion: "attack-potion",
  emerald: "emerald",
};

export function rollLootCaseDrop(random = Math.random): LootCaseDropConfig {
  const rewardId = rollWeighted(lootBoxConfig.lootbox_reward_chance, random);
  const rarity = rollWeighted(lootBoxConfig.lootbox_rarity_chance, random);

  return {
    rewardId: lootBoxRewardIdToRewardId[rewardId],
    rarity: lootBoxRarityToRewardRarity[rarity],
  };
}

function rollWeighted<T extends string>(
  chances: Record<T, number>,
  random: () => number,
) {
  const entries = Object.entries(chances) as Array<[T, number]>;
  const availableEntries = entries.filter(([, chance]) => chance > 0);
  const totalChance = availableEntries.reduce(
    (sum, [, chance]) => sum + chance,
    0,
  );

  if (availableEntries.length === 0 || totalChance <= 0) {
    return entries[0][0];
  }

  let randomChance = random() * totalChance;

  for (const [id, chance] of availableEntries) {
    randomChance -= chance;

    if (randomChance <= 0) {
      return id;
    }
  }

  return availableEntries[availableEntries.length - 1][0];
}
