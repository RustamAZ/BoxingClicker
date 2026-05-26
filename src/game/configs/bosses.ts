export type BossEffectConfig =
  | Record<string, never>
  | {
      type: "explosion";
      explosion_damage: number;
    }
  | {
      type: "attack_speed_slow";
      slow_value: number;
    };

export type BossConfig = {
  health: number;
  damage: number;
  attack_speed: number;
  xp_reward: number;
  buff_container_reward: number;
  lootbox_container_reward: number;
  emerald_drop_chance: number;
  effect?: BossEffectConfig;
};

export const firstBossConfig: BossConfig = {
  health: 280,
  damage: 14,
  attack_speed: 0.55,
  xp_reward: 1,
  buff_container_reward: 32,
  lootbox_container_reward: 32,
  emerald_drop_chance: 1.0,
  effect: {},
};

export const secondBossConfig: BossConfig = {
  health: 520,
  damage: 0,
  attack_speed: 0,
  xp_reward: 1,
  buff_container_reward: 40,
  lootbox_container_reward: 40,
  emerald_drop_chance: 1.0,
  effect: {
    type: "explosion",
    explosion_damage: 170,
  },
};

export const thirdBossConfig: BossConfig = {
  health: 820,
  damage: 20,
  attack_speed: 1.5,
  xp_reward: 1,
  buff_container_reward: 48,
  lootbox_container_reward: 48,
  emerald_drop_chance: 1.0,
  effect: {
    type: "attack_speed_slow",
    slow_value: -0.25,
  },
};

export const fourBossConfig: BossConfig = {
  health: 1050,
  damage: 34,
  attack_speed: 1.35,
  xp_reward: 1,
  buff_container_reward: 56,
  lootbox_container_reward: 56,
  emerald_drop_chance: 1.0,
};

export const fiveBossConfig: BossConfig = {
  health: 2200,
  damage: 75,
  attack_speed: 0.45,
  xp_reward: 1,
  buff_container_reward: 80,
  lootbox_container_reward: 80,
  emerald_drop_chance: 1.0,
};
