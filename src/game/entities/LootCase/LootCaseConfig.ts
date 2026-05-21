import type {
  LootRewardId,
  LootRewardRarity,
} from "./rewards/LootReward";

export type LootCaseDropConfig = {
  rewardId: LootRewardId;
  rarity: LootRewardRarity;
  weight: number;
};

export const lootCaseDrops: readonly LootCaseDropConfig[] = [
  {
    rewardId: "emerald",
    rarity: "wooden",
    weight: 55,
  },
  {
    rewardId: "emerald",
    rarity: "golden",
    weight: 28,
  },
  {
    rewardId: "emerald",
    rarity: "emerald",
    weight: 13,
  },
  {
    rewardId: "emerald",
    rarity: "diamond",
    weight: 4,
  },
];

export function rollLootCaseDrop(
  drops = lootCaseDrops,
  random = Math.random,
) {
  const availableDrops = drops.filter((drop) => drop.weight > 0);
  const totalWeight = availableDrops.reduce(
    (sum, drop) => sum + drop.weight,
    0,
  );

  if (availableDrops.length === 0 || totalWeight <= 0) {
    return lootCaseDrops[0];
  }

  let randomWeight = random() * totalWeight;

  for (const drop of availableDrops) {
    randomWeight -= drop.weight;

    if (randomWeight <= 0) {
      return drop;
    }
  }

  return availableDrops[availableDrops.length - 1];
}
