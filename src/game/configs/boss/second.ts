import type { BossConfig } from "./types";

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
