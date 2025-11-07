# ✅ Cloudflare Deployment - Quick Start Checklist

## Przegląd

Ten checklist pomoże Ci szybko skonfigurować deployment na Cloudflare Pages. Dla szczegółowych informacji technicznych i troubleshootingu zobacz [DEPLOYMENT-CLOUDFLARE.md](./DEPLOYMENT-CLOUDFLARE.md).

---

## 1️⃣ Utwórz projekt w Cloudflare Pages

- [ ] Zaloguj się do [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [ ] Workers & Pages → **Create application** → **Pages**
- [ ] Połącz z GitHub lub użyj Direct Upload
- [ ] Skonfiguruj projekt:
  - Production branch: `master`
  - Build command: `npm run build`
  - Build output: `dist`
- [ ] Zapisz nazwę projektu (używamy: `10x-cards`)

---

## 2️⃣ Skonfiguruj zmienne środowiskowe w Cloudflare

W dashboardzie projektu: **Settings** → **Environment variables** → **Production**

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY`
- [ ] `OPENROUTER_API_KEY`

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Konfiguracja zmiennych"](./DEPLOYMENT-CLOUDFLARE.md#2-konfiguracja-zmiennych-środowiskowych-w-cloudflare)

---

## 3️⃣ Wygeneruj Cloudflare API Token

- [ ] Dashboard → **My Profile** → **API Tokens**
- [ ] **Create Token** → wybierz template **Edit Cloudflare Pages**
- [ ] Skopiuj token (pojawi się tylko raz!)

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Cloudflare API Token"](./DEPLOYMENT-CLOUDFLARE.md#jak-uzyskać-cloudflare-api-token)

---

## 4️⃣ Znajdź Cloudflare Account ID

- [ ] W dashboardzie projektu Cloudflare Pages
- [ ] Sekcja **Overview** (po prawej stronie)
- [ ] Skopiuj **Account ID**

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Cloudflare Account ID"](./DEPLOYMENT-CLOUDFLARE.md#jak-uzyskać-cloudflare-account-id)

---

## 5️⃣ Utwórz środowisko "production" w GitHub

- [ ] GitHub repo → **Settings** → **Environments**
- [ ] **New environment** → nazwa: `production`
- [ ] (Opcjonalnie) Skonfiguruj protection rules

---

## 6️⃣ Dodaj sekrety do środowiska "production" w GitHub

W środowisku `production` dodaj sekrety:

**Sekrety aplikacji:**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY`
- [ ] `OPENROUTER_API_KEY`

**Sekrety Cloudflare:**
- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `CLOUDFLARE_ACCOUNT_ID`

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Konfiguracja sekretów GitHub"](./DEPLOYMENT-CLOUDFLARE.md#3-konfiguracja-sekretów-github)

---

## 7️⃣ Uruchom deployment

### Opcja A: Automatycznie (zalecane)
- [ ] Push zmian do gałęzi `master`
- [ ] Sprawdź status w **Actions** w GitHub

### Opcja B: Manualnie
- [ ] GitHub → **Actions** → **Deploy to Cloudflare Pages**
- [ ] **Run workflow** → wybierz `master` → **Run workflow**

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Proces wdrażania"](./DEPLOYMENT-CLOUDFLARE.md#-proces-wdrażania)

---

## 8️⃣ Weryfikacja

Po zakończeniu deploymentu:

- [ ] Cloudflare Dashboard → **Deployments** → status "Success"
- [ ] Otwórz URL: `https://10x-cards.pages.dev`
- [ ] Przetestuj kluczowe funkcje:
  - [ ] Logowanie
  - [ ] Generowanie fiszek
  - [ ] Zarządzanie fiszkami
  - [ ] Sesja nauki

📖 **Szczegóły**: [DEPLOYMENT-CLOUDFLARE.md - Sekcja "Weryfikacja"](./DEPLOYMENT-CLOUDFLARE.md#-weryfikacja-wdrożenia)

---

## ⚠️ Problemy?

Jeśli coś nie działa:
1. Sprawdź [DEPLOYMENT-CLOUDFLARE.md - Troubleshooting](./DEPLOYMENT-CLOUDFLARE.md#️-znane-problemy-i-rozwiązania)
2. Przejrzyj logi GitHub Actions
3. Sprawdź logi Cloudflare Dashboard

---

## 📚 Pełna dokumentacja

Dla szczegółowych informacji, zobacz:
- 📖 [DEPLOYMENT-CLOUDFLARE.md](./DEPLOYMENT-CLOUDFLARE.md) - Pełna dokumentacja techniczna
- 📖 [.github/workflows/README-MASTER.md](./.github/workflows/README-MASTER.md) - Dokumentacja workflow
- 🔗 [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- 🔗 [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
