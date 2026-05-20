import type { Scene } from "phaser";
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
    label: "Дерево",
    textureKey: "wooden-buff-container",
    texturePath: "assets/images/ui/buffs/wooden-buff-container.png",
    valueMultiplier: 1,
    weight: 56,
  },
  golden: {
    id: "golden",
    label: "Золото",
    textureKey: "golden-buff-container",
    texturePath: "assets/images/ui/buffs/golden-buff-container.png",
    valueMultiplier: 1.5,
    weight: 28,
  },
  emerald: {
    id: "emerald",
    label: "Изумруд",
    textureKey: "emerald-buff-container",
    texturePath: "assets/images/ui/buffs/emerald-buff-container.png",
    valueMultiplier: 2,
    weight: 12,
  },
  diamond: {
    id: "diamond",
    label: "Алмаз",
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
    title: "Сильный удар",
    baseValue: 2,
    getDescription: (value) => `+${value} к урону`,
    apply: (player, value) => {
      player.increaseDamage(value);
    },
  },
  stamina: {
    id: "stamina",
    iconTextureKey: "buff-icon-increase-stamina",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseStamina.png",
    title: "Запас сил",
    baseValue: 15,
    getDescription: (value) => `+${value} к выносливости`,
    apply: (player, value) => {
      player.increaseMaxStamina(value);
    },
  },
  health: {
    id: "health",
    iconTextureKey: "buff-icon-increase-health",
    iconTexturePath: "assets/images/ui/buffs/icons/increaseHealth.png",
    title: "Крепкий корпус",
    baseValue: 10,
    getDescription: (value) => `+${value} к здоровью`,
    apply: (player, value) => {
      player.increaseMaxHealth(value);
    },
  },
  "attack-speed": {
    id: "attack-speed",
    iconTextureKey: "buff-icon-attack-speed",
    iconTexturePath: "assets/images/ui/buffs/icons/attackSpeed.png",
    title: "Быстрые руки",
    baseValue: 15,
    getDescription: (value) => `+${value}% к скорости`,
    apply: (player, value) => {
      player.increasePunchSpeed(value / 100);
    },
  },
  "stamina-cost": {
    id: "stamina-cost",
    iconTextureKey: "buff-icon-decrease-cost",
    iconTexturePath: "assets/images/ui/buffs/icons/decreaseCost.png",
    title: "Легкий удар",
    baseValue: 1,
    getDescription: (value) => `-${value} к затратам`,
    apply: (player, value) => {
      player.decreaseStaminaCost(value);
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

  private static createChoice(
    buff: RewardBuffDefinition,
    rarity: RewardBuffRarityConfig,
  ): RewardChoice {
    const value = Math.max(1, Math.round(buff.baseValue * rarity.valueMultiplier));

    return {
      id: `${rarity.id}-${buff.id}`,
      buffId: buff.id,
      rarity: rarity.id,
      title: buff.title,
      description: buff.getDescription(value),
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
