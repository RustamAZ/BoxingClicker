import type * as PhaserNamespace from "phaser";

type PhaserGlobal = typeof PhaserNamespace;

const phaser = (globalThis as typeof globalThis & { Phaser?: PhaserGlobal }).Phaser;

if (!phaser) {
  throw new Error("Phaser global script is not loaded.");
}

export const AUTO = phaser.AUTO;
export const CANVAS = phaser.CANVAS;
export const Game = phaser.Game;
export const GameObjects = phaser.GameObjects;
export const Input = phaser.Input;
export const Math = phaser.Math;
export const Scale = phaser.Scale;
export const Scene = phaser.Scene;
export const Sound = phaser.Sound;

export default phaser;
