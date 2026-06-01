import type { Scene } from "phaser";

type FullscreenDocumentElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export class FullscreenController {
  private isDisposed = false;

  constructor(private readonly scene: Scene) {
    window.addEventListener("pointerdown", this.handleUserGesture, {
      passive: true,
    });
    window.addEventListener("keydown", this.handleUserGesture);

    this.scene.events.once("shutdown", () => {
      this.destroy();
    });
  }

  private readonly handleUserGesture = () => {
    if (this.isDisposed || FullscreenController.isFullscreenActive()) {
      this.destroy();
      return;
    }

    this.tryStartFullscreen();
    this.destroy();
  };

  private tryStartFullscreen() {
    try {
      if (this.scene.scale && !this.scene.scale.isFullscreen) {
        this.scene.scale.startFullscreen();
        return;
      }
    } catch {
      // Some mobile browsers expose fullscreen APIs but still reject the call.
    }

    FullscreenController.requestDocumentFullscreen();
  }

  destroy() {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    window.removeEventListener("pointerdown", this.handleUserGesture);
    window.removeEventListener("keydown", this.handleUserGesture);
  }

  private static isFullscreenActive() {
    return Boolean(document.fullscreenElement);
  }

  private static requestDocumentFullscreen() {
    const element = document.documentElement as FullscreenDocumentElement;

    try {
      const requestFullscreen =
        element.requestFullscreen ?? element.webkitRequestFullscreen;

      requestFullscreen?.call(element);
    } catch {
      // Fullscreen is optional: if the browser blocks it, the game still works.
    }
  }
}
