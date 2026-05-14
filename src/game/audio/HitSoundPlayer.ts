import { Scene } from 'phaser';

export class HitSoundPlayer
{
    private static readonly soundKeys = ['hit-v1', 'hit-v2', 'hit-v3', 'hit-v4'];

    static preload (scene: Scene)
    {
        HitSoundPlayer.soundKeys.forEach((key) => {
            scene.load.audio(key, `assets/audio/${key}.mp3`);
        });
    }

    constructor (private readonly scene: Scene)
    {
    }

    playRandom ()
    {
        const soundKey = HitSoundPlayer.soundKeys[
            Math.floor(Math.random() * HitSoundPlayer.soundKeys.length)
        ];

        this.scene.sound.play(soundKey, {
            volume: 0.8
        });
    }
}
