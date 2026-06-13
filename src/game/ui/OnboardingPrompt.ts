import { GameObjects, Scene } from "phaser";
import { languageController } from "../localization/LanguageController";
import { HeroMessageView } from "./HeroMessageView";

export class OnboardingPrompt {
  private static readonly depth = 1600;
  private static readonly targetX = 512;
  private static readonly targetY = 390;
  private static readonly pulseDurationMs = 760;

  private readonly messageView: HeroMessageView;
  private readonly innerPulse: GameObjects.Arc;
  private readonly outerPulse: GameObjects.Arc;
  private readonly unsubscribeLanguageChange: () => void;
  private isShown = false;

  static preload(scene: Scene) {
    HeroMessageView.preload(scene);
  }

  constructor(private readonly scene: Scene) {
    this.messageView = new HeroMessageView(this.scene, OnboardingPrompt.depth);
    this.outerPulse = this.createPulse(82, 5, 0xffd44d, 0.72);
    this.innerPulse = this.createPulse(54, 4, 0xffffff, 0.9);
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshText();
    });
  }

  show() {
    if (this.isShown) {
      return;
    }

    this.isShown = true;
    this.messageView.show(languageController.t("onboarding.welcome"));
    this.setPulseVisible(true);
    this.startPulse();
  }

  hide() {
    if (!this.isShown) {
      return;
    }

    this.isShown = false;
    this.scene.tweens.killTweensOf([this.innerPulse, this.outerPulse]);
    this.setPulseVisible(false);
    this.messageView.hide();
  }

  destroy() {
    this.isShown = false;
    this.scene.tweens.killTweensOf([this.innerPulse, this.outerPulse]);
    this.unsubscribeLanguageChange();
    this.messageView.destroy();
    this.innerPulse.destroy();
    this.outerPulse.destroy();
  }

  private createPulse(
    radius: number,
    lineWidth: number,
    color: number,
    alpha: number,
  ) {
    return this.scene.add
      .circle(
        OnboardingPrompt.targetX,
        OnboardingPrompt.targetY,
        radius,
        0x000000,
        0,
      )
      .setStrokeStyle(lineWidth, color, alpha)
      .setDepth(OnboardingPrompt.depth + 2)
      .setVisible(false);
  }

  private startPulse() {
    this.innerPulse.setScale(0.82).setAlpha(0.95);
    this.outerPulse.setScale(0.72).setAlpha(0.82);

    this.scene.tweens.add({
      targets: this.innerPulse,
      scale: 1.16,
      alpha: 0.35,
      duration: OnboardingPrompt.pulseDurationMs,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.scene.tweens.add({
      targets: this.outerPulse,
      scale: 1.28,
      alpha: 0.15,
      duration: OnboardingPrompt.pulseDurationMs,
      delay: 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private refreshText() {
    this.messageView.setText(languageController.t("onboarding.welcome"));
  }

  private setPulseVisible(visible: boolean) {
    this.innerPulse.setVisible(visible);
    this.outerPulse.setVisible(visible);
  }
}
