import type { InfinityTowerConsumableId } from "./infinityTowerConsumables";

export type InfinityTowerEmeraldRewardConfig = {
  type: "emerald";
  id: string;
  level: number;
  amount: number;
};

export type InfinityTowerGlovesRewardConfig = {
  type: "gloves";
  id: string;
  level: number;
  itemId: string;
  titleKey: string;
  iconTextureKey: string;
  iconTexturePath: string;
};

export type InfinityTowerRewiveRewardConfig = {
  type: "rewive";
  id: string;
  level: number;
  amount: number;
};

export type InfinityTowerConsumableRewardConfig = {
  type: "consumable";
  id: string;
  level: number;
  consumableId: InfinityTowerConsumableId;
  amount: number;
};

export type InfinityTowerRewardConfig =
  | InfinityTowerEmeraldRewardConfig
  | InfinityTowerGlovesRewardConfig
  | InfinityTowerRewiveRewardConfig
  | InfinityTowerConsumableRewardConfig;

export type InfinityTowerEnemyStats = {
  maxHealth: number;
  damagePerHit: number;
  attackCooldownSeconds: number;
  initialAttackDelaySeconds: number;
  xpReward: number;
  diamondsReward: number;
  coinsReward: number;
  emeraldDropChance: number;
};

export type InfinityTowerFloorRequirementConfig = {
  fromFloor: number;
  enemies: number;
};

export const infinityTowerFloorRequirementsConfig: InfinityTowerFloorRequirementConfig[] = [
  { fromFloor: 1, enemies: 3 },
  { fromFloor: 5, enemies: 4 },
  { fromFloor: 10, enemies: 5 },
  { fromFloor: 20, enemies: 6 },
  { fromFloor: 40, enemies: 8 },
];

export const infinityTowerDifficultyConfig = {
  base: {
    maxHealth: 460,
    damagePerHit: 34,
    attackCooldownSeconds: 1.05,
    initialAttackDelaySeconds: 0.35,
    xpReward: 1,
    diamondsReward: 16,
    coinsReward: 12,
    emeraldDropChance: 0.4,
  },
  scalingPerFloor: {
    maxHealth: 0.12,
    damagePerHit: 0.08,
    attackCooldownSeconds: -0.006,
  },
  limits: {
    minAttackCooldownSeconds: 0.55,
  },
} satisfies {
  base: InfinityTowerEnemyStats;
  scalingPerFloor: {
    maxHealth: number;
    damagePerHit: number;
    attackCooldownSeconds: number;
  };
  limits: {
    minAttackCooldownSeconds: number;
  };
};

export const infinityTowerRewardsConfig: InfinityTowerRewardConfig[] = [
  { type: "emerald", id: "floor-50-left-emerald", level: 50, amount: 500 },
  {
    type: "consumable",
    id: "floor-40-left-attack-power-potion",
    level: 40,
    consumableId: "attack-power-potion",
    amount: 2,
  },
  {
    type: "gloves",
    id: "floor-10-diamond-tower-gloves",
    level: 40,
    itemId: "diamond-tower-gloves",
    titleKey: "infinite.diamondGlovesRewardItem",
    iconTextureKey: "infinite-tower-diamond-gloves-icon",
    iconTexturePath:
      "assets/images/ui/shop/items/diamond-tower-weapon-icon.png",
  },
  {
    type: "consumable",
    id: "floor-40-left-attack-power-potion",
    level: 40,
    consumableId: "attack-power-potion",
    amount: 1,
  },
  {
    type: "consumable",
    id: "floor-30-left-attack-speed-potion",
    level: 30,
    consumableId: "attack-speed-potion",
    amount: 1,
  },
  { type: "emerald", id: "floor-30-right-emerald", level: 30, amount: 300 },
  { type: "emerald", id: "floor-20-left-emerald", level: 20, amount: 200 },
  { type: "rewive", id: "floor-20-right-rewive", level: 20, amount: 1 },
  { type: "emerald", id: "floor-10-left-emerald", level: 10, amount: 100 },
  {
    type: "consumable",
    id: "floor-40-left-attack-power-potion",
    level: 40,
    consumableId: "attack-power-potion",
    amount: 1,
  },
];
