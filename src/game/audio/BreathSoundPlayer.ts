import { Scene, Sound } from 'phaser';

export class BreathSoundPlayer
{
    private static readonly soundKeys = ['breath-v1', 'breath-v2', 'breath-v3'];
    private currentSound?: Sound.BaseSound;

    static preload (scene: Scene)
    {
        BreathSoundPlayer.soundKeys.forEach((key) => {
            scene.load.audio(key, `assets/audio/${key}.mp3`);
        });
    }

    constructor (private readonly scene: Scene)
    {
    }

    playIfNotPlaying ()
    {
        if (this.currentSound?.isPlaying)
        {
            return;
        }

        const soundKey = BreathSoundPlayer.soundKeys[
            Math.floor(Math.random() * BreathSoundPlayer.soundKeys.length)
        ];

        this.currentSound = this.scene.sound.add(soundKey, {
            volume: 0.2
        });
        this.currentSound.play();
    }
}
