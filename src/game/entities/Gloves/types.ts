export type PunchHand = 'left' | 'right';

export type GlovesAsset = {
    key: string;
    path: string;
};

export type GlovesCombatProfile = {
    id: string;
    attackBonus: number;
    damageMultiplier: number;
    staminaCostMultiplier: number;
    attackSpeedMultiplier: number;
    hitEffectKeys: string[];
    hitEffectSize: number;
    hitSoundKeys: string[];
    hitSoundVolume: number;
};
