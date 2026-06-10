import type { SDK as YandexSDK } from "ysdk";
import type { GamePlatform } from "./GamePlatform";
import { LocalGamePlatform } from "./LocalGamePlatform";
import { YandexGamePlatform } from "./YandexGamePlatform";

type YaGamesGlobal = {
  init<TGlobalSigned extends boolean = false>(opts?: {
    signed?: TGlobalSigned;
  }): Promise<YandexSDK<TGlobalSigned>>;
};

const yandexSdkScriptSrc = "/sdk.js";

let activePlatform: GamePlatform = new LocalGamePlatform();

export const getGamePlatform = () => activePlatform;

export const initializeGamePlatform = async () => {
  const sdk = await initializeYandexSdk();

  activePlatform = sdk
    ? new YandexGamePlatform(sdk)
    : new LocalGamePlatform();

  return activePlatform;
};

const initializeYandexSdk = async () => {
  const hasScript = await ensureYandexSdkScript();
  const yaGames = getYaGamesGlobal();

  if (!hasScript || !yaGames) {
    return undefined;
  }

  try {
    return await yaGames.init();
  } catch {
    return undefined;
  }
};

const ensureYandexSdkScript = async () => {
  if (getYaGamesGlobal()) {
    return true;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${yandexSdkScriptSrc}"]`,
  );

  if (existingScript) {
    return waitForExistingScript(existingScript);
  }

  return loadYandexSdkScript();
};

const waitForExistingScript = (script: HTMLScriptElement) => {
  return new Promise<boolean>((resolve) => {
    if (getYaGamesGlobal()) {
      resolve(true);
      return;
    }

    script.addEventListener("load", () => resolve(true), { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
  });
};

const loadYandexSdkScript = () => {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");

    script.src = yandexSdkScriptSrc;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const getYaGamesGlobal = () => {
  return (globalThis as { YaGames?: YaGamesGlobal }).YaGames;
};
