import type { InAppProduct } from "../platform/yandex/GamePlatform";

const createMockProduct = (
  id: string,
  title: string,
  price: string,
  priceValue: string,
): InAppProduct => ({
  id,
  title,
  description: `${title} for local development`,
  imageUri: "",
  price,
  priceValue,
  priceCurrencyCode: "USD",
  priceCurrencyImage: {
    small: "",
    medium: "",
    svg: "",
  },
});

export const mockInAppProducts: InAppProduct[] = [
  createMockProduct("mock-emeralds-300", "Handful of Emeralds", "$0.97", "0.97"),
  createMockProduct("mock-emeralds-700", "Bag of Emeralds", "$1.94", "1.94"),
  createMockProduct("mock-emeralds-1600", "Emerald Chest", "$3.89", "3.89"),
  createMockProduct("mock-emeralds-3000", "Large Chest", "$6.80", "6.80"),
];

export const inAppProductPresentation = [
  { amount: 300, titleKey: "inApp.pack.handful" },
  { amount: 700, titleKey: "inApp.pack.bag" },
  { amount: 1600, titleKey: "inApp.pack.chest" },
  { amount: 3000, titleKey: "inApp.pack.largeChest" },
] as const;
