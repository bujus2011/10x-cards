# Plan Testów Projektu 10xCards

## 1. Wprowadzenie i cele testowania

- Zapewnienie wysokiej jakości aplikacji 10xCards poprzez kompleksowe testowanie kluczowych funkcjonalności.
- Weryfikacja poprawności działania logiki biznesowej, interfejsu użytkownika, integracji z backendem (Supabase) oraz komunikacji z zewnętrznym modułem AI.
- Identyfikacja błędów, słabych punktów i potencjalnych obszarów ryzyka w środowisku produkcyjnym.
- Zapewnienie dostępności (a11y) oraz zgodności z najlepszymi praktykami bezpieczeństwa.

## 2. Zakres testów

- **Testy jednostkowe**: Weryfikacja pojedynczych komponentów i funkcji (np. komponenty UI, serwisy, moduły wsparcia).
- **Testy integracyjne**: Sprawdzenie poprawnej współpracy pomiędzy komponentami, integracji z API Supabase, middleware i modułem autoryzacji.
- **Testy end-to-end (E2E)**: Symulacja rzeczywistej ścieżki użytkownika – rejestracja, logowanie, generowanie flashcards, zarządzanie kontem.
- **Testy wydajnościowe**: Ocena szybkości działania i obciążenia powiązanego z integracją z modułem AI (Openrouter) oraz przetwarzaniem danych.
- **Testy regresyjne**: Automatyczna weryfikacja po każdej aktualizacji kodu w celu wykrycia niepożądanych zmian.
- **Testy dostępności (a11y)**: Weryfikacja zgodności z WCAG 2.1 i zapewnienie dostępności dla wszystkich użytkowników.
- **Testy visual regression**: Sprawdzenie czy zmiany w kodzie nie powodują niepożądanych zmian wizualnych w UI.
- **Testy bezpieczeństwa**: Weryfikacja poprawności implementacji RLS policies w Supabase oraz zabezpieczeń autentykacji.
- **Testy API**: Weryfikacja poprawności działania endpointów API Astro oraz kontraktów z zewnętrznymi serwisami.

## 3. Typy testów do przeprowadzenia

- **Testy jednostkowe**: Przy użyciu **Vitest** (zintegrowany z Astro/Vite, znacznie szybszy niż Jest) oraz **React Testing Library** (dla komponentów interaktywnych w Astro/React).
- **Testy integracyjne**: Testowanie połączeń pomiędzy warstwą frontendową a backendem. Użycie **MSW 2.x** do mockowania zapytań API oraz **Supertest** dla testowania Astro API endpoints.
- **Testy E2E**: Wykorzystanie **Playwright** (priorytet ze względu na lepsze wsparcie wieloplatformowe, szybkość i stabilność) w celu symulacji pełnych scenariuszy użytkownika.
- **Testy wydajnościowe i obciążeniowe**: **Lighthouse CI** dla audytu wydajności oraz **Artillery** (lub Grafana k6) do testów obciążeniowych.
- **Testy visual regression**: **Storybook 8.x** z **Chromatic** lub **Playwright Screenshots** z Percy/Argos CI.
- **Testy dostępności**: **axe-core** z **@axe-core/playwright** dla automatycznych audytów dostępności.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Autentykacja i autoryzacja

- **Rejestracja użytkownika**:
  - Poprawność walidacji danych (email, hasło, warunki)
  - Tworzenie konta i integracja z Supabase Auth
  - Obsługa błędów (duplikacja emaila, słabe hasło)
  - Weryfikacja wysyłki emaila potwierdzającego
- **Logowanie**:
  - Weryfikacja poprawnego logowania z prawidłowymi danymi
  - Zarządzanie sesją (JWT tokens, cookies)
  - Obsługa błędów (niepoprawne hasło, nieistniejący użytkownik)
  - Test trwałości sesji (refresh tokens)
  - Walidacja formularza logowania (`LoginForm` komponent)
  - Testy E2E dla różnych scenariuszy logowania
  - Obsługa stanów ładowania (disabled button podczas submitu)
- **Wylogowanie**:
  - Endpoint POST `/api/auth/logout`
  - Usuwanie sesji użytkownika z Supabase
  - Czyszczenie cookies i localStorage
  - Przekierowanie na stronę logowania po wylogowaniu
  - Walidacja że chronione trasy są niedostępne po wylogowaniu
  - Test przepływu: logowanie → operacje → wylogowanie → brak dostępu
- **Resetowanie hasła**:
  - Mechanizm resetowania hasła przez email
  - Walidacja tokenów resetowania
  - Komunikacja z API Supabase
- **Middleware**:
  - Weryfikacja poprawnego przekazywania kontekstu użytkownika (`locals.user`)
  - Przekierowania dla chronionych tras
  - Obsługa ścieżek publicznych (PUBLIC_PATHS)
  - Testowanie edge cases (wygasłe tokeny, brak sesji)

### 4.2. Generowanie i zarządzanie flashcards

- **Tworzenie flashcards**:
  - Testy formularza `CreateFlashcardForm` (walidacja, UX)
  - Walidacja danych wejściowych (tekst, długość, format)
  - Inicjacja procesu generacji (integracja z `generation.service.ts`)
  - Obsługa stanów ładowania (SkeletonLoader)
- **Wyświetlanie listy flashcards**:
  - Testy komponentów `FlashcardList` i `FlashcardListItem`
  - Paginacja i lazy loading
  - Filtrowanie i sortowanie
  - Responsywność layoutu
- **Zarządzanie flashcards** (My Flashcards):
  - Testy komponentu `MyFlashcardsView`
  - Edycja istniejących flashcards
  - Usuwanie flashcards
  - Bulk operations (`BulkSaveButton`)
- **Sesja nauki z algorytmem Spaced Repetition** (US-008):
  - Testy komponentu `StudySessionView`
  - Integracja z biblioteką `ts-fsrs` (Free Spaced Repetition Scheduler)
  - Wyświetlanie fiszek do powtórki (karty z `due date` <= teraz)
  - System oceniania trudności (Again, Hard, Good, Easy - rating 1-4)
  - Pokazywanie i ukrywanie odpowiedzi (front/back card)
  - Obliczanie następnego terminu powtórki na podstawie algorytmu FSRS
  - Zapis historii powtórek w tabeli `review_logs`
  - Testy API endpoint `/api/study-session` (GET - pobieranie kart, POST - zapis recenzji)
  - Testy API endpoint `/api/study-stats` (GET - statystyki nauki)
  - Testy stanów FSRS: New (0), Learning (1), Review (2), Relearning (3)
  - Walidacja parametrów FSRS: stability, difficulty, elapsed_days, scheduled_days
  - Scenariusze edge case: brak kart do powtórki, błędy zapisu recenzji
  - Responsywność layoutu sesji nauki
- **Obsługa błędów**:
  - Sprawdzenie wyświetlania komunikatów błędów (`ErrorNotification`)
  - Logowanie błędów do tabeli `generation_error_logs`
  - Fallback UI dla niepowodzeń generacji

### 4.3. Integracja z modułem AI (Openrouter)

- **Wywołania serwisu AI**:
  - Testy `openrouter.service.ts` (poprawność requestów)
  - Parsowanie odpowiedzi od modeli AI
  - Obsługa różnych modeli (fallback scenarios)
- **Obsługa limitów i błędów**:
  - Symulacja przekroczenia limitów API
  - Rate limiting i retry logic
  - Weryfikacja komunikatów dla użytkownika
- **Contract testing**:
  - Weryfikacja stabilności kontraktu API Openrouter
  - Testy z mockami dla szybkiego feedbacku

### 4.4. Testy E2E - specyficzne wyzwania i rozwiązania

- **Problem synchronizacji React state w testach E2E**:
  - Wykryty problem: race condition między Playwright's `fill()` a React `onChange` handlers
  - Objawy: wartości w polach formularza nie są ustawiane w React state przed submitem
  - Rozwiązanie: dodanie strategicznych timeoutów i mechanizmu weryfikacji wartości
  - Implementacja w `LoginPage.ts` Page Object Model
  - Używanie `expect().toHaveValue()` do weryfikacji przed submitem
  - Dodanie `blur()` na ostatnim polu aby wywołać wszystkie pending state updates
  - Timeouty: 300ms po email, 500ms po password dla stabilności
- **Konfiguracja testów dla stabilności**:
  - Tryb `serial` dla test suites z formularzami (`test.describe.configure({ mode: 'serial' })`)
  - Ograniczenie liczby workerów do 3 lokalnie (zmniejsza obciążenie serwera)
  - Workers = 1 w CI dla maksymalnej stabilności
  - Dodanie `noValidate` attribute w `LoginForm` aby wyłączyć HTML5 validation i używać tylko JavaScript validation
- **Timeouty i retry logic**:
  - Zwiększone timeouty dla testów z rzeczywistymi API calls (np. 60s dla successful login)
  - Timeouty dla `waitForURL()` dostosowane do obciążenia serwera (45s)
  - Brak automatycznego retry w lokalnym środowisku (`retries: 0`)
  - 2 retry w CI environment dla odporności na flaky tests
- **Izolacja testów**:
  - `beforeEach` z `clearCookies()` w testach auth
  - Osobne test users dla różnych scenariuszy (valid, invalid, shortPassword, invalidEmail)
  - Użycie `.env.test` z dedykowanymi credentials dla testów
  - Testowa instancja Supabase w chmurze
- **Page Object Model best practices**:
  - Metody `login()`, `fillEmail()`, `fillPassword()` z wbudowaną weryfikacją
  - Gettery dla locatorów (`emailInput`, `passwordInput`, `submitButton`, `errorMessage`)
  - Pomocnicze metody `getErrorText()`, `hasError()`, `isSubmitDisabled()`
  - Oczekiwanie na `toBeVisible()` przed interakcją z elementami

### 4.5. Interfejs użytkownika i komponenty

- **Renderowanie komponentów**:
  - Testy statycznych komponentów Astro (Welcome.astro, Layout.astro)
  - Testy dynamicznych komponentów React (Navbar, FormComponents)
  - Komponenty z Shadcn UI (Button, Card, Alert, Input, etc.)
- **Responsywność**:
  - Testy na różnych breakpointach (mobile, tablet, desktop)
  - Playwright viewport testing
- **Dostępność (a11y)**:
  - Automatyczne audyty z axe-core
  - Testowanie nawigacji klawiaturą
  - Screen reader compatibility
  - Kontrast kolorów i rozmiar czcionek
  - ARIA labels i semantic HTML
- **Visual regression**:
  - Snapshoty komponentów w Storybook
  - Automatyczne wykrywanie zmian wizualnych przez Chromatic

### 4.6. API Endpoints

- **Auth endpoints** (`/api/auth/*`):
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - POST /api/auth/reset-password
  - POST /api/auth/reset-password-confirm
- **Flashcards endpoints** (`/api/flashcards`):
  - GET, POST, PUT, DELETE operations
  - Walidacja danych wejściowych
  - Autoryzacja (user-specific data)
- **Generations endpoints** (`/api/generations`):
  - POST dla nowych generacji
  - Obsługa długotrwałych operacji
- **Study session endpoints** (`/api/study-session`, `/api/study-stats`):
  - GET /api/study-session - pobieranie fiszek do powtórki (z parametrem `limit`)
  - POST /api/study-session - zapisywanie rezultatu powtórki (flashcard_id, rating)
  - GET /api/study-stats - statystyki nauki użytkownika
  - Walidacja z Zod schemas (`SubmitReviewCommand`)
  - Integracja z FSRS algorithm (ts-fsrs library)
  - Obsługa błędów (brak autoryzacji, nieprawidłowy rating, nieistniejąca karta)

### 4.7. Baza danych i migracje

- **Tabele w Supabase**:
  - `flashcards` - przechowywanie fiszek użytkowników
  - `generations` - historia generacji fiszek przez AI
  - `generation_error_logs` - logi błędów podczas generacji
  - `review_logs` - historia powtórek z danymi FSRS (nowa tabela dla US-008)
- **Migracja review_logs** (`20240320143004_create_review_logs_table.sql`):
  - Kolumny: id, flashcard_id, user_id, state, rating, due, stability, difficulty
  - Kolumny FSRS: elapsed_days, scheduled_days, reps, lapses, last_review
  - Foreign keys: flashcard_id → flashcards(id), user_id → auth.users(id)
  - Cascade deletion przy usuwaniu flashcard lub użytkownika
  - Timestamps: created_at, updated_at z automatycznymi wartościami
- **RLS Policies**:
  - Weryfikacja że użytkownicy mają dostęp tylko do swoich `review_logs`
  - Policy dla SELECT, INSERT, UPDATE based on user_id
  - Testy edge cases (próby dostępu do cudzych danych)

### 4.8. Bezpieczeństwo

- **RLS Policies w Supabase**:
  - Weryfikacja czy użytkownicy mają dostęp tylko do swoich danych
  - Testy dla ról `anon` i `authenticated`
  - Edge cases (próby dostępu do cudzych flashcards, review_logs)
- **Walidacja danych**:
  - SQL injection prevention
  - XSS protection
  - CSRF tokens (jeśli implementowane)
- **Secrets management**:
  - Weryfikacja czy klucze API nie wyciekają do frontendu
  - Sprawdzenie zmiennych środowiskowych

## 5. Środowisko testowe

- **Lokalne środowisko deweloperskie**:
  - Uruchomienie aplikacji na lokalnym serwerze Astro (`npm run dev`)
  - Dostęp do emulowanego środowiska Supabase (Supabase CLI)
  - Lokalne mockowanie API Openrouter przez MSW
- **Środowisko CI/CD**:
  - Testy automatyczne w Github Actions
  - Pipeline dla różnych typów testów (unit, integration, E2E)
  - Równoległe uruchamianie testów dla wydajności
- **Testowe środowisko backendowe**:
  - Osobna instancja testowa bazy danych Supabase
  - Dedykowane migracje i seedy dla testów
  - RLS policies testowane w izolacji od produkcji
- **Symulacja integracji z API AI**:
  - MSW do mockowania requestów do Openrouter
  - Sandbox environment dla Openrouter (jeśli dostępny)
  - Fixture data dla różnych scenariuszy odpowiedzi AI

## 6. Narzędzia do testowania

### 6.1. Warstwa jednostkowa i integracyjna

- **Vitest** - framework testowy zintegrowany z Vite/Astro, szybszy niż Jest
- **React Testing Library** - testowanie komponentów React z naciskiem na UX
- **Testing Library User Event** - symulacja zaawansowanych interakcji użytkownika
- **MSW 2.x** (Mock Service Worker) - mockowanie API HTTP na poziomie service worker
- **Supertest** - testowanie Astro API endpoints
- **@supabase/supabase-js mocks** - mockowanie klienta Supabase

### 6.2. Warstwa E2E

- **Playwright** (priorytet):
  - Playwright Test Runner z built-in assertions
  - Playwright Trace Viewer do debugowania testów
  - Cross-browser testing (Chromium, Firefox, WebKit)
  - Parallelizacja testów
  - Auto-waiting i retry mechanisms

### 6.3. Visual Regression

- **Storybook 8.x** - izolowane testowanie i dokumentacja komponentów UI
- **Chromatic** - automatyczne visual regression testing dla Storybook
- Alternatywnie: **Playwright Screenshots** + **Percy/Argos CI**

### 6.4. Testy wydajnościowe

- **Lighthouse CI** - audyt wydajności, dostępności i SEO w pipeline
- **Artillery** - testy obciążeniowe i wydajnościowe (łatwiejsza konfiguracja niż k6)
- **WebPageTest API** - szczegółowa analiza wydajności (opcjonalnie)

### 6.5. Testy dostępności (a11y)

- **axe-core** - silnik do audytów dostępności
- **@axe-core/playwright** - integracja z Playwright
- **Pa11y** - dodatkowe automatyczne audyty dostępności w CI

### 6.6. Specyficzne dla Astro

- **Astro Test Utils** - pomocnicze narzędzia do testowania komponentów .astro
- **Vite Plugin Test** - integracja testów z build process

### 6.7. Monitoring i analiza

- **Codecov** lub **Coveralls** - śledzenie pokrycia kodu testami
- **Sentry** - error tracking w testach E2E i produkcji
- **Grafana/Prometheus** - monitoring wydajności testów (opcjonalnie)

### 6.8. Contract Testing

- **Pactum** - weryfikacja kontraktów API z Openrouter

## 7. Harmonogram testów

### Faza 1: Przygotowanie (1-2 tygodnie)

- Konfiguracja Vitest i React Testing Library
- Setup Playwright z konfiguracją dla różnych przeglądarek
- Konfiguracja MSW dla mockowania API
- Przygotowanie środowiska testowego Supabase
- Setup Storybook dla komponentów UI
- Implementacja pierwszych testów jednostkowych dla krytycznych serwisów
- Konfiguracja CI/CD pipeline w Github Actions

### Faza 2: Implementacja testów jednostkowych i integracyjnych (2-3 tygodnie)

- Testy dla wszystkich serwisów (`flashcard.service.ts`, `generation.service.ts`, `openrouter.service.ts`)
- Testy komponentów UI (wszystkie komponenty w `/src/components`)
- Testy komponentów Shadcn UI z custom props
- Testy middleware (`/src/middleware/index.ts`)
- Testy API endpoints z Supertest
- Implementacja testów integracyjnych dla flow autentykacji

### Faza 3: Implementacja testów E2E (2-3 tygodnie)

- Scenariusze rejestracji i logowania
- Flow generowania flashcards end-to-end
- Zarządzanie flashcards (CRUD operations)
- Testy różnych ścieżek użytkownika (happy paths i edge cases)
- Cross-browser testing
- Mobile responsive testing

### Faza 4: Testy zaawansowane (1-2 tygodnie)

- Wdrożenie testów dostępności (a11y) z axe-core
- Visual regression testing ze Storybook i Chromatic
- Testy wydajnościowe z Lighthouse CI
- Testy obciążeniowe z Artillery
- Testy bezpieczeństwa (RLS policies, XSS, injection)
- Contract testing dla API Openrouter

### Faza 5: Optymalizacja i dokumentacja (1 tydzień)

- Optymalizacja czasu wykonania testów
- Refaktoryzacja i DRY dla test helpers
- Dokumentacja testów i scenariuszy
- Code review testów
- Finalizacja coverage reports

### Faza 6: Ciągła integracja (ongoing)

- Automatyczne uruchamianie testów przy każdym PR
- Daily regression testing
- Weekly full test suite
- Monitoring i alerting dla flaky tests
- Regularne aktualizacje dependencies

## 8. Kryteria akceptacji testów

### 8.1. Pokrycie kodu

- **Minimum 80% pokrycia** dla testów jednostkowych i integracyjnych
- **100% pokrycia** dla krytycznej logiki biznesowej (auth, payments - jeśli implementowane)
- **90%+ pokrycia** dla serwisów (`*.service.ts`)

### 8.2. Testy E2E

- Wszystkie **krytyczne ścieżki użytkownika** przechodzą bez błędów:
  - Rejestracja → Logowanie → Generowanie flashcards → Zarządzanie
  - Resetowanie hasła flow
  - Obsługa błędów i edge cases
- Testy E2E działają stabilnie (< 5% flaky tests)

### 8.3. Wydajność

- Brak **krytycznych błędów** wykrytych podczas testów wydajnościowych
- Lighthouse Score:
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 90
  - SEO: > 90
- Time to Interactive (TTI) < 3s
- First Contentful Paint (FCP) < 1.5s

### 8.4. Dostępność

- **Zero krytycznych błędów a11y** z axe-core
- Wszystkie interaktywne elementy dostępne przez klawiaturę
- Proper ARIA labels i semantic HTML
- WCAG 2.1 Level AA compliance

### 8.5. Bezpieczeństwo

- Wszystkie **RLS policies w Supabase** działają poprawnie
- Brak wycieków secrets/API keys do frontendu
- Walidacja danych wejściowych na wszystkich endpointach
- Proper error handling bez ujawniania wrażliwych informacji

### 8.6. Visual Regression

- Brak **niezamierzonych zmian wizualnych** w komponentach UI
- Wszystkie snapshoty zatwierdzone w Chromatic

### 8.7. CI/CD

- Wszystkie testy **przechodzą w CI/CD pipeline** przed merge
- Czas wykonania całego test suite < 15 minut
- Zero błędów w linterze i type checker

## 9. Role i odpowiedzialności

### 9.1. Inżynierowie QA

- Opracowywanie i utrzymywanie testów jednostkowych, integracyjnych oraz E2E
- Weryfikacja poprawności implementacji według kryteriów akceptacji
- Zarządzanie test fixtures i mockami
- Code review testów innych developerów
- Analiza flaky tests i optymalizacja stabilności
- Raportowanie metryk (coverage, execution time)

### 9.2. Deweloperzy (Frontend/Fullstack)

- Współpraca przy pisaniu testów jednostkowych dla własnego kodu
- Implementacja testów komponentów UI
- Wdrażanie poprawek na podstawie raportów z testów
- Utrzymywanie Storybook stories dla komponentów
- Test-Driven Development (TDD) dla nowych features

### 9.3. Deweloperzy (Backend/Fullstack)

- Testy API endpoints z Supertest
- Testy serwisów backendowych
- Weryfikacja RLS policies w Supabase
- Testy integracji z zewnętrznymi API (Openrouter)
- Przygotowanie test fixtures dla bazy danych

### 9.4. Kierownik projektu / Tech Lead

- Koordynacja harmonogramu testów
- Monitorowanie wyników w pipeline'ach CI/CD
- Decyzje o priorytetach testowych
- Code review complex test scenarios
- Alokacja zasobów dla testowania

### 9.5. DevOps / Specjalista ds. środowiska testowego

- Konfiguracja i utrzymanie środowisk testowych (lokalnych i CI/CD)
- Setup Github Actions workflows
- Integracja z narzędziami (Chromatic, Codecov, Sentry)
- Monitoring wydajności pipeline'ów
- Zarządzanie secrets i zmiennymi środowiskowymi

### 9.6. UX/UI Designer

- Definiowanie kryteriów visual regression testing
- Review Storybook stories
- Weryfikacja zgodności implementacji z designem
- Testy dostępności (a11y) - wsparcie eksperckie

## 10. Procedury raportowania błędów

### 10.1. Automatyczne raportowanie

- **Github Actions**: Automatyczne komentarze w PR z wynikami testów
- **Codecov**: Raporty pokrycia kodu bezpośrednio w PR
- **Chromatic**: Visual diff reports w PR
- **Sentry**: Automatyczne tworzenie issues dla uncaught errors w testach E2E
- **Slack/Discord notifications**: Powiadomienia o failed builds

### 10.2. Struktura raportu błędu

Każdy bug report powinien zawierać:

- **Tytuł**: Zwięzły opis problemu
- **Priorytet**: Critical / High / Medium / Low
- **Typ testu**: Unit / Integration / E2E / Performance / A11y
- **Kroki do reprodukcji**: Szczegółowa lista kroków
- **Oczekiwany rezultat**: Co powinno się wydarzyć
- **Aktualny rezultat**: Co się faktycznie dzieje
- **Environment**: Browser, OS, Node version, etc.
- **Screenshots/Videos**: Playwright trace, screenshots
- **Logi**: Console errors, stack traces
- **Related code**: Link do pliku i linii kodu

### 10.3. Workflow zarządzania błędami

1. **Automatyczne tworzenie issue** w Github Issues dla failed tests
2. **Triage** - team lead ocenia priorytet w ciągu 24h
3. **Assignment** - przypisanie do odpowiedniego developera
4. **Fix** - implementacja poprawki z testem reprodukującym bug
5. **Review** - code review i weryfikacja czy test teraz przechodzi
6. **Merge** - po zatwierdzeniu merge do main branch
7. **Verification** - QA weryfikuje fix w środowisku testowym
8. **Close** - zamknięcie issue z odpowiednim labelem

### 10.4. Spotkania i komunikacja

- **Daily stand-ups**: Krótkie updates o statusie testów
- **Weekly test review**: Analiza metryk (coverage, flaky tests, execution time)
- **Post-mortem meetings**: Po krytycznych bugach w produkcji
- **Retrospectives**: Co 2 tygodnie - co można ulepszyć w procesie testowania

### 10.5. Dokumentacja i baza wiedzy

- **Test documentation** w README projektu
- **Known issues** - dokumentacja znanych problemów i workaroundów
- **Test patterns** - wiki z przykładami dobrych praktyk testowych
- **Flaky tests log** - śledzenie niestabilnych testów i ich rozwiązań
- **Performance benchmarks** - historyczne dane wydajnościowe

### 10.6. Metryki i KPI

Regularne raportowanie:

- **Test coverage** - trend w czasie
- **Test execution time** - optymalizacja
- **Flaky test rate** - < 5% target
- **Bug escape rate** - ile bugów dostało się do produkcji
- **Mean time to resolution** - średni czas naprawy bugów
- **Test automation rate** - % automated vs manual tests

---

## Załącznik A: Status implementacji testów (stan aktualny)

### A.1. Testy E2E - zaimplementowane

✅ **Login tests** (`e2e/auth/login.spec.ts`):
- 11 testów zaimplementowanych
- Wszystkie przechodzą stabilnie w trybie serial
- Page Object Model: `e2e/pages/LoginPage.ts`
- Scenariusze: layout, form interactions, error handling, navigation

✅ **Login with helpers tests** (`e2e/auth/login-with-helpers.spec.ts`):
- 4 testy zaimplementowanych
- Demonstracja użycia test helpers i Page Object Model
- Test users w `e2e/helpers/auth.helpers.ts`
- Wszystkie testy przechodzą

✅ **Example tests** (`e2e/example.spec.ts`):
- Podstawowe testy dla homepage i auth flow
- Visual regression testing example

### A.2. Konfiguracja testowa

✅ **Playwright config** (`playwright.config.ts`):
- Configured dla Chromium (single browser strategy)
- Workers: 3 lokalnie, 1 w CI
- Retry: 0 lokalnie, 2 w CI
- Timeouty i screenshots skonfigurowane
- `.env.test` dla test credentials

✅ **Test helpers**:
- `auth.helpers.ts` - funkcje pomocnicze dla autentykacji
- `TEST_USERS` - różne scenariusze użytkowników
- `loginAsUser()`, `clearAuthData()`, `verifyAuthRequired()`

✅ **Page Object Models**:
- `LoginPage.ts` - z metodami `login()`, `fillEmail()`, `fillPassword()`
- `AuthPage.ts` - bazowa klasa dla stron auth
- Built-in verification i timeouty

### A.3. Do zrobienia (TODO)

❌ **Testy dla Study Session**:
- Brak testów E2E dla `/study-session` page
- Brak testów dla `StudySessionView` komponentu
- Brak testów API dla `/api/study-session` i `/api/study-stats`

❌ **Testy jednostkowe**:
- Brak testów dla `StudySessionService`
- Brak testów dla integracji z `ts-fsrs`
- Brak testów dla `openrouter.service.ts`
- Brak testów dla komponentów React

❌ **Testy dla Logout**:
- Brak testów E2E dla flow wylogowania
- Brak testów dla `/api/auth/logout` endpoint

❌ **Testy dla My Flashcards**:
- Brak testów E2E dla `/my-flashcards` page
- Brak testów dla `MyFlashcardsView` komponentu

❌ **Visual regression testing**:
- Brak konfiguracji Storybook
- Brak Chromatic integration

❌ **Testy wydajnościowe**:
- Brak Lighthouse CI
- Brak testów obciążeniowych

### A.4. Znane problemy

⚠️ **Flaky test**: "should login with valid test user credentials"
- Czasami nie przechodzi przy równoległym uruchomieniu z innymi plikami testowymi
- Przyczyna: wysokie obciążenie serwera dev przy 3+ workerach
- Workaround: test przechodzi zawsze gdy uruchamiany sam
- Timeout zwiększony do 60s dla tego testu
- Status: AKCEPTOWALNE dla lokalnego developmentu

⚠️ **React state synchronization**
- Problem z race condition między Playwright fill() a React onChange
- Rozwiązane poprzez timeouty i verification steps w Page Object Model
- Może wymagać zwiększenia timeoutów na wolniejszych maszynach

### A.5. Metryki testów E2E (aktualny stan)

- **Całkowita liczba testów E2E**: 20
- **Testy przechodzące**: 19 (95%)
- **Testy skipped**: 1 (test wymagający testowego użytkownika)
- **Czas wykonania**: ~10-12s (sequential), ~35-45s (3 workers)
- **Stabilność**: 95% (1 flaky test akceptowalny)
- **Coverage**: Login flow w 100%, pozostałe flow 0%

---

## Załącznik B: Przykładowa konfiguracja narzędzi

### B.1. Vitest configuration (vitest.config.ts)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/mockData"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### B.2. Playwright configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
```

### B.3. MSW setup (src/test/mocks/handlers.ts)

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", () => {
    return HttpResponse.json({
      user: { id: "1", email: "test@example.com" },
    });
  }),

  http.get("/api/flashcards", () => {
    return HttpResponse.json({
      flashcards: [{ id: "1", front: "Test", back: "Answer" }],
    });
  }),
];
```

---

## Podsumowanie zmian względem oryginalnego planu

### ✅ Kluczowe ulepszenia:

1. **Vitest zamiast Jest** - lepsze dopasowanie do Astro/Vite
2. **Playwright jako priorytet** - stabilniejsze i szybsze testy E2E
3. **Dodano sekcję testów dostępności (a11y)** - obowiązkowe w 2025
4. **Storybook + Chromatic** - visual regression testing
5. **Artillery zamiast k6** - łatwiejsza konfiguracja
6. **Rozszerzono scenariusze testowe** - więcej szczegółów i edge cases
7. **Dodano testy API** - Supertest dla Astro endpoints
8. **Rozszerzono testy bezpieczeństwa** - RLS, XSS, injection
9. **Contract testing** - stabilność integracji z Openrouter
10. **Szczegółowe metryki i KPI** - mierzalne cele testowania
11. **Przykładowe konfiguracje** - gotowe do użycia snippety

---
