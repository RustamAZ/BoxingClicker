import { GameObjects, Scene } from "phaser";
import { Enemy } from "../Enemy";
import type { EnemySpawnSlot } from "../types";

export class PunchingBag extends Enemy {
  readonly isCanAttack = false;

  private static readonly config = {
    displayName: "Punching Bag",
    maxHealth: 100,
    xpReward: 2,
    diamondsReward: 0,
    coinsReward: 0,
    damagePerHit: 4,
    attackCooldownSeconds: 4,
  };
  readonly body: GameObjects.Image;
  readonly slot: EnemySpawnSlot;

  static preload(scene: Scene) {
    scene.load.image(
      "punching-bag",
      "assets/images/enemies/PunchingBagSprite.png",
    );
  }

  constructor(scene: Scene, slot: EnemySpawnSlot) {
    super(PunchingBag.config);

    this.slot = slot;

    this.body = scene.add
      .image(slot.x, slot.y, "punching-bag")
      .setDisplaySize(this.slot.width, this.slot.height)
      .setInteractive({ useHandCursor: true });
  }

  onHit(callback: () => void) {
    this.body.on("pointerdown", callback);
  }

  destroy() {
    this.body.destroy();
  }
}
