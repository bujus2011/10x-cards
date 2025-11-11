# 📝 Changelog - master.yml Workflow

## [v2.0.0] - 2024-11-06

### 🎉 Major Changes

#### Migracja na wrangler-action@v3

**Przed:**

```yaml
- name: Publish to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: 10x-cards
    directory: dist
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**Po:**

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=10x-cards
```

**Korzyści:**

- ✅ Najnowsza akcja Cloudflare (v3.14.1)
- ✅ Pełne wsparcie dla Wrangler CLI
- ✅ Lepsza kompatybilność z nowymi funkcjami
- ✅ Bardziej elastyczna konfiguracja przez polecenia CLI
- ✅ Lepsze logi i komunikaty błędów

### 🔧 Changes

- **Changed:** Akcja deploymentu z `pages-action@v1` na `wrangler-action@v3`
- **Changed:** Nazwa projektu teraz w poleceniu `--project-name=10x-cards`
- **Removed:** Parametr `gitHubToken` (nie jest wymagany w wrangler-action)
- **Removed:** Parametr `directory` (teraz w poleceniu CLI)
- **Removed:** Parametr `projectName` (teraz w poleceniu CLI)

### 📚 Documentation Updates

- ✅ Zaktualizowano `.github/workflows/README-MASTER.md`
- ✅ Zaktualizowano `.github/workflows/VERIFICATION-REPORT.md`
- ✅ Zaktualizowano `.github/workflows/TROUBLESHOOTING.md`
- ✅ Zaktualizowano `CLOUDFLARE-SETUP-CHECKLIST.md`
- ✅ Utworzono `.github/workflows/CHANGELOG.md`

---

## [v1.2.0] - 2024-11-06

### 🔧 Changes

- **Changed:** Usunięto sekret `CLOUDFLARE_PROJECT_NAME`
- **Changed:** Nazwa projektu hardcoded jako `10x-cards`
- **Fixed:** Problem "Input required and not supplied: projectName"

### 📝 Documentation

- ✅ Zaktualizowano wszystkie dokumenty z informacją o usunięciu sekretu
- ✅ Dodano informacje o hardcoded nazwie projektu

---

## [v1.1.0] - 2024-11-06

### 🔧 Changes

- **Changed:** Połączono job `build` i `deploy` w jeden job
- **Removed:** Upload/download artefaktów (brak potrzeby)
- **Removed:** Job `deployment-summary`
- **Fixed:** Problem "Artifact not found for name: dist"

### ⚡ Performance

- ⚡ Szybszy deployment (brak uploadowania/downloadowania artefaktów)
- ⚡ Prostsze zarządzanie workflow
- ⚡ Mniej kroków = mniej potencjalnych błędów

---

## [v1.0.0] - 2024-11-06

### 🎉 Initial Release

#### Pipeline Structure

```
Lint → Unit Tests → Deploy (build + deploy)
```

#### Features

- ✅ Lint code with ESLint
- ✅ Run unit tests
- ✅ Build Astro project with Cloudflare adapter
- ✅ Deploy to Cloudflare Pages
- ✅ Environment-based secrets (production)
- ✅ Manual trigger (workflow_dispatch)

#### Actions Used

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `cloudflare/pages-action@v1`

#### Configuration

- Node.js version from `.nvmrc` (22.14.0)
- Uses `npm ci` for dependency installation
- Build directory: `dist/`
- Environment: `production`

---

## Version History

| Version | Date       | Major Changes                  |
| ------- | ---------- | ------------------------------ |
| v2.0.0  | 2024-11-06 | Migracja na wrangler-action@v3 |
| v1.2.0  | 2024-11-06 | Hardcoded project name         |
| v1.1.0  | 2024-11-06 | Połączono build i deploy       |
| v1.0.0  | 2024-11-06 | Initial release                |

---

## Breaking Changes

### v2.0.0

**Zmiana akcji deploymentu:**

- Jeśli używasz forka tego workflow, musisz zaktualizować na `wrangler-action@v3`
- Parametry są teraz przekazywane przez `command` zamiast bezpośrednich parametrów

**Migration Guide v1.x → v2.0:**

```diff
- - name: Publish to Cloudflare Pages
-   uses: cloudflare/pages-action@v1
+ - name: Deploy to Cloudflare Pages
+   uses: cloudflare/wrangler-action@v3
    with:
      apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
-     projectName: 10x-cards
-     directory: dist
-     gitHubToken: ${{ secrets.GITHUB_TOKEN }}
+     command: pages deploy dist --project-name=10x-cards
```

---

## Compatibility

### Supported Versions

- ✅ Astro 5+
- ✅ Node.js 22.14.0+
- ✅ @astrojs/cloudflare adapter
- ✅ GitHub Actions (latest)

### Required Secrets

- `SUPABASE_KEY`
- `SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### No Longer Required

- ~~`CLOUDFLARE_PROJECT_NAME`~~ (hardcoded w v1.2.0+)

---

## Future Plans

### Planned Features

- [ ] Opcjonalne automatyczne triggery na push do master
- [ ] Integration z Dependabot dla auto-update akcji
- [ ] Deployment preview dla PR (opcjonalnie)
- [ ] Automatyczne rollback przy błędach
- [ ] Slack/Discord notifications

### Under Consideration

- [ ] Multi-environment support (staging, production)
- [ ] Automated smoke tests po deploymencie
- [ ] Performance budgeting i monitoring
- [ ] A/B deployment strategies

---

## Support

Jeśli napotkasz problemy:

1. Sprawdź [TROUBLESHOOTING.md](.github/workflows/TROUBLESHOOTING.md)
2. Zobacz [DEPLOYMENT-CLOUDFLARE.md](DEPLOYMENT-CLOUDFLARE.md)
3. Sprawdź logi GitHub Actions i Cloudflare

---

**Maintainer:** 10xCards Team  
**Last Updated:** 6 listopada 2024
