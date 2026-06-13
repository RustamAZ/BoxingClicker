import { GameObjects, Scene } from "phaser";
import {
  secondEnemyConfig,
  toEnemyStatRange,
} from "../../../../configs/enemies";
import { enemyDeathSounds } from "../../../../configs/enemyDeathSounds";
import { Enemy } from "../../Enemy";
import {
  preloadEnemyVariants,
  type EnemySpawnSlot,
  type EnemyVariantConfig,
} from "../../types";
import { randomItem } from "../../../../utils/randomItem";
import { randomInt } from "../../../../utils/randomInt";
import { randomFloat } from "../../../../utils/randomFloat";

export class SecondDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly variants: EnemyVariantConfig[] = [
    {
      displayName: "Zombie",
      alive: {
        key: "second-difficulty-zombie-1",
        path: "assets/images/enemies/second-difficulty/zombie-v1.png",
      },
      dead: {
        key: "second-difficulty-zombie-1-dead",
        path: "assets/images/enemies/second-difficulty/zombie-v1-die.png",
      },
      deathSound: enemyDeathSounds.zombie,
    },
    {
      displayName: "Zombie",
      alive: {
        key: "second-difficulty-zombie-2",
        path: "assets/images/enemies/second-difficulty/zombie-v2.png",
      },
      dead: {
        key: "second-difficulty-zombie-2-dead",
        path: "assets/images/enemies/second-difficulty/zombie-v2-die.png",
      },
      deathSound: enemyDeathSounds.zombie,
    },
    {
      displayName: "Skeleton",
      alive: {
        key: "second-difficulty-skeleton-1",
        path: "assets/images/enemies/second-difficulty/skeleton-v1.png",
      },
      dead: {
        key: "second-difficulty-skeleton-1-dead",
        path: "assets/images/enemies/second-difficulty/skeleton-v1-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
    {
      displayName: "Skeleton",
      alive: {
        key: "second-difficulty-skeleton-2",
        path: "assets/images/enemies/second-difficulty/skeleton-v2.png",
      },
      dead: {
        key: "second-difficulty-skeleton-2-dead",
        path: "assets/images/enemies/second-difficulty/skeleton-v2-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    preloadEnemyVariants(scene, SecondDifficultyEnemy.variants);
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const variant = randomItem(SecondDifficultyEnemy.variants);

    super({
      displayName: variant.displayName,
      maxHealth: randomInt(
        toEnemyStatRange(secondEnemyConfig.health_range),
      ),
      xpReward: secondEnemyConfig.xp_reward,
      diamondsReward: secondEnemyConfig.buff_container_reward,
      coinsReward: secondEnemyConfig.lootbox_container_reward,
      emeraldDropChance: secondEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(
        toEnemyStatRange(secondEnemyConfig.damage_range),
      ),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(secondEnemyConfig.attack_speed_range),
      ),
      initialAttackDelaySeconds: randomFloat(
        toEnemyStatRange(secondEnemyConfig.initial_attack_delay_range),
      ),
      deathSound: variant.deathSound,
    });

    this.slot = slot;
    this.deathSpriteKey = variant.dead.key;
    this.body = scene.add
      .image(slot.x, slot.y, variant.alive.key)
      .setDisplaySize(slot.width, slot.height)
      .setInteractive({ useHandCursor: true });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack() {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * SecondDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * SecondDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: SecondDifficultyEnemy.attackAnimationDurationMs,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.body.disableInteractive();
    this.body.setTexture(this.deathSpriteKey);
    this.body.setDisplaySize(this.slot.width, this.slot.height);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x:
        this.slot.x +
        SecondDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + SecondDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: SecondDifficultyEnemy.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.body.destroy();
  }
}
