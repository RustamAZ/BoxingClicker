export type LootBoxRarity = "common" | "rare" | "epic";

export type LootBoxRewardId =
  | "health_potion"
  | "stamina_potion"
  | "attack_speed_potion"
  | "attack_power_potion"
  | "emerald";

export type LootBoxRewardType =
  | "instant_restore_health"
  | "instant_restore_stamina"
  | "temporary_attack_speed_bonus"
  | "temporary_attack_bonus"
  | "currency";

type LootBoxRewardConfig = {
  nameKey: string;
  descriptionKey: string;
  type: LootBoxRewardType;
  values: Record<LootBoxRarity, number>;
};

type LootBoxConfig = {
  lootbox_rarity_chance: Record<LootBoxRarity, number>;
  lootbox_reward_chance: Record<LootBoxRewardId, number>;
  lootbox_rewards: Record<LootBoxRewardId, LootBoxRewardConfig>;
};

export const lootBoxConfig: LootBoxConfig = {
  lootbox_rarity_chance: {
    common: 0.7,
    rare: 0.25,
    epic: 0.05,
  },
  lootbox_reward_chance: {
    health_potion: 0.3,
    stamina_potion: 0.25,
    attack_speed_potion: 0.14,
    attack_power_potion: 0.15,
    emerald: 0.16,
  },
  lootbox_rewards: {
    health_potion: {
      nameKey: "loot.healthPotion.name",
      descriptionKey: "loot.healthPotion.description",
      type: "instant_restore_health",
      values: {
        common: 35,
        rare: 70,
        epic: 120,
      },
    },
    stamina_potion: {
      nameKey: "loot.staminaPotion.name",
      descriptionKey: "loot.staminaPotion.description",
      type: "instant_restore_stamina",
      values: {
        common: 80,
        rare: 150,
        epic: 240,
      },
    },
    attack_speed_potion: {
      nameKey: "loot.attackSpeedPotion.name",
      descriptionKey: "loot.attackSpeedPotion.description",
      type: "temporary_attack_speed_bonus",
      values: {
        common: 1,
        rare: 1.8,
        epic: 3,
      },
    },
    attack_power_potion: {
      nameKey: "loot.attackPowerPotion.name",
      descriptionKey: "loot.attackPowerPotion.description",
      type: "temporary_attack_bonus",
      values: {
        common: 5,
        rare: 10,
        epic: 18,
      },
    },
    emerald: {
      nameKey: "loot.emerald.name",
      descriptionKey: "loot.emerald.description",
      type: "currency",
      values: {
        common: 3,
        rare: 7,
        epic: 15,
      },
    },
  },
};

export const lootBoxRarityToRewardRarity = {
  common: "s",
  rare: "m",
  epic: "l",
} as const;

export const rewardIdToLootBoxRewardId = {
  "health-potion": "health_potion",
  "stamina-potion": "stamina_potion",
  "speed-potion": "attack_speed_potion",
  "attack-potion": "attack_power_potion",
  emerald: "emerald",
} as const;

export function getLootBoxRewardConfig(rewardId: LootBoxRewardId) {
  return lootBoxConfig.lootbox_rewards[rewardId];
}
