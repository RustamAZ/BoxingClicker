import { PlayerProfile } from "./PlayerProfile";

export class Player {
  readonly profile = new PlayerProfile();

  sessionLevel = 1;
  globalLevel = this.profile.getGlobalLevel();
  xp = 0;
  xpToNextLevel = 100;

  stamina = 200;
  maxStamina = 200;
  staminaRegenPerSecond = 18;

  health = 200;
  maxHealth = 200;

  damagePerHit = 25;

  punchSpeed = 0.9;
  xpPerHit = 2;
  staminaCostPerHit = 8;

  lowStaminaPercent = 0.15;
  lowHealthPercent = 0.25;

  private readonly basePunchAnimationDurationMs = 75;
  private readonly levelUpHealthRestorePercent = 0.2;

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
    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + this.staminaRegenPerSecond * deltaSeconds,
    );
  }

  getPunchAnimationDurationMs(attackSpeedMultiplier = 1) {
    const punchSpeed = this.punchSpeed * Math.max(0.1, attackSpeedMultiplier);

    return this.basePunchAnimationDurationMs / Math.max(punchSpeed, 0.1);
  }

  getDamagePerHit(damageMultiplier = 1) {
    return this.damagePerHit * Math.max(0, damageMultiplier);
  }

  getStaminaCostPerHit(staminaCostMultiplier = 1) {
    return this.staminaCostPerHit * Math.max(0, staminaCostMultiplier);
  }

  takeDamage(amount: number) {
    const damage = Math.max(0, amount);

    this.health = Math.max(0, this.health - damage);

    return this.isAlive();
  }

  restoreHealth() {
    this.health = this.maxHealth;
  }

  restoreHealthPercent(percent: number) {
    const healthToRestore = this.maxHealth * Math.max(0, percent);

    this.health = Math.min(this.maxHealth, this.health + healthToRestore);
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
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.25);
    }

    if (levelsGained > 0) {
      this.profile.setGlobalLevel(this.globalLevel);
    }

    return levelsGained;
  }

  increaseDamage(amount: number) {
    this.damagePerHit += Math.max(0, amount);
  }

  increasePunchSpeed(amount: number) {
    this.punchSpeed += Math.max(0, amount);
  }

  decreaseStaminaCost(amount: number) {
    this.staminaCostPerHit = Math.max(
      1,
      this.staminaCostPerHit - Math.max(0, amount),
    );
  }

  increaseMaxStamina(amount: number) {
    const value = Math.max(0, amount);

    this.maxStamina += value;
    this.stamina = Math.min(this.maxStamina, this.stamina + value);
  }

  increaseMaxHealth(amount: number) {
    const value = Math.max(0, amount);

    this.maxHealth += value;
    this.health = Math.min(this.maxHealth, this.health + value);
  }

  restoreFromAd() {
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;
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
}
