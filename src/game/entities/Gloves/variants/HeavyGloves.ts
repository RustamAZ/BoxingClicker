import { BaseGloves } from '../BaseGloves';

export class HeavyGloves extends BaseGloves {
  readonly id = "heavy-gloves";
  readonly leftTextureKey = "heavy-gloves-left";
  readonly leftTexturePath = "assets/images/gloves/skins/basic/left-hand.png";
  readonly rightTextureKey = "heavy-gloves-right";
  readonly rightTexturePath = "assets/images/gloves/skins/basic/right-hand.png";

  readonly damageMultiplier = 1.35;
  readonly staminaCostMultiplier = 1.2;
  readonly attackSpeedMultiplier = 0.92;

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
}
