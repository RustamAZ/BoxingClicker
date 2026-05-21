import type { Scene } from "phaser";
import type { Player } from "../entities/Player/Player";
import { gameLevelsConfig } from "./gameLevelsConfig";
import type { GameLevelConfig } from "./types";

export class GameLevelController {
  private readonly defeatedBossIds = new Set<string>();
  private activeBossId?: string;

  static preloadBackgrounds(scene: Scene) {
    gameLevelsConfig.forEach((level) => {
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

  shouldShowResourceContainers() {
    return !this.isTrainingLevel();
  }

  shouldShowShopModal() {
    return this.isTrainingLevel();
  }

  private getCurrentLevelConfig() {
    let currentLevel = gameLevelsConfig[0];

    for (const nextLevel of gameLevelsConfig.slice(1)) {
      if (this.player.sessionLevel < nextLevel.startPlayerLevel) {
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
      this.player.sessionLevel < currentLevel.boss.requiredPlayerLevel ||
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
