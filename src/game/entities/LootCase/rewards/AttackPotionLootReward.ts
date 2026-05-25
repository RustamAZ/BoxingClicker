import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
} from "./LootReward";

export class AttackPotionLootReward extends LootReward {
  readonly id = "attack-potion";
  readonly title = "Attack Potion";
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  readonly durationSeconds: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    this.iconTextureKey = `loot-case-${rarity}-attack-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-attack-poition.png`;
    this.durationSeconds = AttackPotionLootReward.durationByRarity[rarity];
    this.description = `+30% attack power for ${this.durationSeconds}s`;
  }

  apply(context: LootRewardApplyContext) {
    context.player.applyStatEffect({
      stat: "damage",
      mode: "multiply",
      value: 1.3,
      durationSeconds: this.durationSeconds,
      sourceId: "loot-case-attack-potion",
    });
  }

  private static readonly durationByRarity: Record<LootRewardRarity, number> = {
    s: 2,
    m: 4,
    l: 6,
  };
}
