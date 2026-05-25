type PlayerConfig = {
  player_start: {
    attack: number;
    health: number;
    stamina: number;
    stamina_cost_per_hit: number;
    attack_speed: number;
    stamina_regen_per_second: number;
  };
  player_limits: {
    minimum_stamina_cost_per_hit: number;
  };
};

export const playerConfig: PlayerConfig = {
  player_start: {
    attack: 100,
    health: 1000,
    stamina: 100,
    stamina_cost_per_hit: 5,
    attack_speed: 2.0,
    stamina_regen_per_second: 25,
  },
  player_limits: {
    minimum_stamina_cost_per_hit: 2,
  },
};
