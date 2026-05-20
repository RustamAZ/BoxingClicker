import { Scene } from "phaser";
import { Gloves } from "../entities/Gloves/Gloves";
import { GlovesEquipmentController } from "../entities/Gloves/GlovesEquipmentController";
import { GameHud } from "../ui/GameHud";
import { PauseMenu } from "../ui/PauseMenu";
import { ShopModal } from "../ui/ShopModal";
import { HitSoundPlayer } from "../audio/HitSoundPlayer";
import { EnemyAttackSoundPlayer } from "../audio/EnemyAttackSoundPlayer";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { BreathSoundPlayer } from "../audio/BreathSoundPlayer";
import { BackgroundMusicController } from "../audio/BackgroundMusicController";
import { GameBackground } from "../entities/Background/GameBackground";
import type { Enemy } from "../entities/Enemy/Enemy";
import { Player } from "../entities/Player/Player";
import { CoinContainer } from "../entities/Rewards/CoinContainer";
import { DiamondContainer } from "../entities/Rewards/DiamondContainer";
import { EmeraldContainer } from "../entities/Rewards/EmeraldContainer";
import { RewardContainer } from "../entities/Rewards/RewardContainer";
import { RewardParticleFlow } from "../entities/Rewards/RewardParticleFlow";
import { SpawnPlace } from "../entities/SpawnPlace/SpawnPlace";
import { Wallet } from "../entities/Wallet/Wallet";
import { GameLevelController } from "../progression/GameLevelController";
import { GameSettings } from "../state/GameSettings";
import { PauseController } from "../state/PauseController";
import { LevelUpRewardController } from "../upgrades/LevelUpRewardController";
import { PlayerDeathModal } from "../ui/PlayerDeathModal";

export class Game extends Scene {
  private player: Player;
  private wallet: Wallet;
  private levelController: GameLevelController;
  private gameSettings: GameSettings;
  private pauseController: PauseController;
  private background: GameBackground;
  private diamondContainer: DiamondContainer;
  private treasureContainer: CoinContainer;
  private emeraldContainer: EmeraldContainer;
  private rewardParticleFlow: RewardParticleFlow;
  private enemySpawnPlace: SpawnPlace;
  private gloves: Gloves;
  private glovesEquipmentController: GlovesEquipmentController;
  private hud: GameHud;
  private pauseMenu: PauseMenu;
  private shopModal: ShopModal;
  private playerDeathModal: PlayerDeathModal;
  private levelUpRewardController: LevelUpRewardController;
  private hitSoundPlayer: HitSoundPlayer;
  private enemyAttackSoundPlayer: EnemyAttackSoundPlayer;
  private breathSoundPlayer: BreathSoundPlayer;
  private backgroundMusicController: BackgroundMusicController;

  constructor() {
    super("Game");
  }

  preload() {
    GameBackground.preload(this);
    SpawnPlace.preload(this);
    GameHud.preload(this);
    PauseMenu.preload(this);
    ShopModal.preload(this);
    LevelUpRewardController.preload(this);
    RewardParticleFlow.preload(this);
    DiamondContainer.preload(this);
    CoinContainer.preload(this);
    EmeraldContainer.preload(this);
    Gloves.preload(this);
    HitSoundPlayer.preload(this);
    EnemyAttackSoundPlayer.preload(this);
    UiSoundPlayer.preload(this);
    BreathSoundPlayer.preload(this);
    BackgroundMusicController.preload(this);
  }

  create() {
    this.player = new Player();
    this.wallet = new Wallet(this.player);
    this.levelController = new GameLevelController(this.player);
    this.pauseController = new PauseController(this);
    this.gameSettings = new GameSettings(this);
    this.pauseController.onPauseChange((isPaused) => {
      this.gameSettings.setAudioPaused(isPaused);
    });

    this.cameras.main.setBackgroundColor(0x1f1f1f);
    this.background = new GameBackground(this, this.levelController);
    this.rewardParticleFlow = new RewardParticleFlow(this);
    this.diamondContainer = new DiamondContainer(this, {
      x: 160,
      y: 620,
    });
    this.treasureContainer = new CoinContainer(this, {
      x: 864,
      y: 620,
    });
    this.emeraldContainer = new EmeraldContainer(this, this.wallet, {
      x: 18,
      y: 150,
    });
    this.updateRewardContainersVisibility();

    this.gloves = new Gloves(this);
    this.glovesEquipmentController = new GlovesEquipmentController(
      this.player.profile,
      this.gloves,
    );
    this.hitSoundPlayer = new HitSoundPlayer(this);
    this.enemyAttackSoundPlayer = new EnemyAttackSoundPlayer(this);
    this.breathSoundPlayer = new BreathSoundPlayer(this);
    this.backgroundMusicController = new BackgroundMusicController(
      this,
      this.levelController,
    );
    this.enemySpawnPlace = new SpawnPlace(
      this,
      {
        x: 512,
        y: 500,
        width: 650,
        height: 550,
      },
      this.levelController,
      this.player,
      this.glovesEquipmentController,
      this.hitSoundPlayer,
      this.enemyAttackSoundPlayer,
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
    this.shopModal = new ShopModal(
      this,
      this.pauseController,
      this.wallet,
      this.glovesEquipmentController,
    );
    this.playerDeathModal = new PlayerDeathModal(
      this,
      this.pauseController,
      () => {
        this.scene.restart();
      },
      () => {
        this.player.restoreFromAd();
        this.pauseController.resume("player-death");
        this.playerDeathModal.hide();
      }
    );
  }

  update(_time: number, delta: number) {
    this.backgroundMusicController.update();

    if (this.pauseMenu.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;

    this.background.update();
    this.updateRewardContainersVisibility();
    this.emeraldContainer.update();
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
    const emeraldsReward = enemy.rollEmeraldReward();

    if (
      enemy.diamondsReward <= 0 &&
      enemy.coinsReward <= 0 &&
      emeraldsReward <= 0
    ) {
      return;
    }

    this.rewardParticleFlow.play({
      from: position,
      diamondTarget: this.diamondContainer.getTargetPoint(),
      treasureTarget: this.treasureContainer.getTargetPoint(),
      emeraldTarget: this.emeraldContainer.getTargetPoint(),
      diamondsCount: enemy.diamondsReward,
      coinsCount: enemy.coinsReward,
      emeraldsCount: emeraldsReward,
      onComplete: () => {
        const rewardChoices =
          this.diamondContainer.add(enemy.diamondsReward) +
          this.treasureContainer.add(enemy.coinsReward);

        if (emeraldsReward > 0) {
          this.emeraldContainer.add(emeraldsReward);
        }

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

  private updateRewardContainersVisibility() {
    const isVisible = this.levelController.shouldShowRewardContainers();

    this.diamondContainer.setVisible(isVisible);
    this.treasureContainer.setVisible(isVisible);
  }
}
