# 🤝 Jak Kontrybuować do Projektu

## Przegląd

Witamy w przewodniku kontrybucji do projektu 10xCards! Ten dokument opisuje proces współtworzenia kodu, zgłaszania problemów i proponowania nowych funkcji.

---

## 📑 Spis Treści

- [Zanim Zaczniesz](#zanim-zaczniesz)
- [Proces Rozwoju](#proces-rozwoju)
- [Zgłaszanie Problemów](#zgłaszanie-problemów)
- [Proponowanie Funkcji](#proponowanie-funkcji)
- [Rozwój Kodu](#rozwój-kodu)
- [Pull Request](#pull-request)
- [Code Review](#code-review)
- [Release Process](#release-process)

---

## 🎯 Zanim Zaczniesz

### Przeczytaj Dokumentację

1. **[README.md](../README.md)** - Główny przegląd projektu
2. **[CLAUDE.md](../CLAUDE.md)** - Szczegółowy opis projektu dla AI
3. **[Development Setup](./setup.md)** - Konfiguracja środowiska
4. **[Coding Standards](./coding-standards.md)** - Standardy kodowania

### Przygotuj Środowisko

```bash
# Sklonuj repozytorium
git clone https://github.com/przeprogramowani/10x-cards.git
cd 10x-cards

# Skonfiguruj środowisko (zobacz setup.md)
npm install
npm run check:env

# Uruchom aplikację
npm run dev
```

### Zapoznaj się z Architekturą

- **Frontend**: Astro + React + TypeScript + Tailwind
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter API dla generowania fiszek
- **Testing**: Vitest (unit) + Playwright (E2E)

---

## 🔄 Proces Rozwoju

### 1. Wybierz Zadanie

Możesz pracować nad:

- **🐛 Zgłoszonymi bugami** z GitHub Issues
- **✨ Zaplanowanymi funkcjami** z Project Board
- **🔧 Ulepszeniami** istniejącego kodu
- **📚 Dokumentacją** - zawsze mile widziana!

### 2. Utwórz Branch

```bash
# Dla nowych funkcji
git checkout -b feature/nazwa-funkcji

# Dla poprawek błędów
git checkout -b fix/nazwa-problemu

# Dla refaktoryzacji
git checkout -b refactor/opis-zmian

# Dla dokumentacji
git checkout -b docs/nazwa-dokumentu

# Dla testów
git checkout -b test/nazwa-testu
```

### 3. Implementuj Zmiany

- **Przestrzegaj standardów kodowania** opisanych w [coding-standards.md](./coding-standards.md)
- **Dodawaj testy** dla nowych funkcji
- **Aktualizuj dokumentację** wraz z kodem
- **Używaj conventional commits**

### 4. Testuj Zmiany

```bash
# Uruchom wszystkie testy
npm run test:all

# Sprawdź linting
npm run lint

# Sprawdź formatowanie
npm run format

# Testuj manualnie w przeglądarce
npm run dev
```

### 5. Utwórz Pull Request

Zobacz sekcję [Pull Request](#pull-request) poniżej.

---

## 🐛 Zgłaszanie Problemów

### Jak Zgłosić Błąd

1. **Sprawdź istniejące issues** - może problem już został zgłoszony
2. **Użyj issue template** dla błędów
3. **Podaj szczegółowe informacje**:

```markdown
**Opis problemu:**
Krótki opis tego, co nie działa

**Kroki do odtworzenia:**
1. Przejdź do '...'
2. Kliknij '....'
3. Zobacz błąd

**Oczekiwane zachowanie:**
Opis oczekiwanego działania

**Środowisko:**
- OS: [np. macOS 12.0]
- Browser: [np. Chrome 100.0]
- Node version: [np. 22.14.0]

**Screenshot/Error logs:**
[Dodaj zrzuty ekranu lub logi błędów]
```

### Typy Problemów

- **🐛 Bug**: Nieprawidłowe zachowanie aplikacji
- **⚡ Performance**: Problemy z wydajnością
- **🎨 UI/UX**: Problemy z interfejsem
- **📱 Mobile**: Problemy na urządzeniach mobilnych
- **🌐 i18n**: Problemy z tłumaczeniami

---

## 💡 Proponowanie Funkcji

### Jak Zaproponować Nową Funkcję

1. **Sprawdź roadmap** - może funkcja już jest planowana
2. **Użyj feature request template**
3. **Opisz wartość biznesową** - dlaczego ta funkcja jest potrzebna?

```markdown
**Problem do rozwiązania:**
Opis problemu, który funkcja ma rozwiązać

**Proponowane rozwiązanie:**
Szczegółowy opis proponowanej funkcji

**Alternatywne rozwiązania:**
Inne możliwe podejścia

**Dodatkowy kontekst:**
Screenshoty, mockupy, linki do podobnych funkcji
```

### Kryteria Akceptacji Funkcji

✅ **Zostanie rozpatrzona jeśli:**
- Rozwiązuje rzeczywisty problem użytkowników
- Jest zgodna z wizją projektu (10xCards MVP)
- Może być zaimplementowana w rozsądnym czasie
- Ma jasne wymagania i kryteria akceptacji

❌ **Nie zostanie rozpatrzona jeśli:**
- Jest poza zakresem MVP (np. zaawansowane funkcje społecznościowe)
- Wymaga znaczących zmian w architekturze
- Konfliktuje z istniejącymi funkcjami

---

## 💻 Rozwój Kodu

### Struktura Commitów

Używamy [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Typy commitów
feat: nowa funkcja
fix: poprawka błędu
refactor: refaktoryzacja kodu
docs: zmiany w dokumentacji
test: dodanie lub zmiana testów
chore: zmiany w konfiguracji/build

# Przykłady
feat: add flashcard generation with OpenRouter AI
fix: resolve auth validation error in login form
refactor: extract flashcard CRUD logic to custom hooks
docs: update API documentation for generation endpoint
test: add E2E tests for flashcard creation workflow
```

### Workflow Rozwoju

```bash
# 1. Zacznij od świeżej gałęzi main
git checkout main
git pull origin main

# 2. Utwórz branch dla zadania
git checkout -b feature/add-dark-mode

# 3. Rób częste commity
git add .
git commit -m "feat: implement basic dark mode toggle"

# 4. Pushuj regularnie
git push origin feature/add-dark-mode

# 5. Utwórz PR gdy gotowe
```

### Testowanie Podczas Rozwoju

```bash
# Testy jednostkowe dla komponentów
npm run test:run

# Testy E2E dla pełnych przepływów
npm run test:e2e

# Pokrycie kodu
npm run test:coverage

# Debugowanie testów
npm run test:e2e:debug
```

---

## 🔄 Pull Request

### Szablon PR

Użyj następującego formatu dla tytułu i opisu:

**Tytuł:**
```
feat: Add flashcard generation feature
```

**Opis:**
```markdown
## Opis zmian

Szczegółowy opis tego, co zostało zaimplementowane.

## Lista zmian

- ✅ Dodano endpoint API dla generowania fiszek
- ✅ Zaimplementowano komponent FlashcardGenerator
- ✅ Dodano testy jednostkowe
- ✅ Zaktualizowano dokumentację

## Testowanie

- ✅ Wszystkie testy przechodzą
- ✅ Ręczna weryfikacja w przeglądarce
- ✅ Testy E2E dla pełnego przepływu

## Screenshoty

[Dodaj zrzuty ekranu nowych funkcji]

## Breaking Changes

[Jeśli applicable - lista zmian łamiących kompatybilność]
```

### Checklist PR

**Przed wysłaniem PR:**
- [ ] Kod spełnia standardy kodowania
- [ ] Wszystkie testy przechodzą
- [ ] ESLint nie zgłasza błędów
- [ ] Dokumentacja została zaktualizowana
- [ ] Zmiany zostały przetestowane manualnie

**Podczas code review:**
- [ ] PR ma opisowe imię i opis
- [ ] Commity są atomiczne i opisowe
- [ ] Nie ma konfliktów z main
- [ ] CI/CD przechodzi

---

## 👁️ Code Review

### Proces Review

1. **Automatic Checks** - CI/CD uruchamia testy i linting
2. **Peer Review** - Inny deweloper przegląda kod
3. **Approval** - Wymagane zatwierdzenie przed merge

### Kryteria Review

**✅ Akceptowalne jeśli:**
- Kod jest czytelny i zrozumiały
- Przestrzega standardów kodowania
- Ma odpowiednie testy
- Nie wprowadza regresji
- Dokumentacja jest aktualna

**🔄 Wymaga poprawek jeśli:**
- ESLint zgłasza błędy/warnings
- Testy nie przechodzą
- Kod nie spełnia standardów
- Brakuje testów dla nowych funkcji
- Istnieją security vulnerabilities

### Przydatne Komentarze w Review

```markdown
💡 **Suggestion:** Możesz rozważyć użycie early return tutaj
🔧 **Technical:** Ta funkcja może być kosztowna - rozważ memoizację
🧪 **Testing:** Dodaj test dla edge case z pustą tablicą
📝 **Documentation:** Zaktualizuj README.md z nową funkcją
```

---

## 🚀 Release Process

### Versioning

Używamy [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (1.x.x)
- **MINOR**: New features (x.1.x)
- **PATCH**: Bug fixes (x.x.1)

### Release Workflow

1. **Feature branches** → **main** (PR + review)
2. **main** → **production** (automatyczne deployment)
3. **Tags** dla wersji (np. `v1.2.3`)

### Deployment

- **Automatic**: Push do main uruchamia CI/CD
- **Staging**: Dostępne na preview URL podczas PR
- **Production**: Automatycznie wdrażane na Cloudflare Pages

---

## 📞 Uzyskaj Pomoc

### Gdzie Szukać Pomocy

1. **Dokumentacja**: Sprawdź [docs/README.md](../README.md)
2. **Issues**: Przeszukaj istniejące problemy
3. **Discussions**: Dla ogólnych pytań
4. **Code**: Zobacz przykłady w istniejącym kodzie

### Zasady Komunikacji

- **Bądź uprzejmy i konstruktywny**
- **Podawaj kontekst** - opisuj problem szczegółowo
- **Używaj angielskiego** dla kodu i dokumentacji
- **Szanuj czas innych** - rób research przed zadawaniem pytań

### Pierwsze Zadania dla Nowych Kontrybutorów

Jeśli jesteś nowy:

1. **Rozpocznij od małych poprawek** - literówki, formatowanie
2. **Dodaj testy** dla istniejącego kodu
3. **Poprawuj dokumentację** - zawsze potrzebne!
4. **Zgłaszaj błędy** - nawet jeśli nie umiesz ich naprawić

---

## 🎉 Podsumowanie

Kontrybucja do 10xCards to świetny sposób na:

- 🌟 Nauczenie się nowoczesnego stacku (Astro + React + TypeScript)
- 🤝 Współpracę z innymi deweloperami
- 📈 Rozwój umiejętności w obszarze AI i edukacji
- 🎯 Wpływ na produkt używany przez prawdziwych użytkowników

**Dziękujemy za zainteresowanie projektem!** 🚀

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletny
