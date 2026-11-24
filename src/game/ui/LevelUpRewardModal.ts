import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import { RewardChoiceController } from "../upgrades/RewardChoiceController";
import type { RewardChoice } from "../upgrades/types";

type RewardCard = {
  view: GameObjects.Container;
  background: GameObjects.Image;
  icon: GameObjects.Image;
  hitArea: GameObjects.Rectangle;
  description: GameObjects.Text;
  choice?: RewardChoice;
};

export class LevelUpRewardModal {
  private static readonly depth = 1200;
  private static readonly selectionLockDurationMs = 800;
  private static readonly selectionAnimationDurationMs = 150;
  private static readonly selectionScale = 1.12;
  private static readonly backgroundTextureKey = "buff-container-empty";
  private static readonly backgroundPath =
    "assets/images/ui/buffs/buff-container-empty.png";
  private static readonly titleYOffset = -187;
  private static readonly cardYOffset = 56;
  private static readonly iconYOffset = -82;
  private static readonly descriptionYOffset = 88;
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
  private selectionUpdate?: (time: number, delta: number) => void;

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
    this.overlay.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
      },
    );

    this.hide();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.clearSelectionAnimation();
      this.unsubscribeLanguageChange();
    });
  }

  show(choices: RewardChoice[], onSelect: (choice: RewardChoice) => void) {
    this.onSelect = onSelect;
    this.isSelectionLocked = true;
    this.clearUnlockSelectionTimer();
    this.clearSelectionAnimation();
    this.setVisible(true);

    this.cards.forEach((card, index) => {
      const choice = choices[index];

      card.choice = choice;
      card.view.setScale(1);
      card.background.clearTint();

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
    this.clearSelectionAnimation();
    this.setVisible(false);
    this.cards.forEach((card) => {
      card.choice = undefined;
      this.setCardVisible(card, false);
    });
  }

  private createRewardCard(x: number, modalCenterY: number): RewardCard {
    const cardY = modalCenterY + LevelUpRewardModal.cardYOffset;

    const background = this.scene.add.image(
      0,
      0,
      LevelUpRewardModal.backgroundTextureKey,
    );
    const icon = this.scene.add.image(
      0,
      LevelUpRewardModal.iconYOffset,
      LevelUpRewardModal.backgroundTextureKey,
    );

    const description = this.scene.add
      .text(
        0,
        LevelUpRewardModal.descriptionYOffset,
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
      .setResolution(2);

    const view = this.scene.add
      .container(x, cardY, [background, icon, description])
      .setDepth(LevelUpRewardModal.depth + 2);
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
    const card: RewardCard = { view, background, icon, description, hitArea };

    hitArea.on(
      "pointerdown",
      (
        _pointer: Phaser.Input.Pointer,
        _localX: number,
        _localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        this.selectCard(card);
      },
    );
    hitArea.on("pointerover", () => {
      card.background.setTint(0xe8e8e8);
    });
    hitArea.on("pointerout", () => {
      card.background.clearTint();
    });

    return card;
  }

  private selectCard(card: RewardCard) {
    const choice = card.choice;
    const onSelect = this.onSelect;

    if (this.isSelectionLocked || !choice || !onSelect) {
      return;
    }

    this.onSelect = undefined;
    this.cards.forEach((rewardCard) => this.setCardInteractive(rewardCard, false));
    UiSoundPlayer.playClick(this.scene);

    let elapsed = 0;

    // The game pauses the scene's tween manager while the reward modal is open.
    this.selectionUpdate = (_time, delta) => {
      elapsed += delta;
      const progress = Math.min(
        elapsed / LevelUpRewardModal.selectionAnimationDurationMs,
        1,
      );
      const easedProgress = 1 - (1 - progress) ** 3;

      card.view.setScale(
        1 + (LevelUpRewardModal.selectionScale - 1) * easedProgress,
      );

      if (progress === 1) {
        this.clearSelectionAnimation();
        onSelect(choice);
      }
    };
    this.scene.events.on("update", this.selectionUpdate);
  }

  private clearSelectionAnimation() {
    if (this.selectionUpdate) {
      this.scene.events.off("update", this.selectionUpdate);
      this.selectionUpdate = undefined;
    }
  }

  private setCardData(card: RewardCard, choice: RewardChoice) {
    const localizedChoice = RewardChoiceController.localizeChoice(choice);

    card.background.setTexture(choice.rarityTextureKey);
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
    card.view.setVisible(visible);
    card.hitArea.setVisible(visible);

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
