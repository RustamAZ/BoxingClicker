import type { Scene } from "phaser";
import { GameBackground } from "../entities/Background/GameBackground";
import { EnemyRegistry } from "../entities/Enemy/EnemyRegistry";
import { gameLevelsConfig } from "./gameLevelsConfig";
import type { EnemySpawnKind, GameLevelConfig } from "./types";

export class LocationAssetPreloader {
  private static readonly initialGameLevelsCount = 2;
  private static readonly encounterSpawnKinds: EnemySpawnKind[] = [
    "four-difficulty-stalker",
  ];

  private readonly loadedGameLevels = new Set<number>();
  private readonly loadingGameLevels = new Set<number>();
  private readonly loadedEnemySpawnKinds = new Set<EnemySpawnKind>();

  static preloadInitial(scene: Scene) {
    LocationAssetPreloader.preloadGameLevels(
      scene,
      gameLevelsConfig.slice(0, LocationAssetPreloader.initialGameLevelsCount),
    );
  }

  constructor(private readonly scene: Scene) {
    gameLevelsConfig
      .slice(0, LocationAssetPreloader.initialGameLevelsCount)
      .forEach((gameLevel) => {
        this.markGameLevelLoaded(gameLevel);
      });
  }

  prefetchNextGameLevel(currentGameLevel: number) {
    const nextGameLevel = this.getNextGameLevel(currentGameLevel);

    if (!nextGameLevel) {
      return;
    }

    this.prefetchGameLevel(nextGameLevel);
  }

  isGameLevelLoaded(gameLevel: number) {
    return this.loadedGameLevels.has(gameLevel);
  }

  private prefetchGameLevel(gameLevel: GameLevelConfig) {
    if (
      this.loadedGameLevels.has(gameLevel.level) ||
      this.loadingGameLevels.has(gameLevel.level)
    ) {
      return;
    }

    const spawnKindsToLoad =
      this.getSpawnKindsForGameLevel(gameLevel).filter(
        (spawnKind) => !this.loadedEnemySpawnKinds.has(spawnKind),
      );
    const shouldLoadBackground = !this.scene.textures.exists(
      gameLevel.background.key,
    );
    const hasFilesToLoad =
      shouldLoadBackground || spawnKindsToLoad.length > 0;

    if (!hasFilesToLoad) {
      this.markGameLevelLoaded(gameLevel);
      return;
    }

    this.loadingGameLevels.add(gameLevel.level);

    if (shouldLoadBackground) {
      GameBackground.preloadBackground(this.scene, gameLevel.background);
    }

    spawnKindsToLoad.forEach((spawnKind) => {
      EnemyRegistry.preloadSpawnKind(this.scene, spawnKind);
    });

    this.scene.load.once("complete", () => {
      this.loadingGameLevels.delete(gameLevel.level);
      this.loadedGameLevels.add(gameLevel.level);
      spawnKindsToLoad.forEach((spawnKind) => {
        this.loadedEnemySpawnKinds.add(spawnKind);
      });
    });

    if (!this.scene.load.isLoading()) {
      this.scene.load.start();
    }
  }

  private markGameLevelLoaded(gameLevel: GameLevelConfig) {
    this.loadedGameLevels.add(gameLevel.level);
    this.getSpawnKindsForGameLevel(gameLevel).forEach((spawnKind) => {
      this.loadedEnemySpawnKinds.add(spawnKind);
    });
  }

  private getNextGameLevel(currentGameLevel: number) {
    const currentIndex = gameLevelsConfig.findIndex(
      (gameLevel) => gameLevel.level === currentGameLevel,
    );

    if (currentIndex < 0) {
      return undefined;
    }

    return gameLevelsConfig[currentIndex + 1];
  }

  private static preloadGameLevels(
    scene: Scene,
    gameLevels: readonly GameLevelConfig[],
  ) {
    const backgroundKeys = new Set<string>();
    const spawnKinds = new Set<EnemySpawnKind>();

    gameLevels.forEach((gameLevel) => {
      if (!backgroundKeys.has(gameLevel.background.key)) {
        GameBackground.preloadBackground(scene, gameLevel.background);
        backgroundKeys.add(gameLevel.background.key);
      }

      LocationAssetPreloader.getSpawnKindsForGameLevel(gameLevel).forEach(
        (spawnKind) => {
          spawnKinds.add(spawnKind);
        },
      );
    });

    spawnKinds.forEach((spawnKind) => {
      EnemyRegistry.preloadSpawnKind(scene, spawnKind);
    });
  }

  private static getSpawnKindsForGameLevel(gameLevel: GameLevelConfig) {
    const spawnKinds = new Set<EnemySpawnKind>([
      gameLevel.enemySpawnKind,
      ...LocationAssetPreloader.encounterSpawnKinds,
    ]);

    if (gameLevel.boss) {
      spawnKinds.add(gameLevel.boss.enemySpawnKind);
    }

    return [...spawnKinds];
  }

  private getSpawnKindsForGameLevel(gameLevel: GameLevelConfig) {
    return LocationAssetPreloader.getSpawnKindsForGameLevel(gameLevel);
  }
}
