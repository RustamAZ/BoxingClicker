import { BaseGloves } from "../BaseGloves";

export class RedDailyGloves extends BaseGloves {
  readonly id = "red-daily-gloves";
  readonly leftTextureKey = "red-daily-gloves-left";
  readonly leftTexturePath = "assets/images/gloves/skins/red-daily/right-hand.png";
  readonly rightTextureKey = "red-daily-gloves-right";
  readonly rightTexturePath = "assets/images/gloves/skins/red-daily/left-hand.png";

  readonly damageMultiplier = 1.4;
  readonly staminaCostMultiplier = 0.94;
  readonly attackSpeedMultiplier = 1.24;
  readonly hitSoundVolume = 0.45;
}
