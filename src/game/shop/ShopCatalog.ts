import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import type { ShopItemConfig, ShopItemView } from "./types";

export class ShopCatalog {
  private static readonly items: ShopItemConfig[] = [
    {
      id: "basic-gloves",
      glovesId: "basic-gloves",
      title: "Basic gloves",
      price: 0,
      iconTextureKey: "shop-item-base-weapon",
      iconTexturePath: "assets/images/ui/shop/items/base-weapon-icon.png",
    },
    {
      id: "amogus-gloves",
      glovesId: "amogus-gloves",
      title: "Amogus gloves",
      price: 20,
      iconTextureKey: "shop-item-amogus-weapon",
      iconTexturePath: "assets/images/ui/shop/items/amogus-weapon-icon.png",
    },
    {
      id: "pepe-gloves",
      glovesId: "pepe-gloves",
      title: "Pepe gloves",
      price: 40,
      iconTextureKey: "shop-item-pepe-weapon",
      iconTexturePath: "assets/images/ui/shop/items/pepe-weapon-icon.png",
    },
    {
      id: "mechanic-gloves",
      glovesId: "mechanic-gloves",
      title: "Mechanic gloves",
      price: 1,
      iconTextureKey: "shop-item-mechanic-weapon",
      iconTexturePath: "assets/images/ui/shop/items/mechanic-weapon-icon.png",
    },
    {
      id: "infinity-gloves",
      glovesId: "infinity-gloves",
      title: "Infinity gloves",
      price: 1,
      iconTextureKey: "shop-item-infinity-weapon",
      iconTexturePath: "assets/images/ui/shop/items/infinity-weapon-icon.png",
    },
    {
      id: "six-seven-gloves",
      glovesId: "six-seven-gloves",
      title: "Six-seven gloves",
      price: 1,
      iconTextureKey: "shop-item-six-seven-weapon",
      iconTexturePath: "assets/images/ui/shop/items/six-seven-weapon-icon.png",
    },
  ];

  static getItems() {
    return [...ShopCatalog.items];
  }

  static getItemById(itemId: string) {
    return ShopCatalog.items.find((item) => item.id === itemId);
  }

  static getItemViews(profile: PlayerProfile): ShopItemView[] {
    return ShopCatalog.items.map((item) => ({
      ...item,
      status: profile.hasPurchasedItem(item.id)
        ? "purchased"
        : "not-purchased",
      isEquipped: profile.getEquippedItemId() === item.id,
    }));
  }
}
