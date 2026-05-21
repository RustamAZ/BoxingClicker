import { GameObjects, Scene } from "phaser";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";
import { randomInt } from "../../../../utils/randomInt";
import { randomFloat } from "../../../../utils/randomFloat";
import { randomItem } from "../../../../utils/randomItem";

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

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "first-difficulty-human-1",
        path: "assets/images/enemies/first-difficulty/human-v1.png",
        displayName: "Village Farmer",
      },
      {
        key: "first-difficulty-human-1-dead",
        path: "assets/images/enemies/first-difficulty/human-v1-die.png",
      },
    ],
    [
      {
        key: "first-difficulty-human-2",
        path: "assets/images/enemies/first-difficulty/human-v2.png",
        displayName: "Village Guard",
      },
      {
        key: "first-difficulty-human-2-dead",
        path: "assets/images/enemies/first-difficulty/human-v2-die.png",
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
    min: 4,
    max: 8,
  };
  private static readonly emeraldDropChance = 0.08;
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
    const [aliveSprite, deadSprite] = randomItem(
      FirstDifficultyEnemy.sprites,
    );

    super({
      displayName: aliveSprite.displayName,
      maxHealth: randomInt(
        FirstDifficultyEnemy.healthRange,
      ),
      xpReward: randomInt(
        FirstDifficultyEnemy.xpRewardRange,
      ),
      diamondsReward: randomInt(
        FirstDifficultyEnemy.diamondsRewardRange,
      ),
      coinsReward: randomInt(
        FirstDifficultyEnemy.coinsRewardRange,
      ),
      emeraldDropChance: FirstDifficultyEnemy.emeraldDropChance,
      damagePerHit: randomInt(
        FirstDifficultyEnemy.damagePerHitRange,
      ),
      attackCooldownSeconds: randomFloat(
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

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.body.scene.tweens.add({
      targets: this.body,
      scaleX: baseScaleX * FirstDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FirstDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: FirstDifficultyEnemy.attackAnimationDurationMs,
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
}
