# 📚 Dokumentacja 10xCards

Witamy w centrum dokumentacji projektu 10xCards. Ten dokument zawiera kompletny przegląd wszystkich zasobów dokumentacyjnych.

---

## 🚀 Szybki Start

### Dla Nowych Deweloperów

1. **[CLAUDE.md](../CLAUDE.md)** - Przeczytaj najpierw - instrukcje dla AI i przegląd projektu
2. **[README.md](../README.md)** - Główny przewodnik projektu
3. **[Development Setup](./development/setup.md)** - Konfiguracja środowiska lokalnego (TODO)
4. **[Coding Standards](./development/coding-standards.md)** - Standardy kodowania (TODO)

---

## 🏗️ Architektura

Dowiedz się o strukturze i wzorcach projektowych aplikacji:

- **[Authentication](./architecture/authentication.md)** - System autentykacji (JWT, Supabase Auth, middleware)
- **[Database](./architecture/database.md)** - Schema PostgreSQL, migracje, typy
- **[API Design](./architecture/api-design.md)** - Wzorce projektowe API, walidacja, error handling

---

## 📱 Funkcje

Szczegółowa dokumentacja poszczególnych funkcji aplikacji:

- **[My Flashcards](./features/my-flashcards.md)** - Zarządzanie fiszkami (CRUD, wyszukiwanie, filtrowanie)
- **[Flashcard Generation](./features/flashcard-generation.md)** - Generowanie fiszek AI przez OpenRouter (TODO)
- **[Study Session](./features/study-session.md)** - Algorytm FSRS, sesje nauki (TODO)

---

## 👨‍💻 Development

Przewodniki dla deweloperów:

- **[Setup](./development/setup.md)** - Konfiguracja środowiska lokalnego (TODO)
- **[Coding Standards](./development/coding-standards.md)** - Standardy kodowania, linting, formatting (TODO)
- **[Testing](./development/testing.md)** - ✅ Testy jednostkowe (Vitest) i E2E (Playwright)
- **[Contributing](./development/contributing.md)** - Jak kontrybuować do projektu (TODO)

---

## 🚀 Deployment

Przewodniki wdrażania i CI/CD:

- **[Cloudflare](./deployment/cloudflare.md)** - ✅ Wdrażanie na Cloudflare Pages (kompletny przewodnik + checklist)
- **[CI/CD](./deployment/ci-cd.md)** - ✅ GitHub Actions workflows, automatyzacja
- **[Troubleshooting](./deployment/troubleshooting.md)** - ✅ Rozwiązywanie problemów wdrożenia

---

## 📡 API Reference

Dokumentacja API (w przygotowaniu):

- **[Endpoints](./api/endpoints.md)** - Lista wszystkich endpointów API (TODO)
- **[Schemas](./api/schemas.md)** - Zod validation schemas (TODO)
- **[Examples](./api/examples.md)** - Przykłady użycia API (TODO)

---

## 📦 Archiwum

Historyczne dokumenty i plany implementacyjne:

### Planning

Archiwalne plany implementacyjne z fazy rozwoju:

- [generate-view-implementation-plan.md](./archive/planning/generate-view-implementation-plan.md)
- [generations-endpoint-implementation-plan.md](./archive/planning/generations-endpoint-implementation-plan.md)
- [openrouter-service-implementation-plan.md](./archive/planning/openrouter-service-implementation-plan.md)
- [ui-plan.md](./archive/planning/ui-plan.md)
- [tech-stack.md](./archive/planning/tech-stack.md)

### Refactoring

Dokumentacja zakończonych refaktoringów:

- **[My Flashcards Refactoring (2024-10)](./archive/refactoring/2024-10-my-flashcards-refactoring.md)** - Szczegóły refactoringu komponentów My Flashcards

---

## 🔍 Przeszukiwanie Dokumentacji

### Według Tematu

- **Autentykacja**: [Architecture/Authentication](./architecture/authentication.md)
- **Baza danych**: [Architecture/Database](./architecture/database.md)
- **Testowanie**: [Development/Testing](./development/testing.md)
- **Wdrażanie**: [Deployment/Cloudflare](./deployment/cloudflare.md)
- **CI/CD**: [Deployment/CI-CD](./deployment/ci-cd.md)

### Według Poziomu Doświadczenia

**Początkujący:**
1. [README.md](../README.md) - Przegląd projektu
2. [CLAUDE.md](../CLAUDE.md) - Szczegółowy overview
3. [Development/Setup](./development/setup.md) - Konfiguracja środowiska

**Średniozaawansowany:**
1. [Architecture](./architecture/) - Wzorce architektoniczne
2. [Features](./features/) - Implementacje funkcji
3. [Development/Testing](./development/testing.md) - Strategia testowania

**Zaawansowany:**
1. [Deployment](./deployment/) - Wdrażanie i optymalizacja
2. [API Reference](./api/) - Szczegóły API
3. [Archive](./archive/) - Historyczne decyzje projektowe

---

## 📝 Konwencje Dokumentacji

### Nazewnictwo Plików

- Używamy `lowercase-with-dashes.md` dla nazw plików
- Przykład: `my-flashcards.md`, `cloudflare.md`, `ci-cd.md`

### Struktura Dokumentów

Każdy dokument powinien zawierać:

1. **Tytuł** (H1) z emoji
2. **Przegląd** - Krótki opis (2-3 zdania)
3. **Spis Treści** - Dla dokumentów > 100 linii
4. **Sekcje tematyczne** - Logiczne grupowanie treści
5. **Przykłady** - Bloki kodu z wyjaśnieniami
6. **Linki** - Odniesienia do powiązanych dokumentów
7. **Status** - ✅ Aktualne / ⚠️ W trakcie / ❌ Przestarzałe

### Emojis w Nagłówkach

- 🚀 Szybki start, deployment
- 🏗️ Architektura
- 📱 Funkcje użytkownika
- 👨‍💻 Development
- 🧪 Testowanie
- 📡 API
- ⚙️ Konfiguracja
- 🔧 Troubleshooting
- 📚 Zasoby
- ✅ Gotowe
- ⚠️ W trakcie
- ❌ Przestarzałe

---

## 📊 Status Dokumentacji

| Kategoria | Plików | Status | Ostatnia aktualizacja |
|-----------|--------|--------|----------------------|
| Architecture | 3 | ✅ Kompletne | 2024-11 |
| Features | 1 | ⚠️ W trakcie | 2024-11 |
| Development | 1 | ⚠️ W trakcie | 2024-11 |
| Deployment | 3 | ✅ Kompletne | 2024-11 |
| API | 0 | ❌ TODO | - |
| Archive | 6 | ✅ Zarchiwizowane | 2024-10 |

---

## 🤝 Współtworzenie Dokumentacji

### Zasady

1. **Aktualizuj dokumenty wraz z kodem** - Zmiany w kodzie = zmiany w dokumentacji
2. **Pisz jasno i zwięźle** - Unikaj żargonu, używaj przykładów
3. **Dodawaj screenshoty** - Dla UI/UX gdzie to możliwe
4. **Linkuj powiązane dokumenty** - Ułatw nawigację
5. **Oznaczaj status** - ✅ Aktualne / ⚠️ W trakcie / ❌ Przestarzałe

### Tworzenie Nowego Dokumentu

1. Wybierz właściwą kategorię (architecture, features, development, deployment)
2. Użyj konwencji nazewnictwa: `lowercase-with-dashes.md`
3. Skopiuj strukturę z istniejącego dokumentu
4. Dodaj link w tym pliku (docs/README.md)
5. Dodaj powiązane linki w innych dokumentach

---

## 🆘 Potrzebujesz Pomocy?

1. **Przeszukaj dokumentację** - Użyj Ctrl+F w plikach .md
2. **Sprawdź [CLAUDE.md](../CLAUDE.md)** - Zawiera przegląd całego projektu
3. **Zobacz [Troubleshooting](./deployment/troubleshooting.md)** - Typowe problemy i rozwiązania
4. **Otwórz issue na GitHub** - Jeśli czegoś brakuje

---

## 📚 Dodatkowe Zasoby

### Wewnętrzne

- [README.md](../README.md) - Główna dokumentacja projektu
- [CLAUDE.md](../CLAUDE.md) - Instrukcje dla AI i szczegółowy overview
- [PRD.md](../.ai/PRD.md) - Product Requirements Document
- [UNIFIED_STANDARDS.md](../.ai/UNIFIED_STANDARDS.md) - Standardy kodowania

### Zewnętrzne

- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)

---

## 🔄 Historia Zmian

- **2024-11-07**: Reorganizacja dokumentacji, utworzenie struktury docs/
- **2024-10**: Dokumentacja My Flashcards feature
- **2024-10**: Dokumentacja deployment na Cloudflare
- **2024-10**: Dokumentacja authentication i architecture

---

**Ostatnia aktualizacja**: 2024-11-07
**Wersja**: 2.0
**Status**: ✅ Aktywnie utrzymywana