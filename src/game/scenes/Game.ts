import { GameObjects, Scene } from "phaser";
import { Gloves } from "../entities/Gloves/Gloves";
import { GlovesEquipmentController } from "../entities/Gloves/GlovesEquipmentController";
import { GameHud } from "../ui/GameHud";
import { PauseMenu } from "../ui/PauseMenu";
import { ShopModal } from "../ui/ShopModal";
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
import { CampaignVictoryModal } from "../ui/CampaignVictoryModal";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ScreenFilterController } from "../effects/ScreenFilterController";
import { fiveDifficultyBossAttackEvent } from "../entities/Enemy/LowGradeEnemies/FiveDifficulty/FiveDifficultyBoss";
import { ShopCatalog } from "../shop/ShopCatalog";
import { getRewardContainerRequirements } from "../configs/rewardContainers";
import { languageController } from "../localization/LanguageController";
import { TrainingController } from "../training/TrainingController";
import { AppLoadingScreen } from "../loading/AppLoadingScreen";
import { FullscreenController } from "../utils/FullscreenController";

export class Game extends Scene {
  private static readonly deathContinueEmeraldCost = 100;
  private static readonly maxDeathContinuesPerRun = 2;
  private static readonly weaponUnlockToastDurationMs = 1800;
  private static readonly lobbyGameLevel = 1;
  private static readonly villageGameLevel = 2;

  private player: Player;
  private wallet: Wallet;
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
  private trainingModal: TrainingModal;
  private infiniteModeModal: InfiniteModeModal;
  private statusBar: StatusBar;
  private playerDeathModal: PlayerDeathModal;
  private campaignVictoryModal: CampaignVictoryModal;
  private levelUpRewardController: LevelUpRewardController;
  private hitSoundPlayer: HitSoundPlayer;
  private enemyAttackSoundPlayer: EnemyAttackSoundPlayer;
  private enemyDeathSoundPlayer: EnemyDeathSoundPlayer;
  private breathSoundPlayer: BreathSoundPlayer;
  private backgroundMusicController: BackgroundMusicController;
  private screenFilterController: ScreenFilterController;
  private weaponUnlockToastBackground: GameObjects.Rectangle;
  private weaponUnlockToastText: GameObjects.Text;
  private playerStatsDebugText: GameObjects.Text;
  private infinityTowerDebugText: GameObjects.Text;
  private weaponUnlockToastTimer?: Phaser.Time.TimerEvent;
  private unsubscribeLanguageChange?: () => void;
  private fullscreenController?: FullscreenController;
  private previousGameLevel: number;
  private deathContinuesUsedInRun = 0;
  private isCampaignVictoryFlowActive = false;

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
    LocationAssetPreloader.preloadInitial(this);
    GameHud.preload(this);
    LoadingSpinner.preload(this);
    PauseMenu.preload(this);
    ShopModal.preload(this);
    StatusBar.preload(this);
    PlayerDeathModal.preload(this);
    TrainingModal.preload(this);
    InfiniteModeModal.preload(this);
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
    this.trainingController = new TrainingController(this.player, this.wallet);
    this.trainingController.applyTrainingBonuses();
    this.levelController = new GameLevelController(this.player);
    this.infinityTowerController = new InfinityTowerController(
      this.player.profile,
    );
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
    this.createPlayerStatsDebugText();
    this.createInfinityTowerDebugText();
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
    this.trainingModal = new TrainingModal(
      this,
      this.pauseController,
      this.trainingController,
    );
    this.infiniteModeModal = new InfiniteModeModal(
      this,
      this.pauseController,
      this.player.profile,
      () => {
        this.startInfiniteRun();
      },
      (itemId) => {
        this.claimInfinityTowerGlovesReward(itemId);
      },
    );
    this.statusBar = new StatusBar(this);
    this.updateShopModalVisibility();
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
    this.createWeaponUnlockToast();
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
      this.fullscreenController?.destroy();
    });
  }

  update(_time: number, delta: number) {
    this.backgroundMusicController.update();

    if (this.pauseMenu.isPaused) {
      return;
    }

    const deltaSeconds = delta / 1000;

    this.updateGameLevelTransitionEffects();
    this.background.update();
    this.updateResourceContainersVisibility();
    this.updateShopModalVisibility();
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
    this.updatePlayerStatsDebugText();
    this.updateInfinityTowerDebugText();
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
    if (this.deathContinuesUsedInRun <= 0) {
      return {
        label: languageController.t("death.continue"),
        isEnabled: true,
        onContinue: () => {
          this.deathContinuesUsedInRun += 1;
          this.restorePlayerAfterDeath();
        },
      };
    }

    if (this.deathContinuesUsedInRun >= Game.maxDeathContinuesPerRun) {
      return {
        label: languageController.t("death.continueForEmerald", {
          amount: Game.deathContinueEmeraldCost,
        }),
        isEnabled: false,
        showEmeraldPrice: true,
        onContinue: () => {},
      };
    }

    const cost = Game.deathContinueEmeraldCost;

    return {
      label: languageController.t("death.continueForEmerald", {
        amount: cost,
      }),
      isEnabled: this.wallet.canWithdraw(cost),
      showEmeraldPrice: true,
      onContinue: () => {
        if (!this.wallet.withdraw(cost)) {
          return;
        }

        this.deathContinuesUsedInRun += 1;
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

  private startInfiniteRun() {
    if (!this.player.profile.isInfinityTowerAvailable()) {
      return;
    }

      this.locationAssetPreloader.prefetchInfiniteLevel(() => {
      this.infinityTowerController.startRun();
      this.levelController.startInfiniteRun();
      this.player.restoreHealth();
      this.player.restoreStamina();
      this.background.update();
      this.updateResourceContainersVisibility();
      this.updateShopModalVisibility();
      this.updateTrainingModalVisibility();
      this.updateInfiniteModeModalVisibility();
      this.enemySpawnPlace.spawnNextEnemy();
      this.backgroundMusicController.resume();
    });
  }

  private claimInfinityTowerGlovesReward(itemId: string) {
    const profile = this.player.profile;

    profile.discoverItem(itemId);
    profile.purchaseItem(itemId);
    this.glovesEquipmentController.loadAndEquipShopItem(this, itemId, () => {
      this.updatePlayerStatsDebugText();
    });
  }

  private updateGameLevelTransitionEffects() {
    const currentGameLevel = this.levelController.getCurrentGameLevel();

    if (
      this.previousGameLevel === Game.lobbyGameLevel &&
      currentGameLevel === Game.villageGameLevel
    ) {
      this.player.restoreStamina();
    }

    if (this.previousGameLevel !== currentGameLevel) {
      this.locationAssetPreloader.prefetchNextGameLevel(currentGameLevel);
    }

    this.previousGameLevel = currentGameLevel;
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
      this.showWeaponUnlockToast();
    }
  }

  private handleBossDefeated(bossId: string) {
    if (bossId === "five-difficulty-boss") {
      this.isCampaignVictoryFlowActive = true;
      this.player.profile.setInfinityTowerAvailable(true);
      this.resetPendingRunRewards();
      this.campaignVictoryModal.show();
      return true;
    }

    return false;
  }

  private returnToLobbyAfterCampaignVictory() {
    this.infinityTowerController.stopRun();
    this.levelController.returnToCampaign();
    this.player.resetSessionProgress();
    this.resetPendingRunRewards();
    this.isCampaignVictoryFlowActive = false;
    this.previousGameLevel = this.levelController.getCurrentGameLevel();
    this.deathContinuesUsedInRun = 0;
    this.background.update();
    this.updateResourceContainersVisibility();
    this.updateShopModalVisibility();
    this.updateTrainingModalVisibility();
    this.updateInfiniteModeModalVisibility();
    this.enemySpawnPlace.spawnNextEnemy();
    this.backgroundMusicController.resume();
    this.hud.update(this.player, this.enemySpawnPlace.currentEnemy);
    this.updatePlayerStatsDebugText();
    this.updateInfinityTowerDebugText();
  }

  private resetPendingRunRewards() {
    this.lootCaseController.reset();
    this.levelUpRewardController.reset();
    this.diamondContainer.reset();
    this.coinContainer.reset();
  }

  private createWeaponUnlockToast() {
    const centerX = this.scale.width / 2;
    const y = this.scale.height - 72;

    this.weaponUnlockToastBackground = this.add
      .rectangle(centerX, y, 360, 54, 0x4f4f4f, 0.88)
      .setDepth(1500)
      .setVisible(false);
    this.weaponUnlockToastText = this.add
      .text(centerX, y, languageController.t("toast.weaponUnlocked"), {
        fontFamily: "Hardpixel",
        fontSize: 22,
        color: "#ffffff",
        stroke: "#222222",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(1501)
      .setVisible(false);
  }

  private refreshLocalizedTexts() {
    this.weaponUnlockToastText.setText(
      languageController.t("toast.weaponUnlocked"),
    );

    if (this.playerDeathModal.isShown) {
      this.playerDeathModal.show(this.getPlayerDeathContinueOption());
    }
  }

  private showWeaponUnlockToast() {
    this.weaponUnlockToastTimer?.remove();
    this.weaponUnlockToastBackground.setVisible(true).setAlpha(0);
    this.weaponUnlockToastText.setVisible(true).setAlpha(0);

    this.tweens.add({
      targets: [this.weaponUnlockToastBackground, this.weaponUnlockToastText],
      alpha: 1,
      duration: 120,
      ease: "Quad.easeOut",
    });

    this.weaponUnlockToastTimer = this.time.delayedCall(
      Game.weaponUnlockToastDurationMs,
      () => {
        this.tweens.add({
          targets: [
            this.weaponUnlockToastBackground,
            this.weaponUnlockToastText,
          ],
          alpha: 0,
          duration: 180,
          ease: "Quad.easeIn",
          onComplete: () => {
            this.weaponUnlockToastBackground.setVisible(false);
            this.weaponUnlockToastText.setVisible(false);
            this.weaponUnlockToastTimer = undefined;
          },
        });
      },
    );
  }

  private createPlayerStatsDebugText() {
    this.playerStatsDebugText = this.add
      .text(18, 208, "", {
        fontFamily: "Hardpixel",
        fontSize: 14,
        color: "#ffffff",
        stroke: "#151515",
        strokeThickness: 3,
        lineSpacing: 2,
      })
      .setResolution(2)
      .setDepth(1600);

    this.updatePlayerStatsDebugText();
  }

  private createInfinityTowerDebugText() {
    this.infinityTowerDebugText = this.add
      .text(this.scale.width / 2, 98, "", {
        fontFamily: "Hardpixel",
        fontSize: 24,
        color: "#ffe85a",
        stroke: "#151515",
        strokeThickness: 5,
        align: "center",
      })
      .setOrigin(0.5)
      .setResolution(2)
      .setDepth(1600)
      .setVisible(false);

    this.updateInfinityTowerDebugText();
  }

  private updatePlayerStatsDebugText() {
    this.playerStatsDebugText.setText([
      `D: cила атаки - ${Game.formatDebugNumber(this.player.getDamagePerHit())}`,
      `S: скорость атаки в ударах в секунду - ${Game.formatDebugNumber(1000 / this.player.getPunchAnimationDurationMs())}`,
      `H: Количество здоровья максимальное - ${Game.formatDebugNumber(this.player.maxHealth)}`,
      `A: Количество выносливости максимальное - ${Game.formatDebugNumber(this.player.maxStamina)}`,
      `C: текущая цена за удар - ${Game.formatDebugNumber(this.player.getStaminaCostPerHit())}`,
    ]);
  }

  private updateInfinityTowerDebugText() {
    if (!this.infinityTowerController.isRunActive()) {
      this.infinityTowerDebugText.setVisible(false);
      return;
    }

    const kills = this.infinityTowerController.getKillsOnFloor();
    const required =
      this.infinityTowerController.getEnemiesRequiredForCurrentFloor();

    this.infinityTowerDebugText
      .setText(
        `Этаж: ${this.infinityTowerController.getCurrentFloor()}\nУбить: ${
          required - kills
        }`,
      )
      .setVisible(true);
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

  private static formatDebugNumber(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}
