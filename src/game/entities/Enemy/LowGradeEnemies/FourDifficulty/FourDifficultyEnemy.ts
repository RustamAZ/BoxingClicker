import { GameObjects, Scene } from "phaser";
import {
  fourthEnemyConfig,
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

export class FourDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly variants: EnemyVariantConfig[] = [
    {
      displayName: "Black Skeleton",
      alive: {
        key: "four-difficulty-black-skeleton-1",
        path: "assets/images/enemies/four-difficulty/black-skeleton-v1.png",
      },
      dead: {
        key: "four-difficulty-black-skeleton-1-dead",
        path: "assets/images/enemies/four-difficulty/black-skeleton-v1-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
    {
      displayName: "Myth Zombie",
      alive: {
        key: "four-difficulty-myth-zombie-1",
        path: "assets/images/enemies/four-difficulty/myth-zombie-v1.png",
      },
      dead: {
        key: "four-difficulty-myth-zombie-1-dead",
        path: "assets/images/enemies/four-difficulty/myth-zombie-v1-die.png",
      },
      deathSound: enemyDeathSounds.zombie,
    },
    {
      displayName: "Frozen Bower",
      alive: {
        key: "four-difficulty-frozen-bower-1",
        path: "assets/images/enemies/four-difficulty/frozen-bower-v1.png",
      },
      dead: {
        key: "four-difficulty-frozen-bower-1-dead",
        path: "assets/images/enemies/four-difficulty/frozen-bower-v1-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    preloadEnemyVariants(scene, FourDifficultyEnemy.variants);
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const variant = randomItem(FourDifficultyEnemy.variants);

    super({
      displayName: variant.displayName,
      maxHealth: randomInt(toEnemyStatRange(fourthEnemyConfig.health_range)),
      xpReward: fourthEnemyConfig.xp_reward,
      diamondsReward: fourthEnemyConfig.buff_container_reward,
      coinsReward: fourthEnemyConfig.lootbox_container_reward,
      emeraldDropChance: fourthEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(toEnemyStatRange(fourthEnemyConfig.damage_range)),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(fourthEnemyConfig.attack_speed_range),
      ),
      initialAttackDelaySeconds: randomFloat(
        toEnemyStatRange(fourthEnemyConfig.initial_attack_delay_range),
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
      scaleX: baseScaleX * FourDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FourDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: FourDifficultyEnemy.attackAnimationDurationMs,
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
      x: this.slot.x + FourDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + FourDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FourDifficultyEnemy.deathAnimationDurationMs,
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
