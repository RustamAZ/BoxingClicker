import type { Scene } from "phaser";

export type EnemySpawnSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EnemyStatRange = {
  min: number;
  max: number;
};

export type EnemyAssetConfig = {
  key: string;
  path: string;
};

export type EnemyDeathSoundConfig = EnemyAssetConfig & {
  volume?: number;
};

export type EnemyVariantConfig = {
  displayName: string;
  alive: EnemyAssetConfig;
  dead: EnemyAssetConfig;
  deathSound?: EnemyDeathSoundConfig;
};

const queuedEnemyImageKeys = new Set<string>();
const queuedEnemySoundKeys = new Set<string>();

export function preloadEnemyDeathSound(
  scene: Scene,
  deathSound: EnemyDeathSoundConfig,
) {
  if (
    scene.cache.audio.exists(deathSound.key) ||
    queuedEnemySoundKeys.has(deathSound.key)
  ) {
    return;
  }

  scene.load.audio(deathSound.key, deathSound.path);
  queuedEnemySoundKeys.add(deathSound.key);
}

export function preloadEnemyVariants(
  scene: Scene,
  variants: readonly EnemyVariantConfig[],
) {
  variants.forEach((variant) => {
    [variant.alive, variant.dead].forEach((asset) => {
      if (
        !scene.textures.exists(asset.key) &&
        !queuedEnemyImageKeys.has(asset.key)
      ) {
        scene.load.image(asset.key, asset.path);
        queuedEnemyImageKeys.add(asset.key);
      }
    });

    if (variant.deathSound) {
      preloadEnemyDeathSound(scene, variant.deathSound);
    }
  });
}
