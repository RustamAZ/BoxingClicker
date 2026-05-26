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
        common: 2,
        rare: 4,
        epic: 7,
        legendary: 11,
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
        common: 40,
        rare: 80,
        epic: 130,
        legendary: 200,
      },
    },
    stamina_cost_per_hit: {
      values: {
        common: -0.15,
        rare: -0.3,
        epic: -0.45,
        legendary: -0.65,
      },
      minimum_value: 0.5,
    },
    attack_speed: {
      values: {
        common: 0.45,
        rare: 0.9,
        epic: 1.5,
        legendary: 2.4,
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
