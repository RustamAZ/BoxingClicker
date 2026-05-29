import { GameObjects, Math as PhaserMath } from "phaser";
import type { Scene } from "phaser";
import type { EnemyAttackSoundPlayer } from "../../audio/EnemyAttackSoundPlayer";
import type { EnemyDeathSoundPlayer } from "../../audio/EnemyDeathSoundPlayer";
import type { HitSoundPlayer } from "../../audio/HitSoundPlayer";
import type { GameLevelController } from "../../progression/GameLevelController";
import type { EnemySpawnKind } from "../../progression/types";
import type { GlovesCombatProfile } from "../Gloves/types";
import type { GlovesEquipmentController } from "../Gloves/GlovesEquipmentController";
import type { Player } from "../Player/Player";
import type { Enemy } from "../Enemy/Enemy";
import {
  EnemyRegistry,
  type EnemySpawnContext,
} from "../Enemy/EnemyRegistry";
import { EnemySpawnResolver } from "../Enemy/EnemySpawnResolver";
import type { EnemySpawnSlot } from "../Enemy/types";

type EnemyDefeatedCallback = (
  enemy: Enemy,
  position: { x: number; y: number },
) => void;

type BossEncounteredCallback = (bossId: string) => void;

export class SpawnPlace {
  private static readonly hitEffectAreaSize = {
    width: 190,
    height: 260,
  };
  private static readonly touchHitAreaPaddingY = 150;

  private currentEnemyValue?: Enemy;
  private currentEnemySpawnKind?: EnemySpawnKind;
  private currentBossId?: string;
  private isEnemyDeathAnimationPlaying = false;
  private readonly enemySpawnResolver = new EnemySpawnResolver();
  private readonly touchHitArea: GameObjects.Zone;

  constructor(
    private readonly scene: Scene,
    readonly slot: EnemySpawnSlot,
    private readonly levelController: GameLevelController,
    private readonly player: Player,
    private readonly glovesEquipmentController: GlovesEquipmentController,
    private readonly hitSoundPlayer: HitSoundPlayer,
    private readonly enemyAttackSoundPlayer: EnemyAttackSoundPlayer,
    private readonly enemyDeathSoundPlayer: EnemyDeathSoundPlayer,
    private readonly onEnemyDefeated?: EnemyDefeatedCallback,
    private readonly onBossEncountered?: BossEncounteredCallback,
  ) {
    this.touchHitArea = this.createTouchHitArea();
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

  get canOpenRewardModal() {
    return !this.isEnemyDeathAnimationPlaying && !this.currentBossId;
  }

  spawnNextEnemy() {
    this.destroyCurrentEnemy();
    this.isEnemyDeathAnimationPlaying = false;

    const resolvedEnemySpawn = this.enemySpawnResolver.resolve(
      this.levelController.getCurrentEnemySpawnKind(),
    );

    this.currentEnemySpawnKind = resolvedEnemySpawn.enemySpawnKind;
    this.currentBossId = this.getBossIdForSpawnKind(this.currentEnemySpawnKind);
    if (this.currentBossId) {
      this.levelController.startBossFight(this.currentBossId);
      this.onBossEncountered?.(this.currentBossId);
    }

    this.currentEnemyValue = this.createEnemyBySpawnKind(
      this.currentEnemySpawnKind,
      resolvedEnemySpawn.context,
    );
    this.currentEnemyValue.onHit(() => this.handleEnemyHit());
    const enemy = this.currentEnemyValue;

    enemy.onAttackPerformed(() => {
      if (
        enemy === this.currentEnemyValue &&
        enemy.shouldPlayDefaultAttackSound
      ) {
        this.enemyAttackSoundPlayer.play();
      }
    });

    enemy.onSelfDefeated(() => {
      this.handleEnemySelfDefeated(enemy);
    });

    return this.currentEnemyValue;
  }

  update(deltaSeconds: number) {
    this.currentEnemyValue?.update(deltaSeconds, this.player);
  }

  hitCurrentEnemy() {
    return this.handleEnemyHit();
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

  private createTouchHitArea() {
    return this.scene.add
      .zone(
        this.scene.scale.width / 2,
        this.slot.y,
        this.scene.scale.width,
        this.slot.height + SpawnPlace.touchHitAreaPaddingY,
      )
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.handleEnemyHit();
      });
  }

  private handleEnemyHit() {
    const enemy = this.currentEnemyValue;

    if (
      !enemy ||
      enemy.isDead() ||
      this.isEnemyDeathAnimationPlaying ||
      !this.glovesEquipmentController.canPunch() ||
      !this.player.hit()
    ) {
      return false;
    }

    const currentWeapon = this.glovesEquipmentController.getCurrentWeapon();
    const enemySurvived = enemy.takeDamage(this.player.getDamagePerHit());

    this.hitSoundPlayer.playRandom(
      currentWeapon.hitSoundKeys,
      currentWeapon.hitSoundVolume,
    );
    this.playHitEffect(currentWeapon);
    this.glovesEquipmentController.punch(
      this.player.getPunchAnimationDurationMs(),
    );

    if (!enemySurvived) {
      const defeatedBossId = this.currentBossId;
      const defeatedEnemySpawnKind = this.currentEnemySpawnKind;

      if (defeatedEnemySpawnKind === "four-difficulty-stalker") {
        this.enemySpawnResolver.markFourDifficultyStalkerHit();
      }

      if (!EnemyRegistry.isEncounter(defeatedEnemySpawnKind)) {
        if (
          !defeatedBossId &&
          !EnemyRegistry.isTraining(defeatedEnemySpawnKind)
        ) {
          this.enemyDeathSoundPlayer.play();
        }

        this.player.gainXp(enemy.xpReward);
        this.onEnemyDefeated?.(enemy, {
          x: this.slot.x,
          y: this.slot.y,
        });
      }
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

  private createEnemyBySpawnKind(
    enemySpawnKind: EnemySpawnKind,
    context?: EnemySpawnContext,
  ) {
    return EnemyRegistry.create(enemySpawnKind, this.scene, this.slot, context);
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
