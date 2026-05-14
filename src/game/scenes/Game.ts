import { Scene } from "phaser";
import { Gloves } from "../entities/Gloves/Gloves";
import { GameHud } from "../ui/GameHud";
import { PauseMenu } from "../ui/PauseMenu";
import { HitSoundPlayer } from "../audio/HitSoundPlayer";
import { BreathSoundPlayer } from "../audio/BreathSoundPlayer";
import { GameBackground } from "../entities/Background/GameBackground";
import type { Enemy } from "../entities/Enemy/Enemy";
import { Player } from "../entities/Player/Player";
import { CoinContainer } from "../entities/Rewards/CoinContainer";
import { DiamondContainer } from "../entities/Rewards/DiamondContainer";
import { RewardContainer } from "../entities/Rewards/RewardContainer";
import { RewardParticleFlow } from "../entities/Rewards/RewardParticleFlow";
import { SpawnPlace } from "../entities/SpawnPlace/SpawnPlace";
import { GameSettings } from "../state/GameSettings";
import { PauseController } from "../state/PauseController";
import { LevelUpRewardController } from "../upgrades/LevelUpRewardController";
import { PlayerDeathModal } from "../ui/PlayerDeathModal";

export class Game extends Scene {
  private player: Player;
  private gameSettings: GameSettings;
  private pauseController: PauseController;
  private background: GameBackground;
  private diamondContainer: DiamondContainer;
  private treasureContainer: CoinContainer;
  private rewardParticleFlow: RewardParticleFlow;
  private enemySpawnPlace: SpawnPlace;
  private gloves: Gloves;
  private hud: GameHud;
  private pauseMenu: PauseMenu;
  private playerDeathModal: PlayerDeathModal;
  private levelUpRewardController: LevelUpRewardController;
  private hitSoundPlayer: HitSoundPlayer;
  private breathSoundPlayer: BreathSoundPlayer;

  constructor() {
    super("Game");
  }

  preload() {
    GameBackground.preload(this);
    SpawnPlace.preload(this);
    DiamondContainer.preload(this);
    CoinContainer.preload(this);
    Gloves.preload(this);
    HitSoundPlayer.preload(this);
    BreathSoundPlayer.preload(this);
  }

  create() {
    this.player = new Player();
    this.pauseController = new PauseController(this);
    this.gameSettings = new GameSettings(this);

    this.cameras.main.setBackgroundColor(0x1f1f1f);
    this.background = new GameBackground(this, this.player);
    this.rewardParticleFlow = new RewardParticleFlow(this);
    this.diamondContainer = new DiamondContainer(this, {
      x: 160,
      y: 620,
    });
    this.treasureContainer = new CoinContainer(this, {
      x: 864,
      y: 620,
    });

    this.gloves = new Gloves(this);
    this.hitSoundPlayer = new HitSoundPlayer(this);
    this.breathSoundPlayer = new BreathSoundPlayer(this);
    this.enemySpawnPlace = new SpawnPlace(
      this,
      {
        x: 512,
        y: 500,
        width: 650,
        height: 550,
      },
      this.player,
      this.gloves,
      this.hitSoundPlayer,
      (enemy, position) => {
        this.handleEnemyRewards(enemy, position);
      },
    );

    this.hud = new GameHud(
      this,
      this.player,
      this.enemySpawnPlace.currentEnemy,
    );
    this.levelUpRewardController = new LevelUpRewardController(
      this,
      this.player,
      this.pauseController,
    );
    this.pauseMenu = new PauseMenu(this, this.pauseController, this.gameSettings, () => {
      this.scene.restart();
    });
    this.playerDeathModal = new PlayerDeathModal(
      this,
      this.pauseController,
      () => {
        this.scene.restart();
      },
    );
  }

  update(_time: number, delta: number) {
    if (this.pauseMenu.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;

    this.background.update();
    this.gloves.update(deltaSeconds);
    this.player.regenerateStamina(deltaSeconds);

    if (this.player.isAlive()) {
      this.enemySpawnPlace.update(deltaSeconds);
    }

    if (this.player.isDead()) {
      this.playerDeathModal.show();
      this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
      return;
    }

    this.levelUpRewardController.update(
      !this.enemySpawnPlace.isDeathAnimationPlaying,
    );

    if (this.player.isLowStamina()) {
      this.breathSoundPlayer.playIfNotPlaying();
    }

    this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
  }

  private handleEnemyRewards(enemy: Enemy, position: { x: number; y: number }) {
    if (enemy.diamondsReward <= 0 && enemy.coinsReward <= 0) {
      return;
    }

    this.rewardParticleFlow.play({
      from: position,
      diamondTarget: this.diamondContainer.getTargetPoint(),
      treasureTarget: this.treasureContainer.getTargetPoint(),
      diamondsCount: enemy.diamondsReward,
      coinsCount: enemy.coinsReward,
      onComplete: () => {
        const rewardChoices =
          this.diamondContainer.add(enemy.diamondsReward) +
          this.treasureContainer.add(enemy.coinsReward);

        if (rewardChoices > 0) {
          this.time.delayedCall(
            RewardContainer.rewardIssueAnimationDelayMs,
            () => {
              this.levelUpRewardController.enqueueRewards(rewardChoices);
            },
          );
        }
      },
    });
  }
}
