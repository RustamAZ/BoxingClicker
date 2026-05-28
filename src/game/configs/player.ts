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
    attack: 9,
    health: 100,
    stamina: 200,
    stamina_cost_per_hit: 2,
    attack_speed: 3.5,
    stamina_regen_per_second: 2.5,
  },
  player_limits: {
    minimum_stamina_cost_per_hit: 0.5,
  },
};