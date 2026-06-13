import { GameObjects, Scene } from "phaser";
import {
  fifthEnemyConfig,
  toEnemyStatRange,
} from "../../../../configs/enemies";
import { enemyDeathSounds } from "../../../../configs/enemyDeathSounds";
import { Enemy } from "../../Enemy";
import {
  preloadEnemyVariants,
  type EnemyAssetConfig,
  type EnemySpawnSlot,
  type EnemyVariantConfig,
} from "../../types";
import { randomItem } from "../../../../utils/randomItem";
import { randomInt } from "../../../../utils/randomInt";
import { randomFloat } from "../../../../utils/randomFloat";
import type { Player } from "../../../Player/Player";

type EnemyAttackEffect = "fireball";

type FiveDifficultyEnemyVariantConfig = EnemyVariantConfig & {
  attackEffect?: EnemyAttackEffect;
};

export class FiveDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly fireballAnimationDurationMs = 560;
  private static readonly fireballStartScale = 0.18;
  private static readonly fireballEndScale = 3.4;
  private static readonly fireballBurnSourceId = "hell-fireball-burn";
  private static readonly fireballBurnDamagePerSecond = 5;
  private static readonly fireballBurnDurationSeconds = 2;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly fireballSprite: EnemyAssetConfig = {
    key: "five-difficulty-fire-ball",
    path: "assets/images/enemies/five-difficulty/fire-ball.png",
  };
  private static readonly variants: FiveDifficultyEnemyVariantConfig[] = [
    {
      displayName: "Pig Zombie",
      alive: {
        key: "five-difficulty-pig-zombie-1",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1.png",
      },
      dead: {
        key: "five-difficulty-pig-zombie-1-dead",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1-die.png",
      },
      deathSound: enemyDeathSounds.zombie,
    },
    {
      displayName: "Myth Bower",
      alive: {
        key: "five-difficulty-myth-bower-1",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1.png",
      },
      dead: {
        key: "five-difficulty-myth-bower-1-dead",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1-die.png",
      },
      deathSound: enemyDeathSounds.skeleton,
    },
    {
      displayName: "Hell Pig",
      alive: {
        key: "five-difficulty-hell-pig-1",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1.png",
      },
      dead: {
        key: "five-difficulty-hell-pig-1-dead",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1-die.png",
      },
    },
    {
      displayName: "Hell Ghast",
      alive: {
        key: "five-difficulty-hell-ghast-1",
        path: "assets/images/enemies/five-difficulty/hell-ghast-v1.png",
      },
      dead: {
        key: "five-difficulty-hell-ghast-1-dead",
        path: "assets/images/enemies/five-difficulty/hell-ghast-v1-die.png",
      },
      attackEffect: "fireball",
    },
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly attackEffect?: EnemyAttackEffect;
  private readonly deathSpriteKey: string;
  private readonly fireballs: GameObjects.Image[] = [];
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    preloadEnemyVariants(scene, FiveDifficultyEnemy.variants);
    scene.load.image(
      FiveDifficultyEnemy.fireballSprite.key,
      FiveDifficultyEnemy.fireballSprite.path,
    );
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const variant = randomItem(FiveDifficultyEnemy.variants);

    super({
      displayName: variant.displayName,
      maxHealth: randomInt(toEnemyStatRange(fifthEnemyConfig.health_range)),
      xpReward: fifthEnemyConfig.xp_reward,
      diamondsReward: fifthEnemyConfig.buff_container_reward,
      coinsReward: fifthEnemyConfig.lootbox_container_reward,
      emeraldDropChance: fifthEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(toEnemyStatRange(fifthEnemyConfig.damage_range)),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(fifthEnemyConfig.attack_speed_range),
      ),
      initialAttackDelaySeconds: randomFloat(
        toEnemyStatRange(fifthEnemyConfig.initial_attack_delay_range),
      ),
      deathSound: variant.deathSound,
    });

    this.slot = slot;
    this.attackEffect = variant.attackEffect;
    this.deathSpriteKey = variant.dead.key;
    this.body = scene.add
      .image(slot.x, slot.y, variant.alive.key)
      .setDisplaySize(slot.width, slot.height)
      .setInteractive({ useHandCursor: true });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack(player: Player) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    if (this.attackEffect === "fireball") {
      this.playFireballAnimation();
      player.applyDamageOverTime({
        sourceId: FiveDifficultyEnemy.fireballBurnSourceId,
        damagePerSecond: FiveDifficultyEnemy.fireballBurnDamagePerSecond,
        durationSeconds: FiveDifficultyEnemy.fireballBurnDurationSeconds,
      });
    }

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * FiveDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FiveDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: FiveDifficultyEnemy.attackAnimationDurationMs,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.destroyFireballs();
    this.body.disableInteractive();
    this.body.setTexture(this.deathSpriteKey);
    this.body.setDisplaySize(this.slot.width, this.slot.height);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x: this.slot.x + FiveDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + FiveDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FiveDifficultyEnemy.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.body.scene.tweens.killTweensOf(this.body);
    this.destroyFireballs();
    this.body.destroy();
  }

  private playFireballAnimation() {
    const fireball = this.body.scene.add
      .image(
        this.slot.x,
        this.slot.y - this.slot.height * 0.2,
        FiveDifficultyEnemy.fireballSprite.key,
      )
      .setScale(FiveDifficultyEnemy.fireballStartScale)
      .setAlpha(0.95)
      .setDepth(this.body.depth + 20);

    this.fireballs.push(fireball);

    this.body.scene.tweens.add({
      targets: fireball,
      x: this.body.scene.scale.width / 2,
      y: this.body.scene.scale.height / 2,
      scale: FiveDifficultyEnemy.fireballEndScale,
      alpha: 0,
      duration: FiveDifficultyEnemy.fireballAnimationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.removeFireball(fireball);
      },
    });
  }

  private removeFireball(fireball: GameObjects.Image) {
    const index = this.fireballs.indexOf(fireball);

    if (index >= 0) {
      this.fireballs.splice(index, 1);
    }

    fireball.destroy();
  }

  private destroyFireballs() {
    this.fireballs.splice(0).forEach((fireball) => {
      this.body.scene.tweens.killTweensOf(fireball);
      fireball.destroy();
    });
  }
}
