export type EnemyDifficulty = "training" | "first" | "second" | 'third' | 'four' | 'five' | 'six';

export type EnemySpawnKind =
  | "training"
  | "first-difficulty-enemy"
  | "first-difficulty-boss"
  | "second-difficulty-enemy"
  | "second-difficulty-boss"
  | "third-difficulty-enemy"
  | "third-difficulty-boss"
  | "four-difficulty-enemy"
  | "four-difficulty-stalker"
  | "four-difficulty-boss"
  | "five-difficulty-enemy"
  | "five-difficulty-boss";

export type BackgroundMusicId =
  | "menu-and-lobby"
  | "action"
  | "boss-fight"
  | "hell-boss-fight";

export type GameLevelBackgroundConfig = {
  key: string;
  path: string;
};

export type GameLevelBossConfig = {
  id: string;
  requiredPlayerLevel: number;
  enemySpawnKind: EnemySpawnKind;
};

export type GameLevelConfig = {
  level: number;
  startPlayerLevel: number;
  background: GameLevelBackgroundConfig;
  enemyDifficulty: EnemyDifficulty;
  enemySpawnKind: EnemySpawnKind;
  music: BackgroundMusicId;
  boss?: GameLevelBossConfig;
};
