import { playerConfig } from "../../configs/player";
import { getXpToNextLevel } from "../../configs/playerLevelUp";
import { PlayerProfile } from "./PlayerProfile";

export type PlayerStat =
  | "damage"
  | "punch-speed"
  | "max-stamina"
  | "max-health"
  | "stamina-cost";

export type PlayerStatEffect = {
  stat: PlayerStat;
  mode: "add" | "multiply";
  value: number;
  durationSeconds?: number;
  sourceId?: string;
};

type ActivePlayerStatEffect = PlayerStatEffect & {
  remainingSeconds: number;
};

export type PlayerActiveStatEffect = Readonly<ActivePlayerStatEffect>;

export class Player {
  readonly profile = new PlayerProfile();

  sessionLevel = 1;
  globalLevel = this.profile.getGlobalLevel();
  xp = 0;
  xpToNextLevel = getXpToNextLevel(this.sessionLevel);

  stamina = playerConfig.player_start.stamina;
  maxStamina = playerConfig.player_start.stamina;
  staminaRegenPerSecond = playerConfig.player_start.stamina_regen_per_second;

  health = playerConfig.player_start.health;
  maxHealth = playerConfig.player_start.health;

  damagePerHit = playerConfig.player_start.attack;

  punchSpeed = playerConfig.player_start.attack_speed;
  xpPerHit = 2;
  staminaCostPerHit = playerConfig.player_start.stamina_cost_per_hit;

  lowStaminaPercent = 0.15;
  lowHealthPercent = 0.25;

  private readonly basePunchAnimationDurationMs = 75;
  private readonly levelUpHealthRestorePercent = 0.2;
  private readonly activeStatEffects: ActivePlayerStatEffect[] = [];

  canHit(staminaCostMultiplier = 1) {
    return (
      this.isAlive() &&
      this.stamina >= this.getStaminaCostPerHit(staminaCostMultiplier)
    );
  }

  hit(staminaCostMultiplier = 1) {
    const staminaCost = this.getStaminaCostPerHit(staminaCostMultiplier);

    if (!this.canHit(staminaCostMultiplier)) {
      return false;
    }

    this.stamina -= staminaCost;
    this.gainXp(this.xpPerHit);

    return true;
  }

  regenerateStamina(deltaSeconds: number) {
    this.updateActiveStatEffects(deltaSeconds);
    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + this.staminaRegenPerSecond * deltaSeconds,
    );
  }

  getPunchAnimationDurationMs(attackSpeedMultiplier = 1) {
    const punchSpeed =
      this.getCurrentPunchSpeed() * Math.max(0.1, attackSpeedMultiplier);

    return this.basePunchAnimationDurationMs / Math.max(punchSpeed, 0.1);
  }

  getDamagePerHit(damageMultiplier = 1) {
    return (
      this.getCurrentDamagePerHit() * Math.max(0, damageMultiplier)
    );
  }

  getStaminaCostPerHit(staminaCostMultiplier = 1) {
    return (
      this.getCurrentStaminaCostPerHit() * Math.max(0, staminaCostMultiplier)
    );
  }

  takeDamage(amount: number) {
    const damage = Math.max(0, amount);

    this.health = Math.max(0, this.health - damage);

    return this.isAlive();
  }

  restoreHealth() {
    this.health = this.maxHealth;
  }

  restoreStamina() {
    this.stamina = this.maxStamina;
  }

  restoreHealthPercent(percent: number) {
    const healthToRestore = this.maxHealth * Math.max(0, percent);

    this.health = Math.min(this.maxHealth, this.health + healthToRestore);
  }

  restoreStaminaPercent(percent: number) {
    const staminaToRestore = this.maxStamina * Math.max(0, percent);

    this.stamina = Math.min(this.maxStamina, this.stamina + staminaToRestore);
  }

  gainXp(amount: number) {
    const xp = Math.max(0, amount);
    let levelsGained = 0;

    this.xp += xp;

    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.sessionLevel += 1;
      this.globalLevel += 1;
      levelsGained += 1;
      this.restoreHealthPercent(this.levelUpHealthRestorePercent);
      this.xpToNextLevel = getXpToNextLevel(this.sessionLevel);
    }

    if (levelsGained > 0) {
      this.profile.setGlobalLevel(this.globalLevel);
    }

    return levelsGained;
  }

  increaseDamage(amount: number) {
    this.applyStatEffect({
      stat: "damage",
      mode: "add",
      value: Math.max(0, amount),
    });
  }

  increasePunchSpeed(amount: number) {
    this.applyStatEffect({
      stat: "punch-speed",
      mode: "add",
      value: Math.max(0, amount),
    });
  }

  decreaseStaminaCost(amount: number) {
    this.applyStatEffect({
      stat: "stamina-cost",
      mode: "add",
      value: -Math.max(0, amount),
    });
  }

  increaseMaxStamina(amount: number) {
    this.applyStatEffect({
      stat: "max-stamina",
      mode: "add",
      value: Math.max(0, amount),
    });
  }

  increaseMaxHealth(amount: number) {
    this.applyStatEffect({
      stat: "max-health",
      mode: "add",
      value: Math.max(0, amount),
    });
  }

  applyStatEffects(effects: PlayerStatEffect[]) {
    effects.forEach((effect) => {
      this.applyStatEffect(effect);
    });
  }

  applyStatEffect(effect: PlayerStatEffect) {
    const durationSeconds = Math.max(0, effect.durationSeconds ?? 0);

    if (durationSeconds > 0) {
      this.applyTemporaryStatEffect(effect, durationSeconds);
      return;
    }

    this.applyPermanentStatEffect(effect);
  }

  getActiveStatEffects(): PlayerActiveStatEffect[] {
    return this.activeStatEffects.map((effect) => ({ ...effect }));
  }

  restoreFromAd() {
    this.health = this.maxHealth;
    this.restoreStamina();
  }

  isLowHealth() {
    return this.health / this.maxHealth <= this.lowHealthPercent;
  }

  isLowStamina() {
    return this.stamina / this.maxStamina <= this.lowStaminaPercent;
  }

  isAlive() {
    return this.health > 0;
  }

  isDead() {
    return !this.isAlive();
  }

  private getCurrentDamagePerHit() {
    return this.applyStatEffectMultipliers("damage", this.damagePerHit);
  }

  private getCurrentPunchSpeed() {
    return this.applyStatEffectMultipliers("punch-speed", this.punchSpeed);
  }

  private getCurrentStaminaCostPerHit() {
    return this.applyStatEffectMultipliers(
      "stamina-cost",
      this.staminaCostPerHit,
    );
  }

  private applyPermanentStatEffect(effect: PlayerStatEffect) {
    switch (effect.stat) {
      case "damage":
        this.damagePerHit = this.applyStatEffectValue(
          this.damagePerHit,
          effect,
        );
        break;
      case "punch-speed":
        this.punchSpeed = this.applyStatEffectValue(this.punchSpeed, effect);
        break;
      case "max-stamina":
        this.applyMaxStaminaEffect(effect);
        break;
      case "max-health":
        this.applyMaxHealthEffect(effect);
        break;
      case "stamina-cost":
        this.staminaCostPerHit = Math.max(
          playerConfig.player_limits.minimum_stamina_cost_per_hit,
          this.applyStatEffectValue(this.staminaCostPerHit, effect),
        );
        break;
    }
  }

  private applyTemporaryStatEffect(
    effect: PlayerStatEffect,
    durationSeconds: number,
  ) {
    const existingEffect = this.activeStatEffects.find(
      (activeEffect) =>
        effect.sourceId !== undefined &&
        activeEffect.sourceId === effect.sourceId &&
        activeEffect.stat === effect.stat,
    );

    if (existingEffect) {
      existingEffect.mode = effect.mode;
      existingEffect.value = effect.value;
      existingEffect.remainingSeconds = durationSeconds;
      return;
    }

    this.activeStatEffects.push({
      ...effect,
      remainingSeconds: durationSeconds,
    });
  }

  private updateActiveStatEffects(deltaSeconds: number) {
    const safeDeltaSeconds = Math.max(0, deltaSeconds);

    for (let index = this.activeStatEffects.length - 1; index >= 0; index -= 1) {
      const effect = this.activeStatEffects[index];

      effect.remainingSeconds -= safeDeltaSeconds;

      if (effect.remainingSeconds <= 0) {
        this.activeStatEffects.splice(index, 1);
      }
    }
  }

  private applyStatEffectMultipliers(stat: PlayerStat, value: number) {
    return this.activeStatEffects.reduce((result, effect) => {
      if (effect.stat !== stat) {
        return result;
      }

      return this.applyStatEffectValue(result, effect);
    }, value);
  }

  private applyMaxStaminaEffect(effect: PlayerStatEffect) {
    const previousMaxStamina = this.maxStamina;

    this.maxStamina = Math.max(
      1,
      this.applyStatEffectValue(this.maxStamina, effect),
    );
    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + Math.max(0, this.maxStamina - previousMaxStamina),
    );
  }

  private applyMaxHealthEffect(effect: PlayerStatEffect) {
    const previousMaxHealth = this.maxHealth;

    this.maxHealth = Math.max(
      1,
      this.applyStatEffectValue(this.maxHealth, effect),
    );
    this.health = Math.min(
      this.maxHealth,
      this.health + Math.max(0, this.maxHealth - previousMaxHealth),
    );
  }

  private applyStatEffectValue(value: number, effect: PlayerStatEffect) {
    if (effect.mode === "multiply") {
      return value * Math.max(0, effect.value);
    }

    return value + effect.value;
  }
}
