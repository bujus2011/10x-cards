# 10xCards

## Opis projektu

10xCards to aplikacja webowa zaprojektowana do automatycznego generowania fiszek przy użyciu LLM. Usprawnia proces tworzenia wysokiej jakości fiszek z tekstu dostarczonego przez użytkownika, czyniąc naukę bardziej efektywną i angażującą. Użytkownicy mogą generować fiszki automatycznie za pomocą AI lub tworzyć i zarządzać nimi manualnie.

### ✨ Kluczowe funkcje

- **🤖 AI-Powered Generation**: Automatyczne tworzenie fiszek przy użyciu OpenRouter.ai API
- **🌙 Dark/Light Mode**: Wsparcie dla ciemnego i jasnego motywu z automatyczną detekcją preferencji systemowych
- **📱 Responsive Design**: Optymalizacja dla wszystkich urządzeń
- **🔐 Bezpieczna autentyfikacja**: Logowanie przez GitHub/Google OAuth oraz tradycyjne konto
- **📊 Spaced Repetition**: Algorytm FSRS do optymalizacji procesu nauki
- **🎯 Manualne zarządzanie**: Tworzenie, edycja i organizacja fiszek

## Spis treści

- [Opis projektu](#opis-projektu)
- [Stack technologiczny](#stack-technologiczny)
- [Rozpoczęcie pracy lokalnie](#rozpoczęcie-pracy-lokalnie)
- [Dostępne skrypty](#dostępne-skrypty)
- [Dokumentacja](#dokumentacja)
- [Wdrożenie](#wdrożenie)
- [Zakres projektu](#zakres-projektu)
- [Status projektu](#status-projektu)
- [Licencja](#licencja)

## Stack technologiczny

**Frontend:**

- Astro 5
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui

**Backend:**

- Supabase (PostgreSQL) do przechowywania danych i autentykacji
- Integracja AI poprzez OpenRouter.ai API

**Testowanie:**

- **Testy jednostkowe i integracyjne:**
  - Vitest - framework testowy zintegrowany z Vite/Astro
  - React Testing Library - testowanie komponentów skupione na UX
  - @testing-library/user-event - zaawansowana symulacja interakcji użytkownika
  - @testing-library/jest-dom - dodatkowe matchery testowe
  - MSW 2.x - mockowanie API poprzez Mock Service Worker
  - jsdom / happy-dom - symulacja środowiska DOM
- **Testy End-to-End:**
  - Playwright - testowanie E2E z wbudowanym runnerem testów
  - Playwright Test Runner - asercje i mechanizmy auto-oczekiwania
  - Playwright Trace Viewer - debugowanie i analiza testów
- **Regresja wizualna i dostępność:**
  - Storybook 8.x - dokumentacja komponentów i izolowane testowanie
  - Chromatic - automatyczne testowanie regresji wizualnej
  - axe-core z @axe-core/playwright - audyty dostępności

**CI/CD / Wdrożenie:**

- GitHub Actions dla ciągłej integracji i wdrażania
- Cloudflare Pages dla hostingu aplikacji z globalnym CDN
- @astrojs/cloudflare adapter dla server-side rendering na Cloudflare Workers

## Rozpoczęcie pracy lokalnie

1. **Sklonuj repozytorium:**

   ```sh
   git clone https://github.com/przeprogramowani/10x-cards.git
   cd 10x-cards
   ```

2. **Upewnij się, że używasz prawidłowej wersji Node:**
   Ten projekt używa wersji Node określonej w pliku `.nvmrc`. Obecnie jest to **22.14.0**.

   ```sh
   nvm use
   ```

3. **Zainstaluj zależności:**

   ```sh
   npm install
   ```

4. **Uruchom serwer deweloperski:**
   ```sh
   npm run dev
   ```
   Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce, aby zobaczyć aplikację.

## Dostępne skrypty

### Rozwój

- **`npm run dev`**: Uruchamia serwer deweloperski.
- **`npm run build`**: Buduje projekt dla produkcji.
- **`npm run preview`**: Podgląd buildu produkcyjnego lokalnie.
- **`npm run astro`**: Uruchamia komendy CLI Astro.

### Jakość kodu

- **`npm run lint`**: Uruchamia ESLint do sprawdzania problemów z lintowaniem.
- **`npm run lint:fix`**: Automatycznie naprawia problemy z lintowaniem.
- **`npm run format`**: Formatuje kod używając Prettier.

### Testowanie

- **`npm run test`**: Uruchamia testy jednostkowe w trybie watch.
- **`npm run test:run`**: Uruchamia wszystkie testy jednostkowe raz.
- **`npm run test:ui`**: Otwiera UI Vitest do wizualnej eksploracji testów.
- **`npm run test:coverage`**: Generuje raport pokrycia testowego.
- **`npm run test:watch`**: Uruchamia testy w trybie watch (alias dla `test`).
- **`npm run test:e2e`**: Uruchamia testy E2E z Playwright.
- **`npm run test:e2e:ui`**: Otwiera tryb UI Playwright.
- **`npm run test:e2e:headed`**: Uruchamia testy E2E z widoczną przeglądarką.
- **`npm run test:e2e:debug`**: Uruchamia testy E2E w trybie debug.
- **`npm run test:e2e:codegen`**: Otwiera codegen Playwright do nagrywania testów.
- **`npm run test:all`**: Uruchamia zarówno testy jednostkowe jak i E2E.

**Uwaga:** Testy E2E używają 1 workera, aby zapobiec wzajemnemu zakłócaniu się testów.

Aby uzyskać szczegółową dokumentację testową, zobacz [docs/development/testing.md](./docs/development/testing.md).

## Dokumentacja

Projekt posiada kompleksową dokumentację w katalogu `docs/`. Główne sekcje:

### 🏗️ Architektura

- [Authentication](./docs/architecture/authentication.md) - System autentykacji (JWT, Supabase, middleware)
- [Database](./docs/architecture/database.md) - Schema PostgreSQL, migracje
- [API Design](./docs/architecture/api-design.md) - Wzorce projektowe API

### 📱 Funkcje

- [My Flashcards](./docs/features/my-flashcards.md) - Zarządzanie fiszkami (CRUD, wyszukiwanie)

### 👨‍💻 Development

- [Testing](./docs/development/testing.md) - Testy jednostkowe (Vitest) i E2E (Playwright)

### 🚀 Deployment

- [Cloudflare](./docs/deployment/cloudflare.md) - Wdrażanie na Cloudflare Pages (kompletny przewodnik)
- [CI/CD](./docs/deployment/ci-cd.md) - GitHub Actions workflows
- [Troubleshooting](./docs/deployment/troubleshooting.md) - Rozwiązywanie problemów

### 📚 Pełna Dokumentacja

Zobacz [docs/README.md](./docs/README.md) dla kompletnego spisu treści wszystkich dokumentów.

## Wdrożenie

Aplikacja jest wdrażana automatycznie na Cloudflare Pages przy każdym pushu do gałęzi `master`.

### Automatyczne wdrażanie

1. Push zmian do gałęzi `master`
2. GitHub Actions automatycznie:
   - Uruchomi linting i testy jednostkowe
   - Zbuduje projekt z adapterem Cloudflare
   - Wdroży na Cloudflare Pages

### Wymagane sekrety GitHub

Skonfiguruj następujące sekrety w środowisku `production`:

**Aplikacja:**

- `PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `PUBLIC_SUPABASE_KEY` - Supabase anon key
- `OPENROUTER_API_KEY` - OpenRouter API key

**Cloudflare:**

- `CLOUDFLARE_API_TOKEN` - Token API z uprawnieniami Cloudflare Pages
- `CLOUDFLARE_ACCOUNT_ID` - ID konta Cloudflare

### Szczegółowa dokumentacja

Pełny przewodnik wdrażania znajduje się w [docs/deployment/cloudflare.md](./docs/deployment/cloudflare.md).

## Zakres projektu

Projekt ma na celu uproszczenie tworzenia fiszek poprzez:

- Automatyczne generowanie fiszek przy użyciu AI na podstawie tekstu dostarczonego przez użytkownika.
- Umożliwienie manualnego tworzenia, edycji i zarządzania fiszkami.
- Obsługę rejestracji konta użytkownika, logowania i bezpiecznej autentykacji przy użyciu Supabase.
- Logowanie społecznościowe przez GitHub i Google obsługiwane przez Supabase OAuth.
- Integrację z algorytmem powtórek rozłożonych w czasie w celu optymalizacji nauki.
- Zbieranie statystyk użytkowania w celu oceny efektywności i jakości generowanych fiszek.

To MVP jest zaprojektowane, aby pozyskać 100 aktywnych użytkowników w ciągu pierwszych trzech miesięcy i będzie ewoluować na podstawie feedbacku użytkowników.

## Status projektu

Projekt jest obecnie w fazie MVP i jest aktywnie rozwijany.

## Licencja

Ten projekt jest licencjonowany na licencji MIT.
