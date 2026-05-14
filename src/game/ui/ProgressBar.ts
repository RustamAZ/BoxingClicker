import { GameObjects, Scene } from 'phaser';

export class ProgressBar
{
    private readonly fill: GameObjects.Rectangle;
    private readonly width: number;

    constructor (
        scene: Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        fillColor: number,
        backgroundColor = 0x333333
    )
    {
        this.width = width;

        scene.add.rectangle(x, y, width, height, backgroundColor)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x111111);

        this.fill = scene.add.rectangle(x + 2, y + 2, width - 4, height - 4, fillColor)
            .setOrigin(0, 0);
    }

    setValue (value: number)
    {
        const clampedValue = Math.min(Math.max(value, 0), 1);

        this.fill.displayWidth = (this.width - 4) * clampedValue;
    }

    setFillColor (color: number)
    {
        this.fill.setFillStyle(color);
    }
}
