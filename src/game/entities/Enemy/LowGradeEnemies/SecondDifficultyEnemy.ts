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

export class SecondDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

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
  private static readonly healthRange = {
    min: 200,
    max: 350,
  };
  private static readonly xpRewardRange = {
    min: 100,
    max: 180,
  };
  private static readonly diamondsRewardRange = {
    min: 14,
    max: 26,
  };
  private static readonly coinsRewardRange = {
    min: 14,
    max: 26,
  };
  private static readonly damagePerHitRange = {
    min: 10,
    max: 18,
  };
  private static readonly attackCooldownSecondsRange = {
    min: 0.8,
    max: 1.5,
  };

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
    const [aliveSprite, deadSprite] = SecondDifficultyEnemy.randomItem(
      SecondDifficultyEnemy.sprites,
    );

    super({
      displayName: aliveSprite.displayName,
      maxHealth: SecondDifficultyEnemy.randomInt(
        SecondDifficultyEnemy.healthRange,
      ),
      xpReward: SecondDifficultyEnemy.randomInt(
        SecondDifficultyEnemy.xpRewardRange,
      ),
      diamondsReward: SecondDifficultyEnemy.randomInt(
        SecondDifficultyEnemy.diamondsRewardRange,
      ),
      coinsReward: SecondDifficultyEnemy.randomInt(
        SecondDifficultyEnemy.coinsRewardRange,
      ),
      damagePerHit: SecondDifficultyEnemy.randomInt(
        SecondDifficultyEnemy.damagePerHitRange,
      ),
      attackCooldownSeconds: SecondDifficultyEnemy.randomFloat(
        SecondDifficultyEnemy.attackCooldownSecondsRange,
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
