import type { Scene } from 'phaser';
import type { BaseGloves } from './BaseGloves';
import { AmogusGloves } from './variants/AmogusGloves';
import { BasicGloves } from './variants/BasicGloves';
import { DiamondTowerGloves } from './variants/DiamondTowerGloves';
import { GoldenTowerGloves } from './variants/GoldenTowerGloves';
import { InfinityGloves } from './variants/InfinityGloves';
import { MechanicGloves } from './variants/MechanicGloves';
import { PepeGloves } from './variants/PepeGloves';
import { SixSevenGloves } from './variants/SixSevenGloves';

export class GlovesCatalog
{
    private static readonly defaultGloves = new BasicGloves();
    private static readonly gloves: BaseGloves[] = [
        GlovesCatalog.defaultGloves,
        new AmogusGloves(),
        new PepeGloves(),
        new MechanicGloves(),
        new InfinityGloves(),
        new SixSevenGloves(),
        new GoldenTowerGloves(),
        new DiamondTowerGloves(),
    ];

    static preload (scene: Scene, equippedGlovesId?: string)
    {
        const equippedGloves =
            GlovesCatalog.getGlovesById(equippedGlovesId ?? '') ??
            GlovesCatalog.getDefaultGloves();

        equippedGloves.preload(scene);
    }

    static getDefaultGloves()
    {
        return GlovesCatalog.defaultGloves;
    }

    static getGlovesById (id: string)
    {
        return GlovesCatalog.gloves.find((gloves) => gloves.id === id);
    }

    static getAllGloves()
    {
        return [...GlovesCatalog.gloves];
    }
}
