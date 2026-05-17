import type { Scene } from 'phaser';
import type { BaseGloves } from './BaseGloves';
import { BasicGloves } from './variants/BasicGloves';

export class GlovesCatalog
{
    private static readonly defaultGloves = new BasicGloves();
    private static readonly gloves: BaseGloves[] = [
        GlovesCatalog.defaultGloves,
    ];

    static preload (scene: Scene)
    {
        GlovesCatalog.gloves.forEach((gloves) => {
            gloves.preload(scene);
        });
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
