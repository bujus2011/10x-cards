# Proces czyszczenia testów E2E

Ten katalog zawiera testy czyszczące, które uruchamiają się **JAKO OSTATNIE** w zestawie testów E2E. Proces czyszczenia wykonuje dwie krytyczne operacje:

## Przegląd

### 1. Czyszczenie bazy danych

Usuwa wszystkie dane testowe utworzone podczas testów E2E z następujących tabel Supabase:

- `review_logs` - Logi przeglądów sesji nauki
- `flashcards` - Wygenerowane fiszki
- `generations` - Rekordy generowania fiszek

Wszystkie dane są filtrowane według `user_id`, aby zapewnić usunięcie tylko danych użytkownika testowego.

### 2. Czyszczenie stanu autentykacji

Czyści plik `.auth/user.json`, aby usunąć wrażliwe dane autentykacyjne i zapewnić czysty stan dla następnego uruchomienia testów.

## Konfiguracja

### Wymagania wstępne

1. **Zmienne środowiskowe** w `.env.test`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
E2E_USERNAME=test@example.com
E2E_PASSWORD=YourSecurePassword123!
E2E_USERNAME_ID=your-user-uuid-here
BASE_URL=http://localhost:3000
```

2. **Uzyskanie ID użytkownika**:
   - Uruchom skrypt tworzenia użytkownika testowego:
     ```bash
     npm run test:e2e:create-user
     ```
   - Skrypt wyświetli ID użytkownika w wyniku
   - Dodaj to ID do `.env.test` jako `E2E_USERNAME_ID`

### Instrukcja krok po kroku

1. **Utwórz plik `.env.test`** w głównym katalogu projektu (skopiuj `.env.example`):

   ```bash
   cp .env.example .env.test
   ```

2. **Wypełnij dane dostępowe Supabase**:

   - Przejdź do Supabase Dashboard → Project Settings → API
   - Skopiuj `Project URL` → `SUPABASE_URL`
   - Skopiuj klucz `anon public` → `SUPABASE_KEY`

3. **Utwórz użytkownika testowego**:

   ```bash
   npm run test:e2e:create-user
   ```

4. **Zaktualizuj `.env.test`** zwróconym User ID jako `E2E_USERNAME_ID`

5. **Uruchom testy E2E z czyszczeniem**:
   ```bash
   npm run test:e2e
   ```

## Jak działa czyszczenie

### Kolejność wykonywania testów

Zgodnie z `playwright.config.ts`, testy uruchamiają się w tej kolejności:

1. **auth-tests** - Testy logowania/autentykacji
2. **flashcard-generation** - Testy generowania fiszek
3. **my-flashcards** - Testy zarządzania fiszkami
4. **study-session** - Testy sesji nauki
5. **cleanup** (zależności: wszystkie powyższe) - Czyszczenie bazy danych i autentykacji

### Plik testu czyszczącego

Plik: `cleanup-auth.spec.ts`

Test wykonuje:

```typescript
// 1. Czyszczenie bazy danych
- Usuwa z review_logs (najpierw ze względu na ograniczenie FK)
- Usuwa z flashcards
- Usuwa z generations

// 2. Czyszczenie stanu autentykacji
- Czyści plik .auth/user.json
```

## Zmienne środowiskowe

### Wymagane zmienne

| Zmienna           | Opis                         | Przykład                      |
| ----------------- | ---------------------------- | ----------------------------- |
| `SUPABASE_URL`    | URL projektu Supabase        | `https://project.supabase.co` |
| `SUPABASE_KEY`    | Klucz anonimowy Supabase     | `eyJhbGciOiJIUzI1NiIs...`     |
| `E2E_USERNAME_ID` | UUID użytkownika testowego   | `123e4567-e89b-12d3-a456...`  |

### Opcjonalne zmienne

| Zmienna        | Opis                     | Domyślne                |
| -------------- | ------------------------ | ----------------------- |
| `E2E_USERNAME` | Email użytkownika test.  | `test@example.com`      |
| `E2E_PASSWORD` | Hasło użytkownika test.  | `Test123456!`           |
| `BASE_URL`     | Bazowy URL aplikacji     | `http://localhost:3000` |

## Helpery

### Helper środowiskowy

Lokalizacja: `helpers/env.helpers.ts`

Zapewnia narzędzia do ładowania i walidacji zmiennych środowiskowych:

```typescript
import { loadE2EEnvironment, validateE2EEnvironment, getEnvVariable, isEnvVariableSet } from "../helpers";

// Załaduj wszystkie zmienne środowiskowe
const env = loadE2EEnvironment();

// Waliduj wymagane zmienne
validateE2EEnvironment(env);

// Pobierz konkretną zmienną z wartością domyślną
const url = getEnvVariable("SUPABASE_URL", "http://localhost:3000");

// Sprawdź czy zmienna jest ustawiona
if (isEnvVariableSet("E2E_USERNAME_ID")) {
  // Zmienna istnieje
}
```

## Debugowanie

### Sprawdź załadowane zmienne środowiskowe

Test czyszczący loguje szczegółowe informacje:

```
🧹 Rozpoczynanie procesu czyszczenia...

📊 Czyszczenie bazy danych Supabase...
  Usuwanie wpisów logów przeglądów...
  ✓ Usunięto 5 wpisów logów przeglądów
  Usuwanie fiszek...
  ✓ Usunięto 10 fiszek
  Usuwanie rekordów generowania...
  ✓ Usunięto 3 rekordy generowania

✓ Czyszczenie bazy danych zakończone pomyślnie

🔐 Czyszczenie stanu autentykacji...
  ✓ Stan autentykacji wyczyszczony
  ✓ Plik: /ścieżka/do/.auth/user.json

✓ Czyszczenie zakończone pomyślnie
```

### Brakujące zmienne środowiskowe

Jeśli `.env.test` jest niekompletny, zobaczysz:

```
⚠️  Czyszczenie bazy danych pominięte - brakujące zmienne środowiskowe:
   - SUPABASE_URL
   - SUPABASE_KEY
   - E2E_USERNAME_ID
```

### Problemy z połączeniem do bazy danych

- Zweryfikuj poprawność `SUPABASE_URL` i `SUPABASE_KEY`
- Sprawdź połączenie internetowe
- Zweryfikuj dostępność projektu Supabase
- Sprawdź Supabase Dashboard pod kątem problemów z usługą

## Ręczne uruchamianie czyszczenia

Jeśli potrzebujesz uruchomić czyszczenie osobno:

```bash
# Uruchom tylko testy czyszczące
npx playwright test --grep "cleanup"

# Uruchom czyszczenie w trybie headed do debugowania
npx playwright test --grep "cleanup" --headed

# Tryb debug z inspektorem przeglądarki
npx playwright test --grep "cleanup" --debug
```

## Rozwiązywanie problemów

### Błąd: "Cannot find .env.test file"

Rozwiązanie: Utwórz `.env.test` w głównym katalogu z wymaganymi zmiennymi

### Błąd: "E2E_USERNAME_ID is missing"

Rozwiązanie:

1. Uruchom `npm run test:e2e:create-user`
2. Skopiuj User ID z wyniku
3. Dodaj do `.env.test` jako `E2E_USERNAME_ID`

### Błąd: "Database cleanup failed"

Rozwiązanie:

1. Zweryfikuj poprawność `SUPABASE_URL` i `SUPABASE_KEY`
2. Sprawdź status usługi w Supabase Dashboard
3. Uruchom `npm run test:e2e:create-user` aby zweryfikować dane dostępowe

### Dane nie są usuwane

- Sprawdź czy `E2E_USERNAME_ID` odpowiada rzeczywistemu ID użytkownika testowego
- Zweryfikuj że dane należą do tego użytkownika w Supabase Dashboard
- Sprawdź polityki RLS (Row Level Security), które mogą blokować usuwanie

## Powiązane pliki

- **Test czyszczący**: `cleanup-auth.spec.ts`
- **Helper środowiskowy**: `../helpers/env.helpers.ts`
- **Konfiguracja Playwright**: `../../playwright.config.ts`
- **Tworzenie użytkownika testowego**: `../scripts/create-test-user.ts`
- **Typy bazy danych**: `../../src/db/database.types.ts`
- **Klient Supabase**: `../../src/db/supabase.client.ts`