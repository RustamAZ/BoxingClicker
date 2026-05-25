import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class StaminaPotionLootReward extends LootReward {
  readonly id = "stamina-potion";
  readonly title = "Stamina Potion";
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  readonly restorePercent: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.iconTextureKey = `loot-case-${rarity}-stamina-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-stamina-poition.png`;
    this.restorePercent = StaminaPotionLootReward.restorePercentByRarity[rarity];
    this.description = `Restore ${Math.round(this.restorePercent * 100)}% stamina`;
  }

  apply(context: LootRewardApplyContext) {
    context.player.restoreStaminaPercent(this.restorePercent);
  }

  private static readonly restorePercentByRarity: Record<
    LootRewardRarity,
    number
  > = {
    s: 0.2,
    m: 0.5,
    l: 1,
  };
}
