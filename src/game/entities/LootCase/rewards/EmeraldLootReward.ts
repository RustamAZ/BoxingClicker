import {
  LootReward,
  lootRewardRarityMultipliers,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class EmeraldLootReward extends LootReward {
  readonly id = "emerald";
  readonly title = "Emerald";
  readonly iconTextureKey = "loot-case-emerald-icon";
  readonly iconTexturePath = "assets/images/ui/icons/emerald.png";
  readonly applySoundKey = "loot-case-emerald-apply";
  readonly applySoundPath = "assets/audio/ui/takeEmerald.mp3";
  readonly value: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.value = Math.max(
      1,
      Math.round(5 * lootRewardRarityMultipliers[rarity]),
    );
    this.description = `+${this.value} emeralds`;
  }

  apply(context: LootRewardApplyContext) {
    context.wallet.deposit(this.value);
  }
}
