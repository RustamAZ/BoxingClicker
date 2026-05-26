import {
  getLootBoxRewardConfig,
  rewardIdToLootBoxRewardId,
} from "../../../configs/lootBox";
import { languageController } from "../../../localization/LanguageController";
import {
  LootReward,
  type LootRewardApplyContext,
  type LootRewardRarity,
  lootRewardRarityToName,
} from "./LootReward";

export class StaminaPotionLootReward extends LootReward {
  readonly id = "stamina-potion";
  readonly title: string;
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  readonly restorePercent: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    const rewardConfig = getLootBoxRewardConfig(
      rewardIdToLootBoxRewardId[this.id],
    );
    const restorePercent = rewardConfig.values[lootRewardRarityToName[rarity]];

    this.title = languageController.t(rewardConfig.nameKey);
    this.iconTextureKey = `loot-case-${rarity}-stamina-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-stamina-poition.png`;
    this.restorePercent = restorePercent / 100;
    this.description = languageController.t(rewardConfig.descriptionKey, {
      value: Math.round(this.restorePercent * 100),
    });
  }

  apply(context: LootRewardApplyContext) {
    context.player.restoreStaminaPercent(this.restorePercent);
  }
}
