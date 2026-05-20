import type { Player } from "../Player/Player";

export class Wallet {
  constructor(private readonly player: Player) {}

  getBalance() {
    return this.player.profile.getEmeralds();
  }

  deposit(amount: number) {
    return this.player.profile.addEmeralds(amount);
  }

  canWithdraw(amount: number) {
    return this.player.profile.canSpendEmeralds(amount);
  }

  withdraw(amount: number) {
    return this.player.profile.spendEmeralds(amount);
  }

  getPlayer() {
    return this.player;
  }
}
