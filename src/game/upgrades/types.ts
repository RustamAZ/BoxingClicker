import type { Player } from "../entities/Player/Player";
import type { BuffConfigId, BuffRarity } from "../configs/buffConfig";

export type RewardBuffId =
  | "damage"
  | "stamina"
  | "health"
  | "attack-speed"
  | "stamina-cost";

export type RewardBuffRarity = "wooden" | "golden" | "emerald" | "diamond";

export type RewardBuffDefinition = {
  id: RewardBuffId;
  configId: BuffConfigId;
  titleKey: string;
  iconTextureKey: string;
  iconTexturePath: string;
  descriptionKey: string;
  apply: (player: Player, value: number) => void;
};

export type RewardBuffRarityConfig = {
  id: RewardBuffRarity;
  label: string;
  configRarity: BuffRarity;
  textureKey: string;
  texturePath: string;
};

export type RewardChoice = {
  id: string;
  buffId: RewardBuffId;
  rarity: RewardBuffRarity;
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  value: number;
  rarityTextureKey: string;
  iconTextureKey: string;
  apply: (player: Player) => void;
};

export type Upgrade = RewardChoice;
