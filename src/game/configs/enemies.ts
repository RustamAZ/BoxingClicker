import type { EnemyStatRange } from "../entities/Enemy/types";

export type EnemyStatRangeConfig = [number, number];

export type EnemyConfig = {
  health_range: EnemyStatRangeConfig;
  damage_range: EnemyStatRangeConfig;
  attack_speed_range: EnemyStatRangeConfig;
  initial_attack_delay_range: EnemyStatRangeConfig;
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
  health_range: [55, 85],
  damage_range: [4, 7],
  attack_speed_range: [0.8, 1.2],
  initial_attack_delay_range: [0.2, 0.35],
  xp_reward: 1,
  buff_container_reward: 8,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.08,
};

export const secondEnemyConfig: EnemyConfig = {
  health_range: [110, 160],
  damage_range: [7, 12],
  attack_speed_range: [1.2, 1.5],
  initial_attack_delay_range: [0.25, 0.4],
  xp_reward: 1,
  buff_container_reward: 8,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.1,
};

export const thirdEnemyConfig: EnemyConfig = {
  health_range: [185, 260],
  damage_range: [12, 19],
  attack_speed_range: [1.05, 1.35],
  initial_attack_delay_range: [0.25, 0.45],
  xp_reward: 1,
  buff_container_reward: 12,
  lootbox_container_reward: 8,
  emerald_drop_chance: 0.13,
};

export const fourthEnemyConfig: EnemyConfig = {
  health_range: [290, 390],
  damage_range: [19, 30],
  attack_speed_range: [0.95, 1.2],
  initial_attack_delay_range: [0.3, 0.5],
  xp_reward: 1,
  buff_container_reward: 12,
  lootbox_container_reward: 12,
  emerald_drop_chance: 0.16,
};

export const fifthEnemyConfig: EnemyConfig = {
  health_range: [420, 560],
  damage_range: [30, 46],
  attack_speed_range: [0.9, 1.1],
  initial_attack_delay_range: [0.35, 0.55],
  xp_reward: 1,
  buff_container_reward: 16,
  lootbox_container_reward: 12,
  emerald_drop_chance: 0.2,
};
