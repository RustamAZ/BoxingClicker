export type ShopItemStatus = "locked" | "purchased" | "not-purchased";

export type ShopItemConfig = {
  id: string;
  glovesId: string;
  title: string;
  price: number;
  attackBonus: number;
  attackSpeedBonus: number;
  iconTextureKey: string;
  iconTexturePath: string;
  lockedCardTextureKey?: string;
  lockedCardTexturePath?: string;
  unlockBossId?: string;
  unlockSource?: "boss" | "infinityTower" | "dailyReward";
};

export type ShopItemView = ShopItemConfig & {
  status: ShopItemStatus;
  isEquipped: boolean;
};
