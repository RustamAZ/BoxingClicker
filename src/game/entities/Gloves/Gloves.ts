import { Scene } from 'phaser';
import { GlovesModel } from './GlovesModel';
import { GlovesView } from './GlovesView';

export class Gloves
{
    private readonly model = new GlovesModel();
    private readonly view: GlovesView;

    static preload (scene: Scene)
    {
        GlovesView.preload(scene);
    }

    constructor (scene: Scene)
    {
        this.view = new GlovesView(scene);
    }

    canPunch ()
    {
        return this.model.canPunch();
    }

    update (deltaSeconds: number)
    {
        this.view.update(deltaSeconds);
    }

    punch (durationMs: number)
    {
        const punchHand = this.model.startPunch();

        if (punchHand === undefined)
        {
            return false;
        }

        this.view.punch(punchHand, durationMs, () => {
            this.model.finishPunch();
        });

        return true;
    }
}
