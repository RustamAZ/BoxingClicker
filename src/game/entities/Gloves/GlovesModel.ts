import { PunchHand } from './types';

export class GlovesModel
{
    private isPunching = false;

    canPunch ()
    {
        return !this.isPunching;
    }

    startPunch (): PunchHand | undefined
    {
        if (!this.canPunch())
        {
            return undefined;
        }

        this.isPunching = true;

        return this.getRandomPunchHand();
    }

    finishPunch ()
    {
        this.isPunching = false;
    }

    private getRandomPunchHand (): PunchHand
    {
        return Math.random() < 0.5 ? 'left' : 'right';
    }
}
