import type { PlayerStat } from "../entities/Player/Player";

export type TrainingItemId =
  | "punch-power"
  | "strong-jaw"
  | "endurance"
  | "light-gloves"
  | "fast-hands"
  | "critical-hit";

export type TrainingItemConfig = {
  id: TrainingItemId;
  titleKey: string;
  descriptionKey: string;
  iconTextureKey: string;
  iconPath: string;
  stat: PlayerStat;
  valuePerLevel: number;
  maxLevel: number;
  priceByLevel: number[];
  requiresInfinityTower?: boolean;
  canExceedMaxLevelInInfinityTower?: boolean;
};

export const trainingConfig = {
  infinityTowerLevelPrice: 350,
  items: [
    {
      id: "punch-power",
      titleKey: "training.punchPower.title",
      descriptionKey: "training.punchPower.description",
      iconTextureKey: "training-punch-power-icon",
      iconPath: "assets/images/ui/buffs/icons/attackDamage.png",
      stat: "damage",
      valuePerLevel: 2,
      maxLevel: 10,
      priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
    },
    {
      id: "strong-jaw",
      titleKey: "training.strongJaw.title",
      descriptionKey: "training.strongJaw.description",
      iconTextureKey: "training-strong-jaw-icon",
      iconPath: "assets/images/ui/buffs/icons/increaseHealth.png",
      stat: "max-health",
      valuePerLevel: 15,
      maxLevel: 10,
      priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
      // priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
    },
    {
      id: "endurance",
      titleKey: "training.endurance.title",
      descriptionKey: "training.endurance.description",
      iconTextureKey: "training-endurance-icon",
      iconPath: "assets/images/ui/buffs/icons/increaseStamina.png",
      stat: "max-stamina",
      valuePerLevel: 25,
      maxLevel: 10,
      priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
    },
    {
      id: "light-gloves",
      titleKey: "training.lightGloves.title",
      descriptionKey: "training.lightGloves.description",
      iconTextureKey: "training-light-gloves-icon",
      iconPath: "assets/images/ui/buffs/icons/decreaseCost.png",
      stat: "stamina-cost",
      valuePerLevel: -0.1,
      maxLevel: 10,
      priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
      canExceedMaxLevelInInfinityTower: false,
    },
    {
      id: "fast-hands",
      titleKey: "training.fastHands.title",
      descriptionKey: "training.fastHands.description",
      iconTextureKey: "training-fast-hands-icon",
      iconPath: "assets/images/ui/buffs/icons/attackSpeed.png",
      stat: "punch-speed",
      valuePerLevel: 0.15,
      maxLevel: 10,
      priceByLevel: [30, 50, 60, 80, 90, 120, 150, 180, 200, 250],
      canExceedMaxLevelInInfinityTower: false,
    },
    {
      id: "critical-hit",
      titleKey: "training.criticalHit.title",
      descriptionKey: "training.criticalHit.description",
      iconTextureKey: "training-critical-hit-icon",
      iconPath: "assets/images/ui/buffs/icons/attackDamage.png",
      stat: "critical-hit-chance",
      valuePerLevel: 0.02,
      maxLevel: 10,
      priceByLevel: [350, 350, 350, 350, 350, 350, 350, 350, 350, 350],
      requiresInfinityTower: true,
      canExceedMaxLevelInInfinityTower: false,
    },
  ] satisfies TrainingItemConfig[],
} as const;

export const trainingItemIds = trainingConfig.items.map((item) => item.id);

export type TrainingLevels = Partial<Record<TrainingItemId, number>>;

export function getTrainingItemConfig(id: TrainingItemId) {
  return trainingConfig.items.find((item) => item.id === id);
}
