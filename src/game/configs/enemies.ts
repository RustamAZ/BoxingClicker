import type { EnemyStatRange } from "../entities/Enemy/types";

export type EnemyStatRangeConfig = [number, number];

export type EnemyConfig = {
  health_range: EnemyStatRangeConfig;
  damage_range: EnemyStatRangeConfig;
  attack_speed_range: EnemyStatRangeConfig;
  xp_reward: number;
  buff_container_reward: number;
  lootbox_container_reward: number;
  emerald_drop_chance: number;
};

export function toEnemyStatRange(range: EnemyStatRangeConfig): EnemyStatRange {
  return {
    min: range[0],
    max: range[1],
  };
}

export const firstEnemyConfig: EnemyConfig = {
  health_range: [18, 35],
  damage_range: [4, 7],
  attack_speed_range: [1, 1.55],
  xp_reward: 1,
  buff_container_reward: 8,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.08,
};

export const secondEnemyConfig: EnemyConfig = {
  health_range: [35, 65],
  damage_range: [7, 12],
  attack_speed_range: [0.45, 0.7],
  xp_reward: 1,
  buff_container_reward: 8,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.1,
};

export const thirdEnemyConfig: EnemyConfig = {
  health_range: [65, 105],
  damage_range: [11, 18],
  attack_speed_range: [0.6, 0.85],
  xp_reward: 1,
  buff_container_reward: 12,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.13,
};

export const fourEnemyConfig: EnemyConfig = {
  health_range: [105, 155],
  damage_range: [18, 28],
  attack_speed_range: [0.75, 1.05],
  xp_reward: 1,
  buff_container_reward: 12,
  lootbox_container_reward: 12,
  emerald_drop_chance: 0.16,
};

export const fiveEnemyConfig: EnemyConfig = {
  health_range: [155, 230],
  damage_range: [28, 42],
  attack_speed_range: [0.85, 1.2],
  xp_reward: 1,
  buff_container_reward: 16,
  lootbox_container_reward: 12,
  emerald_drop_chance: 0.2,
};
