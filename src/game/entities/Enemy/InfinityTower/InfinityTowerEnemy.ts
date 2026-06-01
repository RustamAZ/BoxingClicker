import { GameObjects, Scene } from "phaser";
import type { InfinityTowerEnemyStats } from "../../../configs/infinityTower";
import { randomItem } from "../../../utils/randomItem";
import { Enemy } from "../Enemy";
import type { EnemySpawnSlot } from "../types";

type EnemySpriteConfig = {
  key: string;
  path: string;
};

type EnemySpritePair = readonly [
  alive: EnemySpriteConfig & { displayName: string },
  dead: EnemySpriteConfig,
];

export class InfinityTowerEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "infinity-tower-pig-zombie-1",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1.png",
        displayName: "Tower Pig Zombie",
      },
      {
        key: "infinity-tower-pig-zombie-1-dead",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1-die.png",
      },
    ],
    [
      {
        key: "infinity-tower-myth-bower-1",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1.png",
        displayName: "Tower Myth Bower",
      },
      {
        key: "infinity-tower-myth-bower-1-dead",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1-die.png",
      },
    ],
    [
      {
        key: "infinity-tower-hell-pig-1",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1.png",
        displayName: "Tower Hell Pig",
      },
      {
        key: "infinity-tower-hell-pig-1-dead",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1-die.png",
      },
    ],
    [
      {
        key: "infinity-tower-black-skeleton-1",
        path: "assets/images/enemies/four-difficulty/black-skeleton-v1.png",
        displayName: "Tower Black Skeleton",
      },
      {
        key: "infinity-tower-black-skeleton-1-dead",
        path: "assets/images/enemies/four-difficulty/black-skeleton-v1-die.png",
      },
    ],
    [
      {
        key: "infinity-tower-myth-zombie-1",
        path: "assets/images/enemies/four-difficulty/myth-zombie-v1.png",
        displayName: "Tower Myth Zombie",
      },
      {
        key: "infinity-tower-myth-zombie-1-dead",
        path: "assets/images/enemies/four-difficulty/myth-zombie-v1-die.png",
      },
    ],
  ];

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    InfinityTowerEnemy.sprites.forEach(([aliveSprite, deadSprite]) => {
      scene.load.image(aliveSprite.key, aliveSprite.path);
      scene.load.image(deadSprite.key, deadSprite.path);
    });
  }

  constructor(
    scene: Scene,
    slot: EnemySpawnSlot,
    stats: InfinityTowerEnemyStats,
  ) {
    const [aliveSprite, deadSprite] = randomItem(InfinityTowerEnemy.sprites);

    super({
      displayName: aliveSprite.displayName,
      maxHealth: stats.maxHealth,
      xpReward: stats.xpReward,
      diamondsReward: stats.diamondsReward,
      coinsReward: stats.coinsReward,
      emeraldDropChance: stats.emeraldDropChance,
      damagePerHit: stats.damagePerHit,
      attackCooldownSeconds: stats.attackCooldownSeconds,
      initialAttackDelaySeconds: stats.initialAttackDelaySeconds,
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
      scaleX: baseScaleX * InfinityTowerEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * InfinityTowerEnemy.attackAnimationScaleMultiplier,
      duration: InfinityTowerEnemy.attackAnimationDurationMs,
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
        InfinityTowerEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + InfinityTowerEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: InfinityTowerEnemy.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.body.scene.tweens.killTweensOf(this.body);
    this.body.destroy();
  }
}
