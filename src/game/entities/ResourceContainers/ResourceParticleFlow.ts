import { Scene } from "phaser";

type Point = {
  x: number;
  y: number;
};

type ResourceParticleFlowConfig = {
  from: Point;
  diamondTarget: Point;
  coinTarget: Point;
  emeraldTarget?: Point;
  diamondsCount: number;
  coinsCount: number;
  emeraldsCount?: number;
  onComplete?: () => void;
};

type ParticleMotion = {
  scatterX: number;
  scatterY: number;
};

type ParticleTextureKey =
  | "diamond-particle"
  | "coin-particle"
  | "emerald-particle";

export class ResourceParticleFlow {
  private static readonly diamondParticleTextureKey: ParticleTextureKey =
    "diamond-particle";
  private static readonly coinParticleTextureKey: ParticleTextureKey =
    "coin-particle";
  private static readonly emeraldParticleTextureKey: ParticleTextureKey =
    "emerald-particle";
  private static readonly diamondParticlePath =
    "assets/images/rewards/particles/diamond-particle.png";
  private static readonly coinParticlePath =
    "assets/images/rewards/particles/coin-particle.png";
  private static readonly emeraldParticlePath =
    "assets/images/rewards/particles/emerald-particle.png";
  private static readonly particleScales: Record<ParticleTextureKey, number> = {
    [ResourceParticleFlow.diamondParticleTextureKey]: 2.55,
    [ResourceParticleFlow.coinParticleTextureKey]: 2.4,
    [ResourceParticleFlow.emeraldParticleTextureKey]: 1,
  };
  private static readonly particleScatterDurationMs = 260;
  private static readonly particleAttractDurationMs = 680;
  private static readonly particleDelayMaxMs = 140;
  private static readonly particleFlightDurationMs =
    ResourceParticleFlow.particleScatterDurationMs +
    ResourceParticleFlow.particleAttractDurationMs;
  private static readonly emitterDestroyDelayMs =
    ResourceParticleFlow.particleFlightDurationMs +
    ResourceParticleFlow.particleDelayMaxMs +
    160;
  private static readonly resourceApplyDelayMs =
    ResourceParticleFlow.particleFlightDurationMs +
    ResourceParticleFlow.particleDelayMaxMs;
  private static readonly spawnOffsetY = -120;
  private static readonly scatterDistanceRanges = [
    {
      weight: 0.35,
      min: 90,
      max: 170,
    },
    {
      weight: 0.45,
      min: 180,
      max: 320,
    },
    {
      weight: 0.2,
      min: 330,
      max: 470,
    },
  ];
  private static readonly scatterVerticalStretch = 1.15;
  private static readonly depth = 40;

  static preload(scene: Scene) {
    scene.load.image(
      ResourceParticleFlow.diamondParticleTextureKey,
      ResourceParticleFlow.diamondParticlePath,
    );
    scene.load.image(
      ResourceParticleFlow.coinParticleTextureKey,
      ResourceParticleFlow.coinParticlePath,
    );
    scene.load.image(
      ResourceParticleFlow.emeraldParticleTextureKey,
      ResourceParticleFlow.emeraldParticlePath,
    );
  }

  constructor(private readonly scene: Scene) {}

  play(config: ResourceParticleFlowConfig) {
    const diamondsCount = Math.max(0, Math.floor(config.diamondsCount));
    const coinsCount = Math.max(0, Math.floor(config.coinsCount));
    const emeraldsCount = Math.max(0, Math.floor(config.emeraldsCount ?? 0));

    if (diamondsCount > 0) {
      this.emitParticles(
        ResourceParticleFlow.diamondParticleTextureKey,
        diamondsCount,
        config.from,
        config.diamondTarget,
      );
    }

    if (coinsCount > 0) {
      this.emitParticles(
        ResourceParticleFlow.coinParticleTextureKey,
        coinsCount,
        config.from,
        config.coinTarget,
      );
    }

    if (emeraldsCount > 0 && config.emeraldTarget) {
      this.emitParticles(
        ResourceParticleFlow.emeraldParticleTextureKey,
        emeraldsCount,
        config.from,
        config.emeraldTarget,
      );
    }

    this.scene.time.delayedCall(
      ResourceParticleFlow.resourceApplyDelayMs,
      () => {
        config.onComplete?.();
      },
    );
  }

  private emitParticles(
    textureKey: ParticleTextureKey,
    count: number,
    from: Point,
    target: Point,
  ) {
    const emitPoint = {
      x: from.x,
      y: from.y + ResourceParticleFlow.spawnOffsetY,
    };
    const particleMotions = new WeakMap<
      Phaser.GameObjects.Particles.Particle,
      ParticleMotion
    >();
    const emitter = this.scene.add
      .particles(0, 0, textureKey, {
        emitting: false,
        lifespan: {
          min: ResourceParticleFlow.particleFlightDurationMs - 120,
          max: ResourceParticleFlow.particleFlightDurationMs + 80,
        },
        delay: {
          min: 0,
          max: ResourceParticleFlow.particleDelayMaxMs,
        },
        scale: ResourceParticleFlow.getParticleScale(textureKey),
        rotate: {
          min: -180,
          max: 180,
        },
        x: {
          onEmit: (particle) => {
            if (particle) {
              this.createParticleMotion(particleMotions, particle, emitPoint);
            }

            return emitPoint.x;
          },
          onUpdate: (particle, _key, progress) => {
            const motion = this.getParticleMotion(
              particleMotions,
              particle,
            );

            return ResourceParticleFlow.getParticlePositionOnAxis(
              progress,
              emitPoint.x,
              motion.scatterX,
              target.x,
            );
          },
        },
        y: {
          onEmit: (particle) => {
            if (particle) {
              this.createParticleMotion(particleMotions, particle, emitPoint);
            }

            return emitPoint.y;
          },
          onUpdate: (particle, _key, progress) => {
            const motion = this.getParticleMotion(
              particleMotions,
              particle,
            );

            return ResourceParticleFlow.getParticlePositionOnAxis(
              progress,
              emitPoint.y,
              motion.scatterY,
              target.y,
            );
          },
        },
      })
      .setDepth(ResourceParticleFlow.depth);

    emitter.explode(count);

    this.scene.time.delayedCall(
      ResourceParticleFlow.emitterDestroyDelayMs,
      () => {
        emitter.destroy();
      },
    );
  }

  private createParticleMotion(
    particleMotions: WeakMap<
      Phaser.GameObjects.Particles.Particle,
      ParticleMotion
    >,
    particle: Phaser.GameObjects.Particles.Particle,
    from: Point,
  ) {
    if (particleMotions.has(particle)) {
      return;
    }

    const angle = Math.random() * Math.PI * 2;
    const distance = ResourceParticleFlow.getRandomScatterDistance();

    particleMotions.set(particle, {
      scatterX: from.x + Math.cos(angle) * distance,
      scatterY:
        from.y +
        Math.sin(angle) *
          distance *
          ResourceParticleFlow.scatterVerticalStretch,
    });
  }

  private getParticleMotion(
    particleMotions: WeakMap<
      Phaser.GameObjects.Particles.Particle,
      ParticleMotion
    >,
    particle: Phaser.GameObjects.Particles.Particle,
  ) {
    const motion = particleMotions.get(particle);

    return motion ?? {
      scatterX: particle.x,
      scatterY: particle.y,
    };
  }

  private static getParticlePositionOnAxis(
    progress: number,
    from: number,
    scatter: number,
    target: number,
  ) {
    const scatterProgress =
      ResourceParticleFlow.particleScatterDurationMs /
      ResourceParticleFlow.particleFlightDurationMs;

    if (progress <= scatterProgress) {
      const normalizedProgress = progress / scatterProgress;
      const easedProgress = ResourceParticleFlow.easeOutQuad(
        normalizedProgress,
      );

      return ResourceParticleFlow.lerp(from, scatter, easedProgress);
    }

    const normalizedProgress =
      (progress - scatterProgress) / (1 - scatterProgress);
    const easedProgress = ResourceParticleFlow.easeInQuad(
      normalizedProgress,
    );

    return ResourceParticleFlow.lerp(scatter, target, easedProgress);
  }

  private static lerp(from: number, to: number, progress: number) {
    return from + (to - from) * Math.max(0, Math.min(1, progress));
  }

  private static easeInQuad(progress: number) {
    const safeProgress = Math.max(0, Math.min(1, progress));

    return safeProgress * safeProgress;
  }

  private static easeOutQuad(progress: number) {
    const safeProgress = Math.max(0, Math.min(1, progress));

    return 1 - (1 - safeProgress) * (1 - safeProgress);
  }

  private static getRandomScatterDistance() {
    const totalWeight = ResourceParticleFlow.scatterDistanceRanges.reduce(
      (sum, range) => sum + range.weight,
      0,
    );
    let randomWeight = Math.random() * totalWeight;

    for (const range of ResourceParticleFlow.scatterDistanceRanges) {
      randomWeight -= range.weight;

      if (randomWeight <= 0) {
        return ResourceParticleFlow.randomBetween(range.min, range.max);
      }
    }

    const fallbackRange =
      ResourceParticleFlow.scatterDistanceRanges[
        ResourceParticleFlow.scatterDistanceRanges.length - 1
      ];

    return ResourceParticleFlow.randomBetween(
      fallbackRange.min,
      fallbackRange.max,
    );
  }

  private static randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  private static getParticleScale(textureKey: ParticleTextureKey) {
    return ResourceParticleFlow.particleScales[textureKey];
  }
}
