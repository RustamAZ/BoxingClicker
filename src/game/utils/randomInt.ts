import { EnemyStatRange } from "../entities/Enemy/types";

export function randomInt(range: EnemyStatRange) {
  return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
}