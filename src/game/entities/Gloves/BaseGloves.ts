import type { Scene } from 'phaser';
import { getGlovesShopConfigByGlovesId } from '../../configs/glovesConfig';
import type { GlovesAsset, GlovesCombatProfile } from './types';

export abstract class BaseGloves {
  abstract readonly id: string;
  abstract readonly leftTextureKey: string;
  abstract readonly leftTexturePath: string;
  abstract readonly rightTextureKey: string;
  abstract readonly rightTexturePath: string;

  abstract readonly damageMultiplier: number;
  abstract readonly staminaCostMultiplier: number;
  abstract readonly attackSpeedMultiplier: number;
  abstract readonly hitSoundVolume: number;

  readonly hitEffectAssets: GlovesAsset[] = [
    {
      key: "hit-effect-punch",
      path: "assets/images/effects/punch.png",
    },
    {
      key: "hit-effect-boom",
      path: "assets/images/effects/boom.png",
    },
    {
      key: "hit-effect-pow",
      path: "assets/images/effects/pow.png",
    },
  ];
  readonly hitEffectSize: number = 100;
  readonly hitSoundAssets: GlovesAsset[] = [
    {
      key: "hit-v1",
      path: "assets/audio/hit-v1.mp3",
    },
    {
      key: "hit-v2",
      path: "assets/audio/hit-v2.mp3",
    },
    {
      key: "hit-v3",
      path: "assets/audio/hit-v3.mp3",
    },
    {
      key: "hit-v4",
      path: "assets/audio/hit-v4.mp3",
    },
  ];

  preload(scene: Scene) {
    scene.load.image(this.leftTextureKey, this.leftTexturePath);
    scene.load.image(this.rightTextureKey, this.rightTexturePath);
    this.hitEffectAssets.forEach((asset) => {
      scene.load.image(asset.key, asset.path);
    });
    this.hitSoundAssets.forEach((asset) => {
      scene.load.audio(asset.key, asset.path);
    });
  }

  getCombatProfile(): GlovesCombatProfile {
    const glovesConfig = getGlovesShopConfigByGlovesId(this.id);

    return {
      id: this.id,
      attackBonus: glovesConfig?.attack_bonus ?? 0,
      damageMultiplier: glovesConfig ? 1 : this.damageMultiplier,
      staminaCostMultiplier: glovesConfig ? 1 : this.staminaCostMultiplier,
      attackSpeedMultiplier: glovesConfig
        ? 1 + glovesConfig.attack_speed_bonus
        : this.attackSpeedMultiplier,
      hitEffectKeys: this.hitEffectAssets.map((asset) => asset.key),
      hitEffectSize: this.hitEffectSize,
      hitSoundKeys: this.hitSoundAssets.map((asset) => asset.key),
      hitSoundVolume: this.hitSoundVolume,
    };
  }
}
