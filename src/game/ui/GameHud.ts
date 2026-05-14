import { Scene } from 'phaser';
import type { Enemy } from '../entities/Enemy/Enemy';
import type { Player } from '../entities/Player/Player';
import { ProgressBar } from './ProgressBar';

export class GameHud
{
    private static readonly staminaColor = 0x3bbf5c;
    private static readonly lowStaminaColor = 0xd93636;
    private static readonly healthColor = 0xd93636;
    private static readonly lowHealthColor = 0x8f1d1d;
    private static readonly enemyHealthColor = 0xf0a23a;
    private static readonly lowEnemyHealthColor = 0xd93636;

    private readonly levelText: Phaser.GameObjects.Text;
    private readonly enemyNameText: Phaser.GameObjects.Text;
    private readonly healthBar: ProgressBar;
    private readonly staminaBar: ProgressBar;
    private readonly enemyHealthBar: ProgressBar;

    constructor (scene: Scene, player: Player, enemy?: Enemy)
    {
        this.levelText = scene.add.text(32, 28, '', {
            fontFamily: 'Arial',
            fontSize: 28,
            color: '#ffffff'
        });

        this.enemyNameText = scene.add.text(704, 28, '', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });

        this.healthBar = new ProgressBar(scene, 130, 70, 540, 24, GameHud.healthColor, 0x555555);
        this.staminaBar = new ProgressBar(scene, 130, 106, 540, 24, GameHud.staminaColor, 0x555555);
        this.enemyHealthBar = new ProgressBar(scene, 704, 70, 288, 24, GameHud.enemyHealthColor, 0x555555);

        scene.add.text(32, 69, 'Health', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });

        scene.add.text(32, 105, 'Stamina', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });

        this.update(player, enemy);
    }

    update (player: Player, enemy?: Enemy)
    {
        this.levelText.setText(`Level ${player.level}`);
        this.healthBar.setValue(player.health / player.maxHealth);
        this.healthBar.setFillColor(
            player.isLowHealth()
                ? GameHud.lowHealthColor
                : GameHud.healthColor
        );
        this.staminaBar.setValue(player.stamina / player.maxStamina);
        this.staminaBar.setFillColor(
            player.isLowStamina()
                ? GameHud.lowStaminaColor
                : GameHud.staminaColor
        );

        if (enemy)
        {
            this.enemyNameText.setText(enemy.displayName);
            this.enemyHealthBar.setValue(enemy.health / enemy.maxHealth);
            this.enemyHealthBar.setFillColor(
                enemy.health / enemy.maxHealth <= 0.25
                    ? GameHud.lowEnemyHealthColor
                    : GameHud.enemyHealthColor
            );
        }
    }
}
