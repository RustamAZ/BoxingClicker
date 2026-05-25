import type { EnemyStatRange } from "../../entities/Enemy/types";

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
