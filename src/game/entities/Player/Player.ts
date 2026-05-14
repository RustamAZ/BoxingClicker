export class Player {
  level = 1;
  xp = 0;
  xpToNextLevel = 100;

  stamina = 100;
  maxStamina = 100;
  staminaRegenPerSecond = 50;

  health = 100;
  maxHealth = 100;

  damagePerHit = 10;

  punchSpeed = 1;
  xpPerHit = 2;
  staminaCostPerHit = 8;

  lowStaminaPercent = 0.15;
  lowHealthPercent = 0.25;

  private readonly basePunchAnimationDurationMs = 75;
  private readonly levelUpHealthRestorePercent = 0.2;

  canHit() {
    return this.isAlive() && this.stamina >= this.staminaCostPerHit;
  }

  hit() {
    if (!this.canHit()) {
      return false;
    }

    this.stamina -= this.staminaCostPerHit;
    this.gainXp(this.xpPerHit);

    return true;
  }

  regenerateStamina(deltaSeconds: number) {
    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + this.staminaRegenPerSecond * deltaSeconds,
    );
  }

  getPunchAnimationDurationMs() {
    return this.basePunchAnimationDurationMs / Math.max(this.punchSpeed, 0.1);
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
      this.level += 1;
      levelsGained += 1;
      this.restoreHealthPercent(this.levelUpHealthRestorePercent);
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.25);
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
