import { GameObjects, Scene } from "phaser";
import { secondBossConfig } from "../../../../configs/bosses";
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

export class SecondDifficultyBoss extends Enemy {
  readonly isCanAttack = false;

  private static readonly explosionDelaySeconds = 3;
  private static readonly explosionDamage =
    secondBossConfig.effect?.type === "explosion"
      ? secondBossConfig.effect.explosion_damage
      : 0;
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
  private explosionTimerSeconds = SecondDifficultyBoss.explosionDelaySeconds;
  private isDeathAnimationPlaying = false;
  private isExplosionAnimationPlaying = false;
  private isExplosionCompleted = false;
  private explosionCompleteTimer?: Phaser.Time.TimerEvent;

  static preload(scene: Scene) {
    scene.load.image(
      SecondDifficultyBoss.aliveSprite.key,
      SecondDifficultyBoss.aliveSprite.path,
    );
    scene.load.image(
      SecondDifficultyBoss.deadSprite.key,
      SecondDifficultyBoss.deadSprite.path,
    );
    scene.load.image(
      SecondDifficultyBoss.explosionSprite.key,
      SecondDifficultyBoss.explosionSprite.path,
    );
    scene.load.audio(
      SecondDifficultyBoss.introSound.key,
      SecondDifficultyBoss.introSound.path,
    );
    scene.load.audio(
      SecondDifficultyBoss.boomSound.key,
      SecondDifficultyBoss.boomSound.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    super({
      displayName: "Creeper Boss",
      isBoss: true,
      maxHealth: secondBossConfig.health,
      xpReward: secondBossConfig.xp_reward,
      diamondsReward: secondBossConfig.buff_container_reward,
      coinsReward: secondBossConfig.lootbox_container_reward,
      emeraldDropChance: secondBossConfig.emerald_drop_chance,
      emeraldDropAmount: secondBossConfig.emerald_drop_amount,
      damagePerHit: secondBossConfig.damage,
      attackCooldownSeconds: secondBossConfig.attack_speed,
      initialAttackDelaySeconds: secondBossConfig.initial_attack_delay,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, SecondDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 0.7, slot.height)
      .setInteractive({ useHandCursor: true });

    this.scene.sound.play(SecondDifficultyBoss.introSound.key, {
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
    this.body.setTexture(SecondDifficultyBoss.deadSprite.key);
    this.body.setDisplaySize(this.slot.width * 0.7, this.slot.height);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x:
        this.slot.x +
        SecondDifficultyBoss.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + SecondDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: SecondDifficultyBoss.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.explosionCompleteTimer?.remove();
    this.explosionCompleteTimer = undefined;
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
    this.body.setTexture(SecondDifficultyBoss.explosionSprite.key);
    this.body.setDisplaySize(this.slot.width * 0.85, this.slot.width * 0.85);
    this.scene.sound.play(SecondDifficultyBoss.boomSound.key, {
      volume: 0.9,
    });
    player.takeDamage(SecondDifficultyBoss.explosionDamage);

    this.body.scene.tweens.add({
      targets: this.body,
      alpha: 0,
      duration: SecondDifficultyBoss.explosionAnimationDurationMs,
      ease: "Quad.easeOut",
    });
    this.explosionCompleteTimer = this.scene.time.delayedCall(
      SecondDifficultyBoss.explosionAnimationDurationMs,
      () => {
        this.completeExplosion();
      },
    );
  }

  private completeExplosion() {
    if (this.isExplosionCompleted) {
      return;
    }

    this.isExplosionCompleted = true;
    this.destroy();
    this.emitSelfDefeated();
  }

  private startExplosionChargeAnimation() {
    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * SecondDifficultyBoss.chargeScaleMultiplier,
      scaleY: baseScaleY * SecondDifficultyBoss.chargeScaleMultiplier,
      duration: SecondDifficultyBoss.explosionDelaySeconds * 1000,
      ease: "Quad.easeIn",
    });

    this.scene.tweens.add({
      targets: this.body,
      x: {
        from: this.slot.x - SecondDifficultyBoss.chargeShakeOffsetX,
        to: this.slot.x + SecondDifficultyBoss.chargeShakeOffsetX,
      },
      y: {
        from: this.slot.y - SecondDifficultyBoss.chargeShakeOffsetY,
        to: this.slot.y + SecondDifficultyBoss.chargeShakeOffsetY,
      },
      duration: SecondDifficultyBoss.chargeShakeDurationMs,
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
