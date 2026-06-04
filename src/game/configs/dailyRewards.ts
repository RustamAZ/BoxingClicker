export type DailyRewardId =
  | "daily-emeralds-1"
  | "daily-emeralds-2"
  | "daily-emeralds-3"
  | "daily-emeralds-4"
  | "daily-emeralds-5"
  | "daily-emeralds-6"
  | "daily-emeralds-7";

export type DailyRewardConfig = {
  id: DailyRewardId;
  type: "emerald";
  amount: number;
};

export const dailyRewardsConfig: DailyRewardConfig[] = [
  { id: "daily-emeralds-1", type: "emerald", amount: 30 },
  { id: "daily-emeralds-2", type: "emerald", amount: 65 },
  { id: "daily-emeralds-3", type: "emerald", amount: 90 },
  { id: "daily-emeralds-4", type: "emerald", amount: 120 },
  { id: "daily-emeralds-5", type: "emerald", amount: 150 },
  { id: "daily-emeralds-6", type: "emerald", amount: 300 },
  { id: "daily-emeralds-7", type: "emerald", amount: 100 },
];
