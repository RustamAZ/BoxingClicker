import { BaseGloves } from '../BaseGloves';

export class MechanicGloves extends BaseGloves
{
    readonly id = 'mechanic-gloves';
    readonly leftTextureKey = 'mechanic-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/mechanic/left-hand.png';
    readonly rightTextureKey = 'mechanic-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/mechanic/right-hand.png';

    readonly damageMultiplier = 1.24;
    readonly staminaCostMultiplier = 1.12;
    readonly attackSpeedMultiplier = 1.08;
}
