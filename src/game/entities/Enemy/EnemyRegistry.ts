import type { Scene } from "phaser";
import type { EnemySpawnKind } from "../../progression/types";
import type { EnemySpawnSlot } from "./types";
import type { Enemy } from "./Enemy";
import { FirstDifficultyBoss } from "./LowGradeEnemies/FirstDifficulty/FirstDifficultyBoss";
import { FirstDifficultyEnemy } from "./LowGradeEnemies/FirstDifficulty/FirstDifficultyEnemy";
import { SecondDifficultyBoss } from "./LowGradeEnemies/SecondDifficulty/SecondDifficultyBoss";
import { SecondDifficultyEnemy } from "./LowGradeEnemies/SecondDifficulty/SecondDifficultyEnemy";
import { PunchingBag } from "./PunchingBag/PunchingBag";

type EnemyRegistryItem = {
  preload: (scene: Scene) => void;
  create: (scene: Scene, slot: EnemySpawnSlot) => Enemy;
  isBoss?: boolean;
};

const enemyRegistry: Record<EnemySpawnKind, EnemyRegistryItem> = {
  training: {
    preload: PunchingBag.preload,
    create: (scene, slot) => new PunchingBag(scene, slot),
  },
  "first-difficulty-enemy": {
    preload: FirstDifficultyEnemy.preload,
    create: (scene, slot) => new FirstDifficultyEnemy(scene, slot),
  },
  "first-difficulty-boss": {
    preload: FirstDifficultyBoss.preload,
    create: (scene, slot) => new FirstDifficultyBoss(scene, slot),
    isBoss: true,
  },
  "second-difficulty-enemy": {
    preload: SecondDifficultyEnemy.preload,
    create: (scene, slot) => new SecondDifficultyEnemy(scene, slot),
  },
  "second-difficulty-boss": {
    preload: SecondDifficultyBoss.preload,
    create: (scene, slot) => new SecondDifficultyBoss(scene, slot),
    isBoss: true,
  },
};

export class EnemyRegistry {
  static preload(scene: Scene) {
    Object.values(enemyRegistry).forEach((enemy) => {
      enemy.preload(scene);
    });
  }

  static create(
    enemySpawnKind: EnemySpawnKind,
    scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    return enemyRegistry[enemySpawnKind].create(scene, slot);
  }

  static isBoss(enemySpawnKind: EnemySpawnKind) {
    return Boolean(enemyRegistry[enemySpawnKind].isBoss);
  }

  static isTraining(enemySpawnKind?: EnemySpawnKind) {
    return enemySpawnKind === "training";
  }
}
