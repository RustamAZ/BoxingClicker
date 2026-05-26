import { GameObjects, Scene } from "phaser";
import {
  fiveEnemyConfig,
  toEnemyStatRange,
} from "../../../../configs/enemies";
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

export class FiveDifficultyEnemy extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 90;
  private static readonly attackAnimationScaleMultiplier = 1.04;
  private static readonly deathAnimationDurationMs = 500;
  private static readonly deathAnimationMoveOffsetX = 150;
  private static readonly deathAnimationMoveOffsetY = 120;
  private static readonly sprites: EnemySpritePair[] = [
    [
      {
        key: "five-difficulty-pig-zombie-1",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1.png",
        displayName: "Pig Zombie",
      },
      {
        key: "five-difficulty-pig-zombie-1-dead",
        path: "assets/images/enemies/five-difficulty/pig-zombie-v1-die.png",
      },
    ],
    [
      {
        key: "five-difficulty-myth-bower-1",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1.png",
        displayName: "Myth Bower",
      },
      {
        key: "five-difficulty-myth-bower-1-dead",
        path: "assets/images/enemies/five-difficulty/myth-bower-v1-die.png",
      },
    ],
    [
      {
        key: "five-difficulty-hell-pig-1",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1.png",
        displayName: "Hell Pig",
      },
      {
        key: "five-difficulty-hell-pig-1-dead",
        path: "assets/images/enemies/five-difficulty/hell-pig-v1-die.png",
      },
    ],
  ];
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly deathSpriteKey: string;
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    FiveDifficultyEnemy.sprites.forEach(([aliveSprite, deadSprite]) => {
      scene.load.image(aliveSprite.key, aliveSprite.path);
      scene.load.image(deadSprite.key, deadSprite.path);
    });
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    const [aliveSprite, deadSprite] = randomItem(FiveDifficultyEnemy.sprites);

    super({
      displayName: aliveSprite.displayName,
      maxHealth: randomInt(toEnemyStatRange(fiveEnemyConfig.health_range)),
      xpReward: fiveEnemyConfig.xp_reward,
      diamondsReward: fiveEnemyConfig.buff_container_reward,
      coinsReward: fiveEnemyConfig.lootbox_container_reward,
      emeraldDropChance: fiveEnemyConfig.emerald_drop_chance,
      damagePerHit: randomInt(toEnemyStatRange(fiveEnemyConfig.damage_range)),
      attackCooldownSeconds: randomFloat(
        toEnemyStatRange(fiveEnemyConfig.attack_speed_range),
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
      scaleX: baseScaleX * FiveDifficultyEnemy.attackAnimationScaleMultiplier,
      scaleY: baseScaleY * FiveDifficultyEnemy.attackAnimationScaleMultiplier,
      duration: FiveDifficultyEnemy.attackAnimationDurationMs,
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
      x: this.slot.x + FiveDifficultyEnemy.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + FiveDifficultyEnemy.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: FiveDifficultyEnemy.deathAnimationDurationMs,
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
