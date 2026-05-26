export type BuffRarity = "common" | "rare" | "epic" | "legendary";

export type BuffConfigId =
  | "attack"
  | "health"
  | "stamina"
  | "stamina_cost_per_hit"
  | "attack_speed";

type BuffValueConfig = {
  values: Record<BuffRarity, number>;
  minimum_value?: number;
};

type BuffConfig = {
  buff_rarity_chance: Record<BuffRarity, number>;
  buffs: Record<BuffConfigId, BuffValueConfig>;
};

export const buffConfig: BuffConfig = {
  buff_rarity_chance: {
    common: 0.6,
    rare: 0.27,
    epic: 0.1,
    legendary: 0.03,
  },
  buffs: {
    attack: {
      values: {
        common: 3,
        rare: 6,
        epic: 10,
        legendary: 16,
      },
    },
    health: {
      values: {
        common: 20,
        rare: 40,
        epic: 70,
        legendary: 110,
      },
    },
    stamina: {
      values: {
        common: 20,
        rare: 40,
        epic: 65,
        legendary: 100,
      },
    },
    stamina_cost_per_hit: {
      values: {
        common: -0.5,
        rare: -1,
        epic: -1.5,
        legendary: -2,
      },
      minimum_value: 2,
    },
    attack_speed: {
      values: {
        common: 0.12,
        rare: 0.25,
        epic: 0.4,
        legendary: 0.65,
      },
    },
  },
};

export function getBuffValue(buffId: BuffConfigId, rarity: BuffRarity) {
  return buffConfig.buffs[buffId].values[rarity];
}

export function getBuffMinimumValue(buffId: BuffConfigId) {
  return buffConfig.buffs[buffId].minimum_value;
}
