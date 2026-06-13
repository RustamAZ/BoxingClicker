import { GameObjects, Scene } from "phaser";
import {
  firstEnemyConfig,
  toEnemyStatRange,
} from "../../../../configs/enemies";
import { Enemy } from "../../Enemy";
import {
  preloadEnemyVariants,
  type EnemySpawnSlot,
  type EnemyVariantConfig,
} from "../../types";
import { randomInt } from "../../../../utils/randomInt";
import { randomFloat } from "../../../../utils/randomFloat";
import { randomItem } from "../../../../utils/randomItem";

export class FirstDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly variants: EnemyVariantConfig[] = [
    {
      displayName: "Village Farmer",
      alive: {
        key: "first-difficulty-human-1",
        path: "assets/images/enemies/first-difficulty/human-v1.png",
      },
      dead: {
        key: "first-difficulty-human-1-dead",
        path: "assets/images/enemies/first-difficulty/human-v1-die.png",
      },
    },
    {
      displayName: "Village Guard",
      alive: {
        key: "first-difficulty-human-2",
        path: "assets/images/enemies/first-difficulty/human-v2.png",
      },
      dead: {
        key: "first-difficulty-human-2-dead",
        path: "assets/images/enemies/first-difficulty/human-v2-die.png",
      },
    },
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    preloadEnemyVariants(scene, FirstDifficultyEnemy.variants);
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const variant = randomItem(FirstDifficultyEnemy.variants);

    super({
      displayName: variant.displayName,
      maxHealth: randomInt(
        toEnemyStatRange(firstEnemyConfig.health_range),
      ),
      xpReward: firstEnemyConfig.xp_reward,
      diamondsReward: firstEnemyConfig.buff_container_reward,
      coinsReward: firstEnemyConfig.lootbox_container_reward,
      emeraldDropChance: firstEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(
        toEnemyStatRange(firstEnemyConfig.damage_range),
      ),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(firstEnemyConfig.attack_speed_range),
      ),
      initialAttackDelaySeconds: randomFloat(
        toEnemyStatRange(firstEnemyConfig.initial_attack_delay_range),
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
      scaleX: baseScaleX * FirstDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FirstDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: FirstDifficultyEnemy.attackAnimationDurationMs,
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
        FirstDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + FirstDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FirstDifficultyEnemy.deathAnimationDurationMs,
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
