# 🚀 Master Branch Deployment Workflow

## Przegląd

Workflow `master.yml` automatyzuje proces wdrażania aplikacji 10xCards na Cloudflare Pages. Uruchamia się automatycznie przy każdym pushu do gałęzi `master` lub może być uruchomiony ręcznie poprzez `workflow_dispatch`.

## 📋 Struktura Workflow

### Trigger Events

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
```

- **push to master**: Automatyczne wdrożenie przy każdym commicie do gałęzi master
- **workflow_dispatch**: Możliwość ręcznego uruchomienia z zakładki Actions w GitHub

### Uprawnienia

```yaml
permissions:
  contents: read      # Odczyt zawartości repozytorium
  deployments: write  # Zapis deployment status
```

## 🔄 Jobs Pipeline

Pipeline składa się z 3 jobów wykonywanych sekwencyjnie:

```
lint → unit-test → deploy (build + deploy)
```

### 1️⃣ **Lint** - Sprawdzanie jakości kodu

- **Uruchamia się:** Zawsze jako pierwszy
- **Funkcje:**
  - Checkout kodu
  - Instalacja Node.js z wersją z `.nvmrc`
  - Instalacja zależności (`npm ci`)
  - Uruchomienie ESLint (`npm run lint`)
- **Cache:** npm cache dla szybszej instalacji

### 2️⃣ **Unit Tests** - Testy jednostkowe

- **Uruchamia się:** Po sukcesie Lint
- **Wymaga:** `needs: lint`
- **Funkcje:**
  - Uruchomienie testów jednostkowych
  - Weryfikacja poprawności kodu
- **Polecenie:** `npm run test`

### 3️⃣ **Deploy** - Build i wdrożenie na Cloudflare Pages

- **Uruchamia się:** Po sukcesie Lint i Unit Tests
- **Wymaga:** `needs: [lint, unit-test]`
- **Środowisko:** `production`
- **Funkcje:**
  - Setup Node.js i instalacja zależności
  - Budowanie projektu Astro z konfiguracją produkcyjną
  - Wykorzystanie zmiennych środowiskowych z secrets
  - Wdrożenie na Cloudflare Pages
  - Integracja z GitHub Deployments
- **Polecenia:** 
  - `npm ci` - instalacja zależności
  - `npm run build` - budowanie projektu
  - `pages deploy dist --project-name=10x-cards` - wdrożenie przez Wrangler
- **Action:** `cloudflare/wrangler-action@v3`
- **Katalog:** `dist/`

## 🔐 Wymagane Sekrety

Workflow wymaga następujących sekretów w GitHub (Settings → Secrets and variables → Actions → Environment secrets dla środowiska `production`):

### Sekrety Aplikacji

| Sekret | Opis | Wymagany dla |
|--------|------|--------------|
| `PUBLIC_SUPABASE_URL` | URL projektu Supabase | Build |
| `PUBLIC_SUPABASE_KEY` | Klucz API Supabase (anon key) | Build |
| `OPENROUTER_API_KEY` | Klucz API OpenRouter dla AI | Build |

### Sekrety Cloudflare

| Sekret | Opis | Wymagany dla | Jak uzyskać |
|--------|------|--------------|-------------|
| `CLOUDFLARE_API_TOKEN` | Token API z uprawnieniami do Cloudflare Pages | Deploy | [Instrukcje](#jak-uzyskać-cloudflare-api-token) |
| `CLOUDFLARE_ACCOUNT_ID` | ID konta Cloudflare | Deploy | [Instrukcje](#jak-uzyskać-cloudflare-account-id) |
| ~~`CLOUDFLARE_PROJECT_NAME`~~ | ~~Nazwa projektu~~ | ~~Deploy~~ | **Nie jest potrzebny** - hardcoded w workflow jako `10x-cards` |

### Jak Uzyskać Cloudflare API Token

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Przejdź do: **My Profile** → **API Tokens**
3. Kliknij **Create Token**
4. Wybierz template **Edit Cloudflare Pages** lub utwórz custom token z uprawnieniami:
   - **Cloudflare Pages** - Edit
5. Skopiuj wygenerowany token (pojawi się tylko raz!)
6. Dodaj jako secret `CLOUDFLARE_API_TOKEN` w GitHub

### Jak Uzyskać Cloudflare Account ID

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Wybierz swój projekt Cloudflare Pages
3. Account ID znajdziesz w URL lub w zakładce **Overview** po prawej stronie
4. Format: `1234567890abcdef1234567890abcdef`
5. Dodaj jako secret `CLOUDFLARE_ACCOUNT_ID` w GitHub

### Jak Uzyskać Cloudflare Project Name

1. Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Przejdź do **Workers & Pages**
3. Znajdź swój projekt - nazwa projektu to `CLOUDFLARE_PROJECT_NAME`
4. Jeśli projekt nie istnieje, utwórz nowy projekt w Cloudflare Pages
5. Dodaj jako secret `CLOUDFLARE_PROJECT_NAME` w GitHub

## 🌍 Wymagane Środowiska

Workflow używa środowiska GitHub Environment:

- **`production`** - Środowisko produkcyjne dla buildu i deploymentu
  - Sekrety dla tego środowiska muszą być skonfigurowane w: Settings → Environments → production
  - Można dodać protection rules (np. wymagane approvals przed deploymentem)

### Konfiguracja Środowiska Production

1. Przejdź do Settings → Environments w repozytorium GitHub
2. Kliknij **New environment**
3. Nazwa: `production`
4. Dodaj wymagane sekrety (lista powyżej)
5. Opcjonalnie: skonfiguruj protection rules:
   - Required reviewers (wymagane zatwierdzenie przed deploymentem)
   - Wait timer (opóźnienie przed deploymentem)
   - Deployment branches (tylko z master)

## ⚙️ Konfiguracja Techniczna

### Wersje Node.js

- Wersja Node.js jest pobierana z pliku `.nvmrc` w głównym katalogu projektu
- Aktualnie: `22.14.0`
- Zmiana wersji: edytuj plik `.nvmrc`

### Wersje GitHub Actions

Workflow używa najnowszych wersji akcji (zweryfikowanych w listopadzie 2024):

| Action | Wersja | Najnowsza dostępna | Opis |
|--------|--------|-------------------|------|
| `actions/checkout` | v5 | v5.0.0 | Checkout kodu z repozytorium |
| `actions/setup-node` | v6 | v6.0.0 | Instalacja Node.js |
| `cloudflare/wrangler-action` | v3 | v3.14.1 | Deployment na Cloudflare Pages przez Wrangler CLI |

**Uwaga:** Zgodnie z best practices, używamy tylko MAJOR version number (np. `v5`, `v6`, `v3`) aby automatycznie otrzymywać aktualizacje patch i minor.

**Zmiana:** Zaktualizowano z `cloudflare/pages-action@v1` na `cloudflare/wrangler-action@v3` - nowsza, bardziej funkcjonalna akcja z pełnym wsparciem Wrangler CLI.

### Adapter Astro

Projekt został skonfigurowany do używania adaptera Cloudflare:

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

## 📊 Monitoring i Debugging

### GitHub Actions Summary

Po każdym uruchomieniu workflow, podsumowanie jest dostępne w zakładce **Summary** w szczegółach workflow run:

- ✅ **Success**: Tabela z wynikami wszystkich jobów
- ❌ **Failure**: Informacja o nieudanych krokach z linkami do logów

### Artefakty

Workflow NIE generuje artefaktów - build jest wykonywany bezpośrednio w job deploy i od razu wdrażany na Cloudflare Pages.

### Logi

Szczegółowe logi są dostępne w zakładce **Actions** → wybrany workflow run → konkretny job.

## 🆚 Różnice między master.yml a pull-request.yml

| Aspekt | master.yml | pull-request.yml |
|--------|------------|------------------|
| **Trigger** | Workflow dispatch (manual) | push i PR do master |
| **E2E Tests** | ❌ Nie wykonuje | ✅ Wykonuje |
| **Build** | ✅ Tak (w job deploy) | ❌ Nie |
| **Deploy** | ✅ Cloudflare Pages | ❌ Nie |
| **Środowisko** | production | integration |
| **Komentarze PR** | ❌ Nie | ✅ Tak |
| **Jobs** | 3 (lint, test, deploy) | 4 (lint, test, e2e, summary) |
| **Artefakty** | ❌ Nie | ✅ Coverage i reports |

## 🚨 Troubleshooting

### Problem: Build kończy się błędem "Missing environment variables"

**Rozwiązanie:**
1. Sprawdź czy wszystkie wymagane sekrety są dodane w środowisku `production`
2. Upewnij się, że nazwy sekretów są identyczne jak w workflow
3. Zweryfikuj poprawność wartości sekretów

### Problem: Deployment kończy się błędem "Invalid API token"

**Rozwiązanie:**
1. Wygeneruj nowy Cloudflare API Token z odpowiednimi uprawnieniami
2. Upewnij się, że token ma uprawnienia "Cloudflare Pages - Edit"
3. Zaktualizuj sekret `CLOUDFLARE_API_TOKEN` w GitHub

### Problem: "Project not found" podczas deploymentu

**Rozwiązanie:**
1. Sprawdź czy projekt istnieje w Cloudflare Pages
2. Zweryfikuj poprawność `CLOUDFLARE_PROJECT_NAME` (bez URL, tylko nazwa)
3. Upewnij się, że `CLOUDFLARE_ACCOUNT_ID` jest poprawny

### Problem: Build przechodzi, ale deployment się nie uruchamia

**Rozwiązanie:**
1. Sprawdź czy środowisko `production` jest poprawnie skonfigurowane
2. Zweryfikuj czy nie ma aktywnych protection rules blokujących deployment
3. Sprawdź logi job `build` - artefakty muszą być utworzone

## 📚 Dodatkowe Zasoby

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages GitHub Action](https://github.com/marketplace/actions/deploy-to-cloudflare-pages)

