import { BaseGloves } from '../BaseGloves';

export class InfinityGloves extends BaseGloves
{
    readonly id = 'infinity-gloves';
    readonly leftTextureKey = 'infinity-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/infinity/left-hand.png';
    readonly rightTextureKey = 'infinity-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/infinity/right-hand.png';

    readonly damageMultiplier = 1.42;
    readonly staminaCostMultiplier = 1.18;
    readonly attackSpeedMultiplier = 1.12;
    readonly hitSoundVolume = 0.8;

    readonly hitSoundAssets = [
        {
            key: 'infinity-hit-joined',
            path: 'assets/audio/gloves/infinity/joined.mp3',
        },
        {
            key: 'infinity-hit-joined-g-minor',
            path: 'assets/audio/gloves/infinity/joined-g-minor.mp3',
        },
        {
            key: 'infinity-hit-joined-b-flat',
            path: 'assets/audio/gloves/infinity/joined-b-flat.mp3',
        },
    ];
}
