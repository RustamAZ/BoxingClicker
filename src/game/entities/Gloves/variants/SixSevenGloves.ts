import { BaseGloves } from '../BaseGloves';
import type { GlovesAsset } from '../types';

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
    readonly hitSoundVolume = 0.3;
    readonly hitEffectSize = 120;

    readonly hitEffectAssets: GlovesAsset[] = [
        {
            key: 'six-seven-hit-effect-six',
            path: 'assets/images/effects/six.png',
        },
        {
            key: 'six-seven-hit-effect-seven',
            path: 'assets/images/effects/seven.png',
        },
    ];

    readonly hitSoundAssets = [
        {
            key: 'six-seven-hit-anvil',
            path: 'assets/audio/gloves/six-seven/anvil-hit.mp3',
        },
        {
            key: 'six-seven-hit-anvil-b-flat',
            path: 'assets/audio/gloves/six-seven/anvil-hit-b-flat.mp3',
        },
        {
            key: 'six-seven-hit-anvil-f',
            path: 'assets/audio/gloves/six-seven/anvil-hit-f.mp3',
        },
    ];
}
