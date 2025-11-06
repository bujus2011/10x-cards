# 🚨 Troubleshooting - Cloudflare Deployment

## Problem: "Input required and not supplied: projectName"

### 🔍 Przyczyna

Akcja `cloudflare/pages-action@v1` wymaga parametru `projectName`, ale:
1. Sekret `CLOUDFLARE_PROJECT_NAME` nie jest ustawiony w środowisku `production`
2. Lub środowisko `production` nie jest poprawnie skonfigurowane w GitHub

### ✅ Rozwiązanie 1: Hardcode nazwy projektu (ZASTOSOWANE)

**Status:** ✅ Zaimplementowane

Ustawiono nazwę projektu bezpośrednio w workflow:

```yaml
- name: Publish to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: 10x-cards  # ← Hardcoded
    directory: dist
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Zalety:**
- ✅ Działa natychmiast
- ✅ Jeden sekret mniej do zarządzania
- ✅ Nazwa projektu zwykle nie jest wrażliwa

**Wady:**
- ❌ Jeśli zmienisz nazwę projektu w Cloudflare, musisz zaktualizować workflow

### 📝 Rozwiązanie 2: Skonfigurować sekret (OPCJONALNE)

Jeśli wolisz używać sekretów:

#### Krok 1: Utwórz środowisko production (jeśli nie istnieje)

1. Przejdź do: `Settings` → `Environments` w repozytorium GitHub
2. Kliknij `New environment`
3. Nazwa: `production`
4. Kliknij `Configure environment`

#### Krok 2: Dodaj sekret CLOUDFLARE_PROJECT_NAME

1. W środowisku `production`, sekcja `Environment secrets`
2. Kliknij `Add secret`
3. Name: `CLOUDFLARE_PROJECT_NAME`
4. Value: `10x-cards` (lub twoja nazwa projektu z Cloudflare Pages)
5. Kliknij `Add secret`

#### Krok 3: Zaktualizuj workflow (jeśli wybierzesz tę opcję)

```yaml
projectName: ${{ secrets.CLOUDFLARE_PROJECT_NAME }}
```

## Problem: "Artifact not found for name: dist"

### 🔍 Przyczyna

Job próbował pobrać artefakt `dist`, który nie został utworzony.

### ✅ Rozwiązanie (ZASTOSOWANE)

Połączono build i deploy w jeden job - projekt jest budowany i od razu wdrażany bez tworzenia artefaktów.

## Problem: "Missing environment variables" podczas buildu

### 🔍 Przyczyna

Brakujące sekrety `SUPABASE_KEY`, `SUPABASE_URL`, lub `OPENROUTER_API_KEY` w środowisku `production`.

### ✅ Rozwiązanie

1. Przejdź do: `Settings` → `Environments` → `production`
2. Dodaj brakujące sekrety:
   - `SUPABASE_KEY`
   - `SUPABASE_URL`
   - `OPENROUTER_API_KEY`

## Problem: "Invalid API token" podczas deploymentu

### 🔍 Przyczyna

- Token Cloudflare jest nieprawidłowy lub wygasł
- Token nie ma wymaganych uprawnień

### ✅ Rozwiązanie

1. Wygeneruj nowy token w Cloudflare:
   - Dashboard → `My Profile` → `API Tokens`
   - Kliknij `Create Token`
   - Wybierz template `Edit Cloudflare Pages`
   - Skopiuj token

2. Zaktualizuj sekret w GitHub:
   - `Settings` → `Environments` → `production`
   - Znajdź `CLOUDFLARE_API_TOKEN`
   - Kliknij ikonę ołówka i zaktualizuj wartość

## Problem: "Project not found" w Cloudflare

### 🔍 Przyczyna

- Projekt o nazwie `10x-cards` nie istnieje w Cloudflare Pages
- Nieprawidłowy `CLOUDFLARE_ACCOUNT_ID`

### ✅ Rozwiązanie

#### Opcja A: Utwórz projekt w Cloudflare Pages

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Przejdź do `Workers & Pages`
3. Kliknij `Create application` → `Pages`
4. Nazwa projektu: `10x-cards` (musi być identyczna jak w workflow!)
5. Production branch: `master`
6. Build command: `npm run build`
7. Build output directory: `dist`

#### Opcja B: Zmień nazwę w workflow

Jeśli projekt ma inną nazwę w Cloudflare:

```yaml
projectName: your-actual-project-name
```

## Problem: Build się udaje, ale deployment kończy się błędem

### 🔍 Możliwe przyczyny

1. **Brak katalogu dist:**
   - Build nie utworzył katalogu `dist/`
   - Sprawdź logi buildu

2. **Pusty katalog dist:**
   - Build się wykonał, ale nie wygenerował plików
   - Zweryfikuj konfigurację Astro

3. **Problemy z uprawnieniami:**
   - Token Cloudflare nie ma uprawnień do deploymentu
   - Wygeneruj nowy token z odpowiednimi uprawnieniami

### ✅ Rozwiązanie

Sprawdź logi buildu:
```bash
# Lokalnie przetestuj build
npm run build

# Sprawdź zawartość dist
ls -la dist/
```

## Problem: Workflow nie uruchamia się

### 🔍 Przyczyna

Workflow ma trigger `workflow_dispatch` - wymaga ręcznego uruchomienia.

### ✅ Rozwiązanie

#### Opcja A: Ręczne uruchomienie

1. Przejdź do zakładki `Actions` w GitHub
2. Wybierz workflow `Deploy to Cloudflare Pages`
3. Kliknij `Run workflow`
4. Wybierz branch `master`
5. Kliknij `Run workflow`

#### Opcja B: Dodaj automatyczny trigger

Jeśli chcesz automatyczne wdrażanie przy push do master:

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
```

## Problem: Środowisko "production" nie istnieje

### 🔍 Objawy

- Workflow czeka na approval
- Nie może znaleźć sekretów

### ✅ Rozwiązanie

1. Przejdź do: `Settings` → `Environments`
2. Kliknij `New environment`
3. Nazwa: `production`
4. Kliknij `Configure environment`
5. Dodaj wymagane sekrety (patrz "Wymagane sekrety" poniżej)

## 📋 Wymagane sekrety - Checklist

Upewnij się, że wszystkie wymagane sekrety są ustawione w środowisku `production`:

### Sekrety Cloudflare (wymagane dla deploymentu)

- [ ] `CLOUDFLARE_API_TOKEN` - Token z uprawnieniami "Cloudflare Pages - Edit"
- [ ] `CLOUDFLARE_ACCOUNT_ID` - ID konta z Cloudflare Dashboard
- [ ] ~~`CLOUDFLARE_PROJECT_NAME`~~ - Opcjonalny (obecnie hardcoded w workflow)

### Sekrety aplikacji (wymagane dla buildu)

- [ ] `SUPABASE_KEY` - Supabase anon key
- [ ] `SUPABASE_URL` - URL projektu Supabase
- [ ] `OPENROUTER_API_KEY` - OpenRouter API key

### Jak sprawdzić sekrety

1. Przejdź do: `Settings` → `Environments` → `production`
2. Sekcja `Environment secrets`
3. Sprawdź czy wszystkie wymagane sekrety są na liście

**Uwaga:** Wartości sekretów nie są widoczne po dodaniu, możesz tylko je zaktualizować lub usunąć.

## 🔍 Debugowanie

### Sprawdzanie logów workflow

1. `Actions` → Wybrany workflow run
2. Kliknij na konkretny job (np. `Deploy`)
3. Rozwiń kroki aby zobaczyć szczegółowe logi
4. Szukaj komunikatów błędów (czerwone ❌)

### Sprawdzanie logów Cloudflare

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. `Workers & Pages` → Twój projekt
3. Zakładka `Deployments` - sprawdź status
4. Kliknij na deployment → `View details` → Logi

### Testowanie lokalnie

```bash
# 1. Sprawdź czy build działa lokalnie
npm ci
npm run build

# 2. Sprawdź zawartość dist
ls -la dist/

# 3. Sprawdź czy zawiera pliki
find dist -type f | head -20

# 4. Preview lokalnie
npm run preview
```

## 📚 Przydatne linki

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Pages Action](https://github.com/marketplace/actions/deploy-to-cloudflare-pages)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 Nadal masz problemy?

1. Sprawdź wszystkie sekrety w środowisku `production`
2. Zweryfikuj nazwę projektu w Cloudflare Pages
3. Sprawdź logi GitHub Actions i Cloudflare
4. Przetestuj build lokalnie
5. Zobacz [DEPLOYMENT-CLOUDFLARE.md](../DEPLOYMENT-CLOUDFLARE.md) - pełny przewodnik

---

**Ostatnia aktualizacja:** 6 listopada 2024  
**Aktywne rozwiązania:** projectName hardcoded jako `10x-cards`

