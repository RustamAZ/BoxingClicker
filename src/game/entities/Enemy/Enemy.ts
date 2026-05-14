import type { Player } from '../Player/Player';

export type EnemyConfig = {
    displayName: string;
    maxHealth: number;
    xpReward: number;
    diamondsReward: number;
    coinsReward: number;
    damagePerHit: number;
    attackCooldownSeconds: number;
};

export abstract class Enemy
{
    abstract readonly isCanAttack: boolean;

    readonly displayName: string;
    readonly maxHealth: number;
    readonly xpReward: number;
    readonly diamondsReward: number;
    readonly coinsReward: number;
    readonly damagePerHit: number;
    readonly attackCooldownSeconds: number;

    health: number;

    private attackCooldownRemaining: number;

    protected constructor (config: EnemyConfig)
    {
        this.displayName = config.displayName;
        this.maxHealth = config.maxHealth;
        this.health = config.maxHealth;
        this.xpReward = config.xpReward;
        this.diamondsReward = config.diamondsReward;
        this.coinsReward = config.coinsReward;
        this.damagePerHit = config.damagePerHit;
        this.attackCooldownSeconds = config.attackCooldownSeconds;
        this.attackCooldownRemaining = config.attackCooldownSeconds;
    }

    get timeUntilNextHit ()
    {
        return this.attackCooldownRemaining;
    }

    update (deltaSeconds: number, player: Player)
    {
        if (this.isDead() || !this.isCanAttack)
        {
            return;
        }

        this.attackCooldownRemaining = Math.max(
            0,
            this.attackCooldownRemaining - deltaSeconds
        );

        if (this.canAttack())
        {
            this.attack(player);
        }
    }

    takeDamage (amount: number)
    {
        const damage = Math.max(0, amount);

        this.health = Math.max(0, this.health - damage);

        return this.isAlive();
    }

    canAttack ()
    {
        return this.isCanAttack && this.isAlive() && this.attackCooldownRemaining <= 0;
    }

    attack (player: Player)
    {
        if (!this.canAttack())
        {
            return false;
        }

        player.takeDamage(this.damagePerHit);
        this.attackCooldownRemaining = this.attackCooldownSeconds;
        this.onAttack(player);

        return true;
    }

    isAlive ()
    {
        return this.health > 0;
    }

    isDead ()
    {
        return !this.isAlive();
    }

    protected onAttack (_player: Player)
    {
    }

    playDeathAnimation (onComplete: () => void)
    {
        this.destroy();
        onComplete();
    }

    abstract onHit (callback: () => void): void;

    abstract destroy (): void;
}
