import { GameObjects, Scene } from "phaser";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

type BossSpriteConfig = {
  key: string;
  path: string;
};

export class FirstDifficultyBoss extends Enemy {
  readonly isCanAttack = true;
  readonly soundKeys = {
    spawn: "first-difficulty-boss-spawn-sound",
    attack: "first-difficulty-boss-attack-sound",
    death: "first-difficulty-boss-death-sound",
  };

  private static readonly attackAnimationDurationMs = 110;
  private static readonly attackAnimationScaleMultiplier = 1.05;
  private static readonly deathAnimationDurationMs = 650;
  private static readonly deathAnimationMoveOffsetX = 180;
  private static readonly deathAnimationMoveOffsetY = 140;
  private static readonly aliveSprite: BossSpriteConfig = {
    key: "first-difficulty-boss",
    path: "assets/images/enemies/first-difficulty/human-v2.png",
  };
  private static readonly deadSprite: BossSpriteConfig = {
    key: "first-difficulty-boss-dead",
    path: "assets/images/enemies/first-difficulty/human-v2-die.png",
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      FirstDifficultyBoss.aliveSprite.key,
      FirstDifficultyBoss.aliveSprite.path,
    );
    scene.load.image(
      FirstDifficultyBoss.deadSprite.key,
      FirstDifficultyBoss.deadSprite.path,
    );
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    super({
      displayName: "Village Boss",
      isBoss: true,
      maxHealth: 750,
      xpReward: 350,
      diamondsReward: 60,
      coinsReward: 70,
      emeraldDropChance: 0.2,
      damagePerHit: 18,
      attackCooldownSeconds: 1.1,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, FirstDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 1.08, slot.height * 1.08)
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
      scaleX: baseScaleX * FirstDifficultyBoss.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FirstDifficultyBoss.attackAnimationScaleMultiplier,
      duration: FirstDifficultyBoss.attackAnimationDurationMs,
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
    this.body.setTexture(FirstDifficultyBoss.deadSprite.key);
    this.body.setDisplaySize(this.slot.width * 1.08, this.slot.height * 1.08);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x:
        this.slot.x +
        FirstDifficultyBoss.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + FirstDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FirstDifficultyBoss.deathAnimationDurationMs,
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
