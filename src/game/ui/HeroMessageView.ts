import { GameObjects, Scene } from "phaser";

export class HeroMessageView {
  static readonly slideDurationMs = 320;

  private static readonly textureKey = "hero-message-panel";
  private static readonly texturePath =
    "assets/images/ui/onboarding/hero-message.png";
  private static readonly panelX = 18;
  private static readonly panelY = 584;
  private static readonly panelWidth = 720;
  private static readonly panelHeight = 116;
  private static readonly textOffsetX = 82;
  private static readonly textOffsetY = 19;
  private static readonly textWidth = 610;

  private readonly panel: GameObjects.Image;
  private readonly text: GameObjects.Text;
  private transitionId = 0;
  private shown = false;

  static preload(scene: Scene) {
    if (!scene.textures.exists(HeroMessageView.textureKey)) {
      scene.load.image(
        HeroMessageView.textureKey,
        HeroMessageView.texturePath,
      );
    }
  }

  constructor(
    private readonly scene: Scene,
    depth: number,
  ) {
    this.panel = this.scene.add
      .image(
        HeroMessageView.panelX,
        HeroMessageView.panelY,
        HeroMessageView.textureKey,
      )
      .setOrigin(0, 0)
      .setDisplaySize(
        HeroMessageView.panelWidth,
        HeroMessageView.panelHeight,
      )
      .setDepth(depth)
      .setVisible(false);

    this.text = this.scene.add
      .text(
        HeroMessageView.panelX + HeroMessageView.textOffsetX,
        HeroMessageView.panelY + HeroMessageView.textOffsetY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 18,
          color: "#241d18",
          align: "left",
          lineSpacing: 2,
          wordWrap: {
            width: HeroMessageView.textWidth,
          },
        },
      )
      .setOrigin(0, 0)
      .setResolution(2)
      .setDepth(depth + 1)
      .setVisible(false);
  }

  get isShown() {
    return this.shown;
  }

  get isVisible() {
    return this.panel.visible;
  }

  setText(message: string) {
    this.text.setText(message);
  }

  show(message: string) {
    this.transitionId += 1;
    this.shown = true;
    this.killTweens();
    this.setText(message);
    this.setVisible(true);
    this.setY(this.getHiddenY());

    this.scene.tweens.add({
      targets: this.panel,
      y: HeroMessageView.panelY,
      duration: HeroMessageView.slideDurationMs,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this.text,
      y: HeroMessageView.panelY + HeroMessageView.textOffsetY,
      duration: HeroMessageView.slideDurationMs,
      ease: "Back.easeOut",
    });
  }

  hide(immediate = false, onComplete?: () => void) {
    const transitionId = ++this.transitionId;
    this.shown = false;
    this.killTweens();

    if (immediate || !this.panel.visible) {
      this.setVisible(false);
      onComplete?.();
      return;
    }

    const hiddenY = this.getHiddenY();

    this.scene.tweens.add({
      targets: this.panel,
      y: hiddenY,
      duration: HeroMessageView.slideDurationMs,
      ease: "Back.easeIn",
    });
    this.scene.tweens.add({
      targets: this.text,
      y: hiddenY + HeroMessageView.textOffsetY,
      duration: HeroMessageView.slideDurationMs,
      ease: "Back.easeIn",
      onComplete: () => {
        if (this.transitionId !== transitionId) {
          return;
        }

        this.setVisible(false);
        onComplete?.();
      },
    });
  }

  replace(message: string) {
    if (!this.panel.visible) {
      this.show(message);
      return;
    }

    this.hide(false, () => {
      this.show(message);
    });
  }

  destroy() {
    this.transitionId += 1;
    this.killTweens();
    this.panel.destroy();
    this.text.destroy();
  }

  private setY(panelY: number) {
    this.panel.setY(panelY);
    this.text.setY(panelY + HeroMessageView.textOffsetY);
  }

  private getHiddenY() {
    return this.scene.scale.height + 20;
  }

  private setVisible(visible: boolean) {
    this.panel.setVisible(visible);
    this.text.setVisible(visible);
  }

  private killTweens() {
    this.scene.tweens.killTweensOf([this.panel, this.text]);
  }
}
