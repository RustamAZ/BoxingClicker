import type { GameLevelConfig } from "./types";

export const gameLevelStartPlayerLevels = {
  lobby: 1,
  village: 2,
  cave: 11,
  lowDungeon: 21,
  midDungeon: 26,
  highDungeon: 31,
  hell: 41,
  infinite: 56,
} as const;

export const gameLevelBossPlayerLevels = {
  firstDifficultyBoss: gameLevelStartPlayerLevels.cave,
  secondDifficultyBoss: gameLevelStartPlayerLevels.lowDungeon,
  thirdDifficultyBoss: gameLevelStartPlayerLevels.highDungeon,
  fourDifficultyBoss: gameLevelStartPlayerLevels.hell,
  fiveDifficultyBoss: gameLevelStartPlayerLevels.infinite,
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
    locationId: "village",
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
    locationId: "cave",
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
    locationId: "low-dungeon",
    startPlayerLevel: gameLevelStartPlayerLevels.lowDungeon,
    background: {
      key: "dungeon-background",
      path: "assets/images/backgrounds/dungeon.png",
    },
    enemyDifficulty: "third",
    enemySpawnKind: "third-difficulty-enemy",
    music: "action",
  },
  {
    level: 5,
    locationId: "mid-dungeon",
    startPlayerLevel: gameLevelStartPlayerLevels.midDungeon,
    background: {
      key: "mid-dungeon-background",
      path: "assets/images/backgrounds/mid-dungeon.png",
    },
    enemyDifficulty: "third",
    enemySpawnKind: "third-difficulty-enemy",
    music: "action",
    boss: {
      id: "third-difficulty-boss",
      requiredPlayerLevel: gameLevelBossPlayerLevels.thirdDifficultyBoss,
      enemySpawnKind: "third-difficulty-boss",
    },
  },
  {
    level: 6,
    locationId: "high-dungeon",
    startPlayerLevel: gameLevelStartPlayerLevels.highDungeon,
    background: {
      key: "high-dungeon-background",
      path: "assets/images/backgrounds/high-dungeon.png",
    },
    enemyDifficulty: "four",
    enemySpawnKind: "four-difficulty-enemy",
    music: "action",
    boss: {
      id: "four-difficulty-boss",
      requiredPlayerLevel: gameLevelBossPlayerLevels.fourDifficultyBoss,
      enemySpawnKind: "four-difficulty-boss",
    },
  },
  {
    level: 7,
    locationId: "hell",
    startPlayerLevel: gameLevelStartPlayerLevels.hell,
    background: {
      key: "hell-background",
      path: "assets/images/backgrounds/hell.png",
    },
    enemyDifficulty: "five",
    enemySpawnKind: "five-difficulty-enemy",
    music: "action",
    boss: {
      id: "five-difficulty-boss",
      requiredPlayerLevel: gameLevelBossPlayerLevels.fiveDifficultyBoss,
      enemySpawnKind: "five-difficulty-boss",
    },
  },
  {
    level: 8,
    locationId: "hell",
    startPlayerLevel: gameLevelStartPlayerLevels.infinite,
    background: {
      key: "infinite-background",
      path: "assets/images/backgrounds/infinite.png",
    },
    enemyDifficulty: "six",
    enemySpawnKind: "five-difficulty-enemy",
    music: "action",
  },
];
