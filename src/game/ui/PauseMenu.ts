import { GameObjects, Scene } from "phaser";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { languageController } from "../localization/LanguageController";
import type { GameSettings } from "../state/GameSettings";
import type { PauseController } from "../state/PauseController";

type PauseMenuButton = {
  background: GameObjects.Image;
  label: GameObjects.Text;
};

type PauseMenuIconButton = {
  hitArea: GameObjects.Rectangle;
  icon: GameObjects.Image;
};

type VolumeSlider = {
  label: GameObjects.Text;
  track: GameObjects.Rectangle;
  fill: GameObjects.Rectangle;
  knob: GameObjects.Rectangle;
};

export class PauseMenu {
  private static readonly depth = 1000;
  private static readonly volumeSliderWidth = 260;
  private static readonly settingsIconTextureKey = "settings-icon";
  private static readonly settingsIconPath =
    "assets/images/ui/icons/settings.png";
  private static readonly settingsMenuBackgroundTextureKey =
    "settings-menu-background";
  private static readonly settingsMenuBackgroundPath =
    "assets/images/ui/buttons/settings-menu-bg.png";
  private static readonly settingsButtonBackgroundTextureKey =
    "settings-button-background";
  private static readonly settingsButtonBackgroundPath =
    "assets/images/ui/buttons/settings-button-bg.png";
  private static readonly muteIconTextureKey = "mute-icon";
  private static readonly muteIconPath = "assets/images/ui/icons/mute.png";
  private static readonly voiceIconTextureKey = "voice-icon";
  private static readonly voiceIconPath = "assets/images/ui/icons/voice.png";
  private static readonly settingsButtonSize = 92;
  private static readonly headerIconSize = 86;
  private static readonly headerIconHoverSize = 92;
  private static readonly menuPanelWidth = 480;
  private static readonly menuPanelHeight = 440;

  private readonly settingsButton: PauseMenuIconButton;
  private readonly muteButton: PauseMenuIconButton;
  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Image;
  private readonly title: GameObjects.Text;
  private readonly volumeSlider: VolumeSlider;
  private readonly continueButton: PauseMenuButton;
  private readonly restartButton: PauseMenuButton;
  private readonly languageButton: PauseMenuButton;
  private readonly unsubscribeLanguageChange: () => void;

  static preload(scene: Scene) {
    scene.load.image(PauseMenu.settingsIconTextureKey, PauseMenu.settingsIconPath);
    scene.load.image(
      PauseMenu.settingsMenuBackgroundTextureKey,
      PauseMenu.settingsMenuBackgroundPath,
    );
    scene.load.image(
      PauseMenu.settingsButtonBackgroundTextureKey,
      PauseMenu.settingsButtonBackgroundPath,
    );
    scene.load.image(PauseMenu.muteIconTextureKey, PauseMenu.muteIconPath);
    scene.load.image(PauseMenu.voiceIconTextureKey, PauseMenu.voiceIconPath);
  }

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly gameSettings: GameSettings,
    private readonly onRestart: () => void,
  ) {
    this.settingsButton = this.createSettingsButton(976, 68, () => {
      this.open();
    });
    this.muteButton = this.createMuteButton(900, 68);

    this.overlay = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.58)
      .setDepth(PauseMenu.depth + 10)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .image(512, 384, PauseMenu.settingsMenuBackgroundTextureKey)
      .setDisplaySize(PauseMenu.menuPanelWidth, PauseMenu.menuPanelHeight)
      .setDepth(PauseMenu.depth + 11)
      .setVisible(false);

    this.title = this.scene.add
      .text(512, 250, languageController.t("settings.title"), {
        fontFamily: "Hardpixel",
        fontSize: 30,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PauseMenu.depth + 12)
      .setVisible(false);

    this.volumeSlider = this.createVolumeSlider(512, 340);
    this.continueButton = this.createButton(
      512,
      410,
      240,
      48,
      languageController.t("settings.continue"),
      () => {
        this.close();
      },
    );
    this.restartButton = this.createButton(
      512,
      476,
      240,
      48,
      languageController.t("settings.restart"),
      () => {
        this.close();
        this.onRestart();
      },
    );
    this.languageButton = this.createButton(
      512,
      542,
      240,
      48,
      languageController.t("settings.language"),
      () => {
        languageController.toggleLanguage();
      },
    );

    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
    this.syncMuteButtonTexture();
    this.setMenuVisible(false);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshTexts();
    });
    this.scene.events.once("shutdown", () => {
      this.unsubscribeLanguageChange();
    });
  }

  get isPaused() {
    return this.pauseController.isPaused;
  }

  open() {
    if (this.pauseController.has("settings")) {
      return;
    }

    this.pauseController.pause("settings");
    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
    this.syncMuteButtonTexture();
    this.refreshTexts();
    this.setMenuVisible(true);
  }

  close() {
    if (!this.pauseController.has("settings")) {
      return;
    }

    this.pauseController.resume("settings");
    this.setMenuVisible(false);
  }

  toggle() {
    if (this.pauseController.has("settings")) {
      this.close();
      return;
    }

    if (!this.pauseController.isPaused) {
      this.open();
    }
  }

  private createSettingsButton(
    x: number,
    y: number,
    onClick: () => void,
  ): PauseMenuIconButton {
    return this.createIconButton(
      x,
      y,
      PauseMenu.settingsIconTextureKey,
      onClick,
    );
  }

  private createMuteButton(x: number, y: number): PauseMenuIconButton {
    return this.createIconButton(x, y, this.getMuteButtonTextureKey(), () => {
      this.gameSettings.toggleMuted();
      this.syncMuteButtonTexture();
    });
  }

  private createIconButton(
    x: number,
    y: number,
    textureKey: string,
    onClick: () => void,
  ): PauseMenuIconButton {
    const hitArea = this.scene.add
      .rectangle(
        x,
        y,
        PauseMenu.settingsButtonSize,
        PauseMenu.settingsButtonSize,
        0x000000,
        0,
      )
      .setDepth(PauseMenu.depth)
      .setInteractive({ useHandCursor: true });
    const icon = this.scene.add
      .image(x, y, textureKey)
      .setDisplaySize(PauseMenu.headerIconSize, PauseMenu.headerIconSize)
      .setDepth(PauseMenu.depth + 1);

    hitArea.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      onClick();
    });
    hitArea.on("pointerover", () => {
      icon.setDisplaySize(
        PauseMenu.headerIconHoverSize,
        PauseMenu.headerIconHoverSize,
      );
    });
    hitArea.on("pointerout", () => {
      icon.setDisplaySize(
        PauseMenu.headerIconSize,
        PauseMenu.headerIconSize,
      );
    });

    return {
      hitArea,
      icon,
    };
  }

  private syncMuteButtonTexture() {
    this.muteButton.icon.setTexture(this.getMuteButtonTextureKey());
  }

  private getMuteButtonTextureKey() {
    return this.gameSettings.getIsMuted()
      ? PauseMenu.muteIconTextureKey
      : PauseMenu.voiceIconTextureKey;
  }

  private createVolumeSlider(x: number, y: number): VolumeSlider {
    const label = this.scene.add
      .text(x, y - 36, "", {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PauseMenu.depth + 13);

    const track = this.scene.add
      .rectangle(x, y, PauseMenu.volumeSliderWidth, 8, 0x555555, 1)
      .setDepth(PauseMenu.depth + 12)
      .setInteractive({ useHandCursor: true });

    const fill = this.scene.add
      .rectangle(
        x - PauseMenu.volumeSliderWidth / 2,
        y,
        PauseMenu.volumeSliderWidth,
        8,
        0xffffff,
        0.9,
      )
      .setOrigin(0, 0.5)
      .setDepth(PauseMenu.depth + 13)
      .setInteractive({ useHandCursor: true });

    const knob = this.scene.add
      .rectangle(x, y, 22, 22, 0xffffff, 1)
      .setDepth(PauseMenu.depth + 14)
      .setStrokeStyle(2, 0x1f1f1f, 0.9)
      .setInteractive({ useHandCursor: true });

    this.scene.input.setDraggable(knob);

    track.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.setMasterVolumeByPointerX(pointer.x);
    });
    fill.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.setMasterVolumeByPointerX(pointer.x);
    });
    knob.on("drag", (_pointer: Phaser.Input.Pointer, dragX: number) => {
      this.setMasterVolumeByPointerX(dragX);
    });

    return {
      label,
      track,
      fill,
      knob,
    };
  }

  private setMasterVolumeByPointerX(pointerX: number) {
    const trackLeft = this.volumeSlider.track.x - PauseMenu.volumeSliderWidth / 2;
    const volume = (pointerX - trackLeft) / PauseMenu.volumeSliderWidth;

    this.gameSettings.setMasterVolume(volume);
    this.gameSettings.setMuted(false);
    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
    this.syncMuteButtonTexture();
  }

  private setVolumeSliderValue(volume: number) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    const trackLeft = this.volumeSlider.track.x - PauseMenu.volumeSliderWidth / 2;
    const fillWidth = PauseMenu.volumeSliderWidth * normalizedVolume;

    this.volumeSlider.label.setText(
      languageController.t("settings.volume", {
        value: Math.round(normalizedVolume * 100),
      }),
    );
    this.volumeSlider.fill.width = fillWidth;
    this.volumeSlider.knob.x = trackLeft + fillWidth;
  }

  private refreshTexts() {
    this.title.setText(languageController.t("settings.title"));
    this.continueButton.label.setText(languageController.t("settings.continue"));
    this.restartButton.label.setText(languageController.t("settings.restart"));
    this.languageButton.label.setText(languageController.t("settings.language"));
    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
  }

  private setMenuVisible(visible: boolean) {
    this.overlay.setVisible(visible);
    if (visible) {
      this.overlay.setInteractive();
    } else {
      this.overlay.disableInteractive();
    }

    this.panel.setVisible(visible);
    this.title.setVisible(visible);
    this.setVolumeSliderVisible(visible);
    this.setButtonVisible(this.continueButton, visible);
    this.setButtonVisible(this.restartButton, visible);
    this.setButtonVisible(this.languageButton, visible);
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    onClick: () => void,
  ): PauseMenuButton {
    const background = this.scene.add
      .image(x, y, PauseMenu.settingsButtonBackgroundTextureKey)
      .setDisplaySize(width, height)
      .setDepth(PauseMenu.depth + 12)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "Hardpixel",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PauseMenu.depth + 13);

    background.on("pointerdown", () => {
      UiSoundPlayer.playClick(this.scene);
      onClick();
    });
    background.on("pointerover", () => {
      background.setTint(0xb8b8b8);
    });
    background.on("pointerout", () => {
      background.clearTint();
    });

    return {
      background,
      label,
    };
  }

  private setButtonVisible(button: PauseMenuButton, visible: boolean) {
    button.background.setVisible(visible);
    button.label.setVisible(visible);

    if (visible) {
      button.background.setInteractive({ useHandCursor: true });
    } else {
      button.background.disableInteractive();
    }
  }

  private setVolumeSliderVisible(visible: boolean) {
    this.volumeSlider.label.setVisible(visible);
    this.volumeSlider.track.setVisible(visible);
    this.volumeSlider.fill.setVisible(visible);
    this.volumeSlider.knob.setVisible(visible);

    if (visible) {
      this.volumeSlider.track.setInteractive({ useHandCursor: true });
      this.volumeSlider.fill.setInteractive({ useHandCursor: true });
      this.volumeSlider.knob.setInteractive({ useHandCursor: true });
      this.scene.input.setDraggable(this.volumeSlider.knob);
    } else {
      this.volumeSlider.track.disableInteractive();
      this.volumeSlider.fill.disableInteractive();
      this.volumeSlider.knob.disableInteractive();
    }
  }
}
