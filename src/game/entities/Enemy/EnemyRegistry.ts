import type { Scene } from "phaser";
import type { EnemySpawnKind } from "../../progression/types";
import type { EnemySpawnSlot } from "./types";
import type { Enemy } from "./Enemy";
import type { FourDifficultyStalkerState } from "./LowGradeEnemies/FourDifficulty/FourDifficultyStalker";
import { FirstDifficultyBoss } from "./LowGradeEnemies/FirstDifficulty/FirstDifficultyBoss";
import { FirstDifficultyEnemy } from "./LowGradeEnemies/FirstDifficulty/FirstDifficultyEnemy";
import { SecondDifficultyBoss } from "./LowGradeEnemies/SecondDifficulty/SecondDifficultyBoss";
import { SecondDifficultyEnemy } from "./LowGradeEnemies/SecondDifficulty/SecondDifficultyEnemy";
import { PunchingBag } from "./PunchingBag/PunchingBag";
import { ThirdDifficultyBoss } from "./LowGradeEnemies/ThirdDifficulty/ThirdDifficultyBoss";
import { ThirdDifficultyEnemy } from "./LowGradeEnemies/ThirdDifficulty/ThirdDifficultyEnemy";
import { FourDifficultyBoss } from "./LowGradeEnemies/FourDifficulty/FourDifficultyBoss";
import { FourDifficultyEnemy } from "./LowGradeEnemies/FourDifficulty/FourDifficultyEnemy";
import { FourDifficultyStalker } from "./LowGradeEnemies/FourDifficulty/FourDifficultyStalker";
import { FiveDifficultyBoss } from "./LowGradeEnemies/FiveDifficulty/FiveDifficultyBoss";
import { FiveDifficultyEnemy } from "./LowGradeEnemies/FiveDifficulty/FiveDifficultyEnemy";
import { InfinityTowerEnemy } from "./InfinityTower/InfinityTowerEnemy";
import type { InfinityTowerEnemyStats } from "../../configs/infinityTower";

export type EnemySpawnContext = {
  fourDifficultyStalkerState?: FourDifficultyStalkerState;
  infinityTowerEnemyStats?: InfinityTowerEnemyStats;
};

type EnemyRegistryItem = {
  preload: (scene: Scene) => void;
  create: (
    scene: Scene,
    slot: EnemySpawnSlot,
    context?: EnemySpawnContext,
  ) => Enemy;
  isBoss?: boolean;
  isEncounter?: boolean;
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
  "third-difficulty-enemy": {
    preload: ThirdDifficultyEnemy.preload,
    create: (scene, slot) => new ThirdDifficultyEnemy(scene, slot),
  },
  "third-difficulty-boss": {
    preload: ThirdDifficultyBoss.preload,
    create: (scene, slot) => new ThirdDifficultyBoss(scene, slot),
    isBoss: true,
  },
  "four-difficulty-enemy": {
    preload: FourDifficultyEnemy.preload,
    create: (scene, slot) => new FourDifficultyEnemy(scene, slot),
  },
  "four-difficulty-stalker": {
    preload: FourDifficultyStalker.preload,
    create: (scene, slot, context) =>
      new FourDifficultyStalker(
        scene,
        slot,
        context?.fourDifficultyStalkerState ?? "passive",
      ),
    isEncounter: true,
  },
  "four-difficulty-boss": {
    preload: FourDifficultyBoss.preload,
    create: (scene, slot) => new FourDifficultyBoss(scene, slot),
    isBoss: true,
  },
  "five-difficulty-enemy": {
    preload: FiveDifficultyEnemy.preload,
    create: (scene, slot) => new FiveDifficultyEnemy(scene, slot),
  },
  "five-difficulty-boss": {
    preload: FiveDifficultyBoss.preload,
    create: (scene, slot) => new FiveDifficultyBoss(scene, slot),
    isBoss: true,
  },
  "infinity-tower-enemy": {
    preload: InfinityTowerEnemy.preload,
    create: (scene, slot, context) => {
      if (!context?.infinityTowerEnemyStats) {
        throw new Error("Infinity tower enemy stats are required");
      }

      return new InfinityTowerEnemy(
        scene,
        slot,
        context.infinityTowerEnemyStats,
      );
    },
  },
};

export class EnemyRegistry {
  static preload(scene: Scene) {
    Object.values(enemyRegistry).forEach((enemy) => {
      enemy.preload(scene);
    });
  }

  static preloadSpawnKind(scene: Scene, enemySpawnKind: EnemySpawnKind) {
    enemyRegistry[enemySpawnKind].preload(scene);
  }

  static create(
    enemySpawnKind: EnemySpawnKind,
    scene: Scene,
    slot: EnemySpawnSlot,
    context?: EnemySpawnContext,
  ) {
    return enemyRegistry[enemySpawnKind].create(scene, slot, context);
  }

  static isBoss(enemySpawnKind: EnemySpawnKind) {
    return Boolean(enemyRegistry[enemySpawnKind].isBoss);
  }

  static isTraining(enemySpawnKind?: EnemySpawnKind) {
    return enemySpawnKind === "training";
  }

  static isEncounter(enemySpawnKind?: EnemySpawnKind) {
    if (!enemySpawnKind) {
      return false;
    }

    return Boolean(enemyRegistry[enemySpawnKind].isEncounter);
  }
}
