import type { GameLevelConfig } from "./types";

export const gameLevelStartPlayerLevels = {
  lobby: 1,
  village: 2,
  cave: 7,
  dungeon: 12,
} as const;

export const gameLevelBossPlayerLevels = {
  firstDifficultyBoss: gameLevelStartPlayerLevels.cave,
  secondDifficultyBoss: gameLevelStartPlayerLevels.dungeon,
} as const;

export const gameLevelsConfig: readonly GameLevelConfig[] = [
  {
    level: 1,
    startPlayerLevel: gameLevelStartPlayerLevels.lobby,
    background: {
      key: "home-background",
      path: "assets/images/backgrounds/home.png",
    },
    enemyDifficulty: "training",
    enemySpawnKind: "training",
    music: "menu-and-lobby",
  },
  {
    level: 2,
    startPlayerLevel: gameLevelStartPlayerLevels.village,
    background: {
      key: "village-background",
      path: "assets/images/backgrounds/village.png",
    },
    enemyDifficulty: "first",
    enemySpawnKind: "first-difficulty-enemy",
    music: "action",
    boss: {
      id: "first-difficulty-boss",
      requiredPlayerLevel: gameLevelBossPlayerLevels.firstDifficultyBoss,
      enemySpawnKind: "first-difficulty-boss",
    },
  },
  {
    level: 3,
    startPlayerLevel: gameLevelStartPlayerLevels.cave,
    background: {
      key: "cave-background",
      path: "assets/images/backgrounds/cave.png",
    },
    enemyDifficulty: "second",
    enemySpawnKind: "second-difficulty-enemy",
    music: "action",
    boss: {
      id: "second-difficulty-boss",
      requiredPlayerLevel: gameLevelBossPlayerLevels.secondDifficultyBoss,
      enemySpawnKind: "second-difficulty-boss",
    },
  },
  {
    level: 4,
    startPlayerLevel: gameLevelStartPlayerLevels.dungeon,
    background: {
      key: "dungeon-background",
      path: "assets/images/backgrounds/dungeon.png",
    },
    enemyDifficulty: "second",
    enemySpawnKind: "second-difficulty-enemy",
    music: "action",
  },
];
