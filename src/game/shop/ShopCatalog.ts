import { getGlovesShopConfigByGlovesId } from "../configs/glovesConfig";
import type { PlayerProfile } from "../entities/Player/PlayerProfile";
import type { ShopItemConfig, ShopItemView } from "./types";

export class ShopCatalog {
  private static readonly items: ShopItemConfig[] = [
    {
      id: "basic-gloves",
      glovesId: "basic-gloves",
      title: "Basic gloves",
      price: 0,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-base-weapon",
      iconTexturePath: "assets/images/ui/shop/items/base-weapon-icon.png",
    },
    {
      id: "amogus-gloves",
      glovesId: "amogus-gloves",
      title: "Amogus gloves",
      price: 20,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-amogus-weapon",
      iconTexturePath: "assets/images/ui/shop/items/amogus-weapon-icon.png",
      unlockBossId: "first-difficulty-boss",
    },
    {
      id: "pepe-gloves",
      glovesId: "pepe-gloves",
      title: "Pepe gloves",
      price: 40,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-pepe-weapon",
      iconTexturePath: "assets/images/ui/shop/items/pepe-weapon-icon.png",
      unlockBossId: "second-difficulty-boss",
    },
    {
      id: "mechanic-gloves",
      glovesId: "mechanic-gloves",
      title: "Mechanic gloves",
      price: 1,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-mechanic-weapon",
      iconTexturePath: "assets/images/ui/shop/items/mechanic-weapon-icon.png",
      unlockBossId: "third-difficulty-boss",
    },
    {
      id: "infinity-gloves",
      glovesId: "infinity-gloves",
      title: "Infinity gloves",
      price: 1,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-infinity-weapon",
      iconTexturePath: "assets/images/ui/shop/items/infinity-weapon-icon.png",
      unlockBossId: "four-difficulty-boss",
    },
    {
      id: "six-seven-gloves",
      glovesId: "six-seven-gloves",
      title: "Six-seven gloves",
      price: 1,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-six-seven-weapon",
      iconTexturePath: "assets/images/ui/shop/items/six-seven-weapon-icon.png",
      unlockBossId: "five-difficulty-boss",
    },
    {
      id: "golden-tower-gloves",
      glovesId: "golden-tower-gloves",
      title: "Golden tower gloves",
      price: 0,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-golden-tower-gloves",
      iconTexturePath: "assets/images/ui/shop/items/golden-tower-weapon-icon.png",
      lockedCardTextureKey: "shop-glove-card-locked-gold",
      lockedCardTexturePath:
        "assets/images/ui/shop/cards/glove-card-locked-gold.png",
      unlockSource: "infinityTower",
    },
    {
      id: "diamond-tower-gloves",
      glovesId: "diamond-tower-gloves",
      title: "Diamond tower gloves",
      price: 0,
      attackBonus: 0,
      attackSpeedBonus: 0,
      iconTextureKey: "shop-item-diamond-tower-gloves",
      iconTexturePath:
        "assets/images/ui/shop/items/diamond-tower-weapon-icon.png",
      lockedCardTextureKey: "shop-glove-card-locked-diamond",
      lockedCardTexturePath:
        "assets/images/ui/shop/cards/glove-card-locked-diamond.png",
      unlockSource: "infinityTower",
    },
  ];

  static getItems() {
    return ShopCatalog.items.map((item) => ShopCatalog.withConfig(item));
  }

  static getItemById(itemId: string) {
    const item = ShopCatalog.items.find((item) => item.id === itemId);

    return item ? ShopCatalog.withConfig(item) : undefined;
  }

  static getItemByUnlockBossId(bossId: string) {
    return ShopCatalog.getItems().find((item) => item.unlockBossId === bossId);
  }

  static getItemViews(profile: PlayerProfile): ShopItemView[] {
    return ShopCatalog.getItems().map((item) => ({
      ...item,
      status: !profile.hasDiscoveredItem(item.id)
        ? "locked"
        : profile.hasPurchasedItem(item.id)
          ? "purchased"
          : "not-purchased",
      isEquipped: profile.getEquippedItemId() === item.id,
    }));
  }

  private static withConfig(item: ShopItemConfig): ShopItemConfig {
    const glovesShopConfig = getGlovesShopConfigByGlovesId(item.glovesId);

    if (!glovesShopConfig) {
      return item;
    }

    return {
      ...item,
      title: glovesShopConfig.name,
      price: glovesShopConfig.price_emerald,
      attackBonus: glovesShopConfig.attack_bonus,
      attackSpeedBonus: glovesShopConfig.attack_speed_bonus,
      unlockBossId: glovesShopConfig.unlock_boss_id,
    };
  }
}
