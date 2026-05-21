import { BaseGloves } from '../BaseGloves';

export class MechanicGloves extends BaseGloves
{
    readonly id = 'mechanic-gloves';
    readonly leftTextureKey = 'mechanic-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/mechanic/left-hand.png';
    readonly rightTextureKey = 'mechanic-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/mechanic/right-hand.png';

    readonly damageMultiplier = 1.5;
    readonly staminaCostMultiplier = 1.3;
    readonly attackSpeedMultiplier = 0.6;
    readonly hitSoundVolume = 0.2;

    readonly hitSoundAssets = [
        {
            key: 'mechanic-hit-explosion-8bit-1',
            path: 'assets/audio/gloves/heavy/explosion-8bit-1.mp3',
        },
        {
            key: 'mechanic-hit-explosion-8bit-2',
            path: 'assets/audio/gloves/heavy/explosion-8bit-2.mp3',
        },
    ];
};
