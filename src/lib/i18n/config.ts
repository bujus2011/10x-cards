export const SUPPORTED_LANGUAGES = ["en", "es", "pl"] as const;
export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_COOKIE_NAME = "user-language";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  pl: "Polski",
};

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function getLanguageFromCookie(cookieValue: string | undefined): SupportedLanguage {
  if (!cookieValue) {
    return DEFAULT_LANGUAGE;
  }

  return isValidLanguage(cookieValue) ? cookieValue : DEFAULT_LANGUAGE;
}

export function getLanguageFromBrowser(): SupportedLanguage {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const browserLang = navigator.language.split("-")[0];
  return isValidLanguage(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}
