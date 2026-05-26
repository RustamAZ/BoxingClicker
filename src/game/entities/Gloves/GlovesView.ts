import { GameObjects, Scene } from 'phaser';
import type { BaseGloves } from './BaseGloves';
import { PunchHand } from './types';

type GloveSprite = {
    container: GameObjects.Container;
    image: GameObjects.Image;
    baseX: number;
    baseY: number;
    baseScale: number;
    size: number;
    phaseOffset: number;
};

export class GlovesView
{
    private readonly leftHand: GloveSprite;
    private readonly rightHand: GloveSprite;
    private idleTime = 0;

    constructor (
        private readonly scene: Scene,
        equippedGloves: BaseGloves
    )
    {
        this.leftHand = this.createGlove(
            equippedGloves.leftTextureKey,
            410,
            735,
            430,
            0
        );
        this.rightHand = this.createGlove(
            equippedGloves.rightTextureKey,
            610,
            710,
            400,
            Math.PI * 0.35
        );
    }

    equip (gloves: BaseGloves)
    {
        this.scene.tweens.killTweensOf([
            this.leftHand.image,
            this.rightHand.image,
        ]);
        this.setGloveTexture(this.leftHand, gloves.leftTextureKey);
        this.setGloveTexture(this.rightHand, gloves.rightTextureKey);
    }

    update (deltaSeconds: number)
    {
        this.idleTime += deltaSeconds;
        this.updateIdleGlove(this.leftHand, 1);
        this.updateIdleGlove(this.rightHand, -1);
    }

    punch (punchHand: PunchHand, totalDurationMs: number, onComplete: () => void)
    {
        const hand = punchHand === 'left' ? this.leftHand : this.rightHand;
        const startX = hand.image.x;
        const startY = hand.image.y;
        const startScaleX = hand.image.scaleX;
        const startScaleY = hand.image.scaleY;
        const targetX = startX + (punchHand === 'left' ? 62 : -62);
        const targetY = startY - 92;

        this.scene.tweens.add({
            targets: hand.image,
            x: targetX,
            y: targetY,
            scaleX: startScaleX * 1.06,
            scaleY: startScaleY * 1.06,
            duration: totalDurationMs / 2,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                hand.image.setPosition(startX, startY);
                hand.image.setScale(startScaleX, startScaleY);
                onComplete();
            }
        });
    }

    private createGlove (
        texture: string,
        x: number,
        y: number,
        size: number,
        phaseOffset: number
    ): GloveSprite
    {
        const image = this.scene.add.image(0, 0, texture)
            .setDisplaySize(size, size);
        const container = this.scene.add.container(x, y, [image])
            .setDepth(10);

        return {
            container,
            image,
            baseX: x,
            baseY: y,
            baseScale: 1,
            size,
            phaseOffset
        };
    }

    private setGloveTexture (glove: GloveSprite, texture: string)
    {
        glove.image
            .setTexture(texture)
            .setPosition(0, 0)
            .setDisplaySize(glove.size, glove.size);
    }

    private updateIdleGlove (glove: GloveSprite, direction: number)
    {
        const wave = Math.sin(this.idleTime * 1.8 + glove.phaseOffset);
        const centerAmount = 1 - Math.abs(wave);

        glove.container.setPosition(
            glove.baseX + wave * 18 * direction,
            glove.baseY - centerAmount * 18
        );
        glove.container.setScale(glove.baseScale + centerAmount * 0.035);
    }
}
