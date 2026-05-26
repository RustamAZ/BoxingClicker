import type { Scene } from "phaser";
import { languageController } from "../localization/LanguageController";
import type {
  RewardBuffDefinition,
  RewardBuffId,
  RewardBuffRarity,
  RewardBuffRarityConfig,
  RewardChoice,
} from "./types";

const rarityConfigs: Record<RewardBuffRarity, RewardBuffRarityConfig> = {
  wooden: {
    id: "wooden",
    label: "buff.rarity.wooden",
    textureKey: "wooden-buff-container",
    texturePath: "assets/images/ui/buffs/wooden-buff-container.png",
    valueMultiplier: 1,
    weight: 56,
  },
  golden: {
    id: "golden",
    label: "buff.rarity.golden",
    textureKey: "golden-buff-container",
    texturePath: "assets/images/ui/buffs/golden-buff-container.png",
    valueMultiplier: 1.5,
    weight: 28,
  },
  emerald: {
    id: "emerald",
    label: "buff.rarity.emerald",
    textureKey: "emerald-buff-container",
    texturePath: "assets/images/ui/buffs/emerald-buff-container.png",
    valueMultiplier: 2,
    weight: 12,
  },
  diamond: {
    id: "diamond",
    label: "buff.rarity.diamond",
    textureKey: "diamond-buff-container",
    texturePath: "assets/images/ui/buffs/diamond-buff-container.png",
    valueMultiplier: 3,
    weight: 4,
  },
};

const buffDefinitions: Record<RewardBuffId, RewardBuffDefinition> = {
  damage: {
    id: "damage",
    iconTextureKey: "buff-icon-attack-damage",
    iconTexturePath: "assets/images/ui/buffs/icons/attackDamage.png",
    titleKey: "buff.damage.title",
    baseValue: 2,
    descriptionKey: "buff.damage.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "damage",
        mode: "add",
        value,
      });
    },
  },
  stamina: {
    id: "stamina",
    iconTextureKey: "buff-icon-increase-stamina",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseStamina.png",
    titleKey: "buff.stamina.title",
    baseValue: 15,
    descriptionKey: "buff.stamina.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "max-stamina",
        mode: "add",
        value,
      });
    },
  },
  health: {
    id: "health",
    iconTextureKey: "buff-icon-increase-health",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseHealth.png",
    titleKey: "buff.health.title",
    baseValue: 10,
    descriptionKey: "buff.health.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "max-health",
        mode: "add",
        value,
      });
    },
  },
  "attack-speed": {
    id: "attack-speed",
    iconTextureKey: "buff-icon-attack-speed",
    iconTexturePath: "assets/images/ui/buffs/icons/attackSpeed.png",
    titleKey: "buff.attackSpeed.title",
    baseValue: 15,
    descriptionKey: "buff.attackSpeed.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "punch-speed",
        mode: "add",
        value: value / 100,
      });
    },
  },
  "stamina-cost": {
    id: "stamina-cost",
    iconTextureKey: "buff-icon-decrease-cost",
    iconTexturePath: "assets/images/ui/buffs/icons/decreaseCost.png",
    titleKey: "buff.staminaCost.title",
    baseValue: 1,
    descriptionKey: "buff.staminaCost.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "stamina-cost",
        mode: "add",
        value: -value,
      });
    },
  },
};

export class RewardChoiceController {
  static preload(scene: Scene) {
    for (const rarity of Object.values(rarityConfigs)) {
      scene.load.image(rarity.textureKey, rarity.texturePath);
    }

    for (const buff of Object.values(buffDefinitions)) {
      scene.load.image(buff.iconTextureKey, buff.iconTexturePath);
    }
  }

  static getRandomChoices(count = 3) {
    const availableBuffs = Object.values(buffDefinitions);
    const choices: RewardChoice[] = [];

    while (choices.length < count && availableBuffs.length > 0) {
      const buffIndex = Math.floor(Math.random() * availableBuffs.length);
      const [buff] = availableBuffs.splice(buffIndex, 1);
      const rarity = RewardChoiceController.getRandomRarity();

      choices.push(RewardChoiceController.createChoice(buff, rarity));
    }

    return choices;
  }

  static localizeChoice(choice: RewardChoice) {
    return {
      title: languageController.t(choice.titleKey),
      description: languageController.t(choice.descriptionKey, {
        value: choice.value,
      }),
    };
  }

  private static createChoice(
    buff: RewardBuffDefinition,
    rarity: RewardBuffRarityConfig,
  ): RewardChoice {
    const value = Math.max(
      1,
      Math.round(buff.baseValue * rarity.valueMultiplier),
    );

    return {
      id: `${rarity.id}-${buff.id}`,
      buffId: buff.id,
      rarity: rarity.id,
      title: languageController.t(buff.titleKey),
      titleKey: buff.titleKey,
      description: languageController.t(buff.descriptionKey, { value }),
      descriptionKey: buff.descriptionKey,
      value,
      rarityTextureKey: rarity.textureKey,
      iconTextureKey: buff.iconTextureKey,
      apply: (player) => {
        buff.apply(player, value);
      },
    };
  }

  private static getRandomRarity() {
    const rarities = Object.values(rarityConfigs);
    const totalWeight = rarities.reduce((sum, rarity) => sum + rarity.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const rarity of rarities) {
      roll -= rarity.weight;

      if (roll <= 0) {
        return rarity;
      }
    }

    return rarityConfigs.wooden;
  }
}
