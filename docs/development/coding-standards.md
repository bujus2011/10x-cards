# 📏 Standardy Kodowania

## Przegląd

Ten dokument zawiera standardy kodowania obowiązujące w projekcie 10xCards. Celem jest zapewnienie spójności kodu, łatwości utrzymania oraz wysokiej jakości oprogramowania.

---

## 📑 Spis Treści

- [Ogólne Zasady](#ogólne-zasady)
- [TypeScript](#typescript)
- [React](#react)
- [Astro](#astro)
- [Stylowanie](#stylowanie)
- [Testowanie](#testowanie)
- [Git i Commit Messages](#git-i-commit-messages)
- [Linting i Formatowanie](#linting-i-formatowanie)

---

## 🏛️ Ogólne Zasady

### Struktura Projektu

- **Ścisłe przestrzeganie struktury katalogów** zdefiniowanej w README.md
- **Jeden plik - jedna odpowiedzialność** (Single Responsibility Principle)
- **Rozdzielenie logiki biznesowej od UI** - komponenty zawierają tylko logikę prezentacyjną

### Nazewnictwo

#### Pliki i Katalogi

```bash
# ✅ Dobrze
src/components/
├── ui/Button.tsx
├── auth/LoginForm.tsx
└── hooks/useAuth.ts

# ❌ Źle
src/components/
├── button.tsx
├── login.tsx
└── authHook.ts
```

#### Komponenty i Hooki

```typescript
// ✅ Komponenty - PascalCase
export const FlashcardCard = () => { ... }

// ✅ Hooki - camelCase z prefiksem "use"
export const useFlashcards = () => { ... }

// ✅ Funkcje - camelCase
export const fetchFlashcards = () => { ... }

// ✅ Stałe - UPPER_SNAKE_CASE
export const API_BASE_URL = "/api";
```

### Komentarze

```typescript
// ✅ Dobrze - opisuje dlaczego, nie co
const isValid = email.includes("@"); // Walidacja formatu email

// ❌ Źle - oczywiste komentarze
const isValid = email.includes("@"); // Sprawdza czy email zawiera @
```

---

## 🔷 TypeScript

### Konfiguracja

- **Strict mode** włączony w `tsconfig.json`
- **Ścisłe sprawdzanie typów** - bez użycia `any`
- **Explicit types** dla wszystkich publicznych API

### Typy i Interfejsy

```typescript
// ✅ Dobrze - explicit interface
interface FlashcardProps {
  id: number;
  front: string;
  back: string;
  createdAt: Date;
  onUpdate: (id: number, data: FlashcardUpdate) => Promise<void>;
}

// ✅ Dobrze - union types zamiast enums
type Theme = "light" | "dark" | "system";

// ❌ Źle - any types
interface BadProps {
  data: any; // ❌
  onChange: (value: any) => void; // ❌
}
```

### Generics

```typescript
// ✅ Dobrze - typed generics
interface ApiResponse<T> {
  data: T;
  error?: string;
  loading: boolean;
}

// ✅ Dobrze - constrained generics
function processItems<T extends { id: number }>(items: T[]): T[] {
  return items.filter(item => item.id > 0);
}
```

---

## ⚛️ React

### Komponenty

#### Funkcyjne Komponenty

```tsx
// ✅ Dobrze
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick: () => void;
}

export const Button = ({ children, variant = "primary", onClick }: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### Memoizacja

```tsx
// ✅ Wymagane dla komponentów renderowanych często
export const FlashcardCard = React.memo(function FlashcardCard({
  flashcard,
  onUpdate,
  onDelete
}: FlashcardCardProps) {
  // ... implementacja
});
```

### Hooki

#### Custom Hooki

```typescript
// ✅ Dobrze - custom hook dla logiki biznesowej
export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await flashcardService.getAll();
      setFlashcards(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return { flashcards, loading, refetch: fetchFlashcards };
};
```

#### useCallback i useMemo

```typescript
// ✅ Wymagane dla funkcji przekazywanych do komponentów potomnych
const handleUpdate = useCallback(async (id: number, data: FlashcardUpdate) => {
  await flashcardService.update(id, data);
  await refetch();
}, [refetch]);

// ✅ Wymagane dla kosztownych obliczeń
const filteredFlashcards = useMemo(() => {
  return flashcards.filter(card => card.front.includes(searchTerm));
}, [flashcards, searchTerm]);
```

### Context i State Management

```typescript
// ✅ Zustand dla globalnego stanu
interface AuthStore {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user });
  },
  logout: () => {
    authService.logout();
    set({ user: null });
  },
}));
```

---

## 🚀 Astro

### Struktury Komponentów

```astro
---
// ✅ Dobrze - separacja logiki od prezentacji
const { user } = Astro.locals;
const flashcards = await getFlashcards(user.id);
---

<div class="flashcards-container">
  {flashcards.map(card => (
    <FlashcardCard
      card={card}
      client:load
    />
  ))}
</div>

<script>
  // Interaktywna logika tylko jeśli potrzebna
</script>

<style>
  /* Scoped styles */
  .flashcards-container {
    display: grid;
    gap: 1rem;
  }
</style>
```

### Dyrektywy Klienta

```astro
<!-- ✅ Używaj odpowiednich dyrektyw -->
<Component client:load />        <!-- Ładowanie po stronie klienta -->
<Component client:idle />        <!-- Ładowanie gdy strona jest idle -->
<Component client:visible />     <!-- Ładowanie gdy widoczne -->

<!-- ❌ Nie używaj Next.js dyrektyw -->
<Component>
  "use client";  <!-- ❌ To nie działa w Astro -->
</Component>
```

### API Routes

```typescript
// ✅ Dobrze - typed API routes
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const validatedData = generateFlashcardSchema.parse(body);

  try {
    const result = await generationService.generate(validatedData);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Generation failed' }), {
      status: 500
    });
  }
};
```

---

## 🎨 Stylowanie

### Tailwind CSS

```tsx
// ✅ Dobrze - utility-first approach
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
  Zapisz
</button>

// ✅ Dobrze - conditional classes
<button className={cn(
  "px-4 py-2 rounded-lg transition-colors",
  variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
  variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300"
)}>
  {children}
</button>
```

### Shadcn/ui Components

```tsx
// ✅ Dobrze - używaj komponentów z biblioteki
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FlashcardForm = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nowa Fiszk</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input placeholder="Przód fiszki" />
          <Input placeholder="Tył fiszki" />
          <Button>Utwórz</Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🧪 Testowanie

### Struktura Testów

```typescript
// ✅ Dobrze - opisowe nazwy testów
describe("FlashcardService", () => {
  describe("create", () => {
    it("should create a new flashcard", async () => {
      // Arrange
      const mockData = { front: "Q", back: "A" };

      // Act
      const result = await flashcardService.create(mockData);

      // Assert
      expect(result).toMatchObject(mockData);
      expect(result.id).toBeDefined();
    });

    it("should throw error for invalid data", async () => {
      // Arrange
      const invalidData = { front: "", back: "" };

      // Act & Assert
      await expect(flashcardService.create(invalidData))
        .rejects.toThrow("Validation error");
    });
  });
});
```

### Test Utilities

```typescript
// ✅ Używaj custom render function
import { render, screen } from "@/tests/test-utils";

test("renders flashcard correctly", () => {
  render(<FlashcardCard flashcard={mockFlashcard} />);

  expect(screen.getByText("Question")).toBeInTheDocument();
  expect(screen.getByText("Answer")).toBeInTheDocument();
});
```

---

## 🐙 Git i Commit Messages

### Strategia Branching

```bash
# ✅ Konwencje nazw branchy
feature/add-flashcard-generation    # Nowa funkcjonalność
fix/auth-validation-error         # Poprawka błędu
refactor/extract-custom-hooks     # Refaktoryzacja
docs/update-api-documentation     # Dokumentacja
test/add-e2e-flashcard-creation   # Testy
```

### Commit Messages

```bash
# ✅ Dobrze - conventional commits
feat: add flashcard generation with OpenRouter AI
fix: resolve auth validation error in login form
refactor: extract flashcard CRUD logic to custom hooks
docs: update API documentation for generation endpoint
test: add E2E tests for flashcard creation workflow

# ❌ Źle - nieopisowe wiadomości
fixed bug
updated code
changes
```

### Pull Requests

**Tytuł PR:**
```
feat: Add flashcard generation feature
```

**Opis PR:**
- Co zostało zaimplementowane
- Jakie pliki zostały zmienione
- Screenshoty/UI changes
- Test results
- Breaking changes (jeśli applicable)

---

## 🔧 Linting i Formatowanie

### ESLint

Projekt używa ścisłej konfiguracji ESLint z następującymi regułami:

- **TypeScript strict rules** - pełne sprawdzanie typów
- **React recommended rules** - najlepsze praktyki React
- **Accessibility rules** - jsx-a11y dla dostępności
- **Import rules** - organizacja importów

```bash
# Uruchamianie lintingu
npm run lint          # Sprawdź błędy
npm run lint:fix      # Napraw automatycznie
```

### Prettier

```bash
# Formatowanie kodu
npm run format        # Formatuj wszystkie pliki
```

### Husky (Git Hooks)

Projekt używa Husky do automatycznego uruchamiania kontroli jakości:

- **pre-commit**: Lint staged files
- **pre-push**: Run tests

---

## 📏 Metryki Jakości

### Coverage Testów

- **Minimum 80%** pokrycia kodu testami
- **100% pokrycie** dla krytycznej logiki biznesowej
- **Integration tests** dla kluczowych przepływów

### Performance

- **Bundle size**: Monitorowany z `npm run build`
- **Lighthouse score**: Minimum 90 dla kluczowych metryk
- **Core Web Vitals**: Monitorowane automatycznie

### Accessibility

- **WCAG 2.1 AA** compliance
- **Keyboard navigation** dla wszystkich interaktywnych elementów
- **Screen reader** support

---

## 🚨 Wyjątki od Standardów

Wszystkie odstępstwa od standardów muszą być:

1. **Uzasadnione** - wyjaśnione w komentarzu lub dokumentacji
2. **Dokumentowane** - dlaczego odstępstwo jest konieczne
3. **Przeglądnięte** - zatwierdzone przez innego developera

```typescript
// EXCEPTION: Using any type because external API doesn't provide types
// TODO: Replace with proper types when API documentation is available
const externalData: any = await fetchExternalApi();
```

---

## 📚 Dodatkowe Zasoby

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletny
