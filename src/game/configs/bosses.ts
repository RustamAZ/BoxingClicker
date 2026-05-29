export type BossEffectConfig =
  | Record<string, never>
  | {
      type: "explosion";
      explosion_damage: number;
    }
  | {
      type: "attack_speed_slow";
      max_attack_speed?: number;
    };

export type BossConfig = {
  health: number;
  damage: number;
  attack_speed: number;
  initial_attack_delay: number;
  xp_reward: number;
  buff_container_reward: number;
  lootbox_container_reward: number;
  emerald_drop_chance: number;
  effect?: BossEffectConfig;
};

export const firstBossConfig: BossConfig = {
  health: 520,
  damage: 16,
  attack_speed: 1.5,
  initial_attack_delay: 0.55,
  xp_reward: 1,
  buff_container_reward: 54,
  lootbox_container_reward: 54,
  emerald_drop_chance: 1.0,
  effect: {},
};

export const secondBossConfig: BossConfig = {
  health: 700,
  damage: 0,
  attack_speed: 0,
  initial_attack_delay: 0,
  xp_reward: 1,
  buff_container_reward: 40,
  lootbox_container_reward: 40,
  emerald_drop_chance: 1.0,
  effect: {
    type: "explosion",
    explosion_damage: 120,
  },
};

export const thirdBossConfig: BossConfig = {
  health: 1650,
  damage: 30,
  attack_speed: 1.1,
  initial_attack_delay: 0.55,
  xp_reward: 1,
  buff_container_reward: 64,
  lootbox_container_reward: 64,
  emerald_drop_chance: 1.0,
  effect: {
    type: "attack_speed_slow",
    max_attack_speed: 3,
  },
};

export const fourthBossConfig: BossConfig = {
  health: 1750,
  damage: 36,
  attack_speed: 0.9,
  initial_attack_delay: 0.5,
  xp_reward: 1,
  buff_container_reward: 56,
  lootbox_container_reward: 56,
  emerald_drop_chance: 1.0,
};

export const fifthBossConfig: BossConfig = {
  health: 5000,
  damage: 150,
  attack_speed: 1.6,
  initial_attack_delay: 0.75,
  xp_reward: 1,
  buff_container_reward: 80,
  lootbox_container_reward: 80,
  emerald_drop_chance: 1.0,
};
