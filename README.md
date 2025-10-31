# 10xCards

## Opis projektu

10xCards to aplikacja webowa zaprojektowana do automatycznego generowania fiszek przy użyciu LLM. Usprawnia proces tworzenia wysokiej jakości fiszek z tekstu dostarczonego przez użytkownika, czyniąc naukę bardziej efektywną i angażującą. Użytkownicy mogą generować fiszki automatycznie za pomocą AI lub tworzyć i zarządzać nimi manualnie.

## Spis treści

- [Opis projektu](#opis-projektu)
- [Stack technologiczny](#stack-technologiczny)
- [Rozpoczęcie pracy lokalnie](#rozpoczęcie-pracy-lokalnie)
- [Dostępne skrypty](#dostępne-skrypty)
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
- DigitalOcean dla hostingu z użyciem obrazów Docker

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

Aby uzyskać szczegółową dokumentację testową, zobacz [TESTING-E2E.md](./TESTING-E2E.md).

## Zakres projektu

Projekt ma na celu uproszczenie tworzenia fiszek poprzez:

- Automatyczne generowanie fiszek przy użyciu AI na podstawie tekstu dostarczonego przez użytkownika.
- Umożliwienie manualnego tworzenia, edycji i zarządzania fiszkami.
- Obsługę rejestracji konta użytkownika, logowania i bezpiecznej autentykacji przy użyciu Supabase.
- Integrację z algorytmem powtórek rozłożonych w czasie w celu optymalizacji nauki.
- Zbieranie statystyk użytkowania w celu oceny efektywności i jakości generowanych fiszek.

To MVP jest zaprojektowane, aby pozyskać 100 aktywnych użytkowników w ciągu pierwszych trzech miesięcy i będzie ewoluować na podstawie feedbacku użytkowników.

## Status projektu

Projekt jest obecnie w fazie MVP i jest aktywnie rozwijany.

## Licencja

Ten projekt jest licencjonowany na licencji MIT.