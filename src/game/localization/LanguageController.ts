import { localizationConfig } from "./localizationConfig";
import type { Language, LocalizationParams } from "./types";

type LanguageChangeListener = (language: Language) => void;

export class LanguageController {
  private language: Language = "ru";
  private readonly listeners = new Set<LanguageChangeListener>();

  getLanguage() {
    return this.language;
  }

  setLanguage(language: Language) {
    if (this.language === language) {
      return;
    }

    this.language = language;
    this.listeners.forEach((listener) => {
      listener(this.language);
    });
  }

  toggleLanguage() {
    this.setLanguage(this.language === "ru" ? "en" : "ru");
  }

  t(key: string, params: LocalizationParams = {}) {
    const dictionary = localizationConfig[this.language];
    const fallbackDictionary = localizationConfig.ru;
    const template = dictionary[key] ?? fallbackDictionary[key] ?? key;

    return Object.entries(params).reduce(
      (text, [paramKey, value]) =>
        text.replaceAll(`{${paramKey}}`, String(value)),
      template,
    );
  }

  onChange(listener: LanguageChangeListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const languageController = new LanguageController();
