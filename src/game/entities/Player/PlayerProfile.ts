import {
  trainingConfig,
  trainingItemIds,
  type TrainingItemId,
  type TrainingLevels,
} from "../../configs/training";
import {
  infinityTowerConsumableIds,
  type InfinityTowerConsumableId,
  type InfinityTowerConsumables,
} from "../../configs/infinityTowerConsumables";
import { gameLevelStartPlayerLevels } from "../../configs/gameLevelsConfig";

export type InfinityTowerProfile = {
  isAvailable: boolean;
  currentLevel: number;
  claimedRewardIds: string[];
};

export type DailyRewardsProfile = {
  last_claim_date?: string;
  claimedRewards: number[];
};

export type PlayerProfileSnapshot = {
  id: string;
  emeralds: number;
  rewiveCount: number;
  purchasedItemIds: string[];
  discoveredItemIds: string[];
  equippedItemId: string;
  globalLevel: number;
  InfinityTower: InfinityTowerProfile;
  towerConsumables: InfinityTowerConsumables;
  trainingLevels: TrainingLevels;
  dailyRewards: DailyRewardsProfile;
};

type StoredPlayerProfile = {
  id?: string;
  emeralds?: number;
  rewiveCount?: number;
  purchasedItemIds?: string[];
  discoveredItemIds?: string[];
  equippedItemId?: string;
  globalLevel?: number;
  currentLevel?: number;
  InfinityTower?: Partial<InfinityTowerProfile>;
  towerConsumables?: InfinityTowerConsumables;
  trainingLevels?: TrainingLevels;
  dailyRewards?: Partial<DailyRewardsProfile>;
};

type StoredLegacyWallet = {
  emeralds?: number;
};

const mockStoryGlovesItemIds = [
  "basic-gloves",
  "amogus-gloves",
  "pepe-gloves",
  "mechanic-gloves",
  "infinity-gloves",
  "six-seven-gloves",
];

const mockInfinityTowerStartTrainingLevels = Object.fromEntries(
  trainingConfig.items.map((item) => [
    item.id,
    item.id === "critical-hit" ? 0 : item.maxLevel,
  ]),
) as TrainingLevels;

const mockInfinityTowerStartProfile: StoredPlayerProfile = {
  id: "mock-player",
  emeralds: 0,
  rewiveCount: 0,
  purchasedItemIds: [...mockStoryGlovesItemIds],
  discoveredItemIds: [...mockStoryGlovesItemIds],
  equippedItemId: "six-seven-gloves",
  globalLevel: gameLevelStartPlayerLevels.infinite,
  InfinityTower: {
    isAvailable: true,
    currentLevel: 0,
    claimedRewardIds: [],
  },
  towerConsumables: {},
  trainingLevels: mockInfinityTowerStartTrainingLevels,
  dailyRewards: {
    claimedRewards: [],
  },
};

export class PlayerProfile {
  private static readonly storageKey = "boxing-clicker-player-profile";
  private static readonly legacyWalletStorageKey = "boxing-clicker-wallet";
  private static readonly defaultEquippedItemId = "basic-gloves";
  private static readonly defaultPurchasedItemIds = [
    PlayerProfile.defaultEquippedItemId,
  ];
  private static readonly defaultDiscoveredItemIds = [
    PlayerProfile.defaultEquippedItemId,
  ];
  private static readonly legacyItemIdAliases: Record<string, string> = {
    "heavy-gloves": "mechanic-gloves",
  };
  private static readonly mockProfile: StoredPlayerProfile | undefined =
    undefined;

  private id: string;
  private emeralds: number;
  private rewiveCount: number;
  private purchasedItemIds: string[];
  private discoveredItemIds: string[];
  private equippedItemId: string;
  private globalLevel: number;
  private InfinityTower: InfinityTowerProfile;
  private towerConsumables: InfinityTowerConsumables;
  private trainingLevels: TrainingLevels;
  private dailyRewards: DailyRewardsProfile;

  static getStoredEquippedItemId() {
    try {
      const rawProfile = localStorage.getItem(PlayerProfile.storageKey);
      const profile =
        PlayerProfile.mockProfile ??
        (rawProfile
          ? (JSON.parse(rawProfile) as StoredPlayerProfile)
          : undefined);

      if (!profile) {
        return PlayerProfile.defaultEquippedItemId;
      }

      return typeof profile.equippedItemId === "string"
        ? PlayerProfile.normalizeItemId(profile.equippedItemId)
        : PlayerProfile.defaultEquippedItemId;
    } catch {
      return PlayerProfile.defaultEquippedItemId;
    }
  }

  constructor() {
    const profile = this.loadProfile();

    this.id = profile.id;
    this.emeralds = profile.emeralds;
    this.rewiveCount = profile.rewiveCount;
    this.purchasedItemIds = profile.purchasedItemIds;
    this.discoveredItemIds = profile.discoveredItemIds;
    this.equippedItemId = profile.equippedItemId;
    this.globalLevel = profile.globalLevel;
    this.InfinityTower = profile.InfinityTower;
    this.towerConsumables = profile.towerConsumables;
    this.trainingLevels = profile.trainingLevels;
    this.dailyRewards = profile.dailyRewards;
    this.normalizeProfile();
    this.save();
  }

  getId() {
    return this.id;
  }

  getEmeralds() {
    return this.emeralds;
  }

  getRewiveCount() {
    return this.rewiveCount;
  }

  addRewiveCount(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return this.rewiveCount;
    }

    this.rewiveCount += safeAmount;
    this.save();

    return this.rewiveCount;
  }

  spendRewiveCount(amount = 1) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return true;
    }

    if (this.rewiveCount < safeAmount) {
      return false;
    }

    this.rewiveCount -= safeAmount;
    this.save();

    return true;
  }

  addEmeralds(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return this.emeralds;
    }

    this.emeralds += safeAmount;
    this.save();

    return this.emeralds;
  }

  canSpendEmeralds(amount: number) {
    return this.emeralds >= Math.max(0, Math.floor(amount));
  }

  spendEmeralds(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return true;
    }

    if (!this.canSpendEmeralds(safeAmount)) {
      return false;
    }

    this.emeralds -= safeAmount;
    this.save();

    return true;
  }

  getPurchasedItemIds() {
    return [...this.purchasedItemIds];
  }

  hasPurchasedItem(itemId: string) {
    return this.purchasedItemIds.includes(itemId);
  }

  purchaseItem(itemId: string) {
    if (this.hasPurchasedItem(itemId) || !this.hasDiscoveredItem(itemId)) {
      return false;
    }

    this.purchasedItemIds.push(itemId);
    this.save();

    return true;
  }

  getDiscoveredItemIds() {
    return [...this.discoveredItemIds];
  }

  hasDiscoveredItem(itemId: string) {
    return this.discoveredItemIds.includes(itemId);
  }

  discoverItem(itemId: string) {
    if (this.hasDiscoveredItem(itemId)) {
      return false;
    }

    this.discoveredItemIds.push(itemId);
    this.save();

    return true;
  }

  getEquippedItemId() {
    return this.equippedItemId;
  }

  equipItem(itemId: string) {
    if (!this.hasPurchasedItem(itemId)) {
      return false;
    }

    this.equippedItemId = itemId;
    this.save();

    return true;
  }

  getGlobalLevel() {
    return this.globalLevel;
  }

  setGlobalLevel(level: number) {
    const safeLevel = Math.max(1, Math.floor(level));

    if (this.globalLevel === safeLevel) {
      return this.globalLevel;
    }

    this.globalLevel = safeLevel;
    this.save();

    return this.globalLevel;
  }

  getInfinityTower() {
    return { ...this.InfinityTower };
  }

  isInfinityTowerAvailable() {
    return this.InfinityTower.isAvailable;
  }

  setInfinityTowerAvailable(isAvailable: boolean) {
    if (this.InfinityTower.isAvailable === isAvailable) {
      return this.InfinityTower.isAvailable;
    }

    this.InfinityTower = {
      ...this.InfinityTower,
      isAvailable,
    };
    this.save();

    return this.InfinityTower.isAvailable;
  }

  getInfinityTowerCurrentLevel() {
    return this.InfinityTower.currentLevel;
  }

  setInfinityTowerCurrentLevel(level: number) {
    const safeLevel = Math.max(0, Math.floor(level));

    if (this.InfinityTower.currentLevel === safeLevel) {
      return this.InfinityTower.currentLevel;
    }

    this.InfinityTower = {
      ...this.InfinityTower,
      currentLevel: safeLevel,
    };
    this.save();

    return this.InfinityTower.currentLevel;
  }

  hasClaimedInfinityTowerReward(rewardId: string) {
    return this.InfinityTower.claimedRewardIds.includes(rewardId);
  }

  claimInfinityTowerReward(rewardId: string) {
    if (this.hasClaimedInfinityTowerReward(rewardId)) {
      return false;
    }

    this.InfinityTower = {
      ...this.InfinityTower,
      claimedRewardIds: [...this.InfinityTower.claimedRewardIds, rewardId],
    };
    this.save();

    return true;
  }

  getTowerConsumables(): InfinityTowerConsumables {
    return { ...this.towerConsumables };
  }

  getTowerConsumableCount(consumableId: InfinityTowerConsumableId) {
    return this.towerConsumables[consumableId] ?? 0;
  }

  addTowerConsumable(consumableId: InfinityTowerConsumableId, amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return this.getTowerConsumableCount(consumableId);
    }

    this.towerConsumables = {
      ...this.towerConsumables,
      [consumableId]: this.getTowerConsumableCount(consumableId) + safeAmount,
    };
    this.save();

    return this.getTowerConsumableCount(consumableId);
  }

  spendTowerConsumable(consumableId: InfinityTowerConsumableId) {
    const currentCount = this.getTowerConsumableCount(consumableId);

    if (currentCount <= 0) {
      return false;
    }

    this.towerConsumables = {
      ...this.towerConsumables,
      [consumableId]: currentCount - 1,
    };
    this.save();

    return true;
  }

  getTrainingLevels(): TrainingLevels {
    return { ...this.trainingLevels };
  }

  getTrainingLevel(itemId: TrainingItemId) {
    return this.trainingLevels[itemId] ?? 0;
  }

  setTrainingLevel(itemId: TrainingItemId, level: number) {
    const safeLevel = Math.max(0, Math.floor(level));

    if (safeLevel <= 0) {
      delete this.trainingLevels[itemId];
      this.save();

      return 0;
    }

    this.trainingLevels[itemId] = safeLevel;
    this.save();

    return safeLevel;
  }

  getDailyRewards(): DailyRewardsProfile {
    return {
      last_claim_date: this.dailyRewards.last_claim_date,
      claimedRewards: [...this.dailyRewards.claimedRewards],
    };
  }

  getDailyRewardLastClaimDate() {
    return this.dailyRewards.last_claim_date;
  }

  getDailyRewardClaimedRewards() {
    return [...this.dailyRewards.claimedRewards];
  }

  hasClaimedDailyReward(index: number) {
    return this.dailyRewards.claimedRewards.includes(Math.floor(index));
  }

  claimDailyReward(index: number, date: string) {
    const safeIndex = Math.max(0, Math.floor(index));

    this.dailyRewards = {
      last_claim_date: date,
      claimedRewards: this.hasClaimedDailyReward(safeIndex)
        ? [...this.dailyRewards.claimedRewards]
        : [...this.dailyRewards.claimedRewards, safeIndex],
    };
    this.save();
  }

  getSnapshot(): PlayerProfileSnapshot {
    return {
      id: this.id,
      emeralds: this.emeralds,
      rewiveCount: this.rewiveCount,
      purchasedItemIds: this.getPurchasedItemIds(),
      discoveredItemIds: this.getDiscoveredItemIds(),
      equippedItemId: this.equippedItemId,
      globalLevel: this.globalLevel,
      InfinityTower: this.getInfinityTower(),
      towerConsumables: this.getTowerConsumables(),
      trainingLevels: this.getTrainingLevels(),
      dailyRewards: this.getDailyRewards(),
    };
  }

  private loadProfile(): PlayerProfileSnapshot {
    try {
      const rawProfile = localStorage.getItem(PlayerProfile.storageKey);
      const profile =
        PlayerProfile.mockProfile ??
        (rawProfile
          ? (JSON.parse(rawProfile) as StoredPlayerProfile)
          : undefined);

      if (!profile) {
        return this.getDefaultProfile();
      }

      return {
        id: typeof profile.id === "string" ? profile.id : this.createId(),
        emeralds:
          typeof profile.emeralds === "number"
            ? Math.max(0, Math.floor(profile.emeralds))
            : 0,
        rewiveCount:
          typeof profile.rewiveCount === "number"
            ? Math.max(0, Math.floor(profile.rewiveCount))
            : 0,
        purchasedItemIds: Array.isArray(profile.purchasedItemIds)
          ? profile.purchasedItemIds
              .filter((itemId): itemId is string => typeof itemId === "string")
              .map((itemId) => PlayerProfile.normalizeItemId(itemId))
          : [...PlayerProfile.defaultPurchasedItemIds],
        discoveredItemIds: Array.isArray(profile.discoveredItemIds)
          ? profile.discoveredItemIds
              .filter((itemId): itemId is string => typeof itemId === "string")
              .map((itemId) => PlayerProfile.normalizeItemId(itemId))
          : [...PlayerProfile.defaultDiscoveredItemIds],
        equippedItemId:
          typeof profile.equippedItemId === "string"
            ? PlayerProfile.normalizeItemId(profile.equippedItemId)
            : PlayerProfile.defaultEquippedItemId,
        globalLevel: this.getStoredGlobalLevel(profile),
        InfinityTower: this.normalizeInfinityTower(profile.InfinityTower),
        towerConsumables: this.normalizeTowerConsumables(
          profile.towerConsumables,
        ),
        trainingLevels: this.normalizeTrainingLevels(profile.trainingLevels),
        dailyRewards: this.normalizeDailyRewards(profile.dailyRewards),
      };
    } catch {
      return this.getDefaultProfile();
    }
  }

  private getDefaultProfile(): PlayerProfileSnapshot {
    return {
      id: this.createId(),
      emeralds: this.loadLegacyEmeralds(),
      rewiveCount: 0,
      purchasedItemIds: [...PlayerProfile.defaultPurchasedItemIds],
      discoveredItemIds: [...PlayerProfile.defaultDiscoveredItemIds],
      equippedItemId: PlayerProfile.defaultEquippedItemId,
      globalLevel: 1,
      InfinityTower: PlayerProfile.getDefaultInfinityTower(),
      towerConsumables: {},
      trainingLevels: {},
      dailyRewards: PlayerProfile.getDefaultDailyRewards(),
    };
  }

  private normalizeProfile() {
    const uniquePurchasedItems = new Set([
      PlayerProfile.defaultEquippedItemId,
      ...this.purchasedItemIds,
    ]);
    const uniqueDiscoveredItems = new Set([
      PlayerProfile.defaultEquippedItemId,
      ...this.discoveredItemIds,
      ...this.purchasedItemIds,
    ]);

    this.purchasedItemIds = [...uniquePurchasedItems];
    this.discoveredItemIds = [...uniqueDiscoveredItems];

    if (!this.hasPurchasedItem(this.equippedItemId)) {
      this.equippedItemId = PlayerProfile.defaultEquippedItemId;
    }

    this.trainingLevels = this.normalizeTrainingLevels(this.trainingLevels);
    this.InfinityTower = this.normalizeInfinityTower(this.InfinityTower);
    this.towerConsumables = this.normalizeTowerConsumables(
      this.towerConsumables,
    );
    this.dailyRewards = this.normalizeDailyRewards(this.dailyRewards);
  }

  private static normalizeItemId(itemId: string) {
    return PlayerProfile.legacyItemIdAliases[itemId] ?? itemId;
  }

  private loadLegacyEmeralds() {
    try {
      const rawWallet = localStorage.getItem(
        PlayerProfile.legacyWalletStorageKey,
      );

      if (!rawWallet) {
        return 0;
      }

      const wallet = JSON.parse(rawWallet) as StoredLegacyWallet;

      return typeof wallet.emeralds === "number"
        ? Math.max(0, Math.floor(wallet.emeralds))
        : 0;
    } catch {
      return 0;
    }
  }

  private createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `player-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  private getStoredGlobalLevel(profile: StoredPlayerProfile) {
    if (typeof profile.globalLevel === "number") {
      return Math.max(1, Math.floor(profile.globalLevel));
    }

    if (typeof profile.currentLevel === "number") {
      return Math.max(1, Math.floor(profile.currentLevel));
    }

    return 1;
  }

  private normalizeTrainingLevels(trainingLevels?: TrainingLevels) {
    const normalizedTrainingLevels: TrainingLevels = {};

    if (!trainingLevels || typeof trainingLevels !== "object") {
      return normalizedTrainingLevels;
    }

    trainingItemIds.forEach((itemId) => {
      const level = trainingLevels[itemId];

      if (typeof level === "number" && level > 0) {
        normalizedTrainingLevels[itemId] = Math.floor(level);
      }
    });

    return normalizedTrainingLevels;
  }

  private normalizeInfinityTower(
    tower?: Partial<InfinityTowerProfile>,
  ): InfinityTowerProfile {
    const claimedRewardIds = Array.isArray(tower?.claimedRewardIds)
      ? tower.claimedRewardIds.filter(
          (rewardId): rewardId is string => typeof rewardId === "string",
        )
      : [];

    return {
      isAvailable:
        typeof tower?.isAvailable === "boolean" ? tower.isAvailable : false,
      currentLevel:
        typeof tower?.currentLevel === "number"
          ? Math.max(0, Math.floor(tower.currentLevel))
          : 0,
      claimedRewardIds: [...new Set(claimedRewardIds)],
    };
  }

  private static getDefaultInfinityTower(): InfinityTowerProfile {
    return {
      isAvailable: false,
      currentLevel: 0,
      claimedRewardIds: [],
    };
  }

  private normalizeTowerConsumables(
    towerConsumables?: InfinityTowerConsumables,
  ): InfinityTowerConsumables {
    const normalizedConsumables: InfinityTowerConsumables = {};

    if (!towerConsumables || typeof towerConsumables !== "object") {
      return normalizedConsumables;
    }

    infinityTowerConsumableIds.forEach((consumableId) => {
      const count = towerConsumables[consumableId];

      if (typeof count === "number" && count > 0) {
        normalizedConsumables[consumableId] = Math.floor(count);
      }
    });

    return normalizedConsumables;
  }

  private normalizeDailyRewards(
    dailyRewards?: Partial<DailyRewardsProfile>,
  ): DailyRewardsProfile {
    const claimedRewards = Array.isArray(dailyRewards?.claimedRewards)
      ? dailyRewards.claimedRewards
          .filter((rewardIndex): rewardIndex is number => {
            return typeof rewardIndex === "number" && rewardIndex >= 0;
          })
          .map((rewardIndex) => Math.floor(rewardIndex))
      : [];

    const lastClaimDate =
      typeof dailyRewards?.last_claim_date === "string"
        ? dailyRewards.last_claim_date
        : undefined;

    return {
      last_claim_date: lastClaimDate,
      claimedRewards: [...new Set(claimedRewards)],
    };
  }

  private static getDefaultDailyRewards(): DailyRewardsProfile {
    return {
      claimedRewards: [],
    };
  }

  private save() {
    try {
      localStorage.setItem(
        PlayerProfile.storageKey,
        JSON.stringify(this.getSnapshot()),
      );
    } catch {
      // Profile persistence is optional for local play.
    }
  }
}
