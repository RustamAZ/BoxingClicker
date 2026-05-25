import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class SpeedPotionLootReward extends LootReward {
  readonly id = "speed-potion";
  readonly title = "Speed Potion";
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  readonly durationSeconds: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.iconTextureKey = `loot-case-${rarity}-speed-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-speed-poition.png`;
    this.durationSeconds = SpeedPotionLootReward.durationByRarity[rarity];
    this.description = `+30% attack speed for ${this.durationSeconds}s`;
  }

  apply(context: LootRewardApplyContext) {
    context.player.applyStatEffect({
      stat: "punch-speed",
      mode: "multiply",
      value: 1.3,
      durationSeconds: this.durationSeconds,
      sourceId: "loot-case-speed-potion",
    });
  }

  private static readonly durationByRarity: Record<LootRewardRarity, number> = {
    s: 2,
    m: 4,
    l: 6,
  };
}
