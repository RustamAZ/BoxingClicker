export class AppLoadingScreen {
  private static readonly rootId = "app-loading-screen";
  private static readonly hiddenClassName = "app-loading-screen--hidden";

  private static root?: HTMLElement;

  static show() {
    const root = AppLoadingScreen.getOrCreateRoot();

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

  private static getOrCreateRoot() {
    const existingRoot = document.getElementById(AppLoadingScreen.rootId);

    if (existingRoot) {
      AppLoadingScreen.root = existingRoot;
      return existingRoot;
    }

    const root = document.createElement("div");
    const spinner = document.createElement("img");

    root.id = AppLoadingScreen.rootId;
    root.className = "app-loading-screen";
    spinner.className = "app-loading-screen__spinner";
    spinner.src = "assets/images/ui/loading-spinner.png";
    spinner.alt = "";
    root.appendChild(spinner);
    document.body.appendChild(root);
    AppLoadingScreen.root = root;

    return root;
  }
}
