# Internationalization (i18n)

This directory contains the internationalization system for the 10xCards application.

## Features

- Support for multiple languages (English 🇬🇧, Spanish 🇪🇸, Polish 🇵🇱)
- Client-side language switching with page reload
- Persistent language preference (cookie-based, 365 days)
- Type-safe translations with TypeScript autocomplete
- React hooks for easy translation access
- Automatic language detection from browser settings
- Translation interpolation for dynamic values (e.g., `{count}`, `{current}`, `{total}`)
- Single React context via AppWrapper (prevents context errors)
- Globe icon (🌍) with country flags in dropdown
- Date localization per language
- 250+ translations covering all pages and components

## Usage

### In React Components

Use the `useTranslation` hook to access translations:

```tsx
import { useTranslation } from "@/lib/i18n";

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.myFlashcards.title")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### With Interpolation

For dynamic values, use the second parameter:

```tsx
const { t } = useTranslation();

// Single parameter
const charCount = t("pages.generate.charCount", { count: 1500 });
// Result: "1500 / 10000 characters" (EN) or "1500 / 10000 znaków" (PL)

// Multiple parameters
const progress = t("pages.studySession.cardProgress", { current: 5, total: 20 });
// Result: "Card 5 of 20" (EN) or "Karta 5 z 20" (PL)

const percent = t("pages.studySession.percentComplete", { percent: 75 });
// Result: "75% complete" (EN) or "75% ukończone" (PL)

// Flashcard count
const count = t("pages.myFlashcards.flashcardCount", { filtered: 50, total: 187 });
// Result: "50 of 187 flashcards" (EN) or "50 z 187 fiszek" (PL)
```

### Accessing Current Language

```tsx
const { language } = useTranslation();
console.log(language); // 'en', 'es', or 'pl'
```

### Changing Language

The `LanguageSwitcher` component is already integrated in the Navbar. Users can switch languages by clicking the **globe icon** (🌍). The dropdown menu shows:

- 🇬🇧 English ✓
- 🇪🇸 Español
- 🇵🇱 Polski

### Date Localization

For localized date formatting:

```tsx
const { language } = useTranslation();

const formatDate = (date: string) => {
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    pl: "pl-PL",
  };
  const locale = localeMap[language] || "en-US";

  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Results:
// 🇬🇧 English: "Nov 11, 2025"
// 🇪🇸 Spanish: "11 nov 2025"
// 🇵🇱 Polish: "11 lis 2025"
```

## Structure

- `config.ts` - Configuration and constants for supported languages
- `utils.ts` - Utility functions for translation management
- `context.tsx` - React context provider for i18n state
- `useTranslation.ts` - Custom hook for accessing translations
- `index.ts` - Main export file
- `translations/` - JSON files containing translations for each language
  - `en.json` - English translations
  - `es.json` - Spanish translations
  - `pl.json` - Polish translations

## Adding a New Language

1. Create a new JSON file in `translations/` (e.g., `fr.json`)
2. Copy the structure from `en.json` and translate all strings
3. Add the language code to `SUPPORTED_LANGUAGES` in `config.ts`:

```typescript
export const SUPPORTED_LANGUAGES = ["en", "es", "pl", "fr"] as const;
```

4. Add the language name to `LANGUAGE_NAMES`:

```typescript
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  pl: "Polski",
  fr: "Français",
};
```

5. Import and add the translations in `utils.ts`:

```typescript
import frTranslations from "./translations/fr.json";

const translations: Record<SupportedLanguage, Translations> = {
  en: enTranslations,
  es: esTranslations,
  pl: plTranslations,
  fr: frTranslations,
};
```

## Translation File Structure

All translation files follow this structure:

```json
{
  "language": {
    "name": "English",
    "code": "en"
  },
  "nav": {
    "logo": "10xCards",
    "generate": "Generate",
    "myFlashcards": "My Flashcards",
    "studySession": "Study Session",
    "logout": "Logout"
  },
  "auth": { ... },
  "validation": { ... },
  "pages": { ... },
  "components": { ... },
  "common": { ... },
  "errors": { ... }
}
```

## Best Practices

1. **Use nested keys**: Organize translations hierarchically (e.g., `pages.myFlashcards.title`)
2. **Keep keys consistent**: Use the same key structure across all language files
3. **Use interpolation**: For dynamic values, use `{variableName}` placeholders
4. **Test translations**: Ensure all translations are present in all language files
5. **Context matters**: Add descriptive keys that indicate where the translation is used

## Language Persistence

The selected language is stored in a cookie named `user-language` with a 365-day expiration. This ensures the user's language preference persists across sessions.

## TypeScript Support

The i18n system is fully typed. The `Translations` type is automatically inferred from the English translation file, ensuring type safety when accessing translations.
