import { GameObjects, Scene } from "phaser";
import { fifthBossConfig } from "../../../../configs/bosses";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

type BossAssetConfig = {
  key: string;
  path: string;
};

export const fiveDifficultyBossAttackEvent = "five-difficulty-boss-attack";

export class FiveDifficultyBoss extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 190;
  private static readonly attackAnimationScaleMultiplier = 1.08;
  private static readonly shockwaveAnimationDurationMs = 650;
  private static readonly shockwaveStartScale = 0.22;
  private static readonly shockwaveEndScale = 8;
  private static readonly deathAnimationDurationMs = 680;
  private static readonly deathAnimationMoveOffsetY = 110;
  private static readonly aliveSprite: BossAssetConfig = {
    key: "five-difficulty-warden-boss",
    path: "assets/images/enemies/five-difficulty/warden-boss-die.png",
  };
  private static readonly deadSprite: BossAssetConfig = {
    key: "five-difficulty-warden-boss-dead",
    path: "assets/images/enemies/five-difficulty/warden-boss.png",
  };
  private static readonly spawnSound: BossAssetConfig = {
    key: "five-difficulty-warden-boss-spawn-sound",
    path: "assets/audio/enemies/five-difficulty/warden-boss-spawn.mp3",
  };
  private static readonly deathSound: BossAssetConfig = {
    key: "five-difficulty-warden-boss-death-sound",
    path: "assets/audio/enemies/five-difficulty/warden-boss-death.mp3",
  };
  private static readonly shockwaveSprite: BossAssetConfig = {
    key: "five-difficulty-warden-boss-shockwave",
    path: "assets/images/enemies/five-difficulty/warden-boss-shockwave.png",
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly shockwaves: GameObjects.Image[] = [];
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      FiveDifficultyBoss.aliveSprite.key,
      FiveDifficultyBoss.aliveSprite.path,
    );
    scene.load.image(
      FiveDifficultyBoss.deadSprite.key,
      FiveDifficultyBoss.deadSprite.path,
    );
    scene.load.audio(
      FiveDifficultyBoss.spawnSound.key,
      FiveDifficultyBoss.spawnSound.path,
    );
    scene.load.audio(
      FiveDifficultyBoss.deathSound.key,
      FiveDifficultyBoss.deathSound.path,
    );
    scene.load.image(
      FiveDifficultyBoss.shockwaveSprite.key,
      FiveDifficultyBoss.shockwaveSprite.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    super({
      displayName: "Hell Boss",
      isBoss: true,
      maxHealth: fifthBossConfig.health,
      xpReward: fifthBossConfig.xp_reward,
      diamondsReward: fifthBossConfig.buff_container_reward,
      coinsReward: fifthBossConfig.lootbox_container_reward,
      emeraldDropChance: fifthBossConfig.emerald_drop_chance,
      damagePerHit: fifthBossConfig.damage,
      attackCooldownSeconds: fifthBossConfig.attack_speed,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, FiveDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 1.16, slot.height * 1.16)
      .setInteractive({ useHandCursor: true });

    this.scene.sound.play(FiveDifficultyBoss.spawnSound.key, {
      volume: 1,
    });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack() {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.scene.events.emit(fiveDifficultyBossAttackEvent);
    this.playShockwaveAnimation();

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * FiveDifficultyBoss.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FiveDifficultyBoss.attackAnimationScaleMultiplier,
      duration: FiveDifficultyBoss.attackAnimationDurationMs,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.scene.tweens.killTweensOf(this.body);
    this.destroyShockwaves();
    this.body.disableInteractive();
    this.body.setTexture(FiveDifficultyBoss.deadSprite.key);
    this.body.setDisplaySize(this.slot.width * 1.16, this.slot.height * 1.16);
    this.scene.sound.play(FiveDifficultyBoss.deathSound.key, {
      volume: 1,
    });

    this.scene.tweens.add({
      targets: this.body,
      y: this.slot.y + FiveDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FiveDifficultyBoss.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.body);
    this.destroyShockwaves();
    this.body.destroy();
  }

  private playShockwaveAnimation() {
    const shockwave = this.scene.add
      .image(
        this.slot.x,
        this.slot.y - this.slot.height * 0.18,
        FiveDifficultyBoss.shockwaveSprite.key,
      )
      .setScale(FiveDifficultyBoss.shockwaveStartScale)
      .setAlpha(0.95)
      .setDepth(this.body.depth + 20);

    this.shockwaves.push(shockwave);

    this.scene.tweens.add({
      targets: shockwave,
      x: this.scene.scale.width / 2,
      y: this.scene.scale.height / 2,
      scale: FiveDifficultyBoss.shockwaveEndScale,
      alpha: 0,
      duration: FiveDifficultyBoss.shockwaveAnimationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.removeShockwave(shockwave);
      },
    });
  }

  private removeShockwave(shockwave: GameObjects.Image) {
    const index = this.shockwaves.indexOf(shockwave);

    if (index >= 0) {
      this.shockwaves.splice(index, 1);
    }

    shockwave.destroy();
  }

  private destroyShockwaves() {
    this.shockwaves.splice(0).forEach((shockwave) => {
      this.scene.tweens.killTweensOf(shockwave);
      shockwave.destroy();
    });
  }
}
