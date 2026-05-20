export type PlayerProfileSnapshot = {
  id: string;
  emeralds: number;
  purchasedItemIds: string[];
  equippedItemId: string;
};

type StoredPlayerProfile = {
  id?: string;
  emeralds?: number;
  purchasedItemIds?: string[];
  equippedItemId?: string;
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

  private id: string;
  private emeralds: number;
  private purchasedItemIds: string[];
  private equippedItemId: string;

  constructor() {
    const profile = this.loadProfile();

    this.id = profile.id;
    this.emeralds = profile.emeralds;
    this.purchasedItemIds = profile.purchasedItemIds;
    this.equippedItemId = profile.equippedItemId;
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
    if (this.hasPurchasedItem(itemId)) {
      return false;
    }

    this.purchasedItemIds.push(itemId);
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

  getSnapshot(): PlayerProfileSnapshot {
    return {
      id: this.id,
      emeralds: this.emeralds,
      purchasedItemIds: this.getPurchasedItemIds(),
      equippedItemId: this.equippedItemId,
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
          ? profile.purchasedItemIds.filter(
              (itemId): itemId is string => typeof itemId === "string",
            )
          : [...PlayerProfile.defaultPurchasedItemIds],
        equippedItemId:
          typeof profile.equippedItemId === "string"
            ? profile.equippedItemId
            : PlayerProfile.defaultEquippedItemId,
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
      equippedItemId: PlayerProfile.defaultEquippedItemId,
    };
  }

  private normalizeProfile() {
    const uniquePurchasedItems = new Set([
      PlayerProfile.defaultEquippedItemId,
      ...this.purchasedItemIds,
    ]);

    this.purchasedItemIds = [...uniquePurchasedItems];

    if (!this.hasPurchasedItem(this.equippedItemId)) {
      this.equippedItemId = PlayerProfile.defaultEquippedItemId;
    }
  }

  private loadLegacyEmeralds() {
    try {
      const rawWallet = localStorage.getItem(PlayerProfile.legacyWalletStorageKey);

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
