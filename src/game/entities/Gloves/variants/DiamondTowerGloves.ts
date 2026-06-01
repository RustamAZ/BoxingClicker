import { BaseGloves } from "../BaseGloves";

export class DiamondTowerGloves extends BaseGloves {
  readonly id = "diamond-tower-gloves";
  readonly leftTextureKey = "diamond-tower-gloves-left";
  readonly leftTexturePath =
    "assets/images/gloves/skins/diamond-tower/right-hand.png";
  readonly rightTextureKey = "diamond-tower-gloves-right";
  readonly rightTexturePath =
    "assets/images/gloves/skins/diamond-tower/left-hand.png";

  readonly damageMultiplier = 1.45;
  readonly staminaCostMultiplier = 0.92;
  readonly attackSpeedMultiplier = 1.28;
  readonly hitSoundVolume = 0.45;
}
