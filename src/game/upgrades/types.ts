import type { Player } from "../entities/Player/Player";

export type RewardBuffId =
  | "damage"
  | "stamina"
  | "health"
  | "attack-speed"
  | "stamina-cost";

export type RewardBuffRarity = "wooden" | "golden" | "emerald" | "diamond";

export type RewardBuffDefinition = {
  id: RewardBuffId;
  title: string;
  iconTextureKey: string;
  iconTexturePath: string;
  baseValue: number;
  getDescription: (value: number) => string;
  apply: (player: Player, value: number) => void;
};

export type RewardBuffRarityConfig = {
  id: RewardBuffRarity;
  label: string;
  textureKey: string;
  texturePath: string;
  valueMultiplier: number;
  weight: number;
};

export type RewardChoice = {
  id: string;
  buffId: RewardBuffId;
  rarity: RewardBuffRarity;
  title: string;
  description: string;
  value: number;
  rarityTextureKey: string;
  iconTextureKey: string;
  apply: (player: Player) => void;
};

export type Upgrade = RewardChoice;
