import { GameObjects, Scene } from "phaser";
import type { Player } from "../../../Player/Player";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

type BossAssetConfig = {
  key: string;
  path: string;
};

export class FourDifficultyBoss extends Enemy {
  readonly isCanAttack = true;
  readonly shouldPlayDefaultAttackSound = false;

  private static readonly attackCooldownSeconds = 0.9;
  private static readonly attackAnimationDurationMs = 150;
  private static readonly attackAnimationScaleMultiplier = 1.06;
  private static readonly deathAnimationDurationMs = 520;
  private static readonly deathAnimationMoveOffsetY = -90;
  private static readonly aliveSprite: BossAssetConfig = {
    key: "four-difficulty-boss",
    path: "assets/images/enemies/four-difficulty/stalker-aggressive.png",
  };
  private static readonly spawnSound: BossAssetConfig = {
    key: "four-difficulty-boss-spawn-sound",
    path: "assets/audio/enemies/four-difficulty/stalker-spawn.mp3",
  };
  private static readonly attackSound: BossAssetConfig = {
    key: "four-difficulty-boss-attack-sound",
    path: "assets/audio/enemies/four-difficulty/stalker-attack.mp3",
  };
  private static readonly deathSound: BossAssetConfig = {
    key: "four-difficulty-boss-death-sound",
    path: "assets/audio/enemies/four-difficulty/boss-death.mp3",
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      FourDifficultyBoss.aliveSprite.key,
      FourDifficultyBoss.aliveSprite.path,
    );
    scene.load.audio(
      FourDifficultyBoss.spawnSound.key,
      FourDifficultyBoss.spawnSound.path,
    );
    scene.load.audio(
      FourDifficultyBoss.attackSound.key,
      FourDifficultyBoss.attackSound.path,
    );
    scene.load.audio(
      FourDifficultyBoss.deathSound.key,
      FourDifficultyBoss.deathSound.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    super({
      displayName: "Stalker Boss",
      isBoss: true,
      maxHealth: 1750,
      xpReward: 760,
      diamondsReward: 150,
      coinsReward: 150,
      emeraldDropChance: 0.24,
      damagePerHit: 42,
      attackCooldownSeconds: FourDifficultyBoss.attackCooldownSeconds,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, FourDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 1.08, slot.height * 1.18)
      .setInteractive({ useHandCursor: true });

    this.scene.sound.play(FourDifficultyBoss.spawnSound.key, {
      volume: 1.1,
    });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack(_player: Player) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.scene.sound.play(FourDifficultyBoss.attackSound.key, {
      volume: 0.95,
    });

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * FourDifficultyBoss.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FourDifficultyBoss.attackAnimationScaleMultiplier,
      duration: FourDifficultyBoss.attackAnimationDurationMs,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.body.disableInteractive();
    this.scene.sound.play(FourDifficultyBoss.deathSound.key, {
      volume: 1,
    });

    this.scene.tweens.add({
      targets: this.body,
      y: this.slot.y + FourDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FourDifficultyBoss.deathAnimationDurationMs,
      ease: "Quad.easeOut",
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
}
