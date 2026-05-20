import { EnemyStatRange } from "../entities/Enemy/types";

export function randomFloat(range: EnemyStatRange) {
    return Math.random() * (range.max - range.min) + range.min;
}