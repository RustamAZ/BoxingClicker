export type DailyRewardId =
  | "daily-emeralds-1"
  | "daily-emeralds-2"
  | "daily-emeralds-3"
  | "daily-emeralds-4"
  | "daily-emeralds-5"
  | "daily-emeralds-6"
  | "daily-red-gloves";

export type DailyEmeraldRewardConfig = {
  id: DailyRewardId;
  type: "emerald";
  amount: number;
};

export type DailyGlovesRewardConfig = {
  id: DailyRewardId;
  type: "gloves";
  itemId: string;
  iconTextureKey: string;
  iconTexturePath: string;
};

export type DailyRewardConfig =
  | DailyEmeraldRewardConfig
  | DailyGlovesRewardConfig;

export const dailyRewardsConfig: DailyRewardConfig[] = [
  { id: "daily-emeralds-1", type: "emerald", amount: 30 },
  { id: "daily-emeralds-2", type: "emerald", amount: 65 },
  { id: "daily-emeralds-3", type: "emerald", amount: 90 },
  { id: "daily-emeralds-4", type: "emerald", amount: 120 },
  { id: "daily-emeralds-5", type: "emerald", amount: 150 },
  { id: "daily-emeralds-6", type: "emerald", amount: 300 },
  {
    id: "daily-red-gloves",
    type: "gloves",
    itemId: "red-daily-gloves",
    iconTextureKey: "daily-red-gloves-icon",
    iconTexturePath: "assets/images/ui/shop/items/red-daily-weapon-icon.png",
  },
];
