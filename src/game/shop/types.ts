export type ShopItemStatus = "locked" | "purchased" | "not-purchased";

export type ShopItemConfig = {
  id: string;
  glovesId: string;
  title: string;
  price: number;
  iconTextureKey: string;
  iconTexturePath: string;
  unlockBossId?: string;
};

export type ShopItemView = ShopItemConfig & {
  status: ShopItemStatus;
  isEquipped: boolean;
};
