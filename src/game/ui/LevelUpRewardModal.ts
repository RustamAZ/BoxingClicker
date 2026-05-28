import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import { RewardChoiceController } from "../upgrades/RewardChoiceController";
import type { RewardChoice } from "../upgrades/types";

type RewardCard = {
  container: GameObjects.Image;
  icon: GameObjects.Image;
  hitArea: GameObjects.Rectangle;
  description: GameObjects.Text;
  choice?: RewardChoice;
};

export class LevelUpRewardModal {
  private static readonly depth = 1200;
  private static readonly selectionLockDurationMs = 300;
  private static readonly backgroundTextureKey = "buff-container-empty";
  private static readonly backgroundPath =
    "assets/images/ui/buffs/buff-container-empty.png";
  private static readonly titleYOffset = -187;
  private static readonly cardYOffset = 56;
  private static readonly iconYOffset = -82;
  private static readonly descriptionYOffset = 144;
  private static readonly cardGap = 286;
  private static readonly cardWidth = 262;
  private static readonly cardHeight = 360;
  private static readonly descriptionWidth = 250;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Image;
  private readonly title: GameObjects.Text;
  private readonly cards: RewardCard[];
  private readonly unsubscribeLanguageChange: () => void;
  private onSelect?: (choice: RewardChoice) => void;
  private isSelectionLocked = false;
  private unlockSelectionTimer?: Phaser.Time.TimerEvent;

  static preload(scene: Scene) {
    scene.load.image(
      LevelUpRewardModal.backgroundTextureKey,
      LevelUpRewardModal.backgroundPath,
    );
  }

  constructor(private readonly scene: Scene) {
    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(LevelUpRewardModal.depth)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .image(centerX, centerY, LevelUpRewardModal.backgroundTextureKey)
      .setDepth(LevelUpRewardModal.depth + 1)
      .setVisible(false);

    this.title = this.scene.add
      .text(
        centerX,
        centerY + LevelUpRewardModal.titleYOffset,
        languageController.t("levelReward.title"),
        {
          fontFamily: "Hardpixel",
          fontSize: 34,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 3)
      .setVisible(false);

    this.cards = [
      this.createRewardCard(centerX - LevelUpRewardModal.cardGap, centerY),
      this.createRewardCard(centerX, centerY),
      this.createRewardCard(centerX + LevelUpRewardModal.cardGap, centerY),
    ];

    this.hide();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
  }

  show(choices: RewardChoice[], onSelect: (choice: RewardChoice) => void) {
    this.onSelect = onSelect;
    this.isSelectionLocked = true;
    this.clearUnlockSelectionTimer();
    this.setVisible(true);

    this.cards.forEach((card, index) => {
      const choice = choices[index];

      card.choice = choice;

      if (choice) {
        this.setCardData(card, choice);
      }

      this.setCardVisible(card, Boolean(choice), false);
    });

    this.unlockSelectionTimer = this.scene.time.delayedCall(
      LevelUpRewardModal.selectionLockDurationMs,
      () => {
        this.isSelectionLocked = false;
        this.unlockSelectionTimer = undefined;
        this.cards.forEach((card) => {
          if (card.choice) {
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
      card.choice = undefined;
      this.setCardVisible(card, false);
    });
  }

  private createRewardCard(x: number, modalCenterY: number): RewardCard {
    const card = {} as RewardCard;
    const cardY = modalCenterY + LevelUpRewardModal.cardYOffset;

    const container = this.scene.add
      .image(x, cardY, LevelUpRewardModal.backgroundTextureKey)
      .setDepth(LevelUpRewardModal.depth + 2)
      .setVisible(false);

    const icon = this.scene.add
      .image(
        x,
        cardY + LevelUpRewardModal.iconYOffset,
        LevelUpRewardModal.backgroundTextureKey,
      )
      .setDepth(LevelUpRewardModal.depth + 3)
      .setVisible(false);

    const hitArea = this.scene.add
      .rectangle(
        x,
        cardY,
        LevelUpRewardModal.cardWidth,
        LevelUpRewardModal.cardHeight,
        0x000000,
        0,
      )
      .setDepth(LevelUpRewardModal.depth + 4)
      .setInteractive({ useHandCursor: true });

    const description = this.scene.add
      .text(
        x,
        modalCenterY + LevelUpRewardModal.descriptionYOffset,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 26,
          color: "#ffffff",
          stroke: "#1f1f1f",
          strokeThickness: 5,
          align: "center",
          wordWrap: {
            width: LevelUpRewardModal.descriptionWidth,
          },
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(LevelUpRewardModal.depth + 3);

    card.container = container;
    card.icon = icon;
    card.hitArea = hitArea;
    card.description = description;

    hitArea.on("pointerdown", () => {
      const choice = card.choice;
      const onSelect = this.onSelect;

      if (this.isSelectionLocked || !choice || !onSelect) {
        return;
      }

      UiSoundPlayer.playClick(this.scene);
      this.onSelect = undefined;
      onSelect(choice);
    });
    hitArea.on("pointerover", () => {
      card.container.setTint(0xe8e8e8);
    });
    hitArea.on("pointerout", () => {
      card.container.clearTint();
    });

    return card;
  }

  private setCardData(card: RewardCard, choice: RewardChoice) {
    const localizedChoice = RewardChoiceController.localizeChoice(choice);

    card.container.setTexture(choice.rarityTextureKey);
    card.icon.setTexture(choice.iconTextureKey);
    card.description.setText(
      `${localizedChoice.title}\n${localizedChoice.description}`,
    );
  }

  private refreshTexts() {
    this.title.setText(languageController.t("levelReward.title"));
    this.cards.forEach((card) => {
      if (card.choice) {
        this.setCardData(card, card.choice);
      }
    });
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);

    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
    }
  }

  private setCardVisible(
    card: RewardCard,
    visible: boolean,
    canInteract = visible,
  ) {
    card.container.setVisible(visible);
    card.icon.setVisible(visible);
    card.hitArea.setVisible(visible);
    card.description.setVisible(visible);

    this.setCardInteractive(card, visible && canInteract);
  }

  private setCardInteractive(card: RewardCard, isInteractive: boolean) {
    if (isInteractive) {
      card.hitArea.setInteractive({ useHandCursor: true });
    } else {
      card.hitArea.disableInteractive();
    }
  }

  private clearUnlockSelectionTimer() {
    this.unlockSelectionTimer?.remove();
    this.unlockSelectionTimer = undefined;
  }
}
