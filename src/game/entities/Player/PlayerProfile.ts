import {
  trainingItemIds,
  type TrainingItemId,
  type TrainingLevels,
} from "../../configs/training";

export type PlayerProfileSnapshot = {
  id: string;
  emeralds: number;
  purchasedItemIds: string[];
  discoveredItemIds: string[];
  equippedItemId: string;
  globalLevel: number;
  deathContinueCount: number;
  trainingLevels: TrainingLevels;
};

type StoredPlayerProfile = {
  id?: string;
  emeralds?: number;
  purchasedItemIds?: string[];
  discoveredItemIds?: string[];
  equippedItemId?: string;
  globalLevel?: number;
  currentLevel?: number;
  deathContinueCount?: number;
  trainingLevels?: TrainingLevels;
  current_trainning?: TrainingLevels;
  currentTraining?: TrainingLevels;
};

type StoredLegacyWallet = {
  emeralds?: number;
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

  private id: string;
  private emeralds: number;
  private purchasedItemIds: string[];
  private discoveredItemIds: string[];
  private equippedItemId: string;
  private globalLevel: number;
  private deathContinueCount: number;
  private trainingLevels: TrainingLevels;

  constructor() {
    const profile = this.loadProfile();

    this.id = profile.id;
    this.emeralds = profile.emeralds;
    this.purchasedItemIds = profile.purchasedItemIds;
    this.discoveredItemIds = profile.discoveredItemIds;
    this.equippedItemId = profile.equippedItemId;
    this.globalLevel = profile.globalLevel;
    this.deathContinueCount = profile.deathContinueCount;
    this.trainingLevels = profile.trainingLevels;
    this.normalizeProfile();
    this.save();
  }

  getId() {
    return this.id;
  }

  getEmeralds() {
    return this.emeralds;
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

  getDeathContinueCount() {
    return this.deathContinueCount;
  }

  incrementDeathContinueCount() {
    this.deathContinueCount += 1;
    this.save();

    return this.deathContinueCount;
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

  getSnapshot(): PlayerProfileSnapshot {
    return {
      id: this.id,
      emeralds: this.emeralds,
      purchasedItemIds: this.getPurchasedItemIds(),
      discoveredItemIds: this.getDiscoveredItemIds(),
      equippedItemId: this.equippedItemId,
      globalLevel: this.globalLevel,
      deathContinueCount: this.deathContinueCount,
      trainingLevels: this.getTrainingLevels(),
    };
  }

  private loadProfile(): PlayerProfileSnapshot {
    try {
      const rawProfile = localStorage.getItem(PlayerProfile.storageKey);

      if (!rawProfile) {
        return this.getDefaultProfile();
      }

      const profile = JSON.parse(rawProfile) as StoredPlayerProfile;

      return {
        id: typeof profile.id === "string" ? profile.id : this.createId(),
        emeralds:
          typeof profile.emeralds === "number"
            ? Math.max(0, Math.floor(profile.emeralds))
            : 0,
        purchasedItemIds: Array.isArray(profile.purchasedItemIds)
          ? profile.purchasedItemIds
              .filter((itemId): itemId is string => typeof itemId === "string")
              .map((itemId) => this.normalizeItemId(itemId))
          : [...PlayerProfile.defaultPurchasedItemIds],
        discoveredItemIds: Array.isArray(profile.discoveredItemIds)
          ? profile.discoveredItemIds
              .filter((itemId): itemId is string => typeof itemId === "string")
              .map((itemId) => this.normalizeItemId(itemId))
          : [...PlayerProfile.defaultDiscoveredItemIds],
        equippedItemId:
          typeof profile.equippedItemId === "string"
            ? this.normalizeItemId(profile.equippedItemId)
            : PlayerProfile.defaultEquippedItemId,
        globalLevel: this.getStoredGlobalLevel(profile),
        deathContinueCount:
          typeof profile.deathContinueCount === "number"
            ? Math.max(0, Math.floor(profile.deathContinueCount))
            : 0,
        trainingLevels: this.normalizeTrainingLevels(
          profile.trainingLevels ??
            profile.current_trainning ??
            profile.currentTraining,
        ),
      };
    } catch {
      return this.getDefaultProfile();
    }
  }

  private getDefaultProfile(): PlayerProfileSnapshot {
    return {
      id: this.createId(),
      emeralds: this.loadLegacyEmeralds(),
      purchasedItemIds: [...PlayerProfile.defaultPurchasedItemIds],
      discoveredItemIds: [...PlayerProfile.defaultDiscoveredItemIds],
      equippedItemId: PlayerProfile.defaultEquippedItemId,
      globalLevel: 1,
      deathContinueCount: 0,
      trainingLevels: {},
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
  }

  private normalizeItemId(itemId: string) {
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
