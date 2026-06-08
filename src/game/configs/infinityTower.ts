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
  { type: "emerald", id: "floor-10-left-emerald", level: 10, amount: 200 },
  { type: "rewive", id: "floor-10-right-rewive", level: 10, amount: 1 },
  { type: "emerald", id: "floor-20-left-emerald", level: 20, amount: 200 },
  { type: "rewive", id: "floor-20-right-rewive", level: 20, amount: 1 },
  {
    type: "consumable",
    id: "floor-30-left-attack-speed-potion",
    level: 30,
    consumableId: "attack-speed-potion",
    amount: 1,
  },
  { type: "emerald", id: "floor-30-right-emerald", level: 30, amount: 300 },
  {
    type: "consumable",
    id: "floor-40-left-attack-power-potion",
    level: 40,
    consumableId: "attack-power-potion",
    amount: 2,
  },
  {
    type: "gloves",
    id: "floor-40-right-diamond-tower-gloves",
    level: 40,
    itemId: "diamond-tower-gloves",
    titleKey: "infinite.diamondGlovesRewardItem",
    iconTextureKey: "infinite-tower-diamond-gloves-icon",
    iconTexturePath:
      "assets/images/ui/shop/items/diamond-tower-weapon-icon.png",
  },
  { type: "emerald", id: "floor-50-left-emerald", level: 50, amount: 500 },
  { type: "rewive", id: "floor-50-right-rewive", level: 50, amount: 1 },
  {
    type: "consumable",
    id: "floor-60-left-attack-speed-potion",
    level: 60,
    consumableId: "attack-speed-potion",
    amount: 2,
  },
  { type: "emerald", id: "floor-60-right-emerald", level: 60, amount: 650 },
  {
    type: "consumable",
    id: "floor-70-left-attack-power-potion",
    level: 70,
    consumableId: "attack-power-potion",
    amount: 2,
  },
  { type: "rewive", id: "floor-70-right-rewive", level: 70, amount: 1 },
  { type: "emerald", id: "floor-80-left-emerald", level: 80, amount: 800 },
  {
    type: "consumable",
    id: "floor-80-right-attack-speed-potion",
    level: 80,
    consumableId: "attack-speed-potion",
    amount: 2,
  },
  { type: "rewive", id: "floor-90-left-rewive", level: 90, amount: 2 },
  {
    type: "consumable",
    id: "floor-90-right-attack-power-potion",
    level: 90,
    consumableId: "attack-power-potion",
    amount: 2,
  },
  { type: "emerald", id: "floor-100-left-emerald", level: 100, amount: 1000 },
  {
    type: "consumable",
    id: "floor-100-right-attack-speed-potion",
    level: 100,
    consumableId: "attack-speed-potion",
    amount: 3,
  },
  {
    type: "consumable",
    id: "floor-110-left-attack-power-potion",
    level: 110,
    consumableId: "attack-power-potion",
    amount: 3,
  },
  { type: "emerald", id: "floor-110-right-emerald", level: 110, amount: 1150 },
  { type: "rewive", id: "floor-120-left-rewive", level: 120, amount: 2 },
  {
    type: "consumable",
    id: "floor-120-right-attack-speed-potion",
    level: 120,
    consumableId: "attack-speed-potion",
    amount: 3,
  },
  { type: "emerald", id: "floor-130-left-emerald", level: 130, amount: 1300 },
  {
    type: "consumable",
    id: "floor-130-right-attack-power-potion",
    level: 130,
    consumableId: "attack-power-potion",
    amount: 3,
  },
  {
    type: "consumable",
    id: "floor-140-left-attack-speed-potion",
    level: 140,
    consumableId: "attack-speed-potion",
    amount: 3,
  },
  { type: "rewive", id: "floor-140-right-rewive", level: 140, amount: 2 },
  { type: "emerald", id: "floor-150-left-emerald", level: 150, amount: 1500 },
  {
    type: "consumable",
    id: "floor-150-right-attack-power-potion",
    level: 150,
    consumableId: "attack-power-potion",
    amount: 4,
  },
  { type: "rewive", id: "floor-160-left-rewive", level: 160, amount: 2 },
  {
    type: "consumable",
    id: "floor-160-right-attack-speed-potion",
    level: 160,
    consumableId: "attack-speed-potion",
    amount: 4,
  },
  { type: "emerald", id: "floor-170-left-emerald", level: 170, amount: 1700 },
  {
    type: "consumable",
    id: "floor-170-right-attack-power-potion",
    level: 170,
    consumableId: "attack-power-potion",
    amount: 4,
  },
  {
    type: "consumable",
    id: "floor-180-left-attack-speed-potion",
    level: 180,
    consumableId: "attack-speed-potion",
    amount: 4,
  },
  { type: "rewive", id: "floor-180-right-rewive", level: 180, amount: 3 },
  { type: "emerald", id: "floor-190-left-emerald", level: 190, amount: 1900 },
  {
    type: "consumable",
    id: "floor-190-right-attack-power-potion",
    level: 190,
    consumableId: "attack-power-potion",
    amount: 4,
  },
  { type: "rewive", id: "floor-200-left-rewive", level: 200, amount: 3 },
  { type: "emerald", id: "floor-200-right-emerald", level: 200, amount: 2100 },
  {
    type: "consumable",
    id: "floor-210-left-attack-speed-potion",
    level: 210,
    consumableId: "attack-speed-potion",
    amount: 5,
  },
  {
    type: "consumable",
    id: "floor-210-right-attack-power-potion",
    level: 210,
    consumableId: "attack-power-potion",
    amount: 5,
  },
  { type: "emerald", id: "floor-220-left-emerald", level: 220, amount: 2300 },
  { type: "rewive", id: "floor-220-right-rewive", level: 220, amount: 3 },
  {
    type: "consumable",
    id: "floor-230-left-attack-power-potion",
    level: 230,
    consumableId: "attack-power-potion",
    amount: 5,
  },
  {
    type: "consumable",
    id: "floor-230-right-attack-speed-potion",
    level: 230,
    consumableId: "attack-speed-potion",
    amount: 5,
  },
  { type: "emerald", id: "floor-240-left-emerald", level: 240, amount: 2500 },
  { type: "rewive", id: "floor-240-right-rewive", level: 240, amount: 4 },
  {
    type: "consumable",
    id: "floor-250-left-attack-speed-potion",
    level: 250,
    consumableId: "attack-speed-potion",
    amount: 6,
  },
  { type: "emerald", id: "floor-250-right-emerald", level: 250, amount: 3000 },
];
