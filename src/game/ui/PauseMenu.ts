import { GameObjects, Scene } from "phaser";
import type { GameSettings } from "../state/GameSettings";
import type { PauseController } from "../state/PauseController";

type PauseMenuButton = {
  background: GameObjects.Rectangle;
  label: GameObjects.Text;
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

  private readonly settingsButton: PauseMenuButton;
  private readonly overlay: GameObjects.Rectangle;
  private readonly panel: GameObjects.Rectangle;
  private readonly title: GameObjects.Text;
  private readonly volumeSlider: VolumeSlider;
  private readonly continueButton: PauseMenuButton;
  private readonly restartButton: PauseMenuButton;

  constructor(
    private readonly scene: Scene,
    private readonly pauseController: PauseController,
    private readonly gameSettings: GameSettings,
    private readonly onRestart: () => void,
  ) {
    this.settingsButton = this.createButton(944, 34, 120, 40, "Настройки", () => {
      this.open();
    });
    this.settingsButton.background.setDepth(PauseMenu.depth);
    this.settingsButton.label.setDepth(PauseMenu.depth + 1);

    this.overlay = this.scene.add
      .rectangle(512, 384, 1024, 768, 0x000000, 0.58)
      .setDepth(PauseMenu.depth + 10)
      .setInteractive()
      .setVisible(false);

    this.panel = this.scene.add
      .rectangle(512, 384, 420, 350, 0x1f1f1f, 0.96)
      .setDepth(PauseMenu.depth + 11)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setVisible(false);

    this.title = this.scene.add
      .text(512, 250, "Настройки", {
        fontFamily: "Arial",
        fontSize: 30,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PauseMenu.depth + 12)
      .setVisible(false);

    this.volumeSlider = this.createVolumeSlider(512, 340);
    this.continueButton = this.createButton(512, 430, 240, 48, "Продолжить", () => {
      this.close();
    });
    this.restartButton = this.createButton(512, 496, 240, 48, "Начать заново", () => {
      this.close();
      this.onRestart();
    });

    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
    this.setMenuVisible(false);
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
    this.setMenuVisible(true);
  }

  close() {
    if (!this.pauseController.has("settings")) {
      return;
    }

    this.pauseController.resume("settings");
    this.setMenuVisible(false);
  }

  private createVolumeSlider(x: number, y: number): VolumeSlider {
    const label = this.scene.add
      .text(x, y - 36, "", {
        fontFamily: "Arial",
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
    this.setVolumeSliderValue(this.gameSettings.getMasterVolume());
  }

  private setVolumeSliderValue(volume: number) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    const trackLeft = this.volumeSlider.track.x - PauseMenu.volumeSliderWidth / 2;
    const fillWidth = PauseMenu.volumeSliderWidth * normalizedVolume;

    this.volumeSlider.label.setText(
      `Звук: ${Math.round(normalizedVolume * 100)}%`,
    );
    this.volumeSlider.fill.width = fillWidth;
    this.volumeSlider.knob.x = trackLeft + fillWidth;
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
      .rectangle(x, y, width, height, 0x2d2d2d, 0.95)
      .setDepth(PauseMenu.depth + 12)
      .setStrokeStyle(2, 0xffffff, 0.45)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: "Arial",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(PauseMenu.depth + 13);

    background.on("pointerdown", onClick);
    background.on("pointerover", () => {
      background.setFillStyle(0x3a3a3a, 0.98);
    });
    background.on("pointerout", () => {
      background.setFillStyle(0x2d2d2d, 0.95);
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
