# 🧪 Przewodnik Testowania

## Przegląd

Ten dokument zawiera kompletny przewodnik testowania aplikacji 10xCards, obejmujący testy jednostkowe, integracyjne oraz end-to-end.

---

## 📑 Spis Treści

- [Rodzaje Testów](#rodzaje-testów)
- [Testy Jednostkowe z Vitest](#testy-jednostkowe-z-vitest)
- [Testy E2E z Playwright](#testy-e2e-z-playwright)
- [Uruchamianie Testów](#uruchamianie-testów)
- [Best Practices](#best-practices)

---

## Rodzaje Testów

Projekt używa dwóch komplementarnych frameworków testowych:

- **Vitest** - Szybkie testy jednostkowe i integracyjne dla komponentów i narzędzi
- **Playwright** - Testy end-to-end dla pełnych przepływów użytkownika

---

## 🧪 Testy Jednostkowe z Vitest

### Konfiguracja

Vitest jest skonfigurowany w `vitest.config.ts` z:

- Środowisko jsdom dla testowania DOM
- Integracja z React Testing Library
- Aliasy ścieżek zgodne z głównym projektem
- Raportowanie pokrycia kodu z v8

### Lokalizacja Testów

Umieszczaj testy jednostkowe w jednej z tych lokalizacji:

- `src/tests/` - Ogólne testy jednostkowe
- `src/components/__tests__/` - Testy komponentów (obok komponentu)
- `src/lib/__tests__/` - Testy serwisów/narzędzi

### Pisanie Testów Jednostkowych

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    const element = screen.getByRole('button');
    expect(element).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockFn = vi.fn();
    const { user } = render(<MyComponent onClick={mockFn} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockFn).toHaveBeenCalledOnce();
  });
});
```

### Best Practices dla Vitest

1. **Używaj obiektu `vi` do mocków** - Wykorzystuj `vi.fn()`, `vi.spyOn()`, i `vi.mock()`
2. **Wzorce fabryczne** - Umieszczaj mock factories na najwyższym poziomie
3. **Pliki setup** - Użyj `src/tests/setup.ts` dla globalnej konfiguracji
4. **Inline snapshots** - Użyj `toMatchInlineSnapshot()` dla czytelnych asercji
5. **Tryb watch** - Uruchamiaj `npm run test:watch` podczas developmentu
6. **Tryb UI** - Użyj `npm run test:ui` dla wizualnej eksploracji testów
7. **Bezpieczeństwo typów** - Upewnij się, że mocki zachowują oryginalne sygnatury typów

### Komendy Vitest

```bash
# Uruchom testy w trybie watch (zalecane podczas developmentu)
npm run test:watch

# Uruchom wszystkie testy raz
npm run test:run

# Uruchom z UI do wizualnej eksploracji
npm run test:ui

# Uruchom z raportem pokrycia kodu
npm run test:coverage

# Filtruj testy po nazwie
npm run test -- -t "nazwa komponentu"
```

---

## 🎭 Testy E2E z Playwright

### Wymagania Wstępne

#### 1. Plik `.env.test` jest wymagany

Utwórz plik `.env.test` z następującymi zmiennymi:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-key
E2E_USERNAME=test-user@example.com
E2E_PASSWORD=test-password
E2E_USERNAME_ID=user-uuid-from-database
BASE_URL=http://localhost:3000
```

#### 2. Użytkownik testowy musi istnieć w bazie danych

- Email i hasło muszą zgadzać się z `.env.test`
- Możesz utworzyć użytkownika za pomocą: `npm run test:e2e:create-user`

### Konfiguracja

Playwright jest skonfigurowany w `playwright.config.ts` z:

- Chromium/Desktop Chrome jako przeglądarka testowa
- **1 worker** - testy uruchamiane sekwencyjnie, aby uniknąć konfliktów
- Automatyczne uruchamianie serwera deweloperskiego
- Wsparcie dla testów regresji wizualnej
- Zbieranie trace przy pierwszym powtórzeniu

### Uruchamianie Testów E2E

**WAŻNE:** Testy E2E wymagają DWÓCH oddzielnych terminali:

#### Terminal 1 - Uruchom serwer deweloperski:

```bash
npm run dev:e2e
```

Poczekaj, aż serwer uruchomi się na `http://localhost:3000`

#### Terminal 2 - Uruchom testy:

```bash
# Uruchom wszystkie testy E2E (headless)
npm run test:e2e

# Uruchom z widoczną przeglądarką
npm run test:e2e:headed

# Uruchom w trybie UI Playwright
npm run test:e2e:ui

# Tryb debugowania z inspektorem
npm run test:e2e:debug

# Generator kodu testów (codegen)
npm run test:e2e:codegen
```

### Lokalizacja Testów E2E

Umieszczaj testy E2E w:

- `e2e/` - Wszystkie pliki testów end-to-end (\*.spec.ts)

### Pisanie Testów E2E

```typescript
import { test, expect } from "@playwright/test";

test.describe("Autentykacja użytkownika", () => {
  test("powinien umożliwić logowanie użytkownika", async ({ page }) => {
    await page.goto("/auth/login");

    // Wypełnij formularz
    await page.getByLabel(/email/i).fill("user@example.com");
    await page.getByLabel(/hasło/i).fill("password123");

    // Wyślij
    await page.getByRole("button", { name: /zaloguj/i }).click();

    // Zweryfikuj przekierowanie
    await expect(page).toHaveURL(/\/generate/);
  });

  test("powinien przechwycić regresję wizualną", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Porównanie wizualne
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
```

### Struktura Testów E2E

Testy są uruchamiane w określonej kolejności zależności:

1. **auth-tests** - Najpierw uruchamia `00-setup-auth.spec.ts` (alfabetycznie pierwszy), który zapisuje stan autentykacji do `.auth/user.json`, następnie waliduje funkcjonalność logowania
2. **flashcard-generation** - Używa zapisanego stanu autentykacji, testuje generowanie AI
3. **my-flashcards** - Używa zapisanego stanu autentykacji, testuje zarządzanie fiszkami (edycja, usuwanie)
4. **study-session** - Używa zapisanego stanu autentykacji, testuje algorytm powtórek rozłożonych
   - `00-setup-study-data.spec.ts` usuwa logi powtórek i zasiewa minimum 80 fiszek dla użytkownika testowego, zapewniając świeże dane dla wszystkich scenariuszy
5. **cleanup** - Czyści stan autentykacji i bazę danych (musi być uruchomiony ostatni)

**Ważne:** Testy używają **1 workera** (skonfigurowane w `playwright.config.ts`), aby zapobiec wzajemnemu zakłócaniu się testów poprzez sekwencyjne uruchamianie.

### Timeouty

- Timeouty specyficzne dla projektu skonfigurowane w `playwright.config.ts` (np. 180s dla generowania AI)

### Best Practices dla Playwright

1. **Page Object Model** - Organizuj testy z wielokrotnie używanymi obiektami stron
2. **Odporne selektory** - Używaj `getByRole`, `getByLabel` zamiast selektorów CSS
3. **Testowanie API** - Używaj kontekstu request Playwright do walidacji backendu
4. **Regresja wizualna** - Implementuj `toHaveScreenshot()` dla spójności UI
5. **Narzędzie Codegen** - Użyj `npm run test:e2e:codegen` do nagrywania testów
6. **Trace viewer** - Debuguj za pomocą trace przy błędach
7. **Hooki testowe** - Używaj `beforeEach`/`afterEach` do setup/teardown
8. **Sekwencyjne wykonanie** - Testy uruchamiane sekwencyjnie przy użyciu 1 workera, aby uniknąć zakłóceń

---

## 🐛 Troubleshooting

### Problem: `ERR_CONNECTION_REFUSED`

**Objawy:** Test kończy się błędem połączenia do `http://localhost:3000`

**Rozwiązanie:** Upewnij się, że serwer deweloperski jest uruchomiony:

```bash
npm run dev:e2e
```

### Problem: "Invalid login credentials"

**Objawy:** Test logowania kończy się błędem nieprawidłowych poświadczeń

**Rozwiązanie:**

1. Sprawdź czy użytkownik z `.env.test` istnieje w bazie danych
2. Upewnij się, że email i hasło są prawidłowe
3. Utwórz użytkownika testowego: `npm run test:e2e:create-user`

### Problem: Test timeout

**Objawy:** Testy przekraczają limit czasu

**Rozwiązanie:**

1. Sprawdź czy API OpenRouter działa (dla testów generowania)
2. Zwiększ timeout w `playwright.config.ts`
3. Sprawdź połączenie z Supabase

### Problem: Brak pokrycia kodu

**Objawy:** Raport pokrycia nie jest generowany

**Rozwiązanie:**

1. Uruchom: `npm run test:coverage`
2. Sprawdź katalog `coverage/` dla raportu HTML
3. Zweryfikuj konfigurację w `vitest.config.ts`

---

## 📊 Pokrycie Kodu

Raporty pokrycia są generowane w katalogu `coverage/` po uruchomieniu:

```bash
npm run test:coverage
```

Skup się na sensownych testach zamiast na arbitralnych procentach pokrycia. Krytyczne ścieżki powinny być zawsze pokryte.

---

## 🎯 Best Practices

### Ogólne Zasady Testowania

1. **Wczesne returny** - Obsługuj przypadki brzegowe na początku
2. **Obsługa błędów** - Testuj zarówno ścieżki sukcesu jak i błędów
3. **Znaczące nazwy** - Używaj opisowych nazw testów i bloków `describe`
4. **Wzorzec AAA** - Struktura Arrange, Act, Assert
5. **Izolowane testy** - Każdy test powinien być niezależny
6. **Sprzątanie** - Używaj hooków do czyszczenia po testach

### Testowanie Komponentów

1. **Podejście user-centric** - Testuj z perspektywy użytkownika
2. **Dostępność** - Używaj zapytań semantycznych (getByRole, getByLabel)
3. **Unikaj szczegółów implementacji** - Nie testuj wewnętrznego stanu
4. **Mockuj zewnętrzne zależności** - Izoluj zachowanie komponentu

### Testowanie E2E

1. **Przepływy użytkownika** - Testuj kompletne ścieżki użytkownika
2. **Krytyczne ścieżki** - Skup się na kluczowej funkcjonalności
3. **Zarządzanie stanem** - Używaj kontekstów przeglądarki do izolacji
4. **Warunki sieciowe** - Testuj z realistycznym zachowaniem sieci
5. **Regresja wizualna** - Wyłapuj niezamierzone zmiany UI

### Mockowanie

1. **Mockuj na granicach** - Mockuj zewnętrzne API, nie funkcje wewnętrzne
2. **Realistyczne mocki** - Trzymaj mocki blisko prawdziwego zachowania
3. **Fabryki mocków** - Twórz wielokrotnie używane generatory danych testowych
4. **Warunkowe mocki** - Obsługuj opcjonalne zależności z gracją

---

## 🔄 Continuous Integration

Testy powinny być uruchamiane w pipeline CI/CD:

```yaml
# Przykład workflow GitHub Actions
- name: Uruchom testy jednostkowe
  run: npm run test:run

- name: Uruchom testy E2E
  run: npm run test:e2e
```

Zobacz [docs/deployment/ci-cd.md](../deployment/ci-cd.md) dla szczegółów workflow.

---

## 🐞 Debugging

### Debugowanie Vitest

- Użyj `console.log()` w testach
- Dodaj `.only` aby uruchomić pojedynczy test: `it.only('nazwa testu', ...)`
- Użyj trybu UI: `npm run test:ui`

### Debugowanie Playwright

- Użyj trybu debug: `npm run test:e2e:debug`
- Zobacz trace w przeglądarce po uruchomieniu testu
- Użyj trybu headed aby obserwować testy: `npm run test:e2e:headed`
- Dodaj `await page.pause()` w testach do inspekcji

---

## ⚙️ Konfiguracja Testów

### Vitest (`vitest.config.ts`)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Playwright (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1, // Sekwencyjne wykonanie
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
```

---

## 📚 Zasoby

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 📝 Ważne Uwagi

- **Zawsze uruchamiaj serwer przed testami E2E** - testy wymagają działającej aplikacji
- **Nie commituj `.env.test`** z rzeczywistymi danymi do repozytorium
- **Stan autentykacji** jest zapisywany w `.auth/user.json` i używany przez większość testów E2E
- **Cleanup test** czyści stan autentykacji na końcu, aby uniknąć commitowania wrażliwych danych
- **Testy jednostkowe** powinny być szybkie (< 100ms na test)
- **Testy E2E** mogą być wolniejsze, ale powinny być niezawodne

---

## ✅ Szybki Start

### Dla testów jednostkowych:

```bash
npm run test:watch
```

### Dla testów E2E:

**Terminal 1:**

```bash
npm run dev:e2e
```

**Terminal 2:**

```bash
npm run test:e2e
```

---

## 🎯 Status Testów

| Typ Testów   | Framework  | Status        | Pokrycie                 |
| ------------ | ---------- | ------------- | ------------------------ |
| Jednostkowe  | Vitest     | ✅ Działają   | ~80%                     |
| Integracyjne | Vitest     | ✅ Działają   | ~70%                     |
| E2E          | Playwright | ✅ Działają   | Kluczowe ścieżki pokryte |
| Wizualne     | Playwright | ⚠️ Opcjonalne | -                        |
