import { GameObjects, Scene } from "phaser";
import type { Upgrade, UpgradeDirection, UpgradeRarity } from "../upgrades/types";

type UpgradeCard = {
  background: GameObjects.Rectangle;
  title: GameObjects.Text;
  description: GameObjects.Text;
  meta: GameObjects.Text;
  upgrade?: Upgrade;
};

const rarityView: Record<UpgradeRarity, { label: string; color: string }> = {
  common: {
    label: "Обычный",
    color: "#d8d8d8",
  },
  rare: {
    label: "Редкий",
    color: "#6eb6ff",
  },
  epic: {
    label: "Эпический",
    color: "#d17bff",
  },
};

const directionLabels: Record<UpgradeDirection, string> = {
  strength: "Сила",
  "attack-speed": "Скорость",
  "stamina-cost": "Затраты",
  "stamina-volume": "Выносливость",
  health: "Здоровье",
  armor: "Защита",
};

export class LevelUpRewardModal {
  private static readonly depth = 1200;
  private static readonly selectionLockDurationMs = 300;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly subtitle: GameObjects.Text;
  private readonly cards: UpgradeCard[];
  private onSelect?: (upgrade: Upgrade) => void;
  private isSelectionLocked = false;
  private unlockSelectionTimer?: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Scene) {
    this.overlay = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.62)
      .setDepth(LevelUpRewardModal.depth)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .rectangle(512, 384, 880, 430, 0x1b1b1b, 0.98)
      .setDepth(LevelUpRewardModal.depth + 1)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setVisible(false);

    this.title = this.scene.add
      .text(512, 188, "Новый уровень", {
        fontFamily: "Arial",
        fontSize: 34,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 2)
      .setVisible(false);

    this.subtitle = this.scene.add
      .text(512, 228, "Выбери усиление", {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#d2d2d2",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 2)
      .setVisible(false);

    this.cards = [
      this.createUpgradeCard(232, 420),
      this.createUpgradeCard(512, 420),
      this.createUpgradeCard(792, 420),
    ];

    this.hide();
  }

  show(upgrades: Upgrade[], onSelect: (upgrade: Upgrade) => void) {
    this.onSelect = onSelect;
    this.isSelectionLocked = true;
    this.clearUnlockSelectionTimer();
    this.setVisible(true);

    this.cards.forEach((card, index) => {
      const upgrade = upgrades[index];

      card.upgrade = upgrade;
      this.setCardVisible(card, Boolean(upgrade), false);

      if (upgrade) {
        this.setCardText(card, upgrade);
      }
    });

    this.unlockSelectionTimer = this.scene.time.delayedCall(
      LevelUpRewardModal.selectionLockDurationMs,
      () => {
        this.isSelectionLocked = false;
        this.unlockSelectionTimer = undefined;
        this.cards.forEach((card) => {
          if (card.upgrade) {
            this.setCardInteractive(card, true);
          }
        });
      },
    );
  }

  hide() {
    this.onSelect = undefined;
    this.isSelectionLocked = false;
    this.clearUnlockSelectionTimer();
    this.setVisible(false);
    this.cards.forEach((card) => {
      card.upgrade = undefined;
      this.setCardVisible(card, false);
    });
  }

  private createUpgradeCard(x: number, y: number): UpgradeCard {
    const card = {} as UpgradeCard;
    const background = this.scene.add
      .rectangle(x, y, 250, 260, 0x2d2d2d, 0.97)
      .setDepth(LevelUpRewardModal.depth + 2)
      .setStrokeStyle(2, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });

    const title = this.scene.add
      .text(x, y - 82, "", {
        fontFamily: "Arial",
        fontSize: 22,
        color: "#ffffff",
        align: "center",
        wordWrap: {
          width: 210,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 3);

    const description = this.scene.add
      .text(x, y - 8, "", {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#e7e7e7",
        align: "center",
        wordWrap: {
          width: 210,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 3);

    const meta = this.scene.add
      .text(x, y + 92, "", {
        fontFamily: "Arial",
        fontSize: 16,
        color: "#d8d8d8",
        align: "center",
        wordWrap: {
          width: 210,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 3);

    card.background = background;
    card.title = title;
    card.description = description;
    card.meta = meta;

    background.on("pointerdown", () => {
      const upgrade = card.upgrade;
      const onSelect = this.onSelect;

      if (this.isSelectionLocked || !upgrade || !onSelect) {
        return;
      }

      this.onSelect = undefined;
      onSelect(upgrade);
    });

    background.on("pointerover", () => {
      background.setFillStyle(0x3a3a3a, 0.99);
    });
    background.on("pointerout", () => {
      background.setFillStyle(0x2d2d2d, 0.97);
    });

    return card;
  }

  private setCardText(card: UpgradeCard, upgrade: Upgrade) {
    const rarity = rarityView[upgrade.rarity];

    card.title.setText(upgrade.title);
    card.description.setText(upgrade.description);
    card.meta.setText(`${rarity.label} / ${directionLabels[upgrade.direction]}`);
    card.meta.setColor(rarity.color);
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.subtitle.setVisible(visible);

    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
    }
  }

  private setCardVisible(
    card: UpgradeCard,
    visible: boolean,
    canInteract = visible,
  ) {
    card.background.setVisible(visible);
    card.title.setVisible(visible);
    card.description.setVisible(visible);
    card.meta.setVisible(visible);

    this.setCardInteractive(card, visible && canInteract);
  }

  private setCardInteractive(card: UpgradeCard, isInteractive: boolean) {
    if (isInteractive) {
      card.background.setInteractive({ useHandCursor: true });
    } else {
      card.background.disableInteractive();
    }
  }

  private clearUnlockSelectionTimer() {
    this.unlockSelectionTimer?.remove();
    this.unlockSelectionTimer = undefined;
  }
}
