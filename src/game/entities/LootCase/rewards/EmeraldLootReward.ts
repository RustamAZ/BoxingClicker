import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class EmeraldLootReward extends LootReward {
  readonly id = "emerald";
  readonly title = "Emeralds";
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-emerald-apply";
  readonly applySoundPath = "assets/audio/ui/takeEmerald.mp3";
  readonly value: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.iconTextureKey = `loot-case-${rarity}-emeralds-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-emeralds.png`;
    this.value = EmeraldLootReward.valueByRarity[rarity];
    this.description = `+${this.value} emeralds`;
  }

  apply(context: LootRewardApplyContext) {
    context.wallet.deposit(this.value);
  }

  private static readonly valueByRarity: Record<LootRewardRarity, number> = {
    s: 1,
    m: 3,
    l: 5,
  };
}
