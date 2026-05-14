import type { Player } from "../entities/Player/Player";

export type UpgradeRarity = "common" | "rare" | "epic";

export type UpgradeDirection =
  | "strength"
  | "attack-speed"
  | "stamina-cost"
  | "stamina-volume"
  | "health"
  | "armor";

export type Upgrade = {
  id: string;
  title: string;
  description: string;
  rarity: UpgradeRarity;
  direction: UpgradeDirection;
  apply: (player: Player) => void;
};
