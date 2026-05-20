export type ShopItemStatus = "purchased" | "not-purchased";

export type ShopItemConfig = {
  id: string;
  glovesId: string;
  title: string;
  price: number;
  iconTextureKey: string;
  iconTexturePath: string;
};

export type ShopItemView = ShopItemConfig & {
  status: ShopItemStatus;
  isEquipped: boolean;
};
