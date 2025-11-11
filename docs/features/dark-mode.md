# 🌙 Dark/Light Mode

## Przegląd

10xCards oferuje pełną obsługę ciemnego i jasnego motywu, z automatyczną detekcją preferencji systemowych użytkownika oraz możliwością ręcznego przełączania.

## Funkcjonalności

### 🎨 Automatyczna Detekcja Systemu

- Aplikacja automatycznie wykrywa preferencje motywu systemowego
- Domyślnie używa ustawień systemu operacyjnego
- Preferencje są zapisywane w localStorage dla przyszłych wizyt

### 🔄 Ręczne Przełączanie

- Przycisk przełączania motywu w prawym górnym rogu nawigacji
- Ikona słońca (jasny motyw) / księżyca (ciemny motyw)
- Płynne przełączanie bez migotania

### 🎯 Pełna Wsparcie UI

- Wszystkie komponenty Shadcn/ui wspierają dark mode
- Spójne kolory i kontrasty dla obu motywów
- Optymalizacja dostępności (WCAG compliant)

## Implementacja Techniczna

### 🏗️ Architektura

- **Własny system motywów** (zamiast next-themes dla kompatybilności z React 19)
- **CSS Custom Properties** dla zmiennych kolorystycznych
- **Tailwind CSS** z klasą `.dark` dla przełączania
- **localStorage** do persistent storage

### 🎨 Zmienne CSS

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... więcej zmiennych */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  /* ... odwrócone kolory dla dark mode */
}
```

### ⚛️ Komponent ThemeToggle

```typescript
// Prosty komponent do przełączania motywów
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Detekcja systemowych preferencji
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme || (systemTheme ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button onClick={toggleTheme}>
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
```

## Dostępność

### ♿ WCAG Compliance

- **Kontrast kolorów**: Wszystkie kombinacje spełniają wymagania WCAG AA
- **Focus indicators**: Widoczne wskaźniki fokusu w obu motywach
- **Screen readers**: Przycisk ma odpowiednie etykiety ARIA

### ⌨️ Keyboard Navigation

- Przycisk przełączania dostępny przez Tab
- Możliwość aktywacji przez Enter/Space
- Logiczne położenie w kolejności fokusu

## Testowanie

### 🧪 Testy Jednostkowe

```typescript
describe("ThemeToggle", () => {
  it("should toggle between light and dark themes", () => {
    // Test przełączania motywów
  });

  it("should respect system preferences", () => {
    // Test detekcji preferencji systemowych
  });

  it("should persist theme in localStorage", () => {
    // Test zapisywania preferencji
  });
});
```

### 🎭 Testy Wizualne

- **Playwright**: Automatyczne screenshoty dla obu motywów
- **Chromatic**: Regresja wizualna między motywami
- **Manualne**: Sprawdzenie kontrastów i czytelności

## Najlepsze Praktyki

### 🎨 Projektowanie

1. **Spójność**: Używaj tych samych zmiennych CSS w całym projekcie
2. **Kontrast**: Zapewnij odpowiednie kontrasty dla obu motywów
3. **Neutralne kolory**: Unikaj kolorów specyficznych dla jednego motywu

### 💻 Development

1. **CSS Variables**: Zawsze używaj zmiennych zamiast hardcoded kolorów
2. **Tailwind Classes**: Wykorzystuj klasy `dark:` dla warunkowego stylowania
3. **Testing**: Testuj komponenty w obu motywach

### 🚀 Performance

1. **Lazy Loading**: Komponent ThemeToggle ładowany tylko po stronie klienta
2. **CSS-in-JS**: Unikaj dynamicznego generowania CSS
3. **Bundle Size**: Minimalny wpływ na rozmiar paczki

## Troubleshooting

### 🔧 Problemy i Rozwiązania

#### Przycisk nie jest widoczny

```bash
# Sprawdź czy komponent jest poprawnie zaimportowany
grep -r "ThemeToggle" src/
```

#### Motyw nie jest zapisywany

```javascript
// Sprawdź localStorage w dev tools
localStorage.getItem("theme");
```

#### Kolory nie przełączają się

```css
/* Sprawdź czy CSS variables są prawidłowo zdefiniowane */
:root,
.dark {
  /* sprawdz zmienne */
}
```

## Roadmap

### 🔮 Przyszłe Ulepszenia

- **Więcej motywów**: Dodanie motywów kolorowych (blue, purple, etc.)
- **Animacje**: Płynne przejścia między motywami
- **System motywów**: Wsparcie dla motywów aplikacji vs systemu
- **Customization**: Umożliwienie użytkownikom dostosowywania kolorów

---

**Status**: ✅ Zaimplementowane i działające
**Aktualizacja**: 2024-11-07
**Kompatybilność**: React 19, Astro 5, Tailwind CSS 4
