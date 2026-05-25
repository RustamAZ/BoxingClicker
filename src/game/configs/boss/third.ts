import type { BossConfig } from "./types";

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
