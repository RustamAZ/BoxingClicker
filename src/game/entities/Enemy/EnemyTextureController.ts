import Phaser, { type Loader, type Scene, type Textures } from "phaser";

export class EnemyTextureController {
  private readonly pendingTextureKeys = new Set<string>();

  constructor(private readonly scene: Scene) {
    this.scene.load.on(
      Phaser.Loader.Events.FILE_LOAD,
      this.trackEnemyTexture,
      this,
    );
    this.scene.textures.on(
      Phaser.Textures.Events.ADD,
      this.configureTexture,
      this,
    );
    this.scene.events.once("shutdown", this.destroy, this);
  }

  destroy() {
    this.scene.load.off(
      Phaser.Loader.Events.FILE_LOAD,
      this.trackEnemyTexture,
      this,
    );
    this.scene.textures.off(
      Phaser.Textures.Events.ADD,
      this.configureTexture,
      this,
    );
    this.pendingTextureKeys.clear();
    this.scene.events.off("shutdown", this.destroy, this);
  }

  private trackEnemyTexture(file: Loader.File) {
    if (
      file.type === "image" &&
      typeof file.url === "string" &&
      file.url.includes("assets/images/enemies/")
    ) {
      this.pendingTextureKeys.add(file.key);
    }
  }

  private configureTexture(key: string, texture: Textures.Texture) {
    if (this.pendingTextureKeys.delete(key)) {
      // Prevent linear filtering from sampling the opposite edge during scaling.
      texture.setWrap(Phaser.Textures.WrapMode.CLAMP_TO_EDGE);
    }
  }
}
