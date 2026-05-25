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
