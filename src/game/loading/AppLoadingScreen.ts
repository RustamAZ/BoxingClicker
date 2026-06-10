import { languageController } from "../localization/LanguageController";

export class AppLoadingScreen {
  private static readonly rootId = "app-loading-screen";
  private static readonly hiddenClassName = "app-loading-screen--hidden";

  private static root?: HTMLElement;

  static show() {
    const root = AppLoadingScreen.getOrCreateRoot();

    AppLoadingScreen.setProgress(0);
    AppLoadingScreen.refreshTexts();
    root.classList.remove(AppLoadingScreen.hiddenClassName);
    root.setAttribute("aria-hidden", "false");
  }

  static hide() {
    const root = AppLoadingScreen.root ?? document.getElementById(
      AppLoadingScreen.rootId,
    );

    if (!root) {
      return;
    }

    AppLoadingScreen.root = root;
    root.classList.add(AppLoadingScreen.hiddenClassName);
    root.setAttribute("aria-hidden", "true");
  }

  static setProgress(progress: number) {
    const root = AppLoadingScreen.getOrCreateRoot();
    const safeProgress = Math.max(0, Math.min(1, progress));

    root.style.setProperty("--app-loading-progress", String(safeProgress));
  }

  static refreshTexts() {
    const root = AppLoadingScreen.root ?? document.getElementById(
      AppLoadingScreen.rootId,
    );

    if (!root) {
      return;
    }

    const text = root.querySelector(".app-loading-screen__text");

    if (text) {
      text.textContent = languageController.t("loading.generatingLocation");
    }
  }

  private static getOrCreateRoot() {
    const existingRoot = document.getElementById(AppLoadingScreen.rootId);

    if (existingRoot) {
      AppLoadingScreen.root = existingRoot;
      AppLoadingScreen.ensureContent(existingRoot);
      return existingRoot;
    }

    const root = document.createElement("div");

    root.id = AppLoadingScreen.rootId;
    root.className = "app-loading-screen";
    AppLoadingScreen.ensureContent(root);
    document.body.appendChild(root);
    AppLoadingScreen.root = root;

    return root;
  }

  private static ensureContent(root: HTMLElement) {
    if (!root.querySelector(".app-loading-screen__spinner")) {
      const spinner = document.createElement("img");

      spinner.className = "app-loading-screen__spinner";
      spinner.src = "assets/images/ui/loading-spinner.png";
      spinner.alt = "";
      root.appendChild(spinner);
    }

    if (!root.querySelector(".app-loading-screen__text")) {
      const text = document.createElement("p");

      text.className = "app-loading-screen__text";
      text.textContent = languageController.t("loading.generatingLocation");
      root.appendChild(text);
    }

    if (!root.querySelector(".app-loading-screen__progress")) {
      const progress = document.createElement("div");
      const progressFill = document.createElement("div");

      progress.className = "app-loading-screen__progress";
      progress.setAttribute("aria-hidden", "true");
      progressFill.className = "app-loading-screen__progress-fill";
      progress.appendChild(progressFill);
      root.appendChild(progress);
    }
  }
}
