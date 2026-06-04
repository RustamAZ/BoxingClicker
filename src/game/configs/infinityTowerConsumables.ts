import type { PlayerStatEffect } from "../entities/Player/Player";

export type InfinityTowerConsumableId =
  | "attack-speed-potion"
  | "attack-power-potion";

export type InfinityTowerConsumableConfig = {
  id: InfinityTowerConsumableId;
  titleKey: string;
  iconTextureKey: string;
  iconTexturePath: string;
  effects: PlayerStatEffect[];
};

export type InfinityTowerConsumables = Partial<
  Record<InfinityTowerConsumableId, number>
>;

export const infinityTowerConsumablesConfig: InfinityTowerConsumableConfig[] = [
  {
    id: "attack-speed-potion",
    titleKey: "infinite.consumable.attackSpeed",
    iconTextureKey: "infinite-tower-attack-speed-potion",
    iconTexturePath: "assets/images/loot-case/rewards/l-speed-poition.png",
    effects: [
      {
        stat: "punch-speed",
        mode: "multiply",
        value: 1.3,
      },
    ],
  },
  {
    id: "attack-power-potion",
    titleKey: "infinite.consumable.attackPower",
    iconTextureKey: "infinite-tower-attack-power-potion",
    iconTexturePath: "assets/images/loot-case/rewards/l-attack-poition.png",
    effects: [
      {
        stat: "damage",
        mode: "multiply",
        value: 1.3,
      },
    ],
  },
];

export const infinityTowerConsumableIds =
  infinityTowerConsumablesConfig.map((consumable) => consumable.id);

export function getInfinityTowerConsumableConfig(
  consumableId: InfinityTowerConsumableId,
) {
  return infinityTowerConsumablesConfig.find(
    (consumable) => consumable.id === consumableId,
  );
}
