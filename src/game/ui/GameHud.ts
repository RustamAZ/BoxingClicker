import { Scene } from "phaser";
import type { Enemy } from "../entities/Enemy/Enemy";
import type { Player } from "../entities/Player/Player";

export class GameHud {
  private static readonly xpBarEmptyTextureKey = "expbar-empty";
  private static readonly xpBarFullTextureKey = "expbar-full";
  private static readonly xpBarEmptyPath = "assets/images/ui/expbar-empty.png";
  private static readonly xpBarFullPath = "assets/images/ui/expbar-full.png";
  private static readonly xpBarDepth = 900;
  private static readonly healthBarEmptyTextureKey = "health-bar-empty";
  private static readonly healthBarFullTextureKey = "health-bar-full";
  private static readonly healthBarEmptyPath =
    "assets/images/ui/health-bar-empty.png";
  private static readonly healthBarFullPath =
    "assets/images/ui/health-bar-full.png";
  private static readonly healthBarDepth = 900;
  private static readonly healthBarX = 0;
  private static readonly healthBarY = 28;
  private static readonly healthDamageShakeOffsetX = 4;
  private static readonly healthDamageShakeDurationMs = 28;
  private static readonly healthDamageShakeRepeat = 3;
  private static readonly staminaBarEmptyTextureKey = "stamina-bar-empty";
  private static readonly staminaBarFullTextureKey = "stamina-bar-full";
  private static readonly staminaBarEmptyPath =
    "assets/images/ui/stamina-bar-empty.png";
  private static readonly staminaBarFullPath =
    "assets/images/ui/stamina-bar-full.png";
  private static readonly staminaBarDepth = 900;
  private static readonly enemyHealthBarEmptyTextureKey =
    "enemy-health-bar-empty";
  private static readonly enemyHealthBarFullTextureKey =
    "enemy-health-bar-full";
  private static readonly enemyHealthBarEmptyPath =
    "assets/images/ui/enemy-health-bar-empty.png";
  private static readonly enemyHealthBarFullPath =
    "assets/images/ui/enemy-health-bar-full.png";
  private static readonly enemyHealthBarDepth = 900;
  private static readonly enemyHealthBarY = 150;
  private static readonly bossLabelTextureKey = "boss-label";
  private static readonly bossLabelPath = "assets/images/ui/boss-label.png";
  private static readonly bossLabelGap = 8;

  private readonly xpBarFull: Phaser.GameObjects.Image;
  private readonly healthBarEmpty: Phaser.GameObjects.Image;
  private readonly healthBarFull: Phaser.GameObjects.Image;
  private readonly staminaBarFull: Phaser.GameObjects.Image;
  private readonly enemyHealthBarEmpty: Phaser.GameObjects.Image;
  private readonly enemyHealthBarFull: Phaser.GameObjects.Image;
  private readonly bossLabel: Phaser.GameObjects.Image;
  private previousHealth = 0;

  static preload(scene: Scene) {
    scene.load.image(GameHud.xpBarEmptyTextureKey, GameHud.xpBarEmptyPath);
    scene.load.image(GameHud.xpBarFullTextureKey, GameHud.xpBarFullPath);
    scene.load.image(
      GameHud.healthBarEmptyTextureKey,
      GameHud.healthBarEmptyPath,
    );
    scene.load.image(
      GameHud.healthBarFullTextureKey,
      GameHud.healthBarFullPath,
    );
    scene.load.image(
      GameHud.staminaBarEmptyTextureKey,
      GameHud.staminaBarEmptyPath,
    );
    scene.load.image(
      GameHud.staminaBarFullTextureKey,
      GameHud.staminaBarFullPath,
    );
    scene.load.image(
      GameHud.enemyHealthBarEmptyTextureKey,
      GameHud.enemyHealthBarEmptyPath,
    );
    scene.load.image(
      GameHud.enemyHealthBarFullTextureKey,
      GameHud.enemyHealthBarFullPath,
    );
    scene.load.image(GameHud.bossLabelTextureKey, GameHud.bossLabelPath);
  }

  constructor(scene: Scene, player: Player, enemy?: Enemy) {
    const xpBarFrame = scene.textures.getFrame(GameHud.xpBarEmptyTextureKey);
    const xpBarX = 0;
    const xpBarHeight = xpBarFrame.height;
    const xpBarY = scene.scale.height - xpBarHeight;

    scene.add
      .image(xpBarX, xpBarY, GameHud.xpBarEmptyTextureKey)
      .setOrigin(0, 0)
      .setDepth(GameHud.xpBarDepth);

    this.xpBarFull = scene.add
      .image(xpBarX, xpBarY, GameHud.xpBarFullTextureKey)
      .setOrigin(0, 0)
      .setDepth(GameHud.xpBarDepth + 1);

    this.healthBarEmpty = scene.add
      .image(
        GameHud.healthBarX,
        GameHud.healthBarY,
        GameHud.healthBarEmptyTextureKey,
      )
      .setOrigin(0, 0)
      .setDepth(GameHud.healthBarDepth);

    this.healthBarFull = scene.add
      .image(
        GameHud.healthBarX,
        GameHud.healthBarY,
        GameHud.healthBarFullTextureKey,
      )
      .setOrigin(0, 0)
      .setDepth(GameHud.healthBarDepth + 1);

    const staminaBarX = 0;
    const staminaBarY = 70;

    scene.add
      .image(staminaBarX, staminaBarY, GameHud.staminaBarEmptyTextureKey)
      .setOrigin(0, 0)
      .setDepth(GameHud.staminaBarDepth);

    this.staminaBarFull = scene.add
      .image(staminaBarX, staminaBarY, GameHud.staminaBarFullTextureKey)
      .setOrigin(0, 0)
      .setDepth(GameHud.staminaBarDepth + 1);

    const enemyHealthBarFrame = scene.textures.getFrame(
      GameHud.enemyHealthBarEmptyTextureKey,
    );
    const enemyHealthBarX = (scene.scale.width - enemyHealthBarFrame.width) / 2;
    const bossLabelFrame = scene.textures.getFrame(GameHud.bossLabelTextureKey);
    const bossLabelX =
      enemyHealthBarX - 40;
    const bossLabelY =
      GameHud.enemyHealthBarY +
      (enemyHealthBarFrame.height - bossLabelFrame.height) / 2;

    this.enemyHealthBarEmpty = scene.add
      .image(
        enemyHealthBarX,
        GameHud.enemyHealthBarY,
        GameHud.enemyHealthBarEmptyTextureKey,
      )
      .setOrigin(0, 0)
      .setDepth(GameHud.enemyHealthBarDepth);

    this.enemyHealthBarFull = scene.add
      .image(
        enemyHealthBarX,
        GameHud.enemyHealthBarY,
        GameHud.enemyHealthBarFullTextureKey,
      )
      .setOrigin(0, 0)
      .setDepth(GameHud.enemyHealthBarDepth + 1);

    this.bossLabel = scene.add
      .image(bossLabelX, bossLabelY, GameHud.bossLabelTextureKey)
      .setOrigin(0, 0)
      .setDepth(GameHud.enemyHealthBarDepth + 2);

    this.previousHealth = player.health;
    this.update(player, enemy);
  }

  update(player: Player, enemy?: Enemy) {
    const hasTakenDamage = player.health < this.previousHealth;

    this.updateXpBar(player);
    this.updateHealthBar(player);
    this.updateStaminaBar(player);
    this.updateEnemyHealthBar(enemy);

    if (hasTakenDamage) {
      this.playHealthDamageShake();
    }

    this.previousHealth = player.health;
  }

  private updateXpBar(player: Player) {
    const progress =
      player.xpToNextLevel > 0 ? player.xp / player.xpToNextLevel : 0;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    this.xpBarFull.setCrop(
      0,
      0,
      this.xpBarFull.width * clampedProgress,
      this.xpBarFull.height,
    );
  }

  private updateHealthBar(player: Player) {
    const healthProgress =
      player.maxHealth > 0 ? player.health / player.maxHealth : 0;
    const clampedProgress = Math.min(Math.max(healthProgress, 0), 1);

    this.healthBarFull.setCrop(
      0,
      0,
      this.healthBarFull.width * clampedProgress,
      this.healthBarFull.height,
    );
  }

  private updateStaminaBar(player: Player) {
    const staminaProgress =
      player.maxStamina > 0 ? player.stamina / player.maxStamina : 0;
    const clampedProgress = Math.min(Math.max(staminaProgress, 0), 1);

    this.staminaBarFull.setCrop(
      0,
      0,
      this.staminaBarFull.width * clampedProgress,
      this.staminaBarFull.height,
    );
  }

  private updateEnemyHealthBar(enemy?: Enemy) {
    const enemyHealthProgress =
      enemy && enemy.maxHealth > 0 ? enemy.health / enemy.maxHealth : 0;
    const clampedProgress = Math.min(Math.max(enemyHealthProgress, 0), 1);

    this.enemyHealthBarFull.setCrop(
      0,
      0,
      this.enemyHealthBarFull.width * clampedProgress,
      this.enemyHealthBarFull.height,
    );
    this.enemyHealthBarEmpty.setVisible(Boolean(enemy));
    this.enemyHealthBarFull.setVisible(Boolean(enemy));
    this.bossLabel.setVisible(Boolean(enemy?.isBoss));
  }

  private playHealthDamageShake() {
    const scene = this.healthBarFull.scene;
    const targets = [this.healthBarEmpty, this.healthBarFull];

    scene.tweens.killTweensOf(targets);
    this.resetHealthBarPosition();

    scene.tweens.add({
      targets,
      x: GameHud.healthBarX + GameHud.healthDamageShakeOffsetX,
      duration: GameHud.healthDamageShakeDurationMs,
      yoyo: true,
      repeat: GameHud.healthDamageShakeRepeat,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.resetHealthBarPosition();
      },
    });
  }

  private resetHealthBarPosition() {
    this.healthBarEmpty.setPosition(GameHud.healthBarX, GameHud.healthBarY);
    this.healthBarFull.setPosition(GameHud.healthBarX, GameHud.healthBarY);
  }
}
