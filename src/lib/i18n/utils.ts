import type { SupportedLanguage } from "./config";
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import plTranslations from "./translations/pl.json";

export type Translations = typeof enTranslations;

const translations: Record<SupportedLanguage, Translations> = {
  en: enTranslations,
  es: esTranslations,
  pl: plTranslations,
};

export function getTranslations(lang: SupportedLanguage): Translations {
  return translations[lang];
}

export function interpolate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function getNestedTranslation(translations: Translations, path: string): string | Record<string, unknown> {
  const keys = path.split(".");
  let result: unknown = translations;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return result as string | Record<string, unknown>;
}
