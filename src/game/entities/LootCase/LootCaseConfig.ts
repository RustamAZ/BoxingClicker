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
  { rewardId: "emerald", rarity: "s", weight: 18 },
  { rewardId: "emerald", rarity: "m", weight: 8 },
  { rewardId: "emerald", rarity: "l", weight: 3 },
  { rewardId: "health-potion", rarity: "s", weight: 18 },
  { rewardId: "health-potion", rarity: "m", weight: 8 },
  { rewardId: "health-potion", rarity: "l", weight: 3 },
  { rewardId: "stamina-potion", rarity: "s", weight: 18 },
  { rewardId: "stamina-potion", rarity: "m", weight: 8 },
  { rewardId: "stamina-potion", rarity: "l", weight: 3 },
  { rewardId: "speed-potion", rarity: "s", weight: 18 },
  { rewardId: "speed-potion", rarity: "m", weight: 8 },
  { rewardId: "speed-potion", rarity: "l", weight: 3 },
  { rewardId: "attack-potion", rarity: "s", weight: 18 },
  { rewardId: "attack-potion", rarity: "m", weight: 8 },
  { rewardId: "attack-potion", rarity: "l", weight: 3 },
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
