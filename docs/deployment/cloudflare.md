# 🚀 Cloudflare Pages Deployment

## Przegląd

Ten dokument zawiera kompletny przewodnik wdrażania aplikacji 10xCards na Cloudflare Pages - od szybkiego startu po szczegółową konfigurację i troubleshooting.

---

## ⚡ Quick Start Checklist

### ✅ Krok po kroku

#### 1️⃣ Utwórz projekt w Cloudflare Pages

- [ ] Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [ ] Workers & Pages → **Create application** → **Pages**
- [ ] Połącz z GitHub lub użyj Direct Upload
- [ ] Skonfiguruj projekt:
  - Production branch: `master`
  - Build command: `npm run build`
  - Build output: `dist`
- [ ] Zapisz nazwę projektu (używamy: `10x-cards`)

#### 2️⃣ Skonfiguruj zmienne środowiskowe w Cloudflare

W dashboardzie projektu: **Settings** → **Environment variables** → **Production**

- [ ] `PUBLIC_SUPABASE_URL`
- [ ] `PUBLIC_SUPABASE_KEY`
- [ ] `OPENROUTER_API_KEY`

#### 3️⃣ Wygeneruj Cloudflare API Token

- [ ] Dashboard → **My Profile** → **API Tokens**
- [ ] **Create Token** → wybierz template **Edit Cloudflare Pages**
- [ ] Skopiuj token (pojawi się tylko raz!)

#### 4️⃣ Znajdź Cloudflare Account ID

- [ ] W dashboardzie projektu Cloudflare Pages
- [ ] Sekcja **Overview** (po prawej stronie)
- [ ] Skopiuj **Account ID**

#### 5️⃣ Utwórz środowisko "production" w GitHub

- [ ] GitHub repo → **Settings** → **Environments**
- [ ] **New environment** → nazwa: `production`
- [ ] (Opcjonalnie) Skonfiguruj protection rules

#### 6️⃣ Dodaj sekrety do środowiska "production" w GitHub

**Sekrety aplikacji:**

- [ ] `PUBLIC_SUPABASE_URL`
- [ ] `PUBLIC_SUPABASE_KEY`
- [ ] `OPENROUTER_API_KEY`

**Sekrety Cloudflare:**

- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `CLOUDFLARE_ACCOUNT_ID`

#### 7️⃣ Uruchom deployment

**Opcja A: Automatycznie (zalecane)**

- [ ] Push zmian do gałęzi `master`
- [ ] Sprawdź status w **Actions** w GitHub

**Opcja B: Manualnie**

- [ ] GitHub → **Actions** → **Deploy to Cloudflare Pages**
- [ ] **Run workflow** → wybierz `master` → **Run workflow**

#### 8️⃣ Weryfikacja

- [ ] Cloudflare Dashboard → **Deployments** → status "Success"
- [ ] Otwórz URL: `https://10x-cards.pages.dev`
- [ ] Przetestuj kluczowe funkcje:
  - [ ] Logowanie
  - [ ] Generowanie fiszek
  - [ ] Zarządzanie fiszkami
  - [ ] Sesja nauki

---

## 📋 Szczegółowa Konfiguracja

### Co zostało skonfigurowane

#### 1. Adapter Cloudflare

Projekt został skonfigurowany do używania `@astrojs/cloudflare` adaptera:

```javascript
// astro.config.mjs
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
```

#### 2. GitHub Actions Workflow

Utworzono workflow `master.yml` dla automatycznego wdrażania na Cloudflare Pages:

- **Lokalizacja**: `.github/workflows/master.yml`
- **Trigger**: Push do gałęzi `master` lub manualne uruchomienie
- **Pipeline**: Lint → Unit Tests → Build → Deploy → Summary

Szczegółowa dokumentacja: [docs/deployment/ci-cd.md](./ci-cd.md)

#### 3. Zależności

Dodano niezbędne pakiety:

```json
{
  "dependencies": {
    "@astrojs/cloudflare": "^latest"
  }
}
```

---

## 🔧 Konfiguracja Zmiennych Środowiskowych

### W Cloudflare Pages

W ustawieniach projektu Cloudflare Pages:

1. Przejdź do **Settings** → **Environment variables**
2. Dodaj zmienne dla środowiska **Production**:

| Zmienna                | Wartość                          | Opis                                 |
| ---------------------- | -------------------------------- | ------------------------------------ |
| `PUBLIC_SUPABASE_URL`  | https://your-project.supabase.co | URL projektu Supabase (publicznie)   |
| `PUBLIC_SUPABASE_KEY`  | your-anon-key                    | Supabase anon key (publicznie)       |
| `OPENROUTER_API_KEY`   | your-api-key                     | OpenRouter API key dla AI (serwer)   |

### W GitHub Secrets

Dla automatycznego wdrażania przez GitHub Actions:

1. Przejdź do Settings → Environments → **production**
2. Dodaj sekrety:

#### Sekrety aplikacji:

- `PUBLIC_SUPABASE_URL` - URL projektu Supabase (dostępny publicznie)
- `PUBLIC_SUPABASE_KEY` - Supabase anon key (dostępny publicznie)
- `OPENROUTER_API_KEY` - OpenRouter API key (tylko serwer)

#### Sekrety Cloudflare:

- `CLOUDFLARE_API_TOKEN` - Token API z uprawnieniami Cloudflare Pages Edit
- `CLOUDFLARE_ACCOUNT_ID` - ID konta Cloudflare

---

## 🔑 Uzyskiwanie Danych Cloudflare

### Cloudflare API Token

1. Dashboard → **My Profile** → **API Tokens**
2. **Create Token** → **Edit Cloudflare Pages** template
3. Skopiuj wygenerowany token
4. Dodaj jako secret `CLOUDFLARE_API_TOKEN` w GitHub

**Wymagane uprawnienia:**

- Cloudflare Pages - Edit

### Cloudflare Account ID

1. Dashboard → wybierz projekt Cloudflare Pages
2. Account ID znajdziesz w sekcji **Overview** po prawej stronie
3. Format: `1234567890abcdef1234567890abcdef`
4. Dodaj jako secret `CLOUDFLARE_ACCOUNT_ID` w GitHub

---

## 🚀 Proces Wdrażania

### Automatyczne wdrażanie (zalecane)

1. Commit i push zmian do gałęzi `master`:

```bash
git add .
git commit -m "feat: your feature"
git push origin master
```

2. GitHub Actions automatycznie:

   - Uruchomi linting
   - Wykona testy jednostkowe
   - Zbuduje projekt
   - Wdroży na Cloudflare Pages

3. Sprawdź status w zakładce **Actions** w GitHub

### Manualne wdrażanie

1. Zbuduj projekt lokalnie:

```bash
npm run build
```

2. Wdróż przez Cloudflare Dashboard:

   - Workers & Pages → Twój projekt → **Deploy** → **Direct Upload**
   - Upload folder `dist/`

3. Lub użyj Wrangler CLI:

```bash
npx wrangler pages deploy dist
```

---

## 🏗️ Struktura Buildu

Po uruchomieniu `npm run build`, Cloudflare adapter generuje:

```
dist/
├── _worker.js           # Cloudflare Worker (server-side code)
├── _astro/             # Astro runtime i chunki
├── favicon.png         # Statyczne assety
└── [inne statyczne pliki]
```

---

## 🔍 Weryfikacja Wdrożenia

### Po wdrożeniu sprawdź:

1. **Cloudflare Dashboard**:

   - Workers & Pages → Twój projekt → **Deployments**
   - Status: "Success"
   - URL: https://your-project.pages.dev

2. **Logi deploymentu**:

   - Kliknij w konkretne wdrożenie
   - Sprawdź logi budowania i wdrażania

3. **Funkcjonalność**:
   - Otwórz aplikację w przeglądarce
   - Sprawdź czy logowanie działa
   - Przetestuj generowanie fiszek
   - Sprawdź sesję nauki

---

## ⚠️ Troubleshooting

### Problem 1: "Missing secrets" w GitHub Actions

**Objawy:**

- Workflow kończy się błędem "Secret not found"
- Build nie może się rozpocząć

**Możliwe przyczyny:**

1. Sekrety nie zostały dodane w środowisku `production`
2. Błędna pisownia nazw sekretów
3. Workflow nie używa środowiska `production`

**Rozwiązanie:**

1. GitHub → Settings → Environments → `production`
2. Sprawdź czy wszystkie sekrety są dodane:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_KEY`
   - `OPENROUTER_API_KEY`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Zweryfikuj pisownię nazw (dokładnie jak w workflow)
4. Upewnij się że workflow ma `environment: production`

### Problem 2: Build kończy się błędem

**Objawy:**

- GitHub Actions workflow kończy się na etapie buildu
- Komunikaty o brakujących zależnościach lub błędach TypeScript

**Możliwe przyczyny:**

1. Brakujące zmienne środowiskowe podczas buildu
2. Błędy TypeScript w kodzie
3. Brakujące zależności

**Rozwiązanie:**

1. Sprawdź logi GitHub Actions dla szczegółów błędu
2. Zweryfikuj czy wszystkie zmienne środowiskowe są ustawione jako sekrety
3. Przetestuj build lokalnie: `npm run build`
4. Sprawdź czy wszystkie zależności są zainstalowane: `npm ci`

### Problem 3: "Invalid API token"

**Objawy:**

- Build się udaje
- Deployment kończy się błędem: "Invalid API token" lub "Authentication failed"

**Przyczyna:**

- Nieprawidłowy lub wygasły Cloudflare API Token
- Token nie ma wymaganych uprawnień

**Rozwiązanie:**

1. Wygeneruj nowy Cloudflare API Token:
   - Dashboard → My Profile → API Tokens
   - Create Token → **Edit Cloudflare Pages** template
2. Upewnij się że token ma uprawnienia "Cloudflare Pages - Edit"
3. Zaktualizuj sekret `CLOUDFLARE_API_TOKEN` w GitHub (Settings → Environments → production)
4. Ponownie uruchom workflow

### Problem 4: "Project not found"

**Objawy:**

- Build się udaje
- Deployment kończy się błędem: "Project not found" lub "404"

**Możliwe przyczyny:**

1. Projekt nie istnieje w Cloudflare Pages
2. Nieprawidłowa nazwa projektu w workflow
3. Nieprawidłowy Account ID

**Rozwiązanie:**

1. Sprawdź czy projekt istnieje w Cloudflare Pages:
   - Dashboard → Workers & Pages → Sprawdź listę projektów
2. Zweryfikuj nazwę projektu w workflow (`.github/workflows/master.yml`):
   - Powinno być: `--project-name=10x-cards`
3. Sprawdź czy `CLOUDFLARE_ACCOUNT_ID` jest poprawny:
   - Dashboard → Workers & Pages → Twój projekt → Overview → Account ID

### Problem 5: Aplikacja nie działa po wdrożeniu

**Objawy:**

- Build i deployment się udaje
- Strona wyświetla błędy 500 lub nie ładuje się

**Możliwe przyczyny:**

1. Brakujące zmienne środowiskowe w Cloudflare Pages
2. Niezgodność runtime Cloudflare z kodem Node.js
3. Użycie niekompatybilnych modułów Node.js

**Rozwiązanie:**

1. Sprawdź zmienne środowiskowe w Cloudflare Dashboard (Settings → Environment variables)
2. Sprawdź logi Cloudflare Functions (Dashboard → Logs)
3. Zweryfikuj czy używasz tylko kompatybilnych z Cloudflare API:
   - Używaj Web Crypto API zamiast Node.js `crypto`
   - Unikaj modułów `fs`, `path`, `os`
4. Zobacz sekcję "Cloudflare Workers Constraints" w [CLAUDE.md](../../CLAUDE.md)

### Problem 6: "Invalid binding `SESSION`"

**Objawy:**

- Ostrzeżenie podczas buildu o brakującym bindingu `SESSION`

**Przyczyna:**

- Cloudflare adapter domyślnie włącza sesje z KV

**Rozwiązanie:**
Jeśli nie używasz sesji Cloudflare KV (używasz Supabase Auth), możesz zignorować to ostrzeżenie lub skonfigurować KV binding w `wrangler.toml`.

### Problem 7: Obrazy nie działają

**Objawy:**

- Ostrzeżenie: "Cloudflare does not support sharp at runtime"

**Przyczyna:**

- Cloudflare nie wspiera biblioteki Sharp do przetwarzania obrazów

**Rozwiązanie:**
W `astro.config.mjs` dodaj:

```javascript
export default defineConfig({
  image: {
    service: "compile", // Optymalizacja obrazów podczas buildu
  },
  // ... reszta konfiguracji
});
```

---

## 📊 Monitoring i Debugging

### Logi Produkcyjne

1. **Cloudflare Dashboard**:

   - Workers & Pages → Twój projekt → **Logs**
   - Real-time logs z Cloudflare Workers

2. **Analytics**:
   - Workers & Pages → Twój projekt → **Analytics**
   - Metryki wydajności i użycia

### GitHub Actions

1. **Actions Summary**:

   - Repository → Actions → wybrany workflow run
   - Podsumowanie wszystkich kroków

2. **Artefakty**:
   - `unit-test-coverage` - pokrycie kodu (30 dni retencji)
   - `dist` - zbudowana aplikacja (7 dni retencji)

---

## 🔄 Rollback

Jeśli wdrożenie zawiera błędy:

1. **Cloudflare Dashboard**:

   - Workers & Pages → Twój projekt → **Deployments**
   - Znajdź poprzednie działające wdrożenie
   - Kliknij **...** → **Rollback to this deployment**

2. **GitHub**:
   - Wróć do poprzedniego commita
   - Push do gałęzi `master`
   - Automatyczne wdrożenie poprzedniej wersji

---

## 🚀 Optymalizacja Wydajności

### Caching

Cloudflare automatycznie cachuje:

- Statyczne assety (CSS, JS, obrazy)
- HTML przy użyciu Cache-Control headers

### Edge Locations

- Cloudflare Pages jest automatycznie dystrybuowany globalnie
- Aplikacja serwowana z najbliższej lokalizacji użytkownika

### Best Practices

1. **Minimalizuj bundle size**:

   - Code splitting w Astro
   - Lazy loading komponentów React

2. **Optymalizuj obrazy**:

   - Użyj format WebP
   - Skonfiguruj `imageService: "compile"`

3. **Wykorzystaj cache**:
   - Statyczne assety z długim cache time
   - API responses z odpowiednimi Cache-Control headers

---

## 📚 Dodatkowe Zasoby

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Workers Runtime API](https://developers.cloudflare.com/workers/runtime-apis/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions CI/CD](./ci-cd.md) - Szczegóły workflow

---

## 🆘 Pomoc

Jeśli napotkasz problemy:

1. Sprawdź logi w Cloudflare Dashboard
2. Zweryfikuj zmienne środowiskowe
3. Sprawdź GitHub Actions logs
4. Przeczytaj [Cloudflare Troubleshooting](https://developers.cloudflare.com/pages/platform/known-issues/)
5. Zobacz [Troubleshooting Deployment](./troubleshooting.md) dla więcej rozwiązań
