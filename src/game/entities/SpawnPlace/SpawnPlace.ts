import { Math as PhaserMath } from "phaser";
import type { Scene } from "phaser";
import type { HitSoundPlayer } from "../../audio/HitSoundPlayer";
import type {
  EnemySpawnKind,
  GameLevelController,
} from "../../progression/GameLevelController";
import type { Gloves } from "../Gloves/Gloves";
import type { Player } from "../Player/Player";
import type { Enemy } from "../Enemy/Enemy";
import { FirstDifficultyBoss } from "../Enemy/LowGradeEnemies/FirstDifficulty/FirstDifficultyBoss";
import { FirstDifficultyEnemy } from "../Enemy/LowGradeEnemies/FirstDifficulty/FirstDifficultyEnemy";
import { SecondDifficultyEnemy } from "../Enemy/LowGradeEnemies/SecondDifficulty/SecondDifficultyEnemy";
import { PunchingBag } from "../Enemy/PunchingBag/PunchingBag";
import type { EnemySpawnSlot } from "../Enemy/types";

type EnemyDefeatedCallback = (
  enemy: Enemy,
  position: { x: number; y: number },
) => void;

export class SpawnPlace {
  private static readonly hitEffectKeys = [
    "hit-effect-punch",
    "hit-effect-boom",
    "hit-effect-pow",
  ];
  private static readonly hitEffectAreaSize = {
    width: 190,
    height: 260,
  };

  private currentEnemyValue?: Enemy;
  private currentEnemySpawnKind?: EnemySpawnKind;
  private currentBossId?: string;
  private isEnemyDeathAnimationPlaying = false;

  constructor(
    private readonly scene: Scene,
    readonly slot: EnemySpawnSlot,
    private readonly levelController: GameLevelController,
    private readonly player: Player,
    private readonly gloves: Gloves,
    private readonly hitSoundPlayer: HitSoundPlayer,
    private readonly onEnemyDefeated?: EnemyDefeatedCallback,
  ) {
    this.spawnNextEnemy();
  }

  static preload(scene: Scene) {
    PunchingBag.preload(scene);
    FirstDifficultyEnemy.preload(scene);
    FirstDifficultyBoss.preload(scene);
    SecondDifficultyEnemy.preload(scene);
    scene.load.image("hit-effect-punch", "assets/images/effects/punch.png");
    scene.load.image("hit-effect-boom", "assets/images/effects/boom.png");
    scene.load.image("hit-effect-pow", "assets/images/effects/pow.png");
  }

  get currentEnemy() {
    return this.currentEnemyValue;
  }

  get isDeathAnimationPlaying() {
    return this.isEnemyDeathAnimationPlaying;
  }

  spawnNextEnemy() {
    this.destroyCurrentEnemy();
    this.isEnemyDeathAnimationPlaying = false;

    this.currentEnemySpawnKind = this.levelController.getCurrentEnemySpawnKind();
    this.currentBossId = this.getBossIdForSpawnKind(this.currentEnemySpawnKind);
    if (this.currentBossId) {
      this.levelController.startBossFight(this.currentBossId);
    }

    this.currentEnemyValue = this.createEnemyBySpawnKind(
      this.currentEnemySpawnKind,
    );
    this.currentEnemyValue.onHit(() => this.handleEnemyHit());

    return this.currentEnemyValue;
  }

  update(deltaSeconds: number) {
    this.currentEnemyValue?.update(deltaSeconds, this.player);
  }

  destroyCurrentEnemy() {
    if (this.currentBossId) {
      this.levelController.stopBossFight(this.currentBossId);
    }

    this.currentEnemyValue?.destroy();
    this.currentEnemyValue = undefined;
    this.currentEnemySpawnKind = undefined;
    this.currentBossId = undefined;
  }

  private handleEnemyHit() {
    const enemy = this.currentEnemyValue;

    if (
      !enemy ||
      this.isEnemyDeathAnimationPlaying ||
      !this.gloves.canPunch() ||
      !this.player.hit()
    ) {
      return false;
    }

    const enemySurvived = enemy.takeDamage(this.player.damagePerHit);

    this.hitSoundPlayer.playRandom();
    this.playHitEffect();
    this.gloves.punch(this.player.getPunchAnimationDurationMs());

    if (!enemySurvived) {
      const defeatedBossId = this.currentBossId;

      this.player.gainXp(enemy.xpReward);
      this.onEnemyDefeated?.(enemy, {
        x: this.slot.x,
        y: this.slot.y,
      });
      this.isEnemyDeathAnimationPlaying = true;
      enemy.playDeathAnimation(() => {
        if (defeatedBossId) {
          this.levelController.markBossDefeated(defeatedBossId);
        }

        if (this.currentEnemyValue === enemy) {
          this.currentEnemyValue = undefined;
        }

        this.spawnNextEnemy();
      });

      return true;
    }

    if (this.shouldReplaceTrainingEnemy(enemy)) {
      this.spawnNextEnemy();
    }

    return true;
  }

  private createEnemyBySpawnKind(enemySpawnKind: EnemySpawnKind) {
    switch (enemySpawnKind) {
      case "training":
        return new PunchingBag(this.scene, this.slot);
      case "first-difficulty-enemy":
        return new FirstDifficultyEnemy(this.scene, this.slot);
      case "first-difficulty-boss":
        return new FirstDifficultyBoss(this.scene, this.slot);
      case "second-difficulty-enemy":
        return new SecondDifficultyEnemy(this.scene, this.slot);
    }
  }

  private getBossIdForSpawnKind(enemySpawnKind: EnemySpawnKind) {
    if (enemySpawnKind !== "first-difficulty-boss") {
      return undefined;
    }

    return this.levelController.getPendingBossIdForCurrentLevel();
  }

  private shouldReplaceTrainingEnemy(enemy: Enemy) {
    return (
      this.levelController.getCurrentEnemyDifficulty() !== "training" &&
      enemy instanceof PunchingBag
    );
  }

  private playHitEffect() {
    const effectKey = SpawnPlace.randomItem(SpawnPlace.hitEffectKeys);
    const effectPosition = this.getRandomPointInSlot();
    const effect = this.scene.add
      .image(effectPosition.x, effectPosition.y, effectKey)
      .setDisplaySize(100, 100)
      .setRotation(PhaserMath.DegToRad(PhaserMath.Between(-10, 10)))
      .setAlpha(0)
      .setDepth(10);
    const baseScaleX = effect.scaleX;
    const baseScaleY = effect.scaleY;

    effect.setScale(baseScaleX * 0.65, baseScaleY * 0.65);

    this.scene.tweens.add({
      targets: effect,
      alpha: 1,
      scaleX: baseScaleX,
      scaleY: baseScaleY,
      duration: 90,
      ease: "Back.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: effect,
          alpha: 0,
          scaleX: baseScaleX * 0.9,
          scaleY: baseScaleY * 0.9,
          duration: 190,
          ease: "Quad.easeIn",
          onComplete: () => {
            effect.destroy();
          },
        });
      },
    });
  }

  private getRandomPointInSlot() {
    const halfWidth = SpawnPlace.hitEffectAreaSize.width / 2;
    const halfHeight = SpawnPlace.hitEffectAreaSize.height / 2;

    return {
      x: PhaserMath.Between(this.slot.x - halfWidth, this.slot.x + halfWidth),
      y: PhaserMath.Between(
        this.slot.y - halfHeight + 40,
        this.slot.y + halfHeight + 40,
      ),
    };
  }

  private static randomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }
}
