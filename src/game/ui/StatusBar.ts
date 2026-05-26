import { GameObjects, Scene } from "phaser";
import type { Player } from "../entities/Player/Player";

type StatusBarEffectId =
  | "attack-potion"
  | "speed-potion"
  | "web-slow";

type StatusBarEffectConfig = {
  id: StatusBarEffectId;
  sourceId: string;
  textureKey: string;
  texturePath: string;
  tint?: number;
};

type StatusBarSlot = {
  background: GameObjects.Rectangle;
  icon: GameObjects.Image;
};

export class StatusBar {
  private static readonly depth = 900;
  private static readonly xOffset = 42;
  private static readonly slotSize = 48;
  private static readonly slotGap = 10;
  private static readonly iconSize = 38;
  private static readonly blinkSpeed = 7;
  private static readonly effects: StatusBarEffectConfig[] = [
    {
      id: "speed-potion",
      sourceId: "loot-case-speed-potion",
      textureKey: "status-bar-speed-potion",
      texturePath: "assets/images/loot-case/rewards/l-speed-poition.png",
    },
    {
      id: "attack-potion",
      sourceId: "loot-case-attack-potion",
      textureKey: "status-bar-attack-potion",
      texturePath: "assets/images/loot-case/rewards/l-attack-poition.png",
    },
    {
      id: "web-slow",
      sourceId: "third-difficulty-boss-web-shot",
      textureKey: "status-bar-web-slow",
      texturePath: "assets/images/enemies/third-difficulty/web-shot.png",
      tint: 0xcff8ff,
    },
  ];

  private readonly slots = new Map<StatusBarEffectId, StatusBarSlot>();
  private readonly orderedEffects = StatusBar.effects;

  static preload(scene: Scene) {
    StatusBar.effects.forEach((effect) => {
      scene.load.image(effect.textureKey, effect.texturePath);
    });
  }

  constructor(private readonly scene: Scene) {
    const x = this.scene.scale.width - StatusBar.xOffset;
    const centerY = this.scene.scale.height / 2;

    this.orderedEffects.forEach((effect, index) => {
      const y = this.getSlotY(centerY, index);
      const background = this.scene.add
        .rectangle(
          x,
          y,
          StatusBar.slotSize,
          StatusBar.slotSize,
          0x151515,
          0.72,
        )
        .setDepth(StatusBar.depth)
        .setStrokeStyle(2, 0xffffff, 0.18)
        .setVisible(false);
      const icon = this.scene.add
        .image(x, y, effect.textureKey)
        .setDisplaySize(StatusBar.iconSize, StatusBar.iconSize)
        .setDepth(StatusBar.depth + 1)
        .setVisible(false);

      if (effect.tint !== undefined) {
        icon.setTint(effect.tint);
      }

      this.slots.set(effect.id, {
        background,
        icon,
      });
    });
  }

  update(player: Player, timeMs: number) {
    const activeSourceIds = new Set(
      player
        .getActiveStatEffects()
        .map((effect) => effect.sourceId)
        .filter((sourceId): sourceId is string => sourceId !== undefined),
    );
    const blinkAlpha =
      0.52 + Math.sin((timeMs / 1000) * StatusBar.blinkSpeed) * 0.28;

    this.orderedEffects.forEach((effect) => {
      const slot = this.slots.get(effect.id);

      if (!slot) {
        return;
      }

      const isActive = activeSourceIds.has(effect.sourceId);

      slot.background.setVisible(isActive);
      slot.icon.setVisible(isActive);

      if (isActive) {
        slot.icon.setAlpha(blinkAlpha);
        slot.background.setAlpha(0.68 + blinkAlpha * 0.18);
      }
    });
  }

  destroy() {
    this.slots.forEach((slot) => {
      slot.background.destroy();
      slot.icon.destroy();
    });
    this.slots.clear();
  }

  private getSlotY(centerY: number, index: number) {
    const totalHeight =
      this.orderedEffects.length * StatusBar.slotSize +
      (this.orderedEffects.length - 1) * StatusBar.slotGap;
    const firstY = centerY - totalHeight / 2 + StatusBar.slotSize / 2;

    return firstY + index * (StatusBar.slotSize + StatusBar.slotGap);
  }
}
