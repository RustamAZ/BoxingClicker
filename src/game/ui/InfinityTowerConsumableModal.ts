import { GameObjects, Scene } from "phaser";
import {
  infinityTowerConsumablesConfig,
  type InfinityTowerConsumableConfig,
  type InfinityTowerConsumableId,
} from "../configs/infinityTowerConsumables";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";

type ConsumableOptionView = {
  icon: GameObjects.Image;
  title: GameObjects.Text;
  count: GameObjects.Text;
  hitArea: GameObjects.Rectangle;
  consumable: InfinityTowerConsumableConfig;
};

export class InfinityTowerConsumableModal {
  private static readonly depth = 1380;
  private static readonly iconSize = 96;
  private static readonly optionSize = 132;

  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly options: ConsumableOptionView[];
  private readonly skipButton: GameObjects.Rectangle;
  private readonly skipLabel: GameObjects.Text;
  private readonly unsubscribeLanguageChange: () => void;
  private onChoose?: (consumableId?: InfinityTowerConsumableId) => void;

  static preload(scene: Scene) {
    infinityTowerConsumablesConfig.forEach((consumable) => {
      scene.load.image(consumable.iconTextureKey, consumable.iconTexturePath);
    });
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
  ) {
    const centerX = scene.scale.width / 2;
    const centerY = scene.scale.height / 2;

    this.overlay = scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.62)
      .setDepth(InfinityTowerConsumableModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = scene.add
      .rectangle(centerX, centerY, 520, 330, 0x1b1b1b, 0.94)
      .setDepth(InfinityTowerConsumableModal.depth + 1)
      .setStrokeStyle(3, 0xffd05a, 1)
      .setVisible(false);
    this.title = scene.add
      .text(centerX, centerY - 118, "", {
        fontFamily: "Hardpixel",
        fontSize: 28,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfinityTowerConsumableModal.depth + 2)
      .setVisible(false);

    this.options = infinityTowerConsumablesConfig.map((consumable, index) =>
      this.createOption(centerX + (index === 0 ? -115 : 115), centerY - 12, consumable),
    );
    this.skipButton = scene.add
      .rectangle(centerX, centerY + 118, 190, 48, 0x343434, 1)
      .setDepth(InfinityTowerConsumableModal.depth + 2)
      .setStrokeStyle(2, 0xa8a8a8, 1)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.skipLabel = scene.add
      .text(centerX, centerY + 118, "", {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfinityTowerConsumableModal.depth + 3)
      .setVisible(false);

    this.skipButton.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.choose(undefined);
    });
    this.skipButton.on("pointerover", () => this.setSkipButtonScale(1.04));
    this.skipButton.on("pointerout", () => this.setSkipButtonScale(1));

    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
    this.hide();
  }

  show(
    counts: Partial<Record<InfinityTowerConsumableId, number>>,
    onChoose: (consumableId?: InfinityTowerConsumableId) => void,
  ) {
    this.onChoose = onChoose;
    this.pauseController.pause("infinite-mode");
    this.setVisible(true);
    this.refreshTexts();

    this.options.forEach((option) => {
      const count = counts[option.consumable.id] ?? 0;
      const isAvailable = count > 0;

      option.count.setText(`x${count}`);
      option.icon.setAlpha(isAvailable ? 1 : 0.35);
      option.title.setAlpha(isAvailable ? 1 : 0.35);
      option.count.setAlpha(isAvailable ? 1 : 0.35);

      if (isAvailable) {
        option.hitArea.setInteractive({ useHandCursor: true });
      } else {
        option.hitArea.disableInteractive();
      }
    });
  }

  hide() {
    this.onChoose = undefined;
    this.setVisible(false);

    if (this.pauseController.has("infinite-mode")) {
      this.pauseController.resume("infinite-mode");
    }
  }

  private createOption(
    x: number,
    y: number,
    consumable: InfinityTowerConsumableConfig,
  ): ConsumableOptionView {
    const icon = this.scene.add
      .image(x, y - 14, consumable.iconTextureKey)
      .setDisplaySize(
        InfinityTowerConsumableModal.iconSize,
        InfinityTowerConsumableModal.iconSize,
      )
      .setDepth(InfinityTowerConsumableModal.depth + 3)
      .setVisible(false);
    const title = this.scene.add
      .text(x, y + 64, "", {
        fontFamily: "Hardpixel",
        fontSize: 16,
        color: "#ffe85a",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: 145,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfinityTowerConsumableModal.depth + 3)
      .setVisible(false);
    const count = this.scene.add
      .text(x + 44, y - 58, "", {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(InfinityTowerConsumableModal.depth + 4)
      .setVisible(false);
    const hitArea = this.scene.add
      .rectangle(
        x,
        y,
        InfinityTowerConsumableModal.optionSize,
        InfinityTowerConsumableModal.optionSize,
        0x000000,
        0,
      )
      .setDepth(InfinityTowerConsumableModal.depth + 5)
      .setVisible(false);

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.choose(consumable.id);
    });
    hitArea.on("pointerover", () => this.setOptionScale({ icon, title, count }, 1.05));
    hitArea.on("pointerout", () => this.setOptionScale({ icon, title, count }, 1));

    return {
      icon,
      title,
      count,
      hitArea,
      consumable,
    };
  }

  private choose(consumableId?: InfinityTowerConsumableId) {
    const onChoose = this.onChoose;

    this.hide();
    onChoose?.(consumableId);
  }

  private refreshTexts() {
    this.title.setText(languageController.t("infinite.consumable.question"));
    this.skipLabel.setText(languageController.t("infinite.consumable.no"));
    this.options.forEach((option) => {
      option.title.setText(languageController.t(option.consumable.titleKey));
    });
  }

  private setVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.options.forEach((option) => {
      option.icon.setVisible(visible);
      option.title.setVisible(visible);
      option.count.setVisible(visible);
      option.hitArea.setVisible(visible);

      if (!visible) {
        option.hitArea.disableInteractive();
      }
    });
    this.skipButton.setVisible(visible);
    this.skipLabel.setVisible(visible);

    if (visible) {
      this.overlay.setInteractive();
      this.skipButton.setInteractive({ useHandCursor: true });
    } else {
      this.overlay.disableInteractive();
      this.skipButton.disableInteractive();
    }
  }

  private setOptionScale(
    option: Pick<ConsumableOptionView, "icon" | "title" | "count">,
    scale: number,
  ) {
    option.icon.setScale(scale);
    option.title.setScale(scale);
    option.count.setScale(scale);
  }

  private setSkipButtonScale(scale: number) {
    this.skipButton.setScale(scale);
    this.skipLabel.setScale(scale);
  }
}
