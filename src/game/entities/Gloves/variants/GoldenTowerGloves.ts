import { BaseGloves } from "../BaseGloves";

export class GoldenTowerGloves extends BaseGloves {
  readonly id = "golden-tower-gloves";
  readonly leftTextureKey = "golden-tower-gloves-left";
  readonly leftTexturePath = "assets/images/gloves/skins/golden-tower/right-hand.png";
  readonly rightTextureKey = "golden-tower-gloves-right";
  readonly rightTexturePath = "assets/images/gloves/skins/golden-tower/left-hand.png";

  readonly damageMultiplier = 1.35;
  readonly staminaCostMultiplier = 0.95;
  readonly attackSpeedMultiplier = 1.2;
  readonly hitSoundVolume = 0.45;
}
