import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class HealthPotionLootReward extends LootReward {
  readonly id = "health-potion";
  readonly title = "Health Potion";
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  readonly restorePercent: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.iconTextureKey = `loot-case-${rarity}-health-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-health-poition.png`;
    this.restorePercent = HealthPotionLootReward.restorePercentByRarity[rarity];
    this.description = `Restore ${Math.round(this.restorePercent * 100)}% health`;
  }

  apply(context: LootRewardApplyContext) {
    context.player.restoreHealthPercent(this.restorePercent);
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
