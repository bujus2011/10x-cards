# ✅ Cloudflare Deployment - Checklist

## Co zostało zrobione

### 1. ✅ Zainstalowano i skonfigurowano Cloudflare adapter

- [x] Zainstalowano `@astrojs/cloudflare` package
- [x] Zaktualizowano `astro.config.mjs` z adapterem Cloudflare
- [x] Skonfigurowano `platformProxy` dla lokalnego developmentu
- [x] Zweryfikowano build - działa poprawnie

### 2. ✅ Utworzono GitHub Actions workflow

- [x] Utworzono `.github/workflows/master.yml`
- [x] Skonfigurowano pipeline: Lint → Unit Tests → Deploy (build + deploy)
- [x] Zweryfikowano najnowsze wersje akcji GitHub (listopad 2024)
- [x] Utworzono dokumentację workflow: `.github/workflows/README-MASTER.md`
- [x] Uproszczono workflow - build i deploy w jednym job

### 3. ✅ Przygotowano dokumentację

- [x] Utworzono `DEPLOYMENT-CLOUDFLARE.md` - pełny przewodnik wdrażania
- [x] Zaktualizowano `README.md` z informacjami o deploymencie
- [x] Opisano wymagane sekrety i zmienne środowiskowe

### 4. ✅ Zoptymalizowano workflow

- [x] Usunięto testy E2E z master workflow (tylko w PR)
- [x] Dodano job build osobno od deploy
- [x] Skonfigurowano artefakty dla coverage i buildu
- [x] Dodano deployment summary w GitHub Actions

## Co musisz zrobić

### Krok 1: Utwórz projekt w Cloudflare Pages

- [ ] Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [ ] Przejdź do **Workers & Pages**
- [ ] Kliknij **Create application** → **Pages**
- [ ] Połącz z GitHub lub użyj Direct Upload
- [ ] Zapisz **Project Name** - będzie potrzebny jako `CLOUDFLARE_PROJECT_NAME`

**Konfiguracja projektu:**
```
Project name: [twoja-unikalna-nazwa]
Production branch: master
Build command: npm run build
Build output directory: dist
```

### Krok 2: Skonfiguruj zmienne środowiskowe w Cloudflare

W dashboardzie projektu Cloudflare Pages:

- [ ] Przejdź do **Settings** → **Environment variables**
- [ ] Dodaj dla środowiska **Production**:
  - [ ] `SUPABASE_URL` = https://your-project.supabase.co
  - [ ] `SUPABASE_KEY` = your-supabase-anon-key
  - [ ] `OPENROUTER_API_KEY` = your-openrouter-api-key

### Krok 3: Wygeneruj Cloudflare API Token

- [ ] Dashboard → **My Profile** → **API Tokens**
- [ ] Kliknij **Create Token**
- [ ] Wybierz template **Edit Cloudflare Pages**
- [ ] Skopiuj wygenerowany token (pojawi się tylko raz!)
- [ ] Zapisz jako `CLOUDFLARE_API_TOKEN`

### Krok 4: Znajdź Cloudflare Account ID

- [ ] W dashboardzie projektu Cloudflare Pages
- [ ] Sekcja **Overview** po prawej stronie
- [ ] Skopiuj **Account ID** (format: `1234567890abcdef...`)
- [ ] Zapisz jako `CLOUDFLARE_ACCOUNT_ID`

### Krok 5: Utwórz środowisko "production" w GitHub

- [ ] Przejdź do Settings → Environments w repozytorium GitHub
- [ ] Kliknij **New environment**
- [ ] Nazwa: `production`
- [ ] (Opcjonalnie) Skonfiguruj protection rules:
  - [ ] Required reviewers (jeśli chcesz zatwierdzanie przed deploymentem)
  - [ ] Deployment branches: tylko `master`

### Krok 6: Dodaj sekrety do środowiska "production" w GitHub

W środowisku `production` dodaj następujące sekrety:

**Sekrety aplikacji:**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY`
- [ ] `OPENROUTER_API_KEY`

**Sekrety Cloudflare:**
- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] ~~`CLOUDFLARE_PROJECT_NAME`~~ - Nie jest potrzebny (hardcoded w workflow jako `10x-cards`)

Ścieżka: Settings → Environments → production → **Add secret**

### Krok 7: Przetestuj wdrożenie

#### Opcja A: Automatyczne wdrożenie

- [ ] Commit i push do gałęzi `master`:
```bash
git add .
git commit -m "feat: configure Cloudflare deployment"
git push origin master
```

- [ ] Sprawdź status w zakładce **Actions** w GitHub
- [ ] Zweryfikuj deployment w Cloudflare Dashboard

#### Opcja B: Manualne uruchomienie

- [ ] GitHub → Actions → **Deploy to Cloudflare Pages**
- [ ] Kliknij **Run workflow** → wybierz `master` → **Run workflow**
- [ ] Śledź postęp w logach

### Krok 8: Weryfikacja

Po zakończeniu deploymentu:

- [ ] Sprawdź status w Cloudflare Dashboard:
  - Workers & Pages → Twój projekt → **Deployments**
  - Status: "Success"
  - URL: `https://your-project.pages.dev`

- [ ] Otwórz aplikację w przeglądarce
- [ ] Przetestuj kluczowe funkcje:
  - [ ] Logowanie działa
  - [ ] Generowanie fiszek działa
  - [ ] Zarządzanie fiszkami działa
  - [ ] Sesja nauki działa

## Troubleshooting

### Problem: "Missing secrets" w GitHub Actions

**Rozwiązanie:**
1. Sprawdź czy wszystkie sekrety są dodane w środowisku `production`
2. Zweryfikuj pisownię nazw sekretów (dokładnie jak w workflow)
3. Upewnij się że workflow używa `environment: production`

### Problem: Build kończy się błędem

**Rozwiązanie:**
1. Sprawdź logi GitHub Actions
2. Zweryfikuj czy wszystkie zmienne środowiskowe są ustawione
3. Przetestuj build lokalnie: `npm run build`

### Problem: Deployment kończy się błędem "Invalid API token"

**Rozwiązanie:**
1. Wygeneruj nowy Cloudflare API Token
2. Upewnij się że token ma uprawnienia "Cloudflare Pages - Edit"
3. Zaktualizuj sekret `CLOUDFLARE_API_TOKEN` w GitHub

### Problem: "Project not found" w Cloudflare

**Rozwiązanie:**
1. Sprawdź czy projekt istnieje w Cloudflare Pages
2. Zweryfikuj poprawność `CLOUDFLARE_PROJECT_NAME`
3. Sprawdź czy `CLOUDFLARE_ACCOUNT_ID` jest poprawny

## Pomocne linki

- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [GitHub Repository Settings](../../settings)
- [Deployment Guide](./DEPLOYMENT-CLOUDFLARE.md)
- [Workflow Documentation](./.github/workflows/README-MASTER.md)

## Następne kroki po wdrożeniu

- [ ] Skonfiguruj custom domain w Cloudflare Pages (opcjonalnie)
- [ ] Włącz monitoring i analytics w Cloudflare
- [ ] Skonfiguruj alerty dla failed deployments
- [ ] Zoptymalizuj cache settings dla lepszej wydajności
- [ ] Przetestuj rollback procedure

## Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź [DEPLOYMENT-CLOUDFLARE.md](./DEPLOYMENT-CLOUDFLARE.md) - sekcja Troubleshooting
2. Przejrzyj logi GitHub Actions i Cloudflare
3. Sprawdź [Cloudflare Pages Known Issues](https://developers.cloudflare.com/pages/platform/known-issues/)

