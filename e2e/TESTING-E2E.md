# Przewodnik po testach E2E

## Wymagania wstępne

1. **Plik `.env.test` musi istnieć** z następującymi zmiennymi:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   OPENROUTER_API_KEY=your-openrouter-key
   E2E_USERNAME=test-user@example.com
   E2E_PASSWORD=test-password
   E2E_USERNAME_ID=user-uuid-from-database
   BASE_URL=http://localhost:3000
   ```

2. **Użytkownik testowy musi istnieć w bazie danych**
   - Email i hasło muszą zgadzać się z `.env.test`
   - Możesz utworzyć użytkownika za pomocą: `npm run test:e2e:create-user`

## Jak uruchomić testy E2E

### Krok 1: Uruchom serwer deweloperski

**W PIERWSZYM terminalu:**

```bash
cd 10x-cards
npm run dev:e2e
```

Poczekaj aż zobaczysz komunikat, że serwer jest uruchomiony (domyślnie `http://localhost:3000`).

### Krok 2: Uruchom testy

**W DRUGIM terminalu:**

```bash
cd 10x-cards
npm run test:e2e
```

## Dostępne komendy testowe

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy w trybie UI (interaktywny)
npm run test:e2e:ui

# Uruchom testy z widoczną przeglądarką
npm run test:e2e:headed

# Uruchom testy w trybie debugowania
npm run test:e2e:debug

# Generator testów (codegen)
npm run test:e2e:codegen
```

## Struktura testów

Testy są uruchamiane w następującej kolejności:

1. **auth-tests** - Testy autentykacji, w tym setup zapisujący stan sesji
2. **flashcard-generation** - Testy generowania fiszek (używa zapisanego stanu)
3. **my-flashcards** - Testy zarządzania fiszkami (używa zapisanego stanu)
4. **study-session** - Testy sesji nauki (używa zapisanego stanu)
5. **cleanup** - Czyszczenie stanu autentykacji

**Ważne:** Testy używają **1 workera** (skonfigurowane w `playwright.config.ts`), aby zapobiec wzajemnemu zakłócaniu się testów poprzez sekwencyjne uruchamianie. Dzięki temu każdy test działa w izolacji bez konfliktów dotyczących stanu aplikacji czy bazy danych.

## Troubleshooting

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

## Ważne uwagi

- **Zawsze uruchamiaj serwer przed testami** - testy wymagają działającej aplikacji
- **Nie commituj `.env.test`** z rzeczywistymi danymi do repozytorium
- **Stan autentykacji** jest zapisywany w `.auth/user.json` i używany przez większość testów
- **Cleanup test** czyści stan autentykacji na końcu, aby nie commitować wrażliwych danych

