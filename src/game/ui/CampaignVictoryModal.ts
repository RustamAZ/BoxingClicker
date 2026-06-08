import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import type { PauseController } from "../state/PauseController";

export class CampaignVictoryModal {
  private static readonly depth = 1460;
  private static readonly panelTextureKey = "campaign-victory-panel";
  private static readonly panelPath =
    "assets/images/ui/victory/campaign-victory.png";
  private static readonly panelWidth = 760;
  private static readonly panelHeight = 372;
  private static readonly buttonWidth = 245;
  private static readonly buttonHeight = 58;
  private static isAssetsLoaded = false;
  private static isAssetsLoading = false;
  private static readonly assetLoadCallbacks: Array<() => void> = [];

  private overlay?: GameObjects.Rectangle;
  private panel?: GameObjects.Image;
  private title?: GameObjects.Text;
  private message?: GameObjects.Text;
  private closeLabel?: GameObjects.Text;
  private closeHitArea?: GameObjects.Rectangle;
  private readonly unsubscribeLanguageChange: () => void;

  static preloadAssets(scene: Scene, onComplete?: () => void) {
    if (
      CampaignVictoryModal.isAssetsLoaded ||
      scene.textures.exists(CampaignVictoryModal.panelTextureKey)
    ) {
      CampaignVictoryModal.isAssetsLoaded = true;
      onComplete?.();
      return;
    }

    if (onComplete) {
      CampaignVictoryModal.assetLoadCallbacks.push(onComplete);
    }

    if (CampaignVictoryModal.isAssetsLoading) {
      return;
    }

    if (scene.load.isLoading()) {
      scene.load.once("complete", () => {
        CampaignVictoryModal.preloadAssets(scene);
      });
      return;
    }

    CampaignVictoryModal.isAssetsLoading = true;
    scene.load.image(
      CampaignVictoryModal.panelTextureKey,
      CampaignVictoryModal.panelPath,
    );
    scene.load.once("complete", () => {
      CampaignVictoryModal.isAssetsLoaded = true;
      CampaignVictoryModal.isAssetsLoading = false;
      const callbacks = CampaignVictoryModal.assetLoadCallbacks.splice(0);

      callbacks.forEach((callback) => callback());
    });
    scene.load.start();
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly onClose: () => void,
  ) {
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
  }

  preloadAssets() {
    CampaignVictoryModal.preloadAssets(this.scene);
  }

  show() {
    if (!CampaignVictoryModal.isAssetsLoaded) {
      CampaignVictoryModal.preloadAssets(this.scene, () => {
        this.show();
      });
      return;
    }

    this.ensureCreated();
    this.pauseController.pause("campaign-victory");
    this.refreshTexts();
    this.setVisible(true);
  }

  close() {
    if (!this.pauseController.has("campaign-victory")) {
      return;
    }

    this.pauseController.resume("campaign-victory");
    this.setVisible(false);
    this.onClose();
  }

  private ensureCreated() {
    if (this.panel) {
      return;
    }

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    this.overlay = this.scene.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.66)
      .setDepth(CampaignVictoryModal.depth)
      .setInteractive()
      .setVisible(false);
    this.panel = this.scene.add
      .image(centerX, centerY, CampaignVictoryModal.panelTextureKey)
      .setDisplaySize(
        CampaignVictoryModal.panelWidth,
        CampaignVictoryModal.panelHeight,
      )
      .setDepth(CampaignVictoryModal.depth + 1)
      .setVisible(false);
    this.title = this.scene.add
      .text(centerX, centerY - 124, "", {
        fontFamily: "Hardpixel",
        fontSize: 32,
        color: "#ffe85a",
        stroke: "#1f1f1f",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(CampaignVictoryModal.depth + 2)
      .setVisible(false);
    this.message = this.scene.add
      .text(centerX, centerY - 16, "", {
        fontFamily: "Hardpixel",
        fontSize: 21,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
        align: "center",
        wordWrap: {
          width: 560,
          useAdvancedWrap: true,
        },
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(CampaignVictoryModal.depth + 2)
      .setVisible(false);
    this.closeLabel = this.scene.add
      .text(centerX, centerY + 124, "", {
        fontFamily: "Hardpixel",
        fontSize: 25,
        color: "#ffffff",
        stroke: "#1f1f1f",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(CampaignVictoryModal.depth + 2)
      .setVisible(false);
    this.closeHitArea = this.scene.add
      .rectangle(
        centerX,
        centerY + 142,
        CampaignVictoryModal.buttonWidth,
        CampaignVictoryModal.buttonHeight,
        0x000000,
        0,
      )
      .setDepth(CampaignVictoryModal.depth + 3)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

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
    this.closeHitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      this.close();
    });
    this.closeHitArea.on("pointerover", () => {
      this.closeLabel?.setScale(1.05);
    });
    this.closeHitArea.on("pointerout", () => {
      this.closeLabel?.setScale(1);
    });
  }

  private refreshTexts() {
    this.title?.setText(languageController.t("victory.campaign.title"));
    this.message?.setText(languageController.t("victory.campaign.message"));
    this.closeLabel?.setText(languageController.t("victory.close"));
  }

  private setVisible(visible: boolean) {
    this.overlay?.setVisible(visible);
    this.panel?.setVisible(visible);
    this.title?.setVisible(visible);
    this.message?.setVisible(visible);
    this.closeLabel?.setVisible(visible);
    this.closeHitArea?.setVisible(visible);

    if (visible) {
      this.overlay?.setInteractive();
      this.closeHitArea?.setInteractive({ useHandCursor: true });
    } else {
      this.overlay?.disableInteractive();
      this.closeHitArea?.disableInteractive();
      this.closeLabel?.setScale(1);
    }
  }
}
