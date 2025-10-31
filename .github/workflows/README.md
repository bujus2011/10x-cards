# GitHub Actions Workflows

## 📋 Spis treści

- [Pull Request CI](#pull-request-ci)
- [Wymagane sekrety](#wymagane-sekrety)
- [Wymagane środowiska](#wymagane-środowiska)

---

## Pull Request CI

**Plik:** `pull-request.yml`

### 🎯 Cel

Automatyczne testowanie i walidacja kodu w Pull Requestach do gałęzi `master`.

### 🔄 Przepływ pracy

Workflow składa się z 4 jobów wykonywanych w określonej kolejności:

```
┌──────────┐
│   Lint   │  ← Krok 1: Lintowanie kodu (ESLint)
└────┬─────┘
     │
     ├─────────────────────┐
     │                     │
┌────▼─────┐         ┌────▼─────┐
│Unit Tests│         │E2E Tests │  ← Krok 2: Testy równoległe
└────┬─────┘         └────┬─────┘
     │                     │
     └─────────┬───────────┘
               │
         ┌─────▼──────┐
         │   Status   │  ← Krok 3: Komentarz z podsumowaniem
         │  Comment   │
         └────────────┘
```

### 📝 Szczegółowy opis jobów

#### 1️⃣ **Lint** - Lintowanie kodu
- **Uruchamia się:** Zawsze jako pierwszy
- **Funkcje:**
  - Sprawdzenie kodu za pomocą ESLint
  - Weryfikacja standardów kodowania
- **Polecenie:** `npm run lint`

#### 2️⃣ **Unit Tests** - Testy jednostkowe
- **Uruchamia się:** Równolegle z E2E Tests, po sukcesie Lint
- **Funkcje:**
  - Uruchomienie testów jednostkowych (Vitest)
  - Zbieranie coverage testów
  - Upload artefaktów z pokryciem kodu
- **Polecenie:** `npm run test:coverage`
- **Artefakty:** `unit-test-coverage` (katalog `coverage/`)

#### 3️⃣ **E2E Tests** - Testy end-to-end
- **Uruchamia się:** Równolegle z Unit Tests, po sukcesie Lint
- **Środowisko:** `integration`
- **Funkcje:**
  - Instalacja przeglądarki Chromium (Playwright)
  - Uruchomienie testów E2E
  - Zbieranie coverage i raportów
  - Upload artefaktów
- **Polecenie:** `npm run test:e2e`
- **Przeglądarka:** Chromium (zgodnie z `playwright.config.ts`)
- **Artefakty:** 
  - `playwright-report` (katalog `playwright-report/`)
  - `e2e-test-coverage` (katalog `test-results/`)

#### 4️⃣ **Status Comment** - Komentarz statusu
- **Uruchamia się:** Zawsze po zakończeniu wszystkich poprzednich jobów (`if: always()`)
- **Warunek sukcesu:** Wszystkie 3 poprzednie joby muszą zakończyć się sukcesem
- **Funkcje:**
  - Dodanie komentarza do PR z podsumowaniem statusu
  - Link do szczegółów buildu
  - Tabela z wynikami wszystkich jobów

### 🔐 Wymagane sekrety

Workflow wymaga następujących sekretów w GitHub (Settings → Secrets and variables → Actions):

| Sekret | Opis | Wymagany dla |
|--------|------|--------------|
| `SUPABASE_URL` | URL projektu Supabase | E2E Tests |
| `SUPABASE_KEY` | Klucz API Supabase (anon key) | E2E Tests |
| `OPENROUTER_API_KEY` | Klucz API OpenRouter dla AI | E2E Tests |
| `E2E_USERNAME_ID` | ID użytkownika testowego | E2E Tests |
| `E2E_USERNAME` | Email użytkownika testowego | E2E Tests |
| `E2E_PASSWORD` | Hasło użytkownika testowego | E2E Tests |
| `BASE_URL` | URL aplikacji do testowania | E2E Tests |

### 🌍 Wymagane środowiska

Workflow używa środowiska GitHub Environment:

- **`integration`** - Środowisko dla testów E2E
  - Sekrety dla tego środowiska muszą być skonfigurowane w: Settings → Environments → integration

### ⚙️ Konfiguracja techniczna

#### Wersje Node.js
- Wersja Node.js jest pobierana z pliku `.nvmrc` w głównym katalogu projektu
- Aktualnie: `22.14.0`

#### Wersje GitHub Actions
- `actions/checkout@v5` - Pobranie kodu
- `actions/setup-node@v6` - Instalacja Node.js
- `actions/upload-artifact@v5` - Upload artefaktów
- `actions/github-script@v8` - Tworzenie komentarzy w PR

#### Cache
- Cache npm jest włączony dla szybszych buildów
- Wykorzystuje wbudowany mechanizm `actions/setup-node`

### 🚀 Triggery

Workflow uruchamia się automatycznie przy:

```yaml
pull_request:
  branches:
    - master
  types:
    - opened      # Otwarcie nowego PR
    - synchronize # Push do istniejącego PR
    - reopened    # Ponowne otwarcie PR
```

### 📊 Artefakty

Po zakończeniu workflow, dostępne są następujące artefakty (przez 30 dni):

1. **unit-test-coverage** 
   - Pokrycie kodu testami jednostkowymi
   - Format: HTML, JSON, text (konfiguracja w `vitest.config.ts`)

2. **playwright-report**
   - Raport HTML z testów Playwright
   - Screenshoty i wideo z niepowodzeń

3. **e2e-test-coverage**
   - Szczegółowe wyniki testów E2E
   - Trace files dla debugowania

### 💡 Best Practices

1. **Instalacja zależności:** Używamy `npm ci` zamiast `npm install` dla spójności z `package-lock.json`
2. **Wersjonowanie akcji:** Używamy najnowszych wersji MAJOR wszystkich akcji
3. **Cache:** Cache npm przyspiesza instalację zależności
4. **Równoległość:** Testy jednostkowe i E2E uruchamiają się równolegle dla szybszości
5. **Artefakty:** `if: always()` zapewnia upload artefaktów nawet w przypadku niepowodzenia testów

### 📖 Dodatkowe informacje

- Workflow jest zgodny z wytycznymi z `.cursor/rules/github-action.mdc`
- Konfiguracja testów jednostkowych: `vitest.config.ts`
- Konfiguracja testów E2E: `playwright.config.ts`
- Stack technologiczny: `10x-cards/.ai/tech-stack.md`

### 🐛 Rozwiązywanie problemów

#### Job "Lint" się nie powiódł
- Uruchom lokalnie: `npm run lint`
- Naprawa: `npm run lint:fix`

#### Job "Unit Tests" się nie powiódł
- Uruchom lokalnie: `npm run test`
- Z UI: `npm run test:ui`
- Watch mode: `npm run test:watch`

#### Job "E2E Tests" się nie powiódł
- Sprawdź czy wszystkie sekrety są poprawnie skonfigurowane
- Uruchom lokalnie: `npm run test:e2e`
- Debug mode: `npm run test:e2e:debug`
- Sprawdź środowisko `integration` w ustawieniach repozytorium

#### Brak komentarza w PR
- Sprawdź uprawnienia workflow (Settings → Actions → General → Workflow permissions)
- Workflow musi mieć uprawnienie `write` dla `pull-requests`

---

## 📚 Przydatne linki

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Project README](../../README.md)

