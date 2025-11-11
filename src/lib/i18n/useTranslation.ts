import { useI18n } from "./context";
import { interpolate, getNestedTranslation, type Translations } from "./utils";

export function useTranslation() {
  const { t: translations, language } = useI18n();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(translations, key);

    if (typeof translation !== "string") {
      return key;
    }

    if (params) {
      return interpolate(translation, params);
    }

    return translation;
  };

  return { t, language, translations };
}
