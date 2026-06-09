export type GlovesShopConfigId =
  | "old_gloves"
  | "bruiser_gloves"
  | "demolition_gloves"
  | "spider_hunter_gloves"
  | "ender_hunter_gloves"
  | "warden_gloves"
  | "golden_tower_gloves"
  | "diamond_tower_gloves"
  | "red_daily_gloves";

export type GlovesUnlockCondition =
  | "start"
  | "meet_boss_1"
  | "meet_boss_2"
  | "meet_boss_3"
  | "meet_boss_4"
  | "meet_boss_5";

export type GlovesShopConfig = {
  name: string;
  unlock_condition: GlovesUnlockCondition;
  unlock_boss_id?: string;
  price_emerald: number;
  attack_bonus: number;
  attack_speed_bonus: number;
};

type GlovesConfig = {
  gloves: Record<GlovesShopConfigId, GlovesShopConfig>;
};

export const glovesConfig: GlovesConfig = {
  gloves: {
    old_gloves: {
      name: "Старые перчатки",
      unlock_condition: "start",
      price_emerald: 0,
      attack_bonus: 0,
      attack_speed_bonus: 0,
    },
    bruiser_gloves: {
      name: "Перчатки громилы",
      unlock_condition: "meet_boss_1",
      unlock_boss_id: "first-difficulty-boss",
      price_emerald: 20,
      attack_bonus: 10,
      attack_speed_bonus: 0.15,
    },
    demolition_gloves: {
      name: "Перчатки подрывника",
      unlock_condition: "meet_boss_2",
      unlock_boss_id: "second-difficulty-boss",
      price_emerald: 80,
      attack_bonus: 15,
      attack_speed_bonus: 0.35,
    },
    spider_hunter_gloves: {
      name: "Перчатки охотника на пауков",
      unlock_condition: "meet_boss_3",
      unlock_boss_id: "third-difficulty-boss",
      price_emerald: 150,
      attack_bonus: 20,
      attack_speed_bonus: 0.35,
    },
    ender_hunter_gloves: {
      name: "Перчатки охотника на эндеров",
      unlock_condition: "meet_boss_4",
      unlock_boss_id: "four-difficulty-boss",
      price_emerald: 300,
      attack_bonus: 30,
      attack_speed_bonus: 0.35,
    },
    warden_gloves: {
      name: "Перчатки вардена",
      unlock_condition: "meet_boss_5",
      unlock_boss_id: "five-difficulty-boss",
      price_emerald: 450,
      attack_bonus: 35,
      attack_speed_bonus: 0.45,
    },
    golden_tower_gloves: {
      name: "Золотые перчатки 67",
      unlock_condition: "start",
      price_emerald: 0,
      attack_bonus: 40,
      attack_speed_bonus: 0.45,
    },
    diamond_tower_gloves: {
      name: "Алмазные перчатки 67",
      unlock_condition: "start",
      price_emerald: 0,
      attack_bonus: 55,
      attack_speed_bonus: 0.45,
    },
    red_daily_gloves: {
      name: "Красные перчатки 67",
      unlock_condition: "start",
      price_emerald: 0,
      attack_bonus: 70,
      attack_speed_bonus: 0.45,
    },
  },
};

export const glovesIdToConfigId: Record<string, GlovesShopConfigId> = {
  "basic-gloves": "old_gloves",
  "amogus-gloves": "bruiser_gloves",
  "pepe-gloves": "demolition_gloves",
  "mechanic-gloves": "spider_hunter_gloves",
  "infinity-gloves": "ender_hunter_gloves",
  "six-seven-gloves": "warden_gloves",
  "golden-tower-gloves": "golden_tower_gloves",
  "diamond-tower-gloves": "diamond_tower_gloves",
  "red-daily-gloves": "red_daily_gloves",
};

export function getGlovesShopConfigByGlovesId(glovesId: string) {
  const configId = glovesIdToConfigId[glovesId];

  return configId ? glovesConfig.gloves[configId] : undefined;
}
