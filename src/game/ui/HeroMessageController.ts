import { Math as PhaserMath, Scene } from "phaser";
import {
  heroMessagesConfig,
  type HeroMessageTrigger,
} from "../configs/heroMessages";
import { languageController } from "../localization/LanguageController";
import { HeroMessageView } from "./HeroMessageView";

export type HeroMessageState = "ready" | "showing" | "cooldown";

type HeroMessageQueueItem = {
  trigger: HeroMessageTrigger;
  cooldownMs: number;
  messageKey: string;
};

export class HeroMessageController {
  private static readonly depth = 900;
  private static readonly triggers: HeroMessageTrigger[] = [
    "enemy-spawn",
    "enemy-death",
  ];

  private readonly view: HeroMessageView;
  private readonly queue: HeroMessageQueueItem[] = [];
  private readonly unsubscribeLanguageChange: () => void;
  private state: HeroMessageState = "ready";
  private active = false;
  private remainingStateTimeMs = 0;
  private nextCooldownMs = 0;
  private visibleMessageKey?: string;
  private lastBossMessageKey?: string;

  constructor(private readonly scene: Scene) {
    this.view = new HeroMessageView(scene, HeroMessageController.depth);
    this.fillQueue();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshVisibleMessage();
    });
  }

  setActive(active: boolean) {
    if (this.active === active) {
      return;
    }

    this.active = active;

    if (active) {
      return;
    }

    this.state = "ready";
    this.remainingStateTimeMs = 0;
    this.nextCooldownMs = 0;
    this.visibleMessageKey = undefined;
    this.view.hide();
  }

  update(deltaMs: number) {
    if (!this.active || this.state === "ready") {
      return;
    }

    this.remainingStateTimeMs = Math.max(
      0,
      this.remainingStateTimeMs - deltaMs,
    );

    if (this.remainingStateTimeMs > 0) {
      return;
    }

    if (this.state === "showing") {
      this.view.hide();
      this.visibleMessageKey = undefined;
      this.state = "cooldown";
      this.remainingStateTimeMs = this.nextCooldownMs;
      return;
    }

    this.state = "ready";
  }

  notifyEnemySpawned() {
    this.notify("enemy-spawn");
  }

  notifyEnemyDefeated() {
    this.notify("enemy-death");
  }

  showBossMessage() {
    if (!this.active) {
      return;
    }

    const messageKey = this.randomItem(
      heroMessagesConfig.boss.filter(
        (key) =>
          heroMessagesConfig.boss.length === 1 ||
          key !== this.lastBossMessageKey,
      ),
    );
    const wasVisible = this.view.isVisible;

    this.lastBossMessageKey = messageKey;
    this.visibleMessageKey = messageKey;
    this.state = "showing";
    this.nextCooldownMs = this.getRandomCooldownMs();
    this.remainingStateTimeMs =
      heroMessagesConfig.displayDurationMs +
      HeroMessageView.slideDurationMs * (wasVisible ? 2 : 1);
    this.view.replace(languageController.t(messageKey));
  }

  destroy() {
    this.unsubscribeLanguageChange();
    this.view.destroy();
    this.queue.length = 0;
  }

  private notify(trigger: HeroMessageTrigger) {
    if (!this.active || this.state !== "ready") {
      return;
    }

    const item = this.getCurrentItem();

    if (item.trigger !== trigger) {
      return;
    }

    this.queue.shift();
    this.fillQueue();
    this.visibleMessageKey = item.messageKey;
    this.state = "showing";
    this.nextCooldownMs = item.cooldownMs;
    this.remainingStateTimeMs =
      heroMessagesConfig.displayDurationMs +
      HeroMessageView.slideDurationMs;
    this.view.show(languageController.t(item.messageKey));
  }

  private getCurrentItem() {
    this.fillQueue();
    return this.queue[0];
  }

  private fillQueue() {
    while (this.queue.length < heroMessagesConfig.queueSize) {
      const trigger = this.randomItem(HeroMessageController.triggers);
      const messages = heroMessagesConfig.normal[trigger];

      this.queue.push({
        trigger,
        cooldownMs: this.getRandomCooldownMs(),
        messageKey: this.randomItem(messages),
      });
    }
  }

  private getRandomCooldownMs() {
    return this.randomItem(heroMessagesConfig.cooldownOptionsMs);
  }

  private refreshVisibleMessage() {
    if (!this.visibleMessageKey || !this.view.isShown) {
      return;
    }

    this.view.setText(languageController.t(this.visibleMessageKey));
  }

  private randomItem<T>(items: readonly T[]) {
    return items[PhaserMath.Between(0, items.length - 1)];
  }
}
