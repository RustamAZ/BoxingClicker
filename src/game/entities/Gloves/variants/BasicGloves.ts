import { BaseGloves } from '../BaseGloves';

export class BasicGloves extends BaseGloves
{
    readonly id = 'basic-gloves';
    readonly leftTextureKey = 'basic-gloves-left';
    readonly leftTexturePath = 'assets/images/left-hand.png';
    readonly rightTextureKey = 'basic-gloves-right';
    readonly rightTexturePath = 'assets/images/right-hand.png';

    readonly damageMultiplier = 1;
    readonly staminaCostMultiplier = 1;
    readonly attackSpeedMultiplier = 1;
}
