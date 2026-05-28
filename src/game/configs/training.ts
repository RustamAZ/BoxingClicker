import type { PlayerStat } from "../entities/Player/Player";

export type TrainingItemId =
  | "punch-power"
  | "strong-jaw"
  | "endurance"
  | "light-gloves"
  | "fast-hands";

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
};

export const trainingConfig = {
  items: [
    {
      id: "punch-power",
      titleKey: "training.punchPower.title",
      descriptionKey: "training.punchPower.description",
      iconTextureKey: "training-punch-power-icon",
      iconPath: "assets/images/ui/buffs/icons/attackDamage.png",
      stat: "damage",
      valuePerLevel: 1,
      maxLevel: 10,
      priceByLevel: [50, 60, 75, 90, 110, 135, 165, 200, 240, 290],
    },
    {
      id: "strong-jaw",
      titleKey: "training.strongJaw.title",
      descriptionKey: "training.strongJaw.description",
      iconTextureKey: "training-strong-jaw-icon",
      iconPath: "assets/images/ui/buffs/icons/increaseHealth.png",
      stat: "max-health",
      valuePerLevel: 10,
      maxLevel: 10,
      priceByLevel: [60, 72, 90, 110, 135, 165, 200, 240, 290, 350],
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
      priceByLevel: [75, 90, 110, 135, 165, 200, 240, 290, 350, 420],
    },
    {
      id: "light-gloves",
      titleKey: "training.lightGloves.title",
      descriptionKey: "training.lightGloves.description",
      iconTextureKey: "training-light-gloves-icon",
      iconPath: "assets/images/ui/buffs/icons/decreaseCost.png",
      stat: "stamina-cost",
      valuePerLevel: -0.05,
      maxLevel: 10,
      priceByLevel: [80, 96, 120, 145, 175, 210, 250, 300, 360, 430],
    },
    {
      id: "fast-hands",
      titleKey: "training.fastHands.title",
      descriptionKey: "training.fastHands.description",
      iconTextureKey: "training-fast-hands-icon",
      iconPath: "assets/images/ui/buffs/icons/attackSpeed.png",
      stat: "punch-speed",
      valuePerLevel: 0.1,
      maxLevel: 10,
      priceByLevel: [90, 110, 135, 165, 200, 240, 290, 350, 420, 500],
    },
  ] satisfies TrainingItemConfig[],
} as const;

export const trainingItemIds = trainingConfig.items.map((item) => item.id);

export type TrainingLevels = Partial<Record<TrainingItemId, number>>;

export function getTrainingItemConfig(id: TrainingItemId) {
  return trainingConfig.items.find((item) => item.id === id);
}
