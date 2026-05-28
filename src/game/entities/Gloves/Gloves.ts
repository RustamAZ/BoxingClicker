import { Scene } from 'phaser';
import type { BaseGloves } from './BaseGloves';
import { GlovesCatalog } from './GlovesCatalog';
import { GlovesModel } from './GlovesModel';
import { GlovesView } from './GlovesView';

export class Gloves
{
    private readonly model = new GlovesModel();
    private readonly view: GlovesView;
    private equippedGloves: BaseGloves;

    static preload (scene: Scene, equippedGlovesId?: string)
    {
        GlovesCatalog.preload(scene, equippedGlovesId);
    }

    constructor (scene: Scene, equippedGlovesId?: string)
    {
        this.equippedGloves =
            GlovesCatalog.getGlovesById(equippedGlovesId ?? '') ??
            GlovesCatalog.getDefaultGloves();
        this.view = new GlovesView(scene, this.equippedGloves);
    }

    equip (gloves: BaseGloves)
    {
        this.equippedGloves = gloves;
        this.model.finishPunch();
        this.view.equip(gloves);
    }

    equipById (glovesId: string)
    {
        const gloves = GlovesCatalog.getGlovesById(glovesId);

        if (!gloves)
        {
            return false;
        }

        this.equip(gloves);

        return true;
    }

    loadAndEquipById(scene: Scene, glovesId: string, onComplete: (isEquipped: boolean) => void)
    {
        const gloves = GlovesCatalog.getGlovesById(glovesId);

        if (!gloves)
        {
            onComplete(false);
            return;
        }

        gloves.loadAssets(scene, () => {
            this.equip(gloves);
            onComplete(true);
        });
    }

    getEquippedGloves()
    {
        return this.equippedGloves;
    }

    getCurrentWeapon()
    {
        return this.equippedGloves.getCombatProfile();
    }

    getDamageMultiplier()
    {
        return this.getCurrentWeapon().damageMultiplier;
    }

    getStaminaCostMultiplier()
    {
        return this.getCurrentWeapon().staminaCostMultiplier;
    }

    getAttackSpeedMultiplier()
    {
        return this.getCurrentWeapon().attackSpeedMultiplier;
    }

    canPunch ()
    {
        return this.model.canPunch();
    }

    update (deltaSeconds: number)
    {
        this.view.update(deltaSeconds);
    }

    punch (durationMs: number)
    {
        const punchHand = this.model.startPunch();

        if (punchHand === undefined)
        {
            return false;
        }

        this.view.punch(punchHand, durationMs, () => {
            this.model.finishPunch();
        });

        return true;
    }
}
