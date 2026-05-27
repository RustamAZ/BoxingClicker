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

export class EmeraldLootReward extends LootReward {
  readonly id = "emerald";
  readonly title: string;
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-emerald-apply";
  readonly applySoundPath = "assets/audio/ui/takeEmerald.mp3";
  readonly value: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    const rewardConfig = getLootBoxRewardConfig(
      rewardIdToLootBoxRewardId[this.id],
    );

    const rarityName = lootRewardRarityToName[rarity];

    this.title = languageController.t(`${rewardConfig.nameKey}.${rarityName}`);
    this.iconTextureKey = `loot-case-${rarity}-emeralds-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-emeralds.png`;
    this.value = rewardConfig.values[lootRewardRarityToName[rarity]];
    this.description = languageController.t(rewardConfig.descriptionKey, {
      value: this.value,
    });
  }

  apply(context: LootRewardApplyContext) {
    context.wallet.deposit(this.value);
  }
}
