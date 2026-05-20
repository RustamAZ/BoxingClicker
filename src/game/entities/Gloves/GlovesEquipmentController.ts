import type { PlayerProfile } from '../Player/PlayerProfile';
import type { BaseGloves } from './BaseGloves';
import type { Gloves } from './Gloves';
import { GlovesCatalog } from './GlovesCatalog';
import type { GlovesCombatProfile } from './types';
import { ShopCatalog } from '../../shop/ShopCatalog';

export class GlovesEquipmentController
{
    constructor (
        private readonly profile: PlayerProfile,
        private readonly gloves: Gloves
    )
    {
        this.syncFromProfile();
    }

    syncFromProfile()
    {
        const equippedItem = ShopCatalog.getItemById(
            this.profile.getEquippedItemId()
        );

        if (equippedItem && this.gloves.equipById(equippedItem.glovesId))
        {
            return true;
        }

        const defaultGloves = GlovesCatalog.getDefaultGloves();

        this.gloves.equip(defaultGloves);
        this.profile.equipItem(defaultGloves.id);

        return false;
    }

    equipShopItem (itemId: string)
    {
        const item = ShopCatalog.getItemById(itemId);

        if (!item || !this.profile.equipItem(item.id))
        {
            return false;
        }

        return this.gloves.equipById(item.glovesId);
    }

    getCurrentGloves (): BaseGloves
    {
        return this.gloves.getEquippedGloves();
    }

    getCurrentWeapon (): GlovesCombatProfile
    {
        return this.gloves.getCurrentWeapon();
    }

    getDamageMultiplier()
    {
        return this.gloves.getDamageMultiplier();
    }

    getStaminaCostMultiplier()
    {
        return this.gloves.getStaminaCostMultiplier();
    }

    getAttackSpeedMultiplier()
    {
        return this.gloves.getAttackSpeedMultiplier();
    }

    canPunch()
    {
        return this.gloves.canPunch();
    }

    punch (durationMs: number)
    {
        return this.gloves.punch(durationMs);
    }
}
