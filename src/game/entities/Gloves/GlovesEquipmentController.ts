import type { PlayerProfile } from '../Player/PlayerProfile';
import type { Player, PlayerStatEffect } from '../Player/Player';
import type { BaseGloves } from './BaseGloves';
import type { Scene } from 'phaser';
import type { Gloves } from './Gloves';
import { GlovesCatalog } from './GlovesCatalog';
import type { GlovesCombatProfile } from './types';
import { ShopCatalog } from '../../shop/ShopCatalog';
import { getGlovesShopConfigByGlovesId } from '../../configs/glovesConfig';

export class GlovesEquipmentController
{
    constructor (
        private readonly profile: PlayerProfile,
        private readonly gloves: Gloves,
        private readonly player: Player
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
            this.applyCurrentGlovesBonuses();
            return true;
        }

        const defaultGloves = GlovesCatalog.getDefaultGloves();

        this.gloves.equip(defaultGloves);
        this.profile.equipItem(defaultGloves.id);
        this.applyCurrentGlovesBonuses();

        return false;
    }

    equipShopItem (itemId: string)
    {
        const item = ShopCatalog.getItemById(itemId);

        if (!item || !this.profile.equipItem(item.id))
        {
            return false;
        }

        const isEquipped = this.gloves.equipById(item.glovesId);

        if (isEquipped)
        {
            this.applyCurrentGlovesBonuses();
        }

        return isEquipped;
    }

    loadAndEquipShopItem (
        scene: Scene,
        itemId: string,
        onComplete: (isEquipped: boolean) => void
    )
    {
        const item = ShopCatalog.getItemById(itemId);

        if (!item || !this.profile.equipItem(item.id))
        {
            onComplete(false);
            return;
        }

        this.gloves.loadAndEquipById(scene, item.glovesId, (isEquipped) => {
            if (isEquipped)
            {
                this.applyCurrentGlovesBonuses();
            }

            onComplete(isEquipped);
        });
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

    private applyCurrentGlovesBonuses()
    {
        const glovesConfig = getGlovesShopConfigByGlovesId(
            this.gloves.getEquippedGloves().id
        );
        const effects: PlayerStatEffect[] = [];

        if (glovesConfig?.attack_bonus)
        {
            effects.push({
                stat: 'damage',
                mode: 'add',
                value: glovesConfig.attack_bonus,
            });
        }

        if (glovesConfig?.attack_speed_bonus)
        {
            effects.push({
                stat: 'punch-speed',
                mode: 'multiply',
                value: 1 + glovesConfig.attack_speed_bonus,
            });
        }

        this.player.setPermanentStatEffects('gloves', effects);
    }
}
