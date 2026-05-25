import { GameObjects, Scene } from "phaser";
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

export class ThirdDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "third-difficulty-spider-1",
        path: "assets/images/enemies/third-difficulty/spider-v1.png",
        displayName: "Spider",
      },
      {
        key: "third-difficulty-spider-1-dead",
        path: "assets/images/enemies/third-difficulty/spider-v1-die.png",
      },
    ],
    [
      {
        key: "third-difficulty-golden-zombie-1",
        path: "assets/images/enemies/third-difficulty/golden-zombie-v1.png",
        displayName: "Golden Zombie",
      },
      {
        key: "third-difficulty-golden-zombie-1-dead",
        path: "assets/images/enemies/third-difficulty/golden-zombie-v1-die.png",
      },
    ],
    [
      {
        key: "third-difficulty-skeleton-with-axe-1",
        path: "assets/images/enemies/third-difficulty/skeleton-with-axe-v1.png",
        displayName: "Skeleton",
      },
      {
        key: "third-difficulty-skeleton-with-axe-1-dead",
        path: "assets/images/enemies/third-difficulty/skeleton-with-axe-v1-die.png",
      },
    ],
  ];
  private static readonly healthRange = {
    min: 300,
    max: 400,
  };
  private static readonly xpRewardRange = {
    min: 130,
    max: 210,
  };
  private static readonly diamondsRewardRange = {
    min: 14,
    max: 26,
  };
  private static readonly coinsRewardRange = {
    min: 14,
    max: 26,
  };
  private static readonly emeraldDropChance = 0.12;
  private static readonly damagePerHitRange = {
    min: 10,
    max: 25,
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
    ThirdDifficultyEnemy.sprites.forEach(([aliveSprite, deadSprite]) => {
      scene.load.image(aliveSprite.key, aliveSprite.path);
      scene.load.image(deadSprite.key, deadSprite.path);
    });
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const [aliveSprite, deadSprite] = randomItem(ThirdDifficultyEnemy.sprites);

    super({
      displayName: aliveSprite.displayName,
      maxHealth: randomInt(ThirdDifficultyEnemy.healthRange),
      xpReward: randomInt(ThirdDifficultyEnemy.xpRewardRange),
      diamondsReward: randomInt(ThirdDifficultyEnemy.diamondsRewardRange),
      coinsReward: randomInt(ThirdDifficultyEnemy.coinsRewardRange),
      emeraldDropChance: ThirdDifficultyEnemy.emeraldDropChance,
      damagePerHit: randomInt(ThirdDifficultyEnemy.damagePerHitRange),
      attackCooldownSeconds: randomFloat(
        ThirdDifficultyEnemy.attackCooldownSecondsRange,
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
      scaleX: baseScaleX * ThirdDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * ThirdDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: ThirdDifficultyEnemy.attackAnimationDurationMs,
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
        ThirdDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + ThirdDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: ThirdDifficultyEnemy.deathAnimationDurationMs,
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
