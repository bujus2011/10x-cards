# 🚀 Cloudflare Pages Deployment Guide

## Przegląd

Ten dokument opisuje proces konfiguracji i wdrażania aplikacji 10xCards na Cloudflare Pages.

## ✅ Co zostało skonfigurowane

### 1. Adapter Cloudflare

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

### 2. GitHub Actions Workflow

Utworzono workflow `master.yml` dla automatycznego wdrażania na Cloudflare Pages:

- **Lokalizacja**: `.github/workflows/master.yml`
- **Trigger**: Push do gałęzi `master` lub manualne uruchomienie
- **Pipeline**: Lint → Unit Tests → Build → Deploy → Summary

Szczegółowa dokumentacja: `.github/workflows/README-MASTER.md`

### 3. Zależności

Dodano niezbędne pakiety:

```json
{
  "dependencies": {
    "@astrojs/cloudflare": "^latest"
  }
}
```

## 📋 Wymagania przed wdrożeniem

### 1. Utworzenie projektu w Cloudflare Pages

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Przejdź do **Workers & Pages**
3. Kliknij **Create application** → **Pages** → **Connect to Git**
4. Wybierz swoje repozytorium GitHub (lub użyj Direct Upload)
5. Skonfiguruj projekt:
   - **Project name**: Twoja unikalna nazwa (zapisz jako `CLOUDFLARE_PROJECT_NAME`)
   - **Production branch**: `master`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 2. Konfiguracja zmiennych środowiskowych w Cloudflare

W ustawieniach projektu Cloudflare Pages:

1. Przejdź do **Settings** → **Environment variables**
2. Dodaj zmienne dla środowiska **Production**:

| Zmienna | Wartość | Opis |
|---------|---------|------|
| `SUPABASE_URL` | https://your-project.supabase.co | URL projektu Supabase |
| `SUPABASE_KEY` | your-anon-key | Supabase anon key |
| `OPENROUTER_API_KEY` | your-api-key | OpenRouter API key dla AI |

### 3. Konfiguracja sekretów GitHub

Dla automatycznego wdrażania przez GitHub Actions:

1. Przejdź do Settings → Environments → **production**
2. Dodaj sekrety:

#### Sekrety aplikacji:
- `SUPABASE_URL` - URL projektu Supabase
- `SUPABASE_KEY` - Supabase anon key
- `OPENROUTER_API_KEY` - OpenRouter API key

#### Sekrety Cloudflare:
- `CLOUDFLARE_API_TOKEN` - Token API z uprawnieniami Cloudflare Pages Edit
- `CLOUDFLARE_ACCOUNT_ID` - ID konta Cloudflare
- `CLOUDFLARE_PROJECT_NAME` - Nazwa projektu w Cloudflare Pages

#### Jak uzyskać Cloudflare API Token:

1. Dashboard → **My Profile** → **API Tokens**
2. **Create Token** → **Edit Cloudflare Pages** template
3. Skopiuj wygenerowany token

#### Jak uzyskać Cloudflare Account ID:

1. Dashboard → wybierz projekt Cloudflare Pages
2. Account ID znajdziesz w sekcji **Overview** po prawej stronie
3. Format: `1234567890abcdef1234567890abcdef`

## 🔧 Proces wdrażania

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

## 🏗️ Struktura buildu

Po uruchomieniu `npm run build`, Cloudflare adapter generuje:

```
dist/
├── _worker.js           # Cloudflare Worker (server-side code)
├── _astro/             # Astro runtime i chunki
├── favicon.png         # Statyczne assety
└── [inne statyczne pliki]
```

## 🔍 Weryfikacja wdrożenia

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

## ⚠️ Znane problemy i rozwiązania

### Problem 1: Build kończy się sukcesem, ale aplikacja nie działa

**Objawy**: 
- Build się udaje
- Strona wyświetla błędy 500 lub nie ładuje się

**Możliwe przyczyny**:
1. Brakujące zmienne środowiskowe w Cloudflare
2. Niezgodność runtime Cloudflare z kodem Node.js

**Rozwiązanie**:
1. Sprawdź zmienne środowiskowe w Cloudflare Dashboard
2. Sprawdź logi Cloudflare Functions
3. Zweryfikuj czy używasz tylko kompatybilnych z Cloudflare API

### Problem 2: "Invalid binding `SESSION`"

**Objawy**:
- Ostrzeżenie podczas buildu o brakującym bindingu `SESSION`

**Przyczyna**:
- Cloudflare adapter domyślnie włącza sesje z KV

**Rozwiązanie**:
Jeśli nie używasz sesji Cloudflare KV (używasz Supabase Auth), możesz zignorować to ostrzeżenie lub skonfigurować KV binding w `wrangler.toml`.

### Problem 3: Obrazy nie działają

**Objawy**:
- Ostrzeżenie: "Cloudflare does not support sharp at runtime"

**Przyczyna**:
- Cloudflare nie wspiera biblioteki Sharp do przetwarzania obrazów

**Rozwiązanie**:
W `astro.config.mjs` dodaj:
```javascript
export default defineConfig({
  image: {
    service: "compile" // Optymalizacja obrazów podczas buildu
  },
  // ... reszta konfiguracji
});
```

## 📊 Monitoring i debugging

### Logi produkcyjne

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

## 🚀 Optymalizacja wydajności

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

## 📚 Dodatkowe zasoby

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Workers Runtime API](https://developers.cloudflare.com/workers/runtime-apis/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 Pomoc

Jeśli napotkasz problemy:

1. Sprawdź logi w Cloudflare Dashboard
2. Zweryfikuj zmienne środowiskowe
3. Sprawdź GitHub Actions logs
4. Przeczytaj [Troubleshooting guide](https://developers.cloudflare.com/pages/platform/known-issues/)

