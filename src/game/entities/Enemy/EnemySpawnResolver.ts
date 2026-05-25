import type { EnemySpawnKind } from "../../progression/types";
import type { EnemySpawnContext } from "./EnemyRegistry";

export type ResolvedEnemySpawn = {
  enemySpawnKind: EnemySpawnKind;
  context?: EnemySpawnContext;
};

export class EnemySpawnResolver {
  private static readonly stalkerChance = 0.1;
  private static readonly stalkerEligibleEnemySpawnKinds: EnemySpawnKind[] = [
    "first-difficulty-enemy",
    "second-difficulty-enemy",
    "third-difficulty-enemy",
    "four-difficulty-enemy",
    "five-difficulty-enemy",
  ];

  private hasFourDifficultyStalkerBeenHit = false;

  resolve(enemySpawnKind: EnemySpawnKind): ResolvedEnemySpawn {
    if (
      !EnemySpawnResolver.stalkerEligibleEnemySpawnKinds.includes(
        enemySpawnKind,
      ) ||
      Math.random() > EnemySpawnResolver.stalkerChance
    ) {
      return { enemySpawnKind };
    }

    return {
      enemySpawnKind: "four-difficulty-stalker",
      context: {
        fourDifficultyStalkerState: this.hasFourDifficultyStalkerBeenHit
          ? "aggressive"
          : "passive",
      },
    };
  }

  markFourDifficultyStalkerHit() {
    this.hasFourDifficultyStalkerBeenHit = true;
  }
}
