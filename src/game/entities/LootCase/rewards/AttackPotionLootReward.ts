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

export class AttackPotionLootReward extends LootReward {
  readonly id = "attack-potion";
  readonly title: string;
  readonly iconTextureKey: string;
  readonly iconTexturePath: string;
  readonly applySoundKey = "loot-case-potion-apply";
  readonly applySoundPath = "assets/audio/ui/diamondReward.mp3";
  private static readonly durationSeconds = 6;
  readonly attackPowerBonus: number;
  readonly description: string;

  constructor(readonly rarity: LootRewardRarity) {
    super();

    const rewardConfig = getLootBoxRewardConfig(
      rewardIdToLootBoxRewardId[this.id],
    );

    this.title = languageController.t(rewardConfig.nameKey);
    this.iconTextureKey = `loot-case-${rarity}-attack-potion-icon`;
    this.iconTexturePath = `assets/images/loot-case/rewards/${rarity}-attack-poition.png`;
    this.attackPowerBonus = rewardConfig.values[lootRewardRarityToName[rarity]];
    this.description = languageController.t(rewardConfig.descriptionKey, {
      value: this.attackPowerBonus,
    });
  }

  apply(context: LootRewardApplyContext) {
    context.player.applyStatEffect({
      stat: "damage",
      mode: "add",
      value: this.attackPowerBonus,
      durationSeconds: AttackPotionLootReward.durationSeconds,
      sourceId: "loot-case-attack-potion",
    });
  }
}
