import type { Player } from "../Player/Player";

type StoredWallet = {
  emeralds?: number;
};

export class Wallet {
  private static readonly storageKey = "boxing-clicker-wallet";

  private emeralds = 0;

  constructor(private readonly player: Player) {
    this.emeralds = this.loadEmeralds();
  }

  getBalance() {
    return this.emeralds;
  }

  deposit(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return this.emeralds;
    }

    this.emeralds += safeAmount;
    this.save();

    return this.emeralds;
  }

  canWithdraw(amount: number) {
    return this.emeralds >= Math.max(0, Math.floor(amount));
  }

  withdraw(amount: number) {
    const safeAmount = Math.max(0, Math.floor(amount));

    if (safeAmount <= 0) {
      return true;
    }

    if (!this.canWithdraw(safeAmount)) {
      return false;
    }

    this.emeralds -= safeAmount;
    this.save();

    return true;
  }

  getPlayer() {
    return this.player;
  }

  private loadEmeralds() {
    try {
      const rawWallet = localStorage.getItem(Wallet.storageKey);

      if (!rawWallet) {
        return 0;
      }

      const wallet = JSON.parse(rawWallet) as StoredWallet;

      if (typeof wallet.emeralds !== "number") {
        return 0;
      }

      return Math.max(0, Math.floor(wallet.emeralds));
    } catch {
      return 0;
    }
  }

  private save() {
    const wallet: StoredWallet = {
      emeralds: this.emeralds,
    };

    try {
      localStorage.setItem(Wallet.storageKey, JSON.stringify(wallet));
    } catch {
      // Wallet persistence is optional; the current session can keep playing.
    }
  }
}
