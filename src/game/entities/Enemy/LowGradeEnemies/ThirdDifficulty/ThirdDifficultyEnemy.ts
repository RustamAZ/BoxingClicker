import { GameObjects, Scene } from "phaser";
import {
  thirdEnemyConfig,
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

export class ThirdDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly variants: EnemyVariantConfig[] = [
    {
      displayName: "Spider",
      alive: {
        key: "third-difficulty-spider-1",
        path: "assets/images/enemies/third-difficulty/spider-v1.png",
      },
      dead: {
        key: "third-difficulty-spider-1-dead",
        path: "assets/images/enemies/third-difficulty/spider-v1-die.png",
      },
      deathSound: enemyDeathSounds.spider,
    },
    {
      displayName: "Golden Zombie",
      alive: {
        key: "third-difficulty-golden-zombie-1",
        path: "assets/images/enemies/third-difficulty/golden-zombie-v1.png",
      },
      dead: {
        key: "third-difficulty-golden-zombie-1-dead",
        path: "assets/images/enemies/third-difficulty/golden-zombie-v1-die.png",
      },
      deathSound: enemyDeathSounds.zombie,
    },
    {
      displayName: "Skeleton",
      alive: {
        key: "third-difficulty-skeleton-with-axe-1",
        path: "assets/images/enemies/third-difficulty/skeleton-with-axe-v1.png",
      },
      dead: {
        key: "third-difficulty-skeleton-with-axe-1-dead",
        path: "assets/images/enemies/third-difficulty/skeleton-with-axe-v1-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    preloadEnemyVariants(scene, ThirdDifficultyEnemy.variants);
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const variant = randomItem(ThirdDifficultyEnemy.variants);

    super({
      displayName: variant.displayName,
      maxHealth: randomInt(toEnemyStatRange(thirdEnemyConfig.health_range)),
      xpReward: thirdEnemyConfig.xp_reward,
      diamondsReward: thirdEnemyConfig.buff_container_reward,
      coinsReward: thirdEnemyConfig.lootbox_container_reward,
      emeraldDropChance: thirdEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(toEnemyStatRange(thirdEnemyConfig.damage_range)),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(thirdEnemyConfig.attack_speed_range),
      ),
      initialAttackDelaySeconds: randomFloat(
        toEnemyStatRange(thirdEnemyConfig.initial_attack_delay_range),
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
      scaleX: baseScaleX * ThirdDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * ThirdDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: ThirdDifficultyEnemy.attackAnimationDurationMs,
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
        ThirdDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + ThirdDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: ThirdDifficultyEnemy.deathAnimationDurationMs,
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
