import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { SupportedLanguage } from "./config";
import { LANGUAGE_COOKIE_NAME, getLanguageFromCookie, getLanguageFromBrowser } from "./config";
import { getTranslations, type Translations } from "./utils";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (initialLanguage) {
      return initialLanguage;
    }

    // Try to get from cookie first
    const cookieLang = getCookie(LANGUAGE_COOKIE_NAME);
    if (cookieLang) {
      return getLanguageFromCookie(cookieLang);
    }

    // Fallback to browser language
    return getLanguageFromBrowser();
  });

  const [translations, setTranslations] = useState<Translations>(() => getTranslations(language));

  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    setCookie(LANGUAGE_COOKIE_NAME, lang);
  };

  return <I18nContext.Provider value={{ language, setLanguage, t: translations }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
