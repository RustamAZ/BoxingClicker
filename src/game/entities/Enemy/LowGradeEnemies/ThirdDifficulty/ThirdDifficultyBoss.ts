import { GameObjects, Scene } from "phaser";
import type { Player } from "../../../Player/Player";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

type BossSpriteConfig = {
  key: string;
  path: string;
};

type BossSoundConfig = {
  key: string;
  path: string;
};

export class ThirdDifficultyBoss extends Enemy {
  readonly isCanAttack = false;

  private static readonly explosionDelaySeconds = 3;
  private static readonly explosionDamage = 165;
  private static readonly chargeScaleMultiplier = 1.18;
  private static readonly chargeShakeOffsetX = 5;
  private static readonly chargeShakeOffsetY = 2;
  private static readonly chargeShakeDurationMs = 42;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly explosionAnimationDurationMs = 420;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly aliveSprite: BossSpriteConfig = {
    key: "second-difficulty-boss-creep",
    path: "assets/images/enemies/second-difficulty/creep-boss.png",
  };
  private static readonly deadSprite: BossSpriteConfig = {
    key: "second-difficulty-boss-creep-dead",
    path: "assets/images/enemies/second-difficulty/creep-boss-die.png",
  };
  private static readonly explosionSprite: BossSpriteConfig = {
    key: "second-difficulty-boss-creep-boom",
    path: "assets/images/enemies/second-difficulty/creep-boss-boom.png",
  };
  private static readonly introSound: BossSoundConfig = {
    key: "second-difficulty-boss-creep-intro",
    path: "assets/audio/enemies/second-difficulty/creep-intro.mp3",
  };
  private static readonly boomSound: BossSoundConfig = {
    key: "second-difficulty-boss-creep-boom-sound",
    path: "assets/audio/enemies/second-difficulty/creep-boom.wav",
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private explosionTimerSeconds = ThirdDifficultyBoss.explosionDelaySeconds;
  private isDeathAnimationPlaying = false;
  private isExplosionAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      ThirdDifficultyBoss.aliveSprite.key,
      ThirdDifficultyBoss.aliveSprite.path,
    );
    scene.load.image(
      ThirdDifficultyBoss.deadSprite.key,
      ThirdDifficultyBoss.deadSprite.path,
    );
    scene.load.image(
      ThirdDifficultyBoss.explosionSprite.key,
      ThirdDifficultyBoss.explosionSprite.path,
    );
    scene.load.audio(
      ThirdDifficultyBoss.introSound.key,
      ThirdDifficultyBoss.introSound.path,
    );
    scene.load.audio(
      ThirdDifficultyBoss.boomSound.key,
      ThirdDifficultyBoss.boomSound.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    super({
      displayName: "Creeper Boss",
      isBoss: true,
      maxHealth: 240,
      xpReward: 450,
      diamondsReward: 90,
      coinsReward: 90,
      emeraldDropChance: 0.2,
      damagePerHit: ThirdDifficultyBoss.explosionDamage,
      attackCooldownSeconds: 0,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, ThirdDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 0.7, slot.height)
      .setInteractive({ useHandCursor: true });

    this.scene.sound.play(ThirdDifficultyBoss.introSound.key, {
      volume: 0.85,
    });
    this.startExplosionChargeAnimation();
  }

  update(deltaSeconds: number, player: Player) {
    if (
      this.isDead() ||
      this.isDeathAnimationPlaying ||
      this.isExplosionAnimationPlaying
    ) {
      return;
    }

    this.explosionTimerSeconds = Math.max(
      0,
      this.explosionTimerSeconds - deltaSeconds,
    );

    if (this.explosionTimerSeconds <= 0) {
      this.explode(player);
    }
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying || this.isExplosionAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.stopExplosionChargeAnimation();
    this.body.disableInteractive();
    this.body.setTexture(ThirdDifficultyBoss.deadSprite.key);
    this.body.setDisplaySize(this.slot.width * 0.7, this.slot.height);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x:
        this.slot.x +
        ThirdDifficultyBoss.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + ThirdDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: ThirdDifficultyBoss.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.body);
    this.body.destroy();
  }

  private explode(player: Player) {
    if (this.isExplosionAnimationPlaying || this.isDeathAnimationPlaying) {
      return;
    }

    this.isExplosionAnimationPlaying = true;
    this.health = 0;
    this.stopExplosionChargeAnimation();
    this.body.disableInteractive();
    this.body.setTexture(ThirdDifficultyBoss.explosionSprite.key);
    this.body.setDisplaySize(this.slot.width * 0.85, this.slot.width * 0.85);
    this.scene.sound.play(ThirdDifficultyBoss.boomSound.key, {
      volume: 0.9,
    });
    player.takeDamage(ThirdDifficultyBoss.explosionDamage);

    this.body.scene.tweens.add({
      targets: this.body,
      alpha: 0,
      duration: ThirdDifficultyBoss.explosionAnimationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.destroy();
        this.emitSelfDefeated();
      },
    });
  }

  private startExplosionChargeAnimation() {
    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * ThirdDifficultyBoss.chargeScaleMultiplier,
      scaleY: baseScaleY * ThirdDifficultyBoss.chargeScaleMultiplier,
      duration: ThirdDifficultyBoss.explosionDelaySeconds * 1000,
      ease: "Quad.easeIn",
    });

    this.scene.tweens.add({
      targets: this.body,
      x: {
        from: this.slot.x - ThirdDifficultyBoss.chargeShakeOffsetX,
        to: this.slot.x + ThirdDifficultyBoss.chargeShakeOffsetX,
      },
      y: {
        from: this.slot.y - ThirdDifficultyBoss.chargeShakeOffsetY,
        to: this.slot.y + ThirdDifficultyBoss.chargeShakeOffsetY,
      },
      duration: ThirdDifficultyBoss.chargeShakeDurationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private stopExplosionChargeAnimation() {
    this.scene.tweens.killTweensOf(this.body);
    this.body.setPosition(this.slot.x, this.slot.y);
  }
}
