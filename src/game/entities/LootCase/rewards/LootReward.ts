import type { Scene } from "phaser";
import type { Player } from "../../Player/Player";
import type { Wallet } from "../../Wallet/Wallet";

export type LootRewardId = string;

export type LootRewardRarity =
  | "s"
  | "m"
  | "l";

export type LootRewardRarityName = "common" | "rare" | "epic";

export type LootRewardApplyContext = {
  player: Player;
  wallet: Wallet;
};

export abstract class LootReward {
  abstract readonly id: LootRewardId;
  abstract readonly rarity: LootRewardRarity;
  abstract readonly title: string;
  abstract readonly description: string;
  abstract readonly iconTextureKey: string;
  abstract readonly iconTexturePath: string;
  abstract readonly applySoundKey: string;
  abstract readonly applySoundPath: string;

  getRarity() {
    return this.rarity;
  }

  getIconTextureKey() {
    return this.iconTextureKey;
  }

  getTitle() {
    return this.title;
  }

  getDescription() {
    return this.description;
  }

  getRarityColor() {
    return lootRewardRarityColors[this.rarity];
  }

  preload(scene: Scene) {
    scene.load.image(this.iconTextureKey, this.iconTexturePath);
    scene.load.audio(this.applySoundKey, this.applySoundPath);
  }

  playApplySound(scene: Scene) {
    scene.sound.play(this.applySoundKey, {
      volume: 0.7,
    });
  }

  abstract apply(context: LootRewardApplyContext): void;
}

export const lootRewardRarityColors: Record<LootRewardRarity, number> = {
  s: 0x9a9a9a,
  m: 0xffd05a,
  l: 0x7ed7ff,
};

export const lootRewardRarityToName: Record<
  LootRewardRarity,
  LootRewardRarityName
> = {
  s: "common",
  m: "rare",
  l: "epic",
};
