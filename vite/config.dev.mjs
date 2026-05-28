import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: "/BoxingClicker/",
  resolve: {
    alias: {
      phaser: fileURLToPath(new URL("../src/game/phaser.ts", import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
});
