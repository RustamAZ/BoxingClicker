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
import { LootCaseController } from "../entities/LootCase/LootCaseController";
import { CoinContainer } from "../entities/ResourceContainers/CoinContainer";
import { DiamondContainer } from "../entities/ResourceContainers/DiamondContainer";
import { EmeraldContainer } from "../entities/ResourceContainers/EmeraldContainer";
import { ResourceContainer } from "../entities/ResourceContainers/ResourceContainer";
import { ResourceParticleFlow } from "../entities/ResourceContainers/ResourceParticleFlow";
import { SpawnPlace } from "../entities/SpawnPlace/SpawnPlace";
import { Wallet } from "../entities/Wallet/Wallet";
import { GameLevelController } from "../progression/GameLevelController";
import { GameSettings } from "../state/GameSettings";
import { PauseController } from "../state/PauseController";
import { LevelUpRewardController } from "../upgrades/LevelUpRewardController";
import { PlayerDeathModal } from "../ui/PlayerDeathModal";

export class Game extends Scene {
  private static readonly deathContinueEmeraldCost = 50;

  private player: Player;
  private wallet: Wallet;
  private levelController: GameLevelController;
  private gameSettings: GameSettings;
  private pauseController: PauseController;
  private background: GameBackground;
  private diamondContainer: DiamondContainer;
  private coinContainer: CoinContainer;
  private emeraldContainer: EmeraldContainer;
  private lootCaseController: LootCaseController;
  private resourceParticleFlow: ResourceParticleFlow;
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
    PlayerDeathModal.preload(this);
    LootCaseController.preload(this);
    LevelUpRewardController.preload(this);
    ResourceParticleFlow.preload(this);
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
    this.lootCaseController = new LootCaseController(
      this,
      this.player,
      this.wallet,
      this.pauseController,
    );

    this.cameras.main.setBackgroundColor(0x1f1f1f);
    this.background = new GameBackground(this, this.levelController);
    this.resourceParticleFlow = new ResourceParticleFlow(this);
    this.diamondContainer = new DiamondContainer(this, {
      x: 160,
      y: 620,
    });
    this.coinContainer = new CoinContainer(this, {
      x: 864,
      y: 620,
      onFilled: () => {
        this.time.delayedCall(
          ResourceContainer.filledAnimationDelayMs,
          () => {
            this.lootCaseController.requestOpen();
          },
        );
      },
    });
    this.emeraldContainer = new EmeraldContainer(this, this.wallet, {
      x: 18,
      y: 150,
    });
    this.updateResourceContainersVisibility();

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
    this.updateShopModalVisibility();
    this.playerDeathModal = new PlayerDeathModal(
      this,
      this.pauseController,
      () => {
        this.scene.restart();
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
    this.updateResourceContainersVisibility();
    this.updateShopModalVisibility();
    this.emeraldContainer.update();
    this.gloves.update(deltaSeconds);
    this.player.regenerateStamina(deltaSeconds);

    if (this.player.isAlive()) {
      this.enemySpawnPlace.update(deltaSeconds);
    }

    if (this.player.isDead()) {
      this.backgroundMusicController.pause();
      this.playerDeathModal.show(this.getPlayerDeathContinueOption());
      this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
      return;
    }

    this.levelUpRewardController.update(
      !this.enemySpawnPlace.isDeathAnimationPlaying,
    );
    this.lootCaseController.update();

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

    this.resourceParticleFlow.play({
      from: position,
      diamondTarget: this.diamondContainer.getTargetPoint(),
      coinTarget: this.coinContainer.getTargetPoint(),
      emeraldTarget: this.emeraldContainer.getTargetPoint(),
      diamondsCount: enemy.diamondsReward,
      coinsCount: enemy.coinsReward,
      emeraldsCount: emeraldsReward,
      onComplete: () => {
        const rewardChoices = this.diamondContainer.add(enemy.diamondsReward);

        this.coinContainer.add(enemy.coinsReward);

        if (emeraldsReward > 0) {
          this.emeraldContainer.add(emeraldsReward);
        }

        if (rewardChoices > 0) {
          this.time.delayedCall(
            ResourceContainer.filledAnimationDelayMs,
            () => {
              this.levelUpRewardController.enqueueRewards(rewardChoices);
            },
          );
        }
      },
    });
  }

  private updateResourceContainersVisibility() {
    const isVisible = this.levelController.shouldShowResourceContainers();

    this.diamondContainer.setVisible(isVisible);
    this.coinContainer.setVisible(isVisible);
  }

  private updateShopModalVisibility() {
    const isVisible = this.levelController.shouldShowShopModal();

    this.shopModal.setButtonVisible(isVisible);

    if (!isVisible) {
      this.shopModal.close();
    }
  }

  private getPlayerDeathContinueOption() {
    if (this.player.profile.getDeathContinueCount() <= 0) {
      return {
        label: "РџСЂРѕРґРѕР»Р¶РёС‚СЊ Р·Р° СЂРµРєР»Р°РјСѓ",
        isEnabled: true,
        onContinue: () => {
          this.player.profile.incrementDeathContinueCount();
          this.restorePlayerAfterDeath();
        },
      };
    }

    const cost = Game.deathContinueEmeraldCost;

    return {
      label: `РџСЂРѕРґРѕР»Р¶РёС‚СЊ Р·Р° ${cost}`,
      isEnabled: this.wallet.canWithdraw(cost),
      onContinue: () => {
        if (!this.wallet.withdraw(cost)) {
          return;
        }

        this.player.profile.incrementDeathContinueCount();
        this.restorePlayerAfterDeath();
      },
    };
  }

  private restorePlayerAfterDeath() {
    this.player.restoreFromAd();
    this.backgroundMusicController.resume();
    this.pauseController.resume("player-death");
    this.playerDeathModal.hide();
  }
}
