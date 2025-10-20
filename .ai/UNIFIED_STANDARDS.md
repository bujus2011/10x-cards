# 🎯 Ujednolicenie Projektu - Raport Analityczny

## Exec Summary

Projekt 10xCards ma dobrze zdefiniowane reguły w `.cursor/rules/`, ale **nowo utworzone komponenty** nie są w pełni zgodne. Wymagane są korekty.

---

## ❌ Problemy Znalezione

### 1. **Dyrektywa 'use client' (KRYTYCZNE)**

**Problem:** Komponenty React mają `'use client'` na górze, co jest dyrektywą **Next.js**.

```tsx
// ❌ ŹRÓDŁO: MyFlashcardsView.tsx, FlashcardCard.tsx, CreateFlashcardForm.tsx
"use client";

import { useState } from "react";
```

**Reguła:** `react.mdc` - "Never use 'use client' and other Next.js directives as we use React with Astro"

**Wpływ:** Może powodować problemy z renderowaniem i optymalizacją w Astro.

**Rozwiązanie:** Usunąć `'use client'` z wszystkich komponentów React.

---

### 2. **Brak Custom Hooks Directory**

**Problem:** Logika stanu powinna być ekstrahowana do custom hooks.

**Reguła:** `react.mdc` - "Extract logic into custom hooks in `src/components/hooks`"

**Wskazówka:** `MyFlashcardsView.tsx` ma dużo logiki (fetchFlashcards, handleCreate, handleUpdate, handleDelete) - idealnie do custom hook'ów.

**Struktura do dodania:**

```
src/components/hooks/
├── useFlashcards.ts
├── useFlashcardCreate.ts
├── useFlashcardEdit.ts
└── useFlashcardDelete.ts
```

---

### 3. **Type Safety w Props**

**Problem:** Prop `onUpdate` i `onDelete` mają typ `any`:

```tsx
// ❌ FlashcardCard.tsx
onUpdate: (id: number, data: any) => Promise<void>;
onDelete: (id: number) => Promise<void>;
```

**Powinno być:**

```tsx
// ✅ Prawidłowo
interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onUpdate: (id: number, data: FlashcardUpdateDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}
```

---

### 4. **Brak Memoizacji Komponentów**

**Problem:** Komponenty React nie używają `React.memo()`.

**Reguła:** `react.mdc` - "Implement React.memo() for expensive components that render often with the same props"

**Zalecenie:**

```tsx
// ✅ Prawidłowo
export const FlashcardCard = React.memo(function FlashcardCard({
  flashcard,
  onUpdate,
  onDelete,
  isLoading,
}: FlashcardCardProps) {
  // ... komponent
});
```

---

### 5. **Brak useCallback Optimizacji**

**Problem:** Handlery nie używają `useCallback`.

**Reguła:** `react.mdc` - "Use the useCallback hook for event handlers passed to child components"

**Gdzie stosować:**

- `MyFlashcardsView.tsx`: `handleCreateFlashcard`, `handleUpdateFlashcard`, `handleDeleteFlashcard`
- `FlashcardCard.tsx`: `handleSave`, `handleDelete`, `handleCopy`

---

### 6. **Brak Accessibility (ARIA)**

**Problem:** Komponenty nie mają ARIA atrybutów.

**Reguła:** `frontend.mdc` - ARIA Best Practices

**Brakujące elementy:**

- `aria-label` na buttonach z ikonkami
- `aria-live` na notyfikacjach
- `aria-describedby` na input polach
- `aria-expanded` na collapsible formularzu

**Przykład:**

```tsx
// ❌ Bez accessibility
<Button size="icon" onClick={handleDelete}>
  <Trash2 className="h-3.5 w-3.5" />
</Button>

// ✅ Prawidłowo
<Button
  size="icon"
  onClick={handleDelete}
  aria-label="Delete flashcard"
  title="Delete this flashcard"
>
  <Trash2 className="h-3.5 w-3.5" />
</Button>
```

---

### 7. **Brak useId dla Accessibility**

**Problem:** Brak unique IDs dla accessibility.

**Reguła:** `react.mdc` - "Implement useId() for generating unique IDs for accessibility attributes"

**Implementacja:**

```tsx
import { useId } from "react";

export function CreateFlashcardForm() {
  const frontInputId = useId();
  const backInputId = useId();

  return (
    <div>
      <label htmlFor={frontInputId}>Front</label>
      <textarea id={frontInputId} />
    </div>
  );
}
```

---

### 8. **Tailwind - Brak @layer**

**Problem:** Styling nie organizuje się za pomocą `@layer` directive.

**Reguła:** `frontend.mdc` - "Use the @layer directive to organize styles"

**Zawsze w `global.css`:**

```css
@layer components {
  .card-hover {
    @apply transition-all hover:shadow-lg;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

---

## ✅ Co Wdrożyć

### Priority 1 (ASAP)

- [ ] Usunąć `'use client'` z komponentów
- [ ] Dodać `aria-label` do wszystkich buttonów
- [ ] Zmienić `any` types na konkretne typy
- [ ] Dodać `React.memo()` do `FlashcardCard` i `CreateFlashcardForm`

### Priority 2 (Powinno)

- [ ] Ekstrahować logikę do custom hooks
- [ ] Dodać `useCallback` na handler functions
- [ ] Implementować `useId` dla form fields
- [ ] Dodać `aria-live` na toast notifications

### Priority 3 (Warto)

- [ ] Zorganizować styles w `@layer`
- [ ] Dodać `aria-expanded` na collapsible sections
- [ ] Dodać `aria-describedby` na input descriptions
- [ ] Dodać View Transitions API (Astro)

---

## 📊 Compliance Check

| Reguła                 | Status     | Opis                                |
| ---------------------- | ---------- | ----------------------------------- |
| `shared.mdc`           | ✅ OK      | Struktura katalogów prawidłowa      |
| `frontend.mdc`         | ⚠️ Partial | Brak ARIA, brak @layer              |
| `react.mdc`            | ❌ Not OK  | 'use client', brak memo, brak hooks |
| `astro.mdc`            | ✅ OK      | Page prawidłowa                     |
| `backend.mdc`          | ✅ OK      | API endpoints OK                    |
| `ui-shadcn-helper.mdc` | ✅ OK      | Komponenty OK                       |

---

## 🔧 Action Plan

### Step 1: Usunąć 'use client' (5 min)

Edytuj trzy pliki:

- `src/components/MyFlashcardsView.tsx`
- `src/components/FlashcardCard.tsx`
- `src/components/CreateFlashcardForm.tsx`

Usuń pierwszy wiersz: `'use client';`

### Step 2: Dodać ARIA (15 min)

Dodaj do każdego buttona:

```tsx
aria-label="descriptive text"
```

### Step 3: Fix Types (10 min)

Zmień `any` → `FlashcardUpdateDto`

### Step 4: React.memo (10 min)

Obuduj komponenty w `React.memo()`

### Step 5: useCallback (15 min)

Zawiń handler functions w `useCallback`

---

## 📝 Dokumentacja - Standards

Zaproponuję aktualizację:

**`.cursor/rules/my-flashcards.mdc`** - nowa reguła dla My Flashcards feature:

```markdown
---
description: Reguły dla My Flashcards feature
globs: src/components/Flashcard*.tsx,src/components/MyFlashcards*.tsx,src/components/CreateFlashcard*.tsx
alwaysApply: false
---

## My Flashcards Standards

### Component Structure

- Komponenty React MUSZĄ być bez 'use client' dyrektywy
- Wszystkie komponenty wrapper'owane w React.memo()
- Props handlers wrapper'owane w useCallback
- Wszystkie IDs generowane useId()

### Accessibility

- Każdy button MUSI mieć aria-label
- Toast notifications z aria-live="polite"
- Form inputs z aria-describedby
- Collapsible sections z aria-expanded

### Performance

- Memoizacja wszystkich handlers
- useCallback dla event listeners
- useMemo dla expensive calculations
```

---

## 🎯 Wynik Końcowy

Po wdrożeniu zmian:

- ✅ 100% compliance z `.cursor/` rules
- ✅ Pełna accessibility (WCAG 2.1 AA)
- ✅ Optymalna performance
- ✅ Unified code standards
- ✅ Consistency across project

---

## 💡 Rekomendacje

1. **Code Review Checklist** - dodaj do CI/CD
2. **EditorConfig** - enforce formatting
3. **Husky + Lint-staged** - pre-commit hooks
4. **Storybook** - showcase components z accessibility
5. **Accessibility Audit** - axe DevTools ci

---

## Deadline

⏰ **Szacunkowo 1-2 godziny** na wszystkie korekty
