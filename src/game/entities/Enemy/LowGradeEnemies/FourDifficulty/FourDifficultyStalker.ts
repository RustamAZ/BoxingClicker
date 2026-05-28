import { GameObjects, Scene } from "phaser";
import type { Player } from "../../../Player/Player";
import { Enemy } from "../../Enemy";
import type { EnemySpawnSlot } from "../../types";

export type FourDifficultyStalkerState = "passive" | "aggressive";

type StalkerAssetConfig = {
  key: string;
  path: string;
};

export class FourDifficultyStalker extends Enemy {
  readonly isCanAttack: boolean;
  readonly shouldPlayDefaultAttackSound = false;

  private static readonly passiveSprite: StalkerAssetConfig = {
    key: "four-difficulty-stalker-passive",
    path: "assets/images/enemies/four-difficulty/stalker-passive.png",
  };
  private static readonly aggressiveSprite: StalkerAssetConfig = {
    key: "four-difficulty-stalker-aggressive",
    path: "assets/images/enemies/four-difficulty/stalker-aggressive.png",
  };
  private static readonly spawnSound: StalkerAssetConfig = {
    key: "four-difficulty-stalker-spawn-sound",
    path: "assets/audio/enemies/four-difficulty/stalker-spawn.mp3",
  };
  private static readonly escapeSound: StalkerAssetConfig = {
    key: "four-difficulty-stalker-escape-sound",
    path: "assets/audio/enemies/four-difficulty/stalker-escape.mp3",
  };
  private static readonly attackSound: StalkerAssetConfig = {
    key: "four-difficulty-stalker-attack-sound",
    path: "assets/audio/enemies/four-difficulty/stalker-attack.mp3",
  };
  private static readonly attackCooldownSeconds = 1.1;
  private static readonly initialAttackDelaySeconds = 0.35;
  private static readonly attackAnimationDurationMs = 140;
  private static readonly attackAnimationScaleMultiplier = 1.05;
  private static readonly escapeAnimationDurationMs = 230;
  private static readonly escapeAnimationMoveOffsetY = -70;

  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;

  private isEscapeAnimationPlaying = false;

  static preload(scene: Scene) {
    scene.load.image(
      FourDifficultyStalker.passiveSprite.key,
      FourDifficultyStalker.passiveSprite.path,
    );
    scene.load.image(
      FourDifficultyStalker.aggressiveSprite.key,
      FourDifficultyStalker.aggressiveSprite.path,
    );
    scene.load.audio(
      FourDifficultyStalker.spawnSound.key,
      FourDifficultyStalker.spawnSound.path,
    );
    scene.load.audio(
      FourDifficultyStalker.escapeSound.key,
      FourDifficultyStalker.escapeSound.path,
    );
    scene.load.audio(
      FourDifficultyStalker.attackSound.key,
      FourDifficultyStalker.attackSound.path,
    );
  }

  constructor(
    private readonly scene: Scene,
    slot: EnemySpawnSlot,
    private readonly state: FourDifficultyStalkerState,
  ) {
    super({
      displayName: "Stalker",
      maxHealth: 1,
      xpReward: 0,
      diamondsReward: 0,
      coinsReward: 0,
      emeraldDropChance: 0,
      damagePerHit: state === "aggressive" ? 50 : 0,
      attackCooldownSeconds: FourDifficultyStalker.attackCooldownSeconds,
      initialAttackDelaySeconds:
        FourDifficultyStalker.initialAttackDelaySeconds,
    });

    this.isCanAttack = state === "aggressive";
    this.slot = slot;
    this.body = scene.add
      .image(slot.x, slot.y, this.getSpriteKey())
      .setDisplaySize(slot.width * 1, slot.height * 1.1)
      .setInteractive({ useHandCursor: true });

    this.scene.sound.play(FourDifficultyStalker.spawnSound.key, {
      volume: 3.5,
    });
  }

  takeDamage(_amount: number) {
    this.health = 0;

    return false;
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  protected onAttack(_player: Player) {
    if (this.isEscapeAnimationPlaying || this.state !== "aggressive") {
      return;
    }

    this.scene.sound.play(FourDifficultyStalker.attackSound.key, {
      volume: 1.2,
    });

    const baseScaleX = this.body.scaleX;
    const baseScaleY = this.body.scaleY;

    this.scene.tweens.add({
      targets: this.body,
      scaleX:
        baseScaleX * FourDifficultyStalker.attackAnimationScaleMultiplier,
      scaleY:
        baseScaleY * FourDifficultyStalker.attackAnimationScaleMultiplier,
      duration: FourDifficultyStalker.attackAnimationDurationMs,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  playDeathAnimation(onComplete: () => void) {
    if (this.isEscapeAnimationPlaying) {
      return;
    }

    this.isEscapeAnimationPlaying = true;
    this.body.disableInteractive();
    this.scene.sound.play(FourDifficultyStalker.escapeSound.key, {
      volume: 0.85,
    });

    this.scene.tweens.add({
      targets: this.body,
      y: this.slot.y + FourDifficultyStalker.escapeAnimationMoveOffsetY,
      alpha: 0,
      duration: FourDifficultyStalker.escapeAnimationDurationMs,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  destroy() {
    this.scene.tweens.killTweensOf(this.body);
    this.body.destroy();
  }

  private getSpriteKey() {
    return this.state === "aggressive"
      ? FourDifficultyStalker.aggressiveSprite.key
      : FourDifficultyStalker.passiveSprite.key;
  }
}
