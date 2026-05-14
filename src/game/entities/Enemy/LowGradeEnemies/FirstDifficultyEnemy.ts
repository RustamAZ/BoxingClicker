import { GameObjects, Scene } from "phaser";
import { Enemy } from "../Enemy";
import type { EnemySpawnSlot } from "../types";

type EnemyStatRange = {
  min: number;
  max: number;
};

type EnemySpriteConfig = {
  key: string;
  path: string;
};

type EnemySpritePair = readonly [
  alive: EnemySpriteConfig & { displayName: string },
  dead: EnemySpriteConfig,
];

export class FirstDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "first-difficulty-enemy-1",
        path: "assets/images/enemies/first-difficulty/man-v1.png",
        displayName: "First Difficulty Enemy",
      },
      {
        key: "first-difficulty-enemy-1-dead",
        path: "assets/images/enemies/first-difficulty/man-v1-die.png",
      },
    ],
    [
      {
        key: "first-difficulty-enemy-2",
        path: "assets/images/enemies/first-difficulty/man-v2.png",
        displayName: "First Difficulty Enemy",
      },
      {
        key: "first-difficulty-enemy-2-dead",
        path: "assets/images/enemies/first-difficulty/man-v2-die.png",
      },
    ],
    [
      {
        key: "first-difficulty-skeleton-1",
        path: "assets/images/enemies/first-difficulty/skeleton-v1.png",
        displayName: "Skeleton",
      },
      {
        key: "first-difficulty-skeleton-1-dead",
        path: "assets/images/enemies/first-difficulty/skeleton-v1-die.png",
      },
    ],
  ];
  private static readonly healthRange = {
    min: 100,
    max: 200,
  };
  private static readonly xpRewardRange = {
    min: 50,
    max: 100,
  };
  private static readonly diamondsRewardRange = {
    min: 8,
    max: 16,
  };
  private static readonly coinsRewardRange = {
    min: 8,
    max: 16,
  };
  private static readonly damagePerHitRange = {
    min: 5,
    max: 10,
  };
  private static readonly attackCooldownSecondsRange = {
    min: 1,
    max: 2,
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    FirstDifficultyEnemy.sprites.forEach(([aliveSprite, deadSprite]) => {
      scene.load.image(aliveSprite.key, aliveSprite.path);
      scene.load.image(deadSprite.key, deadSprite.path);
    });
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const [aliveSprite, deadSprite] = FirstDifficultyEnemy.randomItem(
      FirstDifficultyEnemy.sprites,
    );

    super({
      displayName: aliveSprite.displayName,
      maxHealth: FirstDifficultyEnemy.randomInt(
        FirstDifficultyEnemy.healthRange,
      ),
      xpReward: FirstDifficultyEnemy.randomInt(
        FirstDifficultyEnemy.xpRewardRange,
      ),
      diamondsReward: FirstDifficultyEnemy.randomInt(
        FirstDifficultyEnemy.diamondsRewardRange,
      ),
      coinsReward: FirstDifficultyEnemy.randomInt(
        FirstDifficultyEnemy.coinsRewardRange,
      ),
      damagePerHit: FirstDifficultyEnemy.randomInt(
        FirstDifficultyEnemy.damagePerHitRange,
      ),
      attackCooldownSeconds: FirstDifficultyEnemy.randomFloat(
        FirstDifficultyEnemy.attackCooldownSecondsRange,
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

    this.body.scene.tweens.add({
      targets: this.body,
      x: this.slot.x - 18,
      duration: 80,
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

  private static randomInt(range: EnemyStatRange) {
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
  }

  private static randomFloat(range: EnemyStatRange) {
    return Math.random() * (range.max - range.min) + range.min;
  }

  private static randomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }
}
