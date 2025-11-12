# ⚙️ Konfiguracja Środowiska Deweloperskiego

## Przegląd

Ten przewodnik pomoże Ci skonfigurować środowisko deweloperskie dla projektu 10xCards. Proces obejmuje instalację wymaganych narzędzi, skonfigurowanie zmiennych środowiskowych oraz uruchomienie aplikacji lokalnie.

---

## 📋 Wymagania wstępne

### System Operacyjny

- **macOS**: 12.0 lub nowszy
- **Linux**: Ubuntu 20.04+, CentOS 8+, lub dystrybucja z glibc 2.28+
- **Windows**: Windows 10+ (wersja 21H1 lub nowszy) z WSL2

### Wymagane Narzędzia

| Narzędzie | Wersja | Wymagane? | Sprawdzenie |
|-----------|--------|------------|-------------|
| **Node.js** | 22.14.0 | ✅ Tak | `node --version` |
| **npm** | 10+ | ✅ Tak | `npm --version` |
| **Git** | 2.30+ | ✅ Tak | `git --version` |
| **VS Code** | Latest | ✅ Rekomendowane | - |

### Opcjonalne Narzędzia

- **nvm** (Node Version Manager) - do zarządzania wersjami Node.js
- **Docker** - do lokalnego środowiska bazy danych
- **Supabase CLI** - do zarządzania bazą danych

---

## 🛠️ Instalacja i Konfiguracja

### Krok 1: Klonowanie Repozytorium

```bash
# Sklonuj repozytorium
git clone https://github.com/przeprogramowani/10x-cards.git
cd 10x-cards

# Zainstaluj zależności
npm install
```

### Krok 2: Konfiguracja Node.js

Projekt wymaga dokładnie Node.js w wersji **22.14.0**. Użyj jednej z poniższych metod:

#### Opcja A: Użycie nvm (Rekomendowane)

```bash
# Zainstaluj nvm (jeśli nie masz)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restartuj terminal lub uruchom: source ~/.bashrc

# Użyj wymaganej wersji Node.js
nvm use

# Sprawdź wersję
node --version  # Powinno pokazać: v22.14.0
```

#### Opcja B: Bezpośrednia instalacja

Pobierz Node.js 22.14.0 z [oficjalnej strony](https://nodejs.org/) lub użyj menadżera pakietów:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS z Homebrew
brew install node@22
```

### Krok 3: Weryfikacja Instalacji

Uruchom sprawdzenie środowiska:

```bash
# Sprawdź wersje narzędzi
node --version    # v22.14.0
npm --version     # 10.x.x
git --version     # 2.30+

# Sprawdź instalację projektu
npm run check:env
```

---

## 🔧 Konfiguracja Zmienne Środowiskowe

### Pliki Konfiguracyjne

Projekt używa następujących plików środowiskowych:

- `.env` - Zmienne dla środowiska deweloperskiego
- `.env.test` - Zmienne dla testów
- `.env.example` - Szablon z wymaganymi zmiennymi

### Krok 1: Skopiuj Szablon

```bash
# Skopiuj szablon zmiennych środowiskowych
cp .env.example .env
cp .env.example .env.test
```

### Krok 2: Skonfiguruj Supabase

1. **Utwórz projekt Supabase** na [supabase.com](https://supabase.com)

2. **Skonfiguruj zmienne środowiskowe** w `.env`:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_KEY=your-anon-key

# OpenRouter API (dla generowania fiszek AI)
OPENROUTER_API_KEY=your-openrouter-api-key

# Test User (dla testów E2E)
E2E_USERNAME=test@example.com
E2E_PASSWORD=testpassword123
E2E_USERNAME_ID=your-test-user-uuid
```

### Krok 3: Migracje Bazy Danych

```bash
# Zainstaluj Supabase CLI (jeśli nie masz)
npm install -g supabase

# Zaloguj się do Supabase
supabase login

# Połącz z projektem
npm run supabase:link

# Uruchom migracje
npm run supabase:push
```

### Krok 4: Weryfikacja Konfiguracji

```bash
# Sprawdź zmienne środowiskowe
npm run check:env

# Sprawdź połączenie z bazą danych
npm run supabase:status
```

---

## 🚀 Uruchamianie Aplikacji

### Tryb Deweloperski

```bash
# Uruchom serwer deweloperski
npm run dev

# Aplikacja będzie dostępna na: http://localhost:3000
```

### Tryb Testowy (dla testów E2E)

```bash
# W osobnym terminalu uruchom serwer w trybie testowym
npm run dev:e2e

# Serwer będzie dostępny na porcie 3000 w trybie testowym
```

### Budowanie dla Produkcji

```bash
# Zbuduj aplikację
npm run build

# Podgląd buildu produkcyjnego
npm run preview
```

---

## 🧪 Testowanie Konfiguracji

### Uruchom Testy Jednostkowe

```bash
# Uruchom wszystkie testy jednostkowe
npm run test:run

# Uruchom testy z UI
npm run test:ui

# Generuj raport pokrycia
npm run test:coverage
```

### Uruchom Testy E2E

```bash
# Upewnij się, że serwer testowy działa (npm run dev:e2e w osobnym terminalu)

# Uruchom testy E2E
npm run test:e2e

# Uruchom testy z widocznym przeglądarką
npm run test:e2e:headed
```

### Uruchom Wszystkie Testy

```bash
# Uruchom zarówno testy jednostkowe jak i E2E
npm run test:all
```

---

## 🔍 Rozwiązywanie Problemów

### Częste Problemy

#### Problem: "Node version mismatch"

```bash
# Sprawdź aktualną wersję
node --version

# Użyj nvm do przełączenia wersji
nvm use

# Lub zainstaluj ponownie
nvm install 22.14.0
nvm use 22.14.0
```

#### Problem: "Cannot connect to Supabase"

```bash
# Sprawdź zmienne środowiskowe
cat .env | grep SUPABASE

# Sprawdź połączenie
npm run supabase:status

# Resetuj połączenie jeśli potrzeba
npm run supabase:reset
```

#### Problem: "Port 3000 is already in use"

```bash
# Znajdź proces używający portu
lsof -ti:3000 | xargs kill -9

# Lub użyj innego portu
npm run dev -- --port 3001
```

#### Problem: "Testy E2E nie działają"

```bash
# Upewnij się, że serwer testowy działa
npm run dev:e2e

# Sprawdź zmienne środowiskowe dla testów
npm run check:env:test

# Uruchom testy z debugowaniem
npm run test:e2e:debug
```

### Debugowanie

#### Logs Aplikacji

```bash
# Uruchom z dodatkowymi logami
DEBUG=* npm run dev
```

#### Logs Supabase

```bash
# Sprawdź status migracji
npm run supabase:status

# Zobacz szczegóły bazy
npm run supabase:reset -- --debug
```

---

## 📝 Następne Kroki

Po skonfigurowaniu środowiska:

1. **Przeczytaj CLAUDE.md** - Szczegółowy przegląd projektu
2. **Zapoznaj się z architekturą** - Zobacz [docs/architecture/](../architecture/)
3. **Przejrzyj istniejący kod** - Zacznij od `src/pages/` i `src/components/`
4. **Uruchom testy** - Upewnij się, że wszystko działa poprawnie
5. **Rozpocznij development** - Zobacz [docs/development/coding-standards.md](../development/coding-standards.md)

---

## 🆘 Uzyskaj Pomoc

Jeśli napotkasz problemy:

1. Sprawdź [Rozwiązywanie Problemów](#rozwiązywanie-problemów) powyżej
2. Zobacz [docs/deployment/troubleshooting.md](../deployment/troubleshooting.md)
3. Sprawdź istniejące issues na GitHub
4. Utwórz nowe issue z opisem problemu

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletny
