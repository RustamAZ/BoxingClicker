import { BaseGloves } from '../BaseGloves';

export class PepeGloves extends BaseGloves
{
    readonly id = 'pepe-gloves';
    readonly leftTextureKey = 'pepe-gloves-left';
    readonly leftTexturePath = 'assets/images/gloves/skins/pepe/left-hand.png';
    readonly rightTextureKey = 'pepe-gloves-right';
    readonly rightTexturePath = 'assets/images/gloves/skins/pepe/right-hand.png';

    readonly damageMultiplier = 1.14;
    readonly staminaCostMultiplier = 1;
    readonly attackSpeedMultiplier = 1.04;

    readonly hitSoundAssets = [
        {
            key: 'pepe-hit-punch-meme',
            path: 'assets/audio/gloves/pepe/punch-meme.mp3',
        },
        {
            key: 'pepe-hit-punch-meme-g-flat',
            path: 'assets/audio/gloves/pepe/punch-meme-g-flat.mp3',
        },
        {
            key: 'pepe-hit-punch-meme-b-flat',
            path: 'assets/audio/gloves/pepe/punch-meme-b-flat.mp3',
        },
    ];
}
