import { Scene } from 'phaser';

export class HitSoundPlayer
{
    static preload (scene: Scene)
    {
        void scene;
    }

    constructor (private readonly scene: Scene)
    {
    }

    playRandom (soundKeys: string[], volume: number)
    {
        if (soundKeys.length === 0)
        {
            return;
        }

        const soundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];

        this.scene.sound.play(soundKey, {
            volume
        });
    }
}
