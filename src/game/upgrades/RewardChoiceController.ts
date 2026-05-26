import type { Scene } from "phaser";
import {
  buffConfig,
  getBuffValue,
  type BuffRarity,
} from "../configs/buffConfig";
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
    configRarity: "common",
    textureKey: "wooden-buff-container",
    texturePath: "assets/images/ui/buffs/wooden-buff-container.png",
  },
  golden: {
    id: "golden",
    label: "buff.rarity.golden",
    configRarity: "rare",
    textureKey: "golden-buff-container",
    texturePath: "assets/images/ui/buffs/golden-buff-container.png",
  },
  emerald: {
    id: "emerald",
    label: "buff.rarity.emerald",
    configRarity: "epic",
    textureKey: "emerald-buff-container",
    texturePath: "assets/images/ui/buffs/emerald-buff-container.png",
  },
  diamond: {
    id: "diamond",
    label: "buff.rarity.diamond",
    configRarity: "legendary",
    textureKey: "diamond-buff-container",
    texturePath: "assets/images/ui/buffs/diamond-buff-container.png",
  },
};

const buffDefinitions: Record<RewardBuffId, RewardBuffDefinition> = {
  damage: {
    id: "damage",
    configId: "attack",
    iconTextureKey: "buff-icon-attack-damage",
    iconTexturePath: "assets/images/ui/buffs/icons/attackDamage.png",
    titleKey: "buff.damage.title",
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
    configId: "stamina",
    iconTextureKey: "buff-icon-increase-stamina",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseStamina.png",
    titleKey: "buff.stamina.title",
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
    configId: "health",
    iconTextureKey: "buff-icon-increase-health",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseHealth.png",
    titleKey: "buff.health.title",
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
    configId: "attack_speed",
    iconTextureKey: "buff-icon-attack-speed",
    iconTexturePath: "assets/images/ui/buffs/icons/attackSpeed.png",
    titleKey: "buff.attackSpeed.title",
    descriptionKey: "buff.attackSpeed.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "punch-speed",
        mode: "add",
        value,
      });
    },
  },
  "stamina-cost": {
    id: "stamina-cost",
    configId: "stamina_cost_per_hit",
    iconTextureKey: "buff-icon-decrease-cost",
    iconTexturePath: "assets/images/ui/buffs/icons/decreaseCost.png",
    titleKey: "buff.staminaCost.title",
    descriptionKey: "buff.staminaCost.description",
    apply: (player, value) => {
      player.applyStatEffect({
        stat: "stamina-cost",
        mode: "add",
        value,
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
        value: RewardChoiceController.getDisplayValue(
          choice.buffId,
          choice.value,
        ),
      }),
    };
  }

  private static createChoice(
    buff: RewardBuffDefinition,
    rarity: RewardBuffRarityConfig,
  ): RewardChoice {
    const value = getBuffValue(buff.configId, rarity.configRarity);

    return {
      id: `${rarity.id}-${buff.id}`,
      buffId: buff.id,
      rarity: rarity.id,
      title: languageController.t(buff.titleKey),
      titleKey: buff.titleKey,
      description: languageController.t(buff.descriptionKey, {
        value: RewardChoiceController.getDisplayValue(buff.id, value),
      }),
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
    const rarity = RewardChoiceController.rollBuffRarity();

    return (
      Object.values(rarityConfigs).find(
        (rarityConfig) => rarityConfig.configRarity === rarity,
      ) ?? rarityConfigs.wooden
    );
  }

  private static rollBuffRarity(): BuffRarity {
    const rarityChances = Object.entries(
      buffConfig.buff_rarity_chance,
    ) as [BuffRarity, number][];
    let roll = Math.random();

    for (const [rarity, chance] of rarityChances) {
      roll -= chance;

      if (roll <= 0) {
        return rarity;
      }
    }

    return "common";
  }

  private static getDisplayValue(buffId: RewardBuffId, value: number) {
    if (buffId === "attack-speed") {
      return Math.round(value * 100);
    }

    if (buffId === "stamina-cost") {
      return Math.abs(value);
    }

    return value;
  }
}
