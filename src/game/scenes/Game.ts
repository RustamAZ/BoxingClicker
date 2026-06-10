import { GameObjects, Scene } from "phaser";
import { Gloves } from "../entities/Gloves/Gloves";
import { GlovesEquipmentController } from "../entities/Gloves/GlovesEquipmentController";
import { GameHud } from "../ui/GameHud";
import { PauseMenu } from "../ui/PauseMenu";
import { ShopModal } from "../ui/ShopModal";
import { DailyRewardController } from "../daily/DailyRewardController";
import { DailyRewardModal } from "../ui/DailyRewardModal";
import { StatusBar } from "../ui/StatusBar";
import { HitSoundPlayer } from "../audio/HitSoundPlayer";
import { EnemyAttackSoundPlayer } from "../audio/EnemyAttackSoundPlayer";
import { EnemyDeathSoundPlayer } from "../audio/EnemyDeathSoundPlayer";
import { UiSoundPlayer } from "../audio/UiSoundPlayer";
import { BreathSoundPlayer } from "../audio/BreathSoundPlayer";
import { BackgroundMusicController } from "../audio/BackgroundMusicController";
import { GameBackground } from "../entities/Background/GameBackground";
import type { Enemy } from "../entities/Enemy/Enemy";
import { Player } from "../entities/Player/Player";
import { PlayerProfile } from "../entities/Player/PlayerProfile";
import { LootCaseController } from "../entities/LootCase/LootCaseController";
import { CoinContainer } from "../entities/ResourceContainers/CoinContainer";
import { DiamondContainer } from "../entities/ResourceContainers/DiamondContainer";
import { EmeraldContainer } from "../entities/ResourceContainers/EmeraldContainer";
import { ResourceContainer } from "../entities/ResourceContainers/ResourceContainer";
import { ResourceParticleFlow } from "../entities/ResourceContainers/ResourceParticleFlow";
import { SpawnPlace } from "../entities/SpawnPlace/SpawnPlace";
import { Wallet } from "../entities/Wallet/Wallet";
import { GameLevelController } from "../progression/GameLevelController";
import { InfinityTowerController } from "../progression/InfinityTowerController";
import { LocationAssetPreloader } from "../progression/LocationAssetPreloader";
import { GameSettings } from "../state/GameSettings";
import { PauseController } from "../state/PauseController";
import { LevelUpRewardController } from "../upgrades/LevelUpRewardController";
import { PlayerDeathModal } from "../ui/PlayerDeathModal";
import { TrainingModal } from "../ui/TrainingModal";
import { InfiniteModeModal } from "../ui/InfiniteModeModal";
import { InfinityTowerConsumableModal } from "../ui/InfinityTowerConsumableModal";
import { CampaignVictoryModal } from "../ui/CampaignVictoryModal";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { NotificationController } from "../ui/NotificationController";
import { ScreenFilterController } from "../effects/ScreenFilterController";
import { fiveDifficultyBossAttackEvent } from "../entities/Enemy/LowGradeEnemies/FiveDifficulty/FiveDifficultyBoss";
import { ShopCatalog } from "../shop/ShopCatalog";
import { getRewardContainerRequirements } from "../configs/rewardContainers";
import { languageController } from "../localization/LanguageController";
import { TrainingController } from "../training/TrainingController";
import { AppLoadingScreen } from "../loading/AppLoadingScreen";
import { FullscreenController } from "../utils/FullscreenController";
import {
  getInfinityTowerConsumableConfig,
  infinityTowerConsumableIds,
  type InfinityTowerConsumableId,
} from "../configs/infinityTowerConsumables";

export class Game extends Scene {
  private static readonly deathContinueEmeraldCost = 100;
  private static readonly lobbyGameLevel = 1;
  private static readonly villageGameLevel = 2;
  private static readonly infinityTowerFloorCounterTextureKey =
    "infinity-tower-floor-counter";
  private static readonly infinityTowerFloorCounterPath =
    "assets/images/ui/infinity-tower/floor-counter.png";
  private static readonly infinityTowerEnemiesCounterTextureKey =
    "infinity-tower-enemies-counter";
  private static readonly infinityTowerEnemiesCounterPath =
    "assets/images/ui/infinity-tower/enemies-counter.png";
  private static readonly infinityTowerCounterX = 960;
  private static readonly infinityTowerFloorCounterY = 230;
  private static readonly infinityTowerEnemiesCounterY = 300;
  private static readonly infinityTowerCounterDepth = 950;
  private static readonly infinityTowerCounterTextOffsetX = 0;

  private player: Player;
  private wallet: Wallet;
  private dailyRewardController: DailyRewardController;
  private trainingController: TrainingController;
  private levelController: GameLevelController;
  private infinityTowerController: InfinityTowerController;
  private locationAssetPreloader: LocationAssetPreloader;
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
  private dailyRewardModal: DailyRewardModal;
  private trainingModal: TrainingModal;
  private infiniteModeModal: InfiniteModeModal;
  private infinityTowerConsumableModal: InfinityTowerConsumableModal;
  private statusBar: StatusBar;
  private playerDeathModal: PlayerDeathModal;
  private campaignVictoryModal: CampaignVictoryModal;
  private notificationController: NotificationController;
  private levelUpRewardController: LevelUpRewardController;
  private hitSoundPlayer: HitSoundPlayer;
  private enemyAttackSoundPlayer: EnemyAttackSoundPlayer;
  private enemyDeathSoundPlayer: EnemyDeathSoundPlayer;
  private breathSoundPlayer: BreathSoundPlayer;
  private backgroundMusicController: BackgroundMusicController;
  private screenFilterController: ScreenFilterController;
  private infinityTowerFloorCounter: GameObjects.Image;
  private infinityTowerEnemiesCounter: GameObjects.Image;
  private infinityTowerFloorCounterText: GameObjects.Text;
  private infinityTowerEnemiesCounterText: GameObjects.Text;
  private infinityTowerRunLoaderOverlay: GameObjects.Rectangle;
  private infinityTowerRunLoader: LoadingSpinner;
  private unsubscribeLanguageChange?: () => void;
  private unsubscribeInfinityTowerRewardUnlocked?: () => void;
  private fullscreenController?: FullscreenController;
  private previousGameLevel: number;
  private isDeathAdContinueUsedInRun = false;
  private isDeathEmeraldContinueUsedInRun = false;
  private isCampaignVictoryFlowActive = false;
  private isInfinityTowerRunLoading = false;
  private isDailyRewardAutoOpenedForCurrentLobbyVisit = false;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setBaseURL(import.meta.env.BASE_URL);
    const updateLoadingProgress = (progress: number) => {
      AppLoadingScreen.setProgress(progress);
    };

    AppLoadingScreen.setProgress(0);
    this.load.on("progress", updateLoadingProgress);
    this.load.once("complete", () => {
      this.load.off("progress", updateLoadingProgress);
      AppLoadingScreen.setProgress(1);
    });
    this.load.image(
      Game.infinityTowerFloorCounterTextureKey,
      Game.infinityTowerFloorCounterPath,
    );
    this.load.image(
      Game.infinityTowerEnemiesCounterTextureKey,
      Game.infinityTowerEnemiesCounterPath,
    );
    LocationAssetPreloader.preloadInitial(this);
    GameHud.preload(this);
    LoadingSpinner.preload(this);
    PauseMenu.preload(this);
    ShopModal.preload(this);
    DailyRewardModal.preload(this);
    StatusBar.preload(this);
    NotificationController.preload(this);
    PlayerDeathModal.preload(this);
    TrainingModal.preload(this);
    InfiniteModeModal.preload(this);
    InfinityTowerConsumableModal.preload(this);
    ResourceParticleFlow.preload(this);
    DiamondContainer.preload(this);
    CoinContainer.preload(this);
    EmeraldContainer.preload(this);
    Gloves.preload(this, Game.getStoredEquippedGlovesId());
    HitSoundPlayer.preload(this);
    EnemyAttackSoundPlayer.preload(this);
    EnemyDeathSoundPlayer.preload(this);
    UiSoundPlayer.preload(this);
    BreathSoundPlayer.preload(this);
    BackgroundMusicController.preload(this);
  }

  create() {
    this.player = new Player();
    this.fullscreenController = new FullscreenController(this);
    this.wallet = new Wallet(this.player);
    this.dailyRewardController = new DailyRewardController(this.player.profile);
    this.trainingController = new TrainingController(this.player, this.wallet);
    this.trainingController.completeBaseTrainingForInfinityTower();
    this.trainingController.applyTrainingBonuses();
    this.levelController = new GameLevelController(this.player);
    this.infinityTowerController = new InfinityTowerController(
      this.player.profile,
    );
    this.unsubscribeInfinityTowerRewardUnlocked =
      this.infinityTowerController.onRewardUnlocked(() => {
        this.notificationController.show("notification.newReward");
      });
    this.locationAssetPreloader = new LocationAssetPreloader(this);
    this.previousGameLevel = this.levelController.getCurrentGameLevel();
    this.pauseController = new PauseController(this);
    this.screenFilterController = new ScreenFilterController(this);
    this.gameSettings = new GameSettings(this);
    this.pauseController.onPauseChange((isPaused) => {
      this.gameSettings.setAudioPaused(isPaused);
    });
    this.lootCaseController = new LootCaseController(
      this,
      this.player,
      this.wallet,
      this.pauseController,
      () => this.levelController.isInfiniteRun(),
      (amount, from) => {
        this.playModalEmeraldReward(amount, from);
      },
    );

    this.cameras.main.setBackgroundColor(0x1f1f1f);
    this.background = new GameBackground(this, this.levelController);
    this.resourceParticleFlow = new ResourceParticleFlow(this);
    this.diamondContainer = new DiamondContainer(this, {
      x: 160,
      y: 620,
      getRequiredValue: () =>
        getRewardContainerRequirements(
          this.levelController.getCurrentLocationId(),
        ).buff_container_required,
    });
    this.coinContainer = new CoinContainer(this, {
      x: 864,
      y: 620,
      getRequiredValue: () =>
        getRewardContainerRequirements(
          this.levelController.getCurrentLocationId(),
        ).lootbox_container_required,
      onFilled: () => {
        this.time.delayedCall(
          ResourceContainer.filledAnimationDelayMs,
          () => {
            if (this.isCampaignVictoryFlowActive) {
              return;
            }

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

    this.gloves = new Gloves(this, Game.getEquippedGlovesId(this.player.profile));
    this.glovesEquipmentController = new GlovesEquipmentController(
      this.player.profile,
      this.gloves,
      this.player,
    );
    this.hitSoundPlayer = new HitSoundPlayer(this);
    this.enemyAttackSoundPlayer = new EnemyAttackSoundPlayer(this);
    this.enemyDeathSoundPlayer = new EnemyDeathSoundPlayer(this);
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
      this.enemyDeathSoundPlayer,
      (enemy, position) => {
        this.handleEnemyRewards(enemy, position);
      },
      (bossId) => {
        this.handleBossEncountered(bossId);
      },
      (bossId) => {
        this.handleBossDefeated(bossId);
      },
      this.infinityTowerController,
    );

    this.hud = new GameHud(
      this,
      this.player,
      this.enemySpawnPlace.currentEnemy,
    );
    this.createInfinityTowerCounters();
    this.createInfinityTowerRunLoader();
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
    this.dailyRewardModal = new DailyRewardModal(
      this,
      this.pauseController,
      this.dailyRewardController,
      (result) => {
        if (result.reward.type !== "gloves") {
          return;
        }

        this.glovesEquipmentController.loadAndEquipShopItem(
          this,
          result.reward.itemId,
          () => {},
        );
      },
      (amount, from) => {
        this.playModalEmeraldReward(amount, from);
      },
    );
    this.trainingModal = new TrainingModal(
      this,
      this.pauseController,
      this.trainingController,
      () => {
        this.emeraldContainer.update();
      },
      (amount, from) => {
        this.playModalEmeraldReward(amount, from);
      },
    );
    this.infiniteModeModal = new InfiniteModeModal(
      this,
      this.pauseController,
      this.player.profile,
      () => {
        this.requestStartInfiniteRun();
      },
      (itemId) => {
        this.claimInfinityTowerGlovesReward(itemId);
      },
      () => {
        this.emeraldContainer.update();
      },
    );
    this.infinityTowerConsumableModal = new InfinityTowerConsumableModal(
      this,
      this.pauseController,
    );
    this.statusBar = new StatusBar(this);
    this.notificationController = new NotificationController(this);
    this.updateShopModalVisibility();
    this.updateDailyRewardModalVisibility();
    this.updateTrainingModalVisibility();
    this.updateInfiniteModeModalVisibility();
    this.playerDeathModal = new PlayerDeathModal(
      this,
      this.pauseController,
      () => {
        this.scene.restart();
      }
    );
    this.campaignVictoryModal = new CampaignVictoryModal(
      this,
      this.pauseController,
      () => {
        this.returnToLobbyAfterCampaignVictory();
      },
    );
    this.locationAssetPreloader.prefetchNextGameLevel(
      this.levelController.getCurrentGameLevel(),
    );
    this.lootCaseController.preloadAssets();
    this.levelUpRewardController.preloadAssets();
    this.unsubscribeLanguageChange = languageController.onChange(() => {
      this.refreshLocalizedTexts();
    });
    AppLoadingScreen.hide();

    this.events.on(
      fiveDifficultyBossAttackEvent,
      this.handleFiveDifficultyBossAttack,
      this,
    );
    window.addEventListener("keydown", this.handleGlobalKeyDown);
    this.events.once("shutdown", () => {
      this.events.off(
        fiveDifficultyBossAttackEvent,
        this.handleFiveDifficultyBossAttack,
        this,
      );
      window.removeEventListener("keydown", this.handleGlobalKeyDown);
      this.unsubscribeLanguageChange?.();
      this.unsubscribeInfinityTowerRewardUnlocked?.();
      this.notificationController.destroy();
      this.fullscreenController?.destroy();
    });
  }

  update(_time: number, delta: number) {
    this.backgroundMusicController.update();

    if (this.pauseMenu.isPaused) {
      return;
    }

    if (this.isInfinityTowerRunLoading) {
      return;
    }

    const deltaSeconds = delta / 1000;

    this.updateGameLevelTransitionEffects();
    this.background.update();
    this.updateResourceContainersVisibility();
    this.updateShopModalVisibility();
    this.updateDailyRewardModalVisibility();
    this.updateTrainingModalVisibility();
    this.updateInfiniteModeModalVisibility();
    this.emeraldContainer.update();
    this.gloves.update(deltaSeconds);
    this.player.regenerateStamina(deltaSeconds);
    this.statusBar.update(this.player, _time);

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
      this.enemySpawnPlace.canOpenRewardModal,
    );
    this.lootCaseController.update(this.enemySpawnPlace.canOpenRewardModal);

    if (this.player.isLowStamina()) {
      this.breathSoundPlayer.playIfNotPlaying();
    }

    this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
    this.updateInfinityTowerCounters();
  }

  private handleEnemyRewards(enemy: Enemy, position: { x: number; y: number }) {
    if (this.isCampaignVictoryFlowActive) {
      return;
    }

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
        if (this.isCampaignVictoryFlowActive) {
          return;
        }

        const rewardChoices = this.diamondContainer.add(enemy.diamondsReward);

        this.coinContainer.add(enemy.coinsReward);

        if (emeraldsReward > 0) {
          this.emeraldContainer.add(emeraldsReward);
        }

        if (rewardChoices > 0) {
          this.time.delayedCall(
            ResourceContainer.filledAnimationDelayMs,
            () => {
              if (this.isCampaignVictoryFlowActive) {
                return;
              }

              this.levelUpRewardController.enqueueRewards(rewardChoices);
            },
          );
        }
      },
    });
  }

  private playModalEmeraldReward(
    amount: number,
    from: { x: number; y: number },
  ) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return;
    }

    this.resourceParticleFlow.play({
      from,
      diamondTarget: this.emeraldContainer.getTargetPoint(),
      coinTarget: this.emeraldContainer.getTargetPoint(),
      emeraldTarget: this.emeraldContainer.getTargetPoint(),
      diamondsCount: 0,
      coinsCount: 0,
      emeraldsCount: 1,
      depth: 2200,
      spawnOffsetY: 0,
      onComplete: () => {
        this.emeraldContainer.add(safeAmount);
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

  private updateDailyRewardModalVisibility() {
    const isVisible =
      this.levelController.getCurrentGameLevel() === Game.lobbyGameLevel &&
      !this.levelController.isInfiniteRun();

    this.dailyRewardModal.setButtonVisible(isVisible);

    if (!isVisible) {
      this.dailyRewardModal.close();
      this.isDailyRewardAutoOpenedForCurrentLobbyVisit = false;
      return;
    }

    if (
      this.isDailyRewardAutoOpenedForCurrentLobbyVisit ||
      !this.dailyRewardModal.hasAvailableReward() ||
      this.pauseController.isPaused
    ) {
      return;
    }

    this.isDailyRewardAutoOpenedForCurrentLobbyVisit = true;
    this.dailyRewardModal.open();
  }

  private getPlayerDeathContinueOption() {
    const rewiveCount = this.player.profile.getRewiveCount();

    if (rewiveCount > 0) {
      return {
        label: languageController.t("death.continueForRewive"),
        isEnabled: true,
        showRewivePrice: true,
        rewiveCount,
        onContinue: () => {
          if (!this.player.profile.spendRewiveCount()) {
            return;
          }

          this.restorePlayerAfterDeath();
        },
      };
    }

    if (!this.isDeathAdContinueUsedInRun) {
      return {
        label: languageController.t("death.continueForAd"),
        isEnabled: true,
        showAdPrice: true,
        onContinue: () => {
          this.isDeathAdContinueUsedInRun = true;
          this.restorePlayerAfterDeath();
        },
      };
    }

    const cost = Game.deathContinueEmeraldCost;
    const canUseEmeraldContinue = !this.isDeathEmeraldContinueUsedInRun;

    return {
      label: languageController.t("death.continueForEmerald", {
        amount: cost,
      }),
      isEnabled: canUseEmeraldContinue && this.wallet.canWithdraw(cost),
      showEmeraldPrice: true,
      onContinue: () => {
        if (!canUseEmeraldContinue) {
          return;
        }

        if (!this.wallet.withdraw(cost)) {
          return;
        }

        this.isDeathEmeraldContinueUsedInRun = true;
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

  private updateTrainingModalVisibility() {
    const isVisible =
      this.levelController.getCurrentGameLevel() === Game.lobbyGameLevel;

    this.trainingModal.setButtonVisible(isVisible);

    if (!isVisible) {
      this.trainingModal.close();
    }
  }

  private updateInfiniteModeModalVisibility() {
    const isVisible =
      this.levelController.getCurrentGameLevel() === Game.lobbyGameLevel &&
      !this.levelController.isInfiniteRun();

    this.infiniteModeModal.setButtonVisible(isVisible);

    if (!isVisible) {
      this.infiniteModeModal.close();
    }
  }

  private requestStartInfiniteRun() {
    if (
      !this.player.profile.isInfinityTowerAvailable() ||
      this.isInfinityTowerRunLoading
    ) {
      return;
    }

    const consumables = this.player.profile.getTowerConsumables();
    const hasAvailableConsumable = infinityTowerConsumableIds.some(
      (consumableId) => (consumables[consumableId] ?? 0) > 0,
    );

    if (hasAvailableConsumable) {
      this.infinityTowerConsumableModal.show(consumables, (consumableId) => {
        this.startInfiniteRun(consumableId);
      });
      return;
    }

    this.startInfiniteRun();
  }

  private startInfiniteRun(consumableId?: InfinityTowerConsumableId) {
    this.isInfinityTowerRunLoading = true;
    this.setInfinityTowerRunLoaderVisible(true);
    this.infinityTowerController.startRun();
    this.applyInfinityTowerRunConsumable(consumableId);

    this.locationAssetPreloader.prefetchInfiniteLevelBackground(() => {
      this.locationAssetPreloader.prefetchInfinityTowerEnemyPacks(
        [this.infinityTowerController.getCurrentEnemyPack()],
        () => {
          this.isInfinityTowerRunLoading = false;
          this.setInfinityTowerRunLoaderVisible(false);
          this.resetDeathContinuesForNewRun();
          this.startPreparedInfiniteRun();
          this.locationAssetPreloader.prefetchInfinityTowerEnemyPacks(
            this.infinityTowerController.getRemainingEnemyPacks(),
          );
        },
      );
    });
  }

  private startPreparedInfiniteRun() {
      this.levelController.startInfiniteRun();
      this.player.restoreHealth();
      this.player.restoreStamina();
      this.background.update();
      this.updateResourceContainersVisibility();
      this.updateShopModalVisibility();
      this.updateDailyRewardModalVisibility();
      this.updateTrainingModalVisibility();
      this.updateInfiniteModeModalVisibility();
      this.enemySpawnPlace.spawnNextEnemy();
      this.backgroundMusicController.resume();
  }

  private applyInfinityTowerRunConsumable(
    consumableId?: InfinityTowerConsumableId,
  ) {
    const consumable = consumableId
      ? getInfinityTowerConsumableConfig(consumableId)
      : undefined;

    this.player.setPermanentStatEffects("infinity-tower-consumable", []);

    if (!consumable) {
      return;
    }

    if (!this.player.profile.spendTowerConsumable(consumable.id)) {
      return;
    }

    this.player.setPermanentStatEffects(
      "infinity-tower-consumable",
      consumable.effects,
    );
  }

  private claimInfinityTowerGlovesReward(itemId: string) {
    const profile = this.player.profile;

    profile.discoverItem(itemId);
    profile.purchaseItem(itemId);
    this.glovesEquipmentController.loadAndEquipShopItem(this, itemId, () => {});
  }

  private updateGameLevelTransitionEffects() {
    const currentGameLevel = this.levelController.getCurrentGameLevel();

    if (
      this.previousGameLevel === Game.lobbyGameLevel &&
      currentGameLevel === Game.villageGameLevel
    ) {
      this.resetDeathContinuesForNewRun();
      this.player.restoreStamina();
    }

    if (this.previousGameLevel !== currentGameLevel) {
      this.locationAssetPreloader.prefetchNextGameLevel(currentGameLevel);
    }

    this.previousGameLevel = currentGameLevel;
  }

  private resetDeathContinuesForNewRun() {
    this.isDeathAdContinueUsedInRun = false;
    this.isDeathEmeraldContinueUsedInRun = false;
  }

  private handleFiveDifficultyBossAttack() {
    this.screenFilterController.playGrayscale(1000);
  }

  private readonly handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape" || event.key === "Escape") {
      event.preventDefault();

      if (this.pauseController.has("shop")) {
        this.shopModal.close();
        return;
      }

      if (this.pauseController.has("daily-reward")) {
        this.dailyRewardModal.close();
        return;
      }

      if (this.pauseController.has("training")) {
        this.trainingModal.close();
        return;
      }

      if (this.pauseController.has("infinite-mode")) {
        this.infiniteModeModal.close();
        return;
      }

      if (this.pauseController.has("campaign-victory")) {
        this.campaignVictoryModal.close();
        return;
      }

      this.pauseMenu.toggle();
      return;
    }

    if (
      event.code !== "Space" &&
      event.code !== "Enter" &&
      event.key !== " " &&
      event.key !== "Enter"
    ) {
      return;
    }

    event.preventDefault();

    if (
      this.pauseController.isPaused ||
      this.player.isDead() ||
      this.enemySpawnPlace.isDeathAnimationPlaying
    ) {
      return;
    }

    this.enemySpawnPlace.hitCurrentEnemy();
  };

  private handleBossEncountered(bossId: string) {
    if (bossId === "five-difficulty-boss") {
      this.campaignVictoryModal.preloadAssets();
    }

    const unlockedItem = ShopCatalog.getItemByUnlockBossId(bossId);

    if (!unlockedItem) {
      return;
    }

    if (this.player.profile.discoverItem(unlockedItem.id)) {
      this.notificationController.show("notification.weaponUnlocked");
    }
  }

  private handleBossDefeated(bossId: string) {
    if (bossId === "five-difficulty-boss") {
      this.isCampaignVictoryFlowActive = true;
      this.player.profile.setInfinityTowerAvailable(true);
      this.trainingController.completeBaseTrainingForInfinityTower();
      this.trainingController.applyTrainingBonuses();
      this.resetPendingRunRewards();
      this.campaignVictoryModal.show();
      return true;
    }

    return false;
  }

  private returnToLobbyAfterCampaignVictory() {
    this.infinityTowerController.stopRun();
    this.player.setPermanentStatEffects("infinity-tower-consumable", []);
    this.levelController.returnToCampaign();
    this.player.resetSessionProgress();
    this.resetPendingRunRewards();
    this.isCampaignVictoryFlowActive = false;
    this.previousGameLevel = this.levelController.getCurrentGameLevel();
    this.resetDeathContinuesForNewRun();
    this.background.update();
    this.updateResourceContainersVisibility();
    this.updateShopModalVisibility();
    this.updateDailyRewardModalVisibility();
    this.updateTrainingModalVisibility();
    this.updateInfiniteModeModalVisibility();
    this.enemySpawnPlace.spawnNextEnemy();
    this.backgroundMusicController.resume();
    this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
    this.updateInfinityTowerCounters();
  }

  private resetPendingRunRewards() {
    this.lootCaseController.reset();
    this.levelUpRewardController.reset();
    this.diamondContainer.reset();
    this.coinContainer.reset();
  }

  private refreshLocalizedTexts() {
    this.notificationController.refresh();

    if (this.playerDeathModal.isShown) {
      this.playerDeathModal.show(this.getPlayerDeathContinueOption());
    }
  }

  private createInfinityTowerCounters() {
    this.infinityTowerFloorCounter = this.add
      .image(
        Game.infinityTowerCounterX,
        Game.infinityTowerFloorCounterY,
        Game.infinityTowerFloorCounterTextureKey,
      )
      .setDepth(Game.infinityTowerCounterDepth)
      .setVisible(false);
    this.infinityTowerEnemiesCounter = this.add
      .image(
        Game.infinityTowerCounterX,
        Game.infinityTowerEnemiesCounterY,
        Game.infinityTowerEnemiesCounterTextureKey,
      )
      .setDepth(Game.infinityTowerCounterDepth)
      .setVisible(false);

    this.infinityTowerFloorCounterText = this.add
      .text(
        Game.infinityTowerCounterX + Game.infinityTowerCounterTextOffsetX,
        Game.infinityTowerFloorCounterY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 26,
          color: "#ffffff",
          stroke: "#151515",
          strokeThickness: 4,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(Game.infinityTowerCounterDepth + 1)
      .setVisible(false);
    this.infinityTowerEnemiesCounterText = this.add
      .text(
        Game.infinityTowerCounterX + Game.infinityTowerCounterTextOffsetX,
        Game.infinityTowerEnemiesCounterY,
        "",
        {
          fontFamily: "Hardpixel",
          fontSize: 26,
          color: "#ffffff",
          stroke: "#151515",
          strokeThickness: 4,
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(Game.infinityTowerCounterDepth + 1)
      .setVisible(false);
    this.updateInfinityTowerCounters();
  }

  private createInfinityTowerRunLoader() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.infinityTowerRunLoaderOverlay = this.add
      .rectangle(centerX, centerY, 1024, 768, 0x000000, 0.58)
      .setDepth(2200)
      .setInteractive()
      .setVisible(false);
    this.infinityTowerRunLoader = new LoadingSpinner(
      this,
      centerX,
      centerY,
      2201,
    );
  }

  private setInfinityTowerRunLoaderVisible(visible: boolean) {
    this.infinityTowerRunLoaderOverlay.setVisible(visible);

    if (visible) {
      this.infinityTowerRunLoaderOverlay.setInteractive();
      this.infinityTowerRunLoader.show();
    } else {
      this.infinityTowerRunLoaderOverlay.disableInteractive();
      this.infinityTowerRunLoader.hide();
    }
  }

  private updateInfinityTowerCounters() {
    if (!this.infinityTowerController.isRunActive()) {
      this.setInfinityTowerCountersVisible(false);
      return;
    }

    const kills = this.infinityTowerController.getKillsOnFloor();
    const required =
      this.infinityTowerController.getEnemiesRequiredForCurrentFloor();

    this.infinityTowerFloorCounterText.setText(
      String(this.infinityTowerController.getCurrentFloor()),
    );
    this.infinityTowerEnemiesCounterText.setText(`${kills}/${required}`);
    this.setInfinityTowerCountersVisible(true);
  }

  private setInfinityTowerCountersVisible(visible: boolean) {
    this.infinityTowerFloorCounter.setVisible(visible);
    this.infinityTowerEnemiesCounter.setVisible(visible);
    this.infinityTowerFloorCounterText.setVisible(visible);
    this.infinityTowerEnemiesCounterText.setVisible(visible);
  }

  private static getStoredEquippedGlovesId() {
    return (
      ShopCatalog.getItemById(PlayerProfile.getStoredEquippedItemId())
        ?.glovesId ?? PlayerProfile.getStoredEquippedItemId()
    );
  }

  private static getEquippedGlovesId(profile: PlayerProfile) {
    return (
      ShopCatalog.getItemById(profile.getEquippedItemId())?.glovesId ??
      profile.getEquippedItemId()
    );
  }

}
