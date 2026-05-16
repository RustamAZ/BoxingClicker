import type { Scene } from "phaser";
import type { Player } from "../entities/Player/Player";

export type EnemyDifficulty = "training" | "first" | "second";
export type EnemySpawnKind =
  | "training"
  | "first-difficulty-enemy"
  | "first-difficulty-boss"
  | "second-difficulty-enemy";
export type BackgroundMusicId = "menu-and-lobby" | "action" | "boss-fight";

export type GameLevelBackgroundConfig = {
  key: string;
  path: string;
};

type GameLevelConfig = {
  level: number;
  startPlayerLevel: number;
  background: GameLevelBackgroundConfig;
  enemyDifficulty: EnemyDifficulty;
  enemySpawnKind: EnemySpawnKind;
  music: BackgroundMusicId;
  boss?: {
    id: string;
    requiredPlayerLevel: number;
    enemySpawnKind: EnemySpawnKind;
  };
};

export class GameLevelController {
  private static readonly lobbyStartPlayerLevel = 1;
  private static readonly villageStartPlayerLevel = 2;
  private static readonly caveStartPlayerLevel = 7;
  private static readonly dungeonStartPlayerLevel = 12;
  private static readonly firstDifficultyBossPlayerLevel =
    GameLevelController.caveStartPlayerLevel;

  private static readonly levels: GameLevelConfig[] = [
    {
      level: 1,
      startPlayerLevel: GameLevelController.lobbyStartPlayerLevel,
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
      startPlayerLevel: GameLevelController.villageStartPlayerLevel,
      background: {
        key: "village-background",
        path: "assets/images/backgrounds/village.png",
      },
      enemyDifficulty: "first",
      enemySpawnKind: "first-difficulty-enemy",
      music: "action",
      boss: {
        id: "first-difficulty-boss",
        requiredPlayerLevel:
          GameLevelController.firstDifficultyBossPlayerLevel,
        enemySpawnKind: "first-difficulty-boss",
      },
    },
    {
      level: 3,
      startPlayerLevel: GameLevelController.caveStartPlayerLevel,
      background: {
        key: "cave-background",
        path: "assets/images/backgrounds/cave.png",
      },
      enemyDifficulty: "second",
      enemySpawnKind: "second-difficulty-enemy",
      music: "action",
    },
    {
      level: 4,
      startPlayerLevel: GameLevelController.dungeonStartPlayerLevel,
      background: {
        key: "dungeon-background",
        path: "assets/images/backgrounds/dungeon.png",
      },
      enemyDifficulty: "second",
      enemySpawnKind: "second-difficulty-enemy",
      music: "action",
    },
  ];

  private readonly defeatedBossIds = new Set<string>();
  private activeBossId?: string;

  static preloadBackgrounds(scene: Scene) {
    GameLevelController.levels.forEach((level) => {
      scene.load.image(level.background.key, level.background.path);
    });
  }

  constructor(private readonly player: Player) {}

  getCurrentGameLevel() {
    return this.getCurrentLevelConfig().level;
  }

  getCurrentBackground() {
    return this.getCurrentLevelConfig().background;
  }

  getCurrentEnemyDifficulty() {
    return this.getCurrentLevelConfig().enemyDifficulty;
  }

  getCurrentEnemySpawnKind() {
    return (
      this.getPendingBossForCurrentLevel()?.enemySpawnKind ??
      this.getCurrentLevelConfig().enemySpawnKind
    );
  }

  getPendingBossIdForCurrentLevel() {
    return this.getPendingBossForCurrentLevel()?.id;
  }

  startBossFight(bossId: string) {
    this.activeBossId = bossId;
  }

  stopBossFight(bossId: string) {
    if (this.activeBossId === bossId) {
      this.activeBossId = undefined;
    }
  }

  markBossDefeated(bossId: string) {
    this.defeatedBossIds.add(bossId);
    this.stopBossFight(bossId);
  }

  getCurrentMusicId() {
    if (this.activeBossId) {
      return "boss-fight";
    }

    return this.getCurrentLevelConfig().music;
  }

  isTrainingLevel() {
    return this.getCurrentEnemyDifficulty() === "training";
  }

  shouldShowRewardContainers() {
    return !this.isTrainingLevel();
  }

  private getCurrentLevelConfig() {
    let currentLevel = GameLevelController.levels[0];

    for (const nextLevel of GameLevelController.levels.slice(1)) {
      if (this.player.level < nextLevel.startPlayerLevel) {
        break;
      }

      if (this.hasLockedBossGate(currentLevel)) {
        break;
      }

      currentLevel = nextLevel;
    }

    return currentLevel;
  }

  private getPendingBossForCurrentLevel() {
    const currentLevel = this.getCurrentLevelConfig();

    if (
      !currentLevel.boss ||
      this.player.level < currentLevel.boss.requiredPlayerLevel ||
      this.defeatedBossIds.has(currentLevel.boss.id)
    ) {
      return undefined;
    }

    return currentLevel.boss;
  }

  private hasLockedBossGate(level: GameLevelConfig) {
    return Boolean(level.boss && !this.defeatedBossIds.has(level.boss.id));
  }
}
