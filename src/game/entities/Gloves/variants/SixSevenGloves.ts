import { BaseGloves } from '../BaseGloves';

export class SixSevenGloves extends BaseGloves
{
    readonly id = 'six-seven-gloves';
    readonly leftTextureKey = 'six-seven-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/six-seven/left-hand.png';
    readonly rightTextureKey = 'six-seven-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/six-seven/right-hand.png';

    readonly damageMultiplier = 1.32;
    readonly staminaCostMultiplier = 0.95;
    readonly attackSpeedMultiplier = 1.18;
    readonly hitSoundVolume = 0.8;
}
