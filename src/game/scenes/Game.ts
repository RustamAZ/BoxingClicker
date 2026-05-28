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
import { LocationAssetPreloader } from "../progression/LocationAssetPreloader";
import { GameSettings } from "../state/GameSettings";
import { PauseController } from "../state/PauseController";
import { LevelUpRewardController } from "../upgrades/LevelUpRewardController";
import { PlayerDeathModal } from "../ui/PlayerDeathModal";
import { TrainingModal } from "../ui/TrainingModal";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ScreenFilterController } from "../effects/ScreenFilterController";
import { fiveDifficultyBossAttackEvent } from "../entities/Enemy/LowGradeEnemies/FiveDifficulty/FiveDifficultyBoss";
import { ShopCatalog } from "../shop/ShopCatalog";
import { getRewardContainerRequirements } from "../configs/rewardContainers";
import { languageController } from "../localization/LanguageController";
import { TrainingController } from "../training/TrainingController";
import { AppLoadingScreen } from "../loading/AppLoadingScreen";

export class Game extends Scene {
  private static readonly deathContinueEmeraldCost = 50;
  private static readonly weaponUnlockToastDurationMs = 1800;
  private static readonly lobbyGameLevel = 1;
  private static readonly villageGameLevel = 2;

  private player: Player;
  private wallet: Wallet;
  private trainingController: TrainingController;
  private levelController: GameLevelController;
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
  private statusBar: StatusBar;
  private playerDeathModal: PlayerDeathModal;
  private levelUpRewardController: LevelUpRewardController;
  private hitSoundPlayer: HitSoundPlayer;
  private enemyAttackSoundPlayer: EnemyAttackSoundPlayer;
  private enemyDeathSoundPlayer: EnemyDeathSoundPlayer;
  private breathSoundPlayer: BreathSoundPlayer;
  private backgroundMusicController: BackgroundMusicController;
  private screenFilterController: ScreenFilterController;
  private weaponUnlockToastBackground: GameObjects.Rectangle;
  private weaponUnlockToastText: GameObjects.Text;
  private weaponUnlockToastTimer?: Phaser.Time.TimerEvent;
  private unsubscribeLanguageChange?: () => void;
  private previousGameLevel: number;
  private isDeathAdContinueUsed = false;

  constructor() {
    super("Game");
  }

  preload() {
    this.load.setBaseURL(import.meta.env.BASE_URL);
    LocationAssetPreloader.preloadInitial(this);
    GameHud.preload(this);
    LoadingSpinner.preload(this);
    PauseMenu.preload(this);
    ShopModal.preload(this);
    StatusBar.preload(this);
    PlayerDeathModal.preload(this);
    TrainingModal.preload(this);
    LootCaseController.preload(this);
    LevelUpRewardController.preload(this);
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
    this.wallet = new Wallet(this.player);
    this.trainingController = new TrainingController(this.player, this.wallet);
    this.trainingController.applyTrainingBonuses();
    this.levelController = new GameLevelController(this.player);
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
    this.trainingModal = new TrainingModal(
      this,
      this.pauseController,
      this.trainingController,
    );
    this.statusBar = new StatusBar(this);
    this.updateShopModalVisibility();
    this.updateTrainingModalVisibility();
    this.playerDeathModal = new PlayerDeathModal(
      this,
      this.pauseController,
      () => {
        this.scene.restart();
      }
    );
    this.createWeaponUnlockToast();
    this.locationAssetPreloader.prefetchNextGameLevel(
      this.levelController.getCurrentGameLevel(),
    );
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
    if (!this.isDeathAdContinueUsed) {
      return {
        label: languageController.t("death.continue"),
        isEnabled: true,
        onContinue: () => {
          this.isDeathAdContinueUsed = true;
          this.player.profile.incrementDeathContinueCount();
          this.restorePlayerAfterDeath();
        },
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

  private updateTrainingModalVisibility() {
    const isVisible =
      this.levelController.getCurrentGameLevel() === Game.lobbyGameLevel;

    this.trainingModal.setButtonVisible(isVisible);

    if (!isVisible) {
      this.trainingModal.close();
    }
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
    const unlockedItem = ShopCatalog.getItemByUnlockBossId(bossId);

    if (!unlockedItem) {
      return;
    }

    if (this.player.profile.discoverItem(unlockedItem.id)) {
      this.showWeaponUnlockToast();
    }
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
