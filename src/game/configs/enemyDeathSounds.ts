import type { EnemyDeathSoundConfig } from "../entities/Enemy/types";

export const enemyDeathSounds = {
  skeleton: {
    key: "skeleton-death",
    path: "assets/audio/enemies/skeleton-death.mp3",
    volume: 0.9,
  },
  zombie: {
    key: "zombie-death",
    path: "assets/audio/enemies/zombie-death.mp3",
    volume: 0.9,
  },
  spider: {
    key: "spider-death",
    path: "assets/audio/enemies/spider-death.mp3",
    volume: 0.9,
  },
} satisfies Record<string, EnemyDeathSoundConfig>;
