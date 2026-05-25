import { GameObjects, Scene } from "phaser";
import { secondEnemyConfig } from "../../../../configs/enemies/second";
import { toEnemyStatRange } from "../../../../configs/enemies/types";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";
import { randomItem } from "../../../../utils/randomItem";
import { randomInt } from "../../../../utils/randomInt";
import { randomFloat } from "../../../../utils/randomFloat";

type EnemySpriteConfig = {
  key: string;
  path: string;
};

type EnemySpritePair = readonly [
  alive: EnemySpriteConfig & { displayName: string },
  dead: EnemySpriteConfig,
];

export class SecondDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "second-difficulty-zombie-1",
        path: "assets/images/enemies/second-difficulty/zombie-v1.png",
        displayName: "Zombie",
      },
      {
        key: "second-difficulty-zombie-1-dead",
        path: "assets/images/enemies/second-difficulty/zombie-v1-die.png",
      },
    ],
    [
      {
        key: "second-difficulty-zombie-2",
        path: "assets/images/enemies/second-difficulty/zombie-v2.png",
        displayName: "Zombie",
      },
      {
        key: "second-difficulty-zombie-2-dead",
        path: "assets/images/enemies/second-difficulty/zombie-v2-die.png",
      },
    ],
    [
      {
        key: "second-difficulty-skeleton-1",
        path: "assets/images/enemies/second-difficulty/skeleton-v1.png",
        displayName: "Skeleton",
      },
      {
        key: "second-difficulty-skeleton-1-dead",
        path: "assets/images/enemies/second-difficulty/skeleton-v1-die.png",
      },
    ],
    [
      {
        key: "second-difficulty-skeleton-2",
        path: "assets/images/enemies/second-difficulty/skeleton-v2.png",
        displayName: "Skeleton",
      },
      {
        key: "second-difficulty-skeleton-2-dead",
        path: "assets/images/enemies/second-difficulty/skeleton-v2-die.png",
      },
    ],
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    SecondDifficultyEnemy.sprites.forEach(([aliveSprite, deadSprite]) => {
      scene.load.image(aliveSprite.key, aliveSprite.path);
      scene.load.image(deadSprite.key, deadSprite.path);
    });
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const [aliveSprite, deadSprite] = randomItem(
      SecondDifficultyEnemy.sprites,
    );

    super({
      displayName: aliveSprite.displayName,
      maxHealth: randomInt(
        toEnemyStatRange(secondEnemyConfig.health_range),
      ),
      xpReward: secondEnemyConfig.xp_reward,
      diamondsReward: secondEnemyConfig.buff_container_reward,
      coinsReward: secondEnemyConfig.lootbox_container_reward,
      emeraldDropChance: secondEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(
        toEnemyStatRange(secondEnemyConfig.damage_range),
      ),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(secondEnemyConfig.attack_speed_range),
      ),
    });

    this.slot = slot;
    this.deathSpriteKey = deadSprite.key;
    this.body = scene.add
      .image(slot.x, slot.y, aliveSprite.key)
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
      scaleX: baseScaleX * SecondDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * SecondDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: SecondDifficultyEnemy.attackAnimationDurationMs,
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
        SecondDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + SecondDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: SecondDifficultyEnemy.deathAnimationDurationMs,
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
