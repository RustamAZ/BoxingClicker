import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardId,
  type LootRewardRarity,
} from "./LootReward";

export class PlaceholderLootReward extends LootReward {
  readonly title = "Reward";
  readonly description = "Reward effect placeholder";
  readonly iconTextureKey = "loot-case-placeholder-icon";
  readonly iconTexturePath = "assets/images/rewards/particles/coin-particle.png";
  readonly applySoundKey = "loot-case-placeholder-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";

  constructor(
    readonly id: LootRewardId,
    readonly rarity: LootRewardRarity,
  ) {
    super();
  }

  apply(_context: LootRewardApplyContext) {}
}
