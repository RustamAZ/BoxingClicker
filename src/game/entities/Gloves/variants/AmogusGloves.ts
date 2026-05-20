import { BaseGloves } from '../BaseGloves';
import { GlovesAsset } from '../types';

export class AmogusGloves extends BaseGloves {
  readonly id = "amogus-gloves";
  readonly leftTextureKey = "amogus-gloves-left";
  readonly leftTexturePath = "assets/images/gloves/skins/amogus/left-hand.png";
  readonly rightTextureKey = "amogus-gloves-right";
  readonly rightTexturePath =
    "assets/images/gloves/skins/amogus/right-hand.png";

  readonly damageMultiplier = 1.08;
  readonly staminaCostMultiplier = 0.98;
  readonly attackSpeedMultiplier = 1.02;

  readonly hitSoundAssets = [
    {
      key: "amogus-hit-smeared",
      path: "assets/audio/gloves/amogus/smeared.mp3",
    },
    {
      key: "amogus-hit-smeared-e-flat",
      path: "assets/audio/gloves/amogus/smeared-e-flat.mp3",
    },
    {
      key: "amogus-hit-smeared-g-flat",
      path: "assets/audio/gloves/amogus/smeared-g-flat.mp3",
    },
  ];

  readonly hitEffectAssets: GlovesAsset[] = [
    {
      key: "amogus-punch-effect",
      path: "assets/images/effects/amogus-punch.png",
    },
  ];
}
