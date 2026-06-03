export type InfinityTowerEnemyAttackType = "melee" | "ranged";

export type InfinityTowerEnemySpriteConfig = {
  key: string;
  path: string;
};

export type InfinityTowerEnemyProjectileConfig = {
  texture: InfinityTowerEnemySpriteConfig;
  animationDurationMs: number;
  startScale: number;
  endScale: number;
  burnSourceId: string;
  burnDamagePerSecond: number;
  burnDurationSeconds: number;
};

export type InfinityTowerEnemyVariantConfig = {
  id: string;
  displayName: string;
  attackType: InfinityTowerEnemyAttackType;
  alive: InfinityTowerEnemySpriteConfig;
  dead: InfinityTowerEnemySpriteConfig;
  projectile?: InfinityTowerEnemyProjectileConfig;
};

export type InfinityTowerEnemyPackId = "humans" | "myths" | "skeletons";

export type InfinityTowerEnemyPackConfig = {
  id: InfinityTowerEnemyPackId;
  variants: InfinityTowerEnemyVariantConfig[];
};

const fireballProjectile: InfinityTowerEnemyProjectileConfig = {
  texture: {
    key: "infinity-tower-fire-ball",
    path: "assets/images/enemies/five-difficulty/fire-ball.png",
  },
  animationDurationMs: 560,
  startScale: 0.18,
  endScale: 3.4,
  burnSourceId: "hell-fireball-burn",
  burnDamagePerSecond: 5,
  burnDurationSeconds: 2,
};

export const infinityTowerEnemyPacks: InfinityTowerEnemyPackConfig[] = [
  {
    id: "humans",
    variants: [
      {
        id: "humans-bower",
        displayName: "Tower Bower",
        attackType: "ranged",
        alive: {
          key: "infinity-tower-humans-bower",
          path: "assets/images/enemies/infinityTower/humans/infinity-bower.png",
        },
        dead: {
          key: "infinity-tower-humans-bower-dead",
          path: "assets/images/enemies/infinityTower/humans/infinity-bower-die.png",
        },
        projectile: fireballProjectile,
      },
      {
        id: "humans-village-boss",
        displayName: "Tower Fighter",
        attackType: "melee",
        alive: {
          key: "infinity-tower-humans-village-boss",
          path: "assets/images/enemies/first-difficulty/human-boss.png",
        },
        dead: {
          key: "infinity-tower-humans-village-boss-dead",
          path: "assets/images/enemies/first-difficulty/human-boss-die.png",
        },
      },
    ],
  },
  {
    id: "myths",
    variants: [
      {
        id: "myths-war",
        displayName: "Tower Myth Warrior",
        attackType: "melee",
        alive: {
          key: "infinity-tower-myths-war",
          path: "assets/images/enemies/infinityTower/myths/infinity-war.png",
        },
        dead: {
          key: "infinity-tower-myths-war-dead",
          path: "assets/images/enemies/infinityTower/myths/infinity-war-die.png",
        },
      },
      {
        id: "myths-mage",
        displayName: "Tower Myth Mage",
        attackType: "ranged",
        alive: {
          key: "infinity-tower-myths-mage",
          path: "assets/images/enemies/infinityTower/myths/infinity-mage-v2.png",
        },
        dead: {
          key: "infinity-tower-myths-mage-dead",
          path: "assets/images/enemies/infinityTower/myths/infinity-mage-v2-die.png",
        },
        projectile: fireballProjectile,
      },
    ],
  },
  {
    id: "skeletons",
    variants: [
      {
        id: "skeletons-mage-1",
        displayName: "Tower Skeleton Mage",
        attackType: "ranged",
        alive: {
          key: "infinity-tower-skeletons-mage-1",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-mage-v1.png",
        },
        dead: {
          key: "infinity-tower-skeletons-mage-1-dead",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-mage-v1-die.png",
        },
        projectile: fireballProjectile,
      },
      {
        id: "skeletons-mage-3",
        displayName: "Tower Skeleton Mage",
        attackType: "ranged",
        alive: {
          key: "infinity-tower-skeletons-mage-3",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-mage-v3.png",
        },
        dead: {
          key: "infinity-tower-skeletons-mage-3-dead",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-mage-v3-die.png",
        },
        projectile: fireballProjectile,
      },
      {
        id: "skeletons-warrior",
        displayName: "Tower Skeleton Warrior",
        attackType: "melee",
        alive: {
          key: "infinity-tower-skeletons-warrior",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-skeelton.png",
        },
        dead: {
          key: "infinity-tower-skeletons-warrior-dead",
          path: "assets/images/enemies/infinityTower/skeletons/infinity-skeleton-die.png",
        },
      },
    ],
  },
];

export const initialInfinityTowerEnemyPackId: InfinityTowerEnemyPackId =
  "humans";

export function getInfinityTowerEnemyPackById(
  packId: InfinityTowerEnemyPackId,
) {
  return infinityTowerEnemyPacks.find((pack) => pack.id === packId);
}
