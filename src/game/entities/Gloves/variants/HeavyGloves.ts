import { BaseGloves } from '../BaseGloves';

export class HeavyGloves extends BaseGloves
{
    readonly id = 'heavy-gloves';
    readonly leftTextureKey = 'heavy-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/basic/left-hand.png';
    readonly rightTextureKey = 'heavy-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/basic/right-hand.png';

    readonly damageMultiplier = 1.35;
    readonly staminaCostMultiplier = 1.2;
    readonly attackSpeedMultiplier = 0.92;
}
