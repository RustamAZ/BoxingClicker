import { GameObjects, Scene } from "phaser";
import { thirdBossConfig } from "../../../../configs/bosses";
import type { Player } from "../../../Player/Player";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

type BossSpriteConfig = {
  key: string;
  path: string;
};

export class ThirdDifficultyBoss extends Enemy {
  readonly isCanAttack = true;

  private static readonly attackAnimationDurationMs = 180;
  private static readonly attackAnimationMoveOffsetY = -18;
  private static readonly attackAnimationAngle = -5;
  private static readonly webShotMaxPunchSpeed =
    thirdBossConfig.effect?.type === "attack_speed_slow"
      ? (thirdBossConfig.effect.max_attack_speed ?? 3)
      : 3;
  private static readonly webShotDebuffDurationSeconds = 0.8;
  private static readonly webShotAnimationDurationMs = 620;
  private static readonly webShotStartScale = 0.18;
  private static readonly webShotEndScale = 7.5;
  private static readonly deathAnimationDurationMs = 650;
  private static readonly deathAnimationMoveOffsetX = 180;
  private static readonly deathAnimationMoveOffsetY = 140;
  private static readonly aliveSprite: BossSpriteConfig = {
    key: "third-difficulty-spider-rider-boss",
    path: "assets/images/enemies/third-difficulty/spider-rider-boss.png",
  };
  private static readonly deadSprite: BossSpriteConfig = {
    key: "third-difficulty-spider-rider-boss-dead",
    path: "assets/images/enemies/third-difficulty/spider-rider-boss-die.png",
  };
  private static readonly webShotSprite: BossSpriteConfig = {
    key: "third-difficulty-spider-rider-boss-web-shot",
    path: "assets/images/enemies/third-difficulty/web-shot.png",
  };

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;
  private readonly webShots: GameObjects.Image[] = [];
  private isDeathAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      ThirdDifficultyBoss.aliveSprite.key,
      ThirdDifficultyBoss.aliveSprite.path,
    );
    scene.load.image(
      ThirdDifficultyBoss.deadSprite.key,
      ThirdDifficultyBoss.deadSprite.path,
    );
    scene.load.image(
      ThirdDifficultyBoss.webShotSprite.key,
      ThirdDifficultyBoss.webShotSprite.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
  ) {
    super({
      displayName: "Spider Rider Boss",
      isBoss: true,
      maxHealth: thirdBossConfig.health,
      xpReward: thirdBossConfig.xp_reward,
      diamondsReward: thirdBossConfig.buff_container_reward,
      coinsReward: thirdBossConfig.lootbox_container_reward,
      emeraldDropChance: thirdBossConfig.emerald_drop_chance,
      emeraldDropAmount: thirdBossConfig.emerald_drop_amount,
      damagePerHit: thirdBossConfig.damage,
      attackCooldownSeconds: thirdBossConfig.attack_speed,
      initialAttackDelaySeconds: thirdBossConfig.initial_attack_delay,
    });

    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, ThirdDifficultyBoss.aliveSprite.key)
      .setDisplaySize(slot.width * 1.14, slot.height * 1.14)
      .setInteractive({ useHandCursor: true });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack(player: Player) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    player.applyStatEffect({
      stat: "punch-speed",
      mode: "cap-max",
      value: ThirdDifficultyBoss.webShotMaxPunchSpeed,
      durationSeconds: ThirdDifficultyBoss.webShotDebuffDurationSeconds,
      sourceId: "third-difficulty-boss-web-shot",
    });
    this.playAttackAnimation();
    this.playWebShotAnimation();
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isDeathAnimationPlaying) {
      return;
    }

    this.isDeathAnimationPlaying = true;
    this.scene.tweens.killTweensOf(this.body);
    this.destroyWebShots();
    this.body.disableInteractive();
    this.body.setAngle(0);
    this.body.setTexture(ThirdDifficultyBoss.deadSprite.key);
    this.body.setDisplaySize(this.slot.width * 1.14, this.slot.height * 1.14);

    const direction = Math.random() < 0.5 ? -1 : 1;

    this.body.scene.tweens.add({
      targets: this.body,
      x:
        this.slot.x +
        ThirdDifficultyBoss.deathAnimationMoveOffsetX * direction,
      y: this.slot.y + ThirdDifficultyBoss.deathAnimationMoveOffsetY,
      alpha: 0,
      duration: ThirdDifficultyBoss.deathAnimationDurationMs,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.body);
    this.destroyWebShots();
    this.body.destroy();
  }

  private playAttackAnimation() {
    this.scene.tweens.killTweensOf(this.body);
    this.body.setPosition(this.slot.x, this.slot.y);
    this.body.setAngle(0);

    this.scene.tweens.add({
      targets: this.body,
      y: this.slot.y + ThirdDifficultyBoss.attackAnimationMoveOffsetY,
      angle: ThirdDifficultyBoss.attackAnimationAngle,
      duration: ThirdDifficultyBoss.attackAnimationDurationMs,
      yoyo: true,
      ease: "Back.easeOut",
      onComplete: () => {
        if (!this.isDeathAnimationPlaying) {
          this.body.setPosition(this.slot.x, this.slot.y);
          this.body.setAngle(0);
        }
      },
    });
  }

  private playWebShotAnimation() {
    const webShot = this.scene.add
      .image(
        this.slot.x,
        this.slot.y - this.slot.height * 0.22,
        ThirdDifficultyBoss.webShotSprite.key,
      )
      .setScale(ThirdDifficultyBoss.webShotStartScale)
      .setAlpha(0.95)
      .setDepth(this.body.depth + 20);

    this.webShots.push(webShot);

    this.scene.tweens.add({
      targets: webShot,
      x: this.scene.scale.width / 2,
      y: this.scene.scale.height / 2,
      scale: ThirdDifficultyBoss.webShotEndScale,
      alpha: 0,
      duration: ThirdDifficultyBoss.webShotAnimationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.removeWebShot(webShot);
      },
    });
  }

  private removeWebShot(webShot: GameObjects.Image) {
    const index = this.webShots.indexOf(webShot);

    if (index >= 0) {
      this.webShots.splice(index, 1);
    }

    webShot.destroy();
  }

  private destroyWebShots() {
    this.webShots.splice(0).forEach((webShot) => {
      this.scene.tweens.killTweensOf(webShot);
      webShot.destroy();
    });
  }
}
