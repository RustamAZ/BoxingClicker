import { GameObjects, Scene } from "phaser";
import type { InfinityTowerEnemyStats } from "../../../configs/infinityTower";
import {
  infinityTowerEnemyPacks,
  type InfinityTowerEnemyPackConfig,
  type InfinityTowerEnemyProjectileConfig,
  type InfinityTowerEnemyVariantConfig,
} from "../../../configs/infinityTowerEnemies";
import type { Player } from "../../Player/Player";
import { Enemy } from "../Enemy";
import type { EnemySpawnSlot } from "../types";

export class InfinityTowerEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly projectile?: InfinityTowerEnemyProjectileConfig;
  private readonly deathSpriteKey: string;
  private readonly projectiles: GameObjects.Image[] = [];
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    InfinityTowerEnemy.preloadPacks(scene, infinityTowerEnemyPacks);
  }

  static preloadPacks(
    scene: Scene,
    packs: readonly InfinityTowerEnemyPackConfig[],
  ) {
    const loadedProjectileKeys = new Set<string>();

    packs.forEach((pack) => {
      pack.variants.forEach((variant) => {
        if (!scene.textures.exists(variant.alive.key)) {
          scene.load.image(variant.alive.key, variant.alive.path);
        }

        if (!scene.textures.exists(variant.dead.key)) {
          scene.load.image(variant.dead.key, variant.dead.path);
        }

        if (
          variant.projectile &&
          !scene.textures.exists(variant.projectile.texture.key) &&
          !loadedProjectileKeys.has(variant.projectile.texture.key)
        ) {
          scene.load.image(
            variant.projectile.texture.key,
            variant.projectile.texture.path,
          );
          loadedProjectileKeys.add(variant.projectile.texture.key);
        }
      });
    });
  }

  constructor(
    scene: Scene,
    slot: EnemySpawnSlot,
    stats: InfinityTowerEnemyStats,
    variant: InfinityTowerEnemyVariantConfig,
  ) {
    super({
      displayName: variant.displayName,
      maxHealth: stats.maxHealth,
      xpReward: stats.xpReward,
      diamondsReward: stats.diamondsReward,
      coinsReward: stats.coinsReward,
      emeraldDropChance: stats.emeraldDropChance,
      damagePerHit: stats.damagePerHit,
      attackCooldownSeconds: stats.attackCooldownSeconds,
      initialAttackDelaySeconds: stats.initialAttackDelaySeconds,
    });

    this.slot = slot;
    this.projectile = variant.attackType === "ranged" ? variant.projectile : undefined;
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

    if (this.projectile) {
      this.playProjectileAnimation(this.projectile);
      player.applyDamageOverTime({
        sourceId: this.projectile.burnSourceId,
        damagePerSecond: this.projectile.burnDamagePerSecond,
        durationSeconds: this.projectile.burnDurationSeconds,
      });
    }

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * InfinityTowerEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * InfinityTowerEnemy.attackAnimationScaleMultiplier,
      duration: InfinityTowerEnemy.attackAnimationDurationMs,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.destroyProjectiles();
    this.body.disableInteractive();
    this.body.setTexture(this.deathSpriteKey);
    this.body.setDisplaySize(this.slot.width, this.slot.height);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x: this.slot.x + InfinityTowerEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + InfinityTowerEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: InfinityTowerEnemy.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.body.scene.tweens.killTweensOf(this.body);
    this.destroyProjectiles();
    this.body.destroy();
  }

  private playProjectileAnimation(projectileConfig: InfinityTowerEnemyProjectileConfig) {
    const projectile = this.body.scene.add
      .image(
        this.slot.x,
        this.slot.y - this.slot.height * 0.2,
        projectileConfig.texture.key,
      )
      .setScale(projectileConfig.startScale)
      .setAlpha(0.95)
      .setDepth(this.body.depth + 20);

    this.projectiles.push(projectile);

    this.body.scene.tweens.add({
      targets: projectile,
      x: this.body.scene.scale.width / 2,
      y: this.body.scene.scale.height / 2,
      scale: projectileConfig.endScale,
      alpha: 0,
      duration: projectileConfig.animationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.removeProjectile(projectile);
      },
    });
  }

  private removeProjectile(projectile: GameObjects.Image) {
    const index = this.projectiles.indexOf(projectile);

    if (index >= 0) {
      this.projectiles.splice(index, 1);
    }

    projectile.destroy();
  }

  private destroyProjectiles() {
    this.projectiles.splice(0).forEach((projectile) => {
      this.body.scene.tweens.killTweensOf(projectile);
      projectile.destroy();
    });
  }
}
