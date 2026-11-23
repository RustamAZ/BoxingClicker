import type { Scene } from "phaser";

export class ContextMenuController {
  private readonly canvas: HTMLCanvasElement;
  private readonly container: HTMLElement | null;
  private isDisposed = false;

  constructor(private readonly scene: Scene) {
    this.canvas = this.scene.game.canvas;
    this.container = this.canvas.parentElement;

    document.addEventListener("contextmenu", this.handleContextMenu, {
      capture: true,
    });
    document.addEventListener("pointerdown", this.handlePointerButton, {
      capture: true,
    });
    document.addEventListener("pointerup", this.handlePointerButton, {
      capture: true,
    });
    document.addEventListener("mousedown", this.handlePointerButton, {
      capture: true,
    });
    document.addEventListener("mouseup", this.handlePointerButton, {
      capture: true,
    });
    document.addEventListener("auxclick", this.handlePointerButton, {
      capture: true,
    });

    this.scene.events.once("shutdown", () => {
      this.destroy();
    });
  }

  destroy() {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    document.removeEventListener("contextmenu", this.handleContextMenu, true);
    document.removeEventListener("pointerdown", this.handlePointerButton, true);
    document.removeEventListener("pointerup", this.handlePointerButton, true);
    document.removeEventListener("mousedown", this.handlePointerButton, true);
    document.removeEventListener("mouseup", this.handlePointerButton, true);
    document.removeEventListener("auxclick", this.handlePointerButton, true);
  }

  private readonly handleContextMenu = (event: MouseEvent) => {
    if (!this.isGameTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private readonly handlePointerButton = (event: MouseEvent) => {
    if (event.button !== 2 || !this.isGameTarget(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  };

  private isGameTarget(target: EventTarget | null) {
    if (!(target instanceof Node)) {
      return false;
    }

    return target === this.canvas || this.container?.contains(target) === true;
  }
}
