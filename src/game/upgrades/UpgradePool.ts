import type { Upgrade, UpgradeRarity } from "./types";

const commonUpgrades: Upgrade[] = [
  {
    id: "common-damage-1",
    title: "Сильный удар",
    description: "+2 к урону за удар",
    rarity: "common",
    direction: "strength",
    apply: (player) => {
      player.increaseDamage(2);
    },
  },
  {
    id: "common-punch-speed-1",
    title: "Быстрые руки",
    description: "+15% к скорости ударов",
    rarity: "common",
    direction: "attack-speed",
    apply: (player) => {
      player.increasePunchSpeed(0.15);
    },
  },
  {
    id: "common-stamina-volume-1",
    title: "Второе дыхание",
    description: "+15 к максимуму выносливости",
    rarity: "common",
    direction: "stamina-volume",
    apply: (player) => {
      player.increaseMaxStamina(15);
    },
  },
  {
    id: "common-stamina-cost-1",
    title: "Легкий удар",
    description: "-1 к затратам выносливости",
    rarity: "common",
    direction: "stamina-cost",
    apply: (player) => {
      player.decreaseStaminaCost(1);
    },
  },
  {
    id: "common-health-1",
    title: "Крепкий корпус",
    description: "+10 к максимуму здоровья",
    rarity: "common",
    direction: "health",
    apply: (player) => {
      player.increaseMaxHealth(10);
    },
  },
];

const upgradesByRarity: Record<UpgradeRarity, Upgrade[]> = {
  common: commonUpgrades,
  rare: [],
  epic: [],
};

export class UpgradePool {
  static getRandomChoices(count = 3) {
    const pool = [...upgradesByRarity.common];
    const choices: Upgrade[] = [];

    while (choices.length < count && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const [upgrade] = pool.splice(index, 1);

      choices.push(upgrade);
    }

    return choices;
  }
}
