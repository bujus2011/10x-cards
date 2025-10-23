Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI
- Zustand do zarządzania stanem aplikacji (state management)
- Lucide React jako biblioteka ikon
- Sonner do wyświetlania toast notifications
- next-themes do zarządzania motywami (theme management)

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników
- @supabase/ssr dla server-side rendering z Astro
- ts-fsrs jako algorytm spaced repetition do optymalizacji nauki

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie - Kompleksowe pokrycie testami jednostkowymi i end-to-end:

**Testy jednostkowe i integracyjne:**

- Vitest jako framework testowy zintegrowany z Vite/Astro (szybszy niż Jest)
- React Testing Library do testowania komponentów React z naciskiem na UX
- @testing-library/user-event do symulacji zaawansowanych interakcji użytkownika
- @testing-library/jest-dom dla dodatkowych matcherów w testach
- MSW 2.x (Mock Service Worker) do mockowania API HTTP na poziomie service worker
- jsdom i happy-dom jako środowiska testowe do symulacji DOM

**Testy end-to-end (E2E):**

- Playwright jako główne narzędzie do testów E2E z obsługą wieloplatformową
- Playwright Test Runner z wbudowanymi assertions i auto-waiting
- Playwright Trace Viewer do debugowania testów
- Cross-browser testing (Chromium, Firefox, WebKit)
- Wsparcie dla testów równoległych i mechanizmów retry

**Visual Regression i dostępność:**

- Storybook 8.x do izolowanego testowania i dokumentacji komponentów UI
- Chromatic do automatycznego visual regression testing
- axe-core jako silnik do audytów dostępności
- @axe-core/playwright do integracji testów a11y z Playwright

Narzędzia programistyczne i jakość kodu:

- ESLint z TypeScript, React, Astro i wieloma innymi pluginami
- Prettier do formatowania kodu
- Husky + lint-staged do automatycznego lintowania i formatowania przed commitem
- Dotenv do zarządzania zmiennymi środowiskowymi

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
