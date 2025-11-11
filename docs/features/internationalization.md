# Internationalization (i18n) Implementation Guide

## Overview

The 10xCards application supports multiple languages with a complete internationalization system. Users can switch between English, Spanish, and Polish seamlessly through a language switcher with globe icon (🌍) and country flags in the navigation bar.

## Features

✅ **Client-side language switching** - Instant language changes with page reload  
✅ **Persistent language preference** - Stored in cookies for 365 days  
✅ **Browser language detection** - Automatically detects user's preferred language  
✅ **Type-safe translations** - Full TypeScript support with autocomplete  
✅ **Translation interpolation** - Dynamic values in translations (e.g., "Card {current} of {total}")  
✅ **Single React context** - AppWrapper prevents context errors  
✅ **Globe icon with flags** - 🇬🇧 🇪🇸 🇵🇱 for visual identification  
✅ **Date localization** - Dates formatted per language  
✅ **Complete coverage** - All pages and components translated  
✅ **Easy to extend** - Simple process to add new languages

## Supported Languages

- **English (en)** 🇬🇧 - Default language
- **Spanish (es)** 🇪🇸 - Español
- **Polish (pl)** 🇵🇱 - Polski

## Architecture

The i18n system is built with:

1. **AppWrapper** - Single React island wrapping I18nProvider
2. **React Context** - Manages language state across the application
3. **Custom Hook** - `useTranslation()` for easy access to translations
4. **Cookie Storage** - Persists user's language preference
5. **JSON Translation Files** - Structured translation data with 250+ translations each

### File Structure

```
src/
├── components/
│   ├── AppWrapper.tsx          # Single React context wrapper
│   └── LanguageSwitcher.tsx    # Globe icon with flags dropdown
├── layouts/
│   └── Layout.astro            # Uses AppWrapper
├── pages/
│   ├── generate.astro          # Passes page="generate"
│   ├── my-flashcards.astro     # Passes page="my-flashcards"
│   └── study-session.astro     # Passes page="study-session"
└── lib/i18n/
    ├── config.ts               # Language configuration
    ├── context.tsx             # React context provider
    ├── useTranslation.ts       # Custom hook
    ├── utils.ts                # Translation utilities
    ├── index.ts                # Main exports
    ├── README.md               # Developer documentation
    └── translations/
        ├── en.json             # English (250+ translations)
        ├── es.json             # Spanish (250+ translations)
        └── pl.json             # Polish (250+ translations)
```

## Implementation Details

### 1. AppWrapper with I18n Provider

The `AppWrapper` creates a single React island wrapping the entire application in `Layout.astro`:

```astro
---
// src/layouts/Layout.astro
import { AppWrapper } from "@/components/AppWrapper";
import { getLanguageFromCookie, LANGUAGE_COOKIE_NAME } from "@/lib/i18n";

const { page } = Astro.props; // "generate" | "my-flashcards" | "study-session"
const user = Astro.locals.user;
const cookieLang = Astro.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
const initialLanguage = getLanguageFromCookie(cookieLang);
---

<html lang={initialLanguage}>
  <body>
    <AppWrapper client:only="react" initialLanguage={initialLanguage} user={user} page={page}>
      <slot />
    </AppWrapper>
  </body>
</html>
```

**AppWrapper benefits:**

- Single React island for all components
- Prevents "useI18n must be used within an I18nProvider" errors
- Conditional page rendering inside context
- Shared state across all components

### 2. Language Switcher Component

Located in `src/components/LanguageSwitcher.tsx` with **Globe icon** and **country flags**:

```tsx
import { Globe } from "lucide-react";

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  pl: "🇵🇱",
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    window.location.reload(); // Reload to update all content
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Change language">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem onClick={() => handleLanguageChange(lang)} className={language === lang ? "bg-accent" : ""}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{LANGUAGE_FLAGS[lang]}</span>
              {LANGUAGE_NAMES[lang]}
              {language === lang && <span className="ml-auto">✓</span>}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Visual result:**

- Button: 🌍 Globe icon
- Dropdown:
  - 🇬🇧 English ✓
  - 🇪🇸 Español
  - 🇵🇱 Polski

### 3. Using Translations in Components

#### Basic Usage

```tsx
import { useTranslation } from "@/lib/i18n";

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("pages.myFlashcards.title")}</h1>
      <button>{t("common.save")}</button>
      <p>{t("common.loading")}</p>
    </div>
  );
}
```

#### With Dynamic Values (Interpolation)

```tsx
const { t } = useTranslation();

// Translation in JSON: "Cards studied: {count}"
const message = t("pages.studySession.cardsStudied", { count: 10 });
// Result: "Cards studied: 10"

// Translation in JSON: "Accuracy: {percentage}%"
const accuracy = t("pages.studySession.accuracy", { percentage: 85 });
// Result: "Accuracy: 85%"
```

#### Accessing Current Language

```tsx
const { language } = useTranslation();

if (language === "pl") {
  // Polish-specific logic
}
```

## Translation File Structure

All translation files follow the same structure:

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
  "auth": {
    "login": {
      /* ... */
    },
    "register": {
      /* ... */
    }
  },
  "validation": {
    /* ... */
  },
  "pages": {
    "generate": {
      /* ... */
    },
    "myFlashcards": {
      /* ... */
    },
    "studySession": {
      /* ... */
    }
  },
  "components": {
    /* ... */
  },
  "common": {
    /* ... */
  },
  "errors": {
    /* ... */
  }
}
```

## Example: Converting a Component

**Before** (hardcoded text):

```tsx
export function Navbar({ user }: NavbarProps) {
  return (
    <nav>
      <a href="/generate">Generate</a>
      <a href="/my-flashcards">My Flashcards</a>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
```

**After** (with translations):

```tsx
import { useTranslation } from "@/lib/i18n";

export function Navbar({ user }: NavbarProps) {
  const { t } = useTranslation();

  return (
    <nav>
      <a href="/generate">{t("nav.generate")}</a>
      <a href="/my-flashcards">{t("nav.myFlashcards")}</a>
      <button onClick={handleLogout}>{t("nav.logout")}</button>
    </nav>
  );
}
```

## Adding a New Language

### Step 1: Create Translation File

Create a new JSON file in `src/lib/i18n/translations/` (e.g., `fr.json`):

```json
{
  "language": {
    "name": "Français",
    "code": "fr"
  },
  "nav": {
    "logo": "10xCards",
    "generate": "Générer",
    "myFlashcards": "Mes Cartes",
    "studySession": "Session d'Étude",
    "logout": "Déconnexion"
  }
  // ... copy all other sections from en.json and translate
}
```

### Step 2: Update Configuration

In `src/lib/i18n/config.ts`:

```typescript
export const SUPPORTED_LANGUAGES = ["en", "es", "pl", "fr"] as const;

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  pl: "Polski",
  fr: "Français",
};
```

### Step 3: Import Translations

In `src/lib/i18n/utils.ts`:

```typescript
import frTranslations from "./translations/fr.json";

const translations: Record<SupportedLanguage, Translations> = {
  en: enTranslations,
  es: esTranslations,
  pl: plTranslations,
  fr: frTranslations,
};
```

## Best Practices

### 1. Use Descriptive Keys

✅ Good: `pages.myFlashcards.createNewButton`  
❌ Bad: `btn1`

### 2. Organize Hierarchically

Group related translations:

```json
{
  "pages": {
    "myFlashcards": {
      "title": "My Flashcards",
      "createNewButton": "Create New Flashcard",
      "searchPlaceholder": "Search flashcards..."
    }
  }
}
```

### 3. Use Interpolation for Dynamic Content

✅ Good: `"Cards studied: {count}"`  
❌ Bad: Creating multiple keys like `cardsStudied1`, `cardsStudied2`

### 4. Keep Keys Consistent Across Languages

All language files should have the exact same structure and keys.

### 5. Add Context in Comments (Optional)

```json
{
  "components": {
    "flashcardCard": {
      // Shown on the delete confirmation dialog
      "confirmDelete": "Are you sure you want to delete this flashcard?"
    }
  }
}
```

## Testing

### Manual Testing Checklist

1. ✅ Language switcher appears in the navbar
2. ✅ Clicking language changes all visible text
3. ✅ Selected language persists after page reload
4. ✅ Browser language detection works for new users
5. ✅ All pages display correctly in all languages
6. ✅ No untranslated text (English keys) appear

### Test Language Switching

1. Open the application
2. Click the language icon (🌐) in the navbar
3. Select a different language
4. Verify all text updates correctly
5. Refresh the page
6. Verify the selected language persists

## Future Enhancements

Potential improvements:

1. **Server-side rendering** - Render initial page in user's language
2. **Language-specific routes** - `/en/generate`, `/es/generate`
3. **Lazy loading translations** - Load translations on-demand
4. **Translation management** - Admin panel for managing translations
5. **Pluralization support** - Handle singular/plural forms
6. **Date/time formatting** - Localized date and time display
7. **Number formatting** - Localized number display (1,000 vs 1.000)

## Troubleshooting

### Translation key not found

If a translation key is missing, the key itself will be displayed. Check:

1. The key exists in all translation files
2. The key path is correct (case-sensitive)
3. No typos in the key name

### Language not persisting

Check:

1. Cookies are enabled in the browser
2. The `user-language` cookie is set
3. The cookie domain and path are correct

### TypeScript errors

If TypeScript complains about translation keys:

1. Ensure all language files have the same structure
2. The `Translations` type is inferred from `en.json`
3. Run `npm run build` to update types

## Resources

- [React Context API](https://react.dev/reference/react/createContext)
- [i18n Best Practices](https://www.i18next.com/)
- [Astro Islands](https://docs.astro.build/en/concepts/islands/)
