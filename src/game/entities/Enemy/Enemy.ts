import type { Player } from '../Player/Player';

export type EnemyConfig = {
    displayName: string;
    isBoss?: boolean;
    maxHealth: number;
    xpReward: number;
    diamondsReward: number;
    coinsReward: number;
    emeraldDropChance?: number;
    emeraldReward?: number;
    damagePerHit: number;
    attackCooldownSeconds: number;
};

export abstract class Enemy
{
    abstract readonly isCanAttack: boolean;
    readonly shouldPlayDefaultAttackSound: boolean = true;

    readonly displayName: string;
    readonly isBoss: boolean;
    readonly maxHealth: number;
    readonly xpReward: number;
    readonly diamondsReward: number;
    readonly coinsReward: number;
    readonly emeraldDropChance: number;
    readonly emeraldReward: number;
    readonly damagePerHit: number;
    readonly attackCooldownSeconds: number;

    health: number;

    private attackCooldownRemaining: number;
    private readonly attackPerformedCallbacks: Array<() => void> = [];
    private readonly selfDefeatedCallbacks: Array<() => void> = [];

    protected constructor (config: EnemyConfig)
    {
        this.displayName = config.displayName;
        this.isBoss = config.isBoss ?? false;
        this.maxHealth = config.maxHealth;
        this.health = config.maxHealth;
        this.xpReward = config.xpReward;
        this.diamondsReward = config.diamondsReward;
        this.coinsReward = config.coinsReward;
        this.emeraldDropChance = Math.max(0, Math.min(1, config.emeraldDropChance ?? 0));
        this.emeraldReward = Math.max(0, Math.floor(config.emeraldReward ?? 1));
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
        this.emitAttackPerformed();

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

    rollEmeraldReward ()
    {
        if (this.emeraldReward <= 0 || this.emeraldDropChance <= 0)
        {
            return 0;
        }

        return Math.random() <= this.emeraldDropChance
            ? this.emeraldReward
            : 0;
    }

    protected onAttack (_player: Player)
    {
    }

    playDeathAnimation (onComplete: () => void)
    {
        this.destroy();
        onComplete();
    }

    onAttackPerformed (callback: () => void)
    {
        this.attackPerformedCallbacks.push(callback);
    }

    onSelfDefeated (callback: () => void)
    {
        this.selfDefeatedCallbacks.push(callback);
    }

    private emitAttackPerformed ()
    {
        this.attackPerformedCallbacks.forEach((callback) => {
            callback();
        });
    }

    protected emitSelfDefeated ()
    {
        this.selfDefeatedCallbacks.forEach((callback) => {
            callback();
        });
    }

    abstract onHit (callback: () => void): void;

    abstract destroy (): void;
}
