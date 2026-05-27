import {
  getLootBoxRewardConfig,
  rewardIdToLootBoxRewardId,
} from "../../../configs/lootBox";
import { languageController } from "../../../localization/LanguageController";
import {
  LootReward,
  getLootPotionTitle,
  type LootRewardApplyContext,
  type LootRewardRarity,
  lootRewardRarityToName,
} from "./LootReward";

export class SpeedPotionLootReward extends LootReward {
  readonly id = "speed-potion";
  readonly title: string;
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  private static readonly durationSeconds = 6;
  readonly attackSpeedBonus: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    const rewardConfig = getLootBoxRewardConfig(
      rewardIdToLootBoxRewardId[this.id],
    );

    this.title = getLootPotionTitle(rewardConfig.nameKey, rarity);
    this.iconTextureKey = `loot-case-${rarity}-speed-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-speed-poition.png`;
    this.attackSpeedBonus = rewardConfig.values[lootRewardRarityToName[rarity]];
    this.description = languageController.t(rewardConfig.descriptionKey, {
      value: Math.round(this.attackSpeedBonus * 100),
    });
  }

  apply(context: LootRewardApplyContext) {
    context.player.applyStatEffect({
      stat: "punch-speed",
      mode: "multiply",
      value: 1 + this.attackSpeedBonus,
      durationSeconds: SpeedPotionLootReward.durationSeconds,
      sourceId: "loot-case-speed-potion",
    });
  }
}
