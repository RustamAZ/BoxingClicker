import { Math as PhaserMath } from "phaser";
import type { Scene } from "phaser";
import type { HitSoundPlayer } from "../../audio/HitSoundPlayer";
import type { GameLevelController } from "../../progression/GameLevelController";
import type { EnemySpawnKind } from "../../progression/types";
import type { GlovesCombatProfile } from "../Gloves/types";
import type { Gloves } from "../Gloves/Gloves";
import type { Player } from "../Player/Player";
import type { Enemy } from "../Enemy/Enemy";
import { EnemyRegistry } from "../Enemy/EnemyRegistry";
import type { EnemySpawnSlot } from "../Enemy/types";

type EnemyDefeatedCallback = (
  enemy: Enemy,
  position: { x: number; y: number },
) => void;

export class SpawnPlace {
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
    EnemyRegistry.preload(scene);
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
    const enemy = this.currentEnemyValue;

    enemy.onSelfDefeated(() => {
      this.handleEnemySelfDefeated(enemy);
    });

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
      !this.player.hit(this.gloves.getStaminaCostMultiplier())
    ) {
      return false;
    }

    const currentWeapon = this.gloves.getCurrentWeapon();
    const enemySurvived = enemy.takeDamage(
      this.player.getDamagePerHit(currentWeapon.damageMultiplier),
    );

    this.hitSoundPlayer.playRandom(
      currentWeapon.hitSoundKeys,
      currentWeapon.hitSoundVolume,
    );
    this.playHitEffect(currentWeapon);
    this.gloves.punch(
      this.player.getPunchAnimationDurationMs(
        currentWeapon.attackSpeedMultiplier,
      ),
    );

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

    if (this.shouldReplaceTrainingEnemy()) {
      this.spawnNextEnemy();
    }

    return true;
  }

  private handleEnemySelfDefeated(enemy?: Enemy) {
    if (
      !enemy ||
      enemy !== this.currentEnemyValue ||
      this.isEnemyDeathAnimationPlaying
    ) {
      return;
    }

    const defeatedBossId = this.currentBossId;

    if (defeatedBossId) {
      this.levelController.markBossDefeated(defeatedBossId);
    }

    this.currentEnemyValue = undefined;
    this.currentEnemySpawnKind = undefined;
    this.currentBossId = undefined;
    this.spawnNextEnemy();
  }

  private createEnemyBySpawnKind(enemySpawnKind: EnemySpawnKind) {
    return EnemyRegistry.create(enemySpawnKind, this.scene, this.slot);
  }

  private getBossIdForSpawnKind(enemySpawnKind: EnemySpawnKind) {
    if (!EnemyRegistry.isBoss(enemySpawnKind)) {
      return undefined;
    }

    return this.levelController.getPendingBossIdForCurrentLevel();
  }

  private shouldReplaceTrainingEnemy() {
    return (
      !this.levelController.isTrainingLevel() &&
      EnemyRegistry.isTraining(this.currentEnemySpawnKind)
    );
  }

  private playHitEffect(currentWeapon: GlovesCombatProfile) {
    if (currentWeapon.hitEffectKeys.length === 0) {
      return;
    }

    const effectKey = SpawnPlace.randomItem(currentWeapon.hitEffectKeys);
    const effectPosition = this.getRandomPointInSlot();
    const effect = this.scene.add
      .image(effectPosition.x, effectPosition.y, effectKey)
      .setDisplaySize(
        currentWeapon.hitEffectSize,
        currentWeapon.hitEffectSize,
      )
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
