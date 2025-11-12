# 📋 API Schemas - Zod Validation

## Przegląd

Wszystkie dane wejściowe API są walidowane przy użyciu biblioteki Zod. Schematy zapewniają type safety, sanitizację danych i zrozumiałe komunikaty błędów.

---

## 📑 Spis Treści

- [Architektura Walidacji](#architektura-walidacji)
- [Schematy Auth](#schematy-auth)
- [Schematy Fiszek](#schematy-fiszek)
- [API Request Schemas](#api-request-schemas)
- [Komunikaty Błędów](#komunikaty-błędów)
- [Type Safety](#type-safety)

---

## 🏗️ Architektura Walidacji

### Lokalizacja Schematów

```bash
src/lib/validations/
├── auth.schemas.ts          # Schematy autentyfikacji
├── flashcard.schemas.ts     # Schematy fiszek
└── index.ts                 # Eksport wszystkich schematów
```

### Zasady Walidacji

1. **Ścisła walidacja** - wszystkie dane wejściowe są sprawdzane
2. **Sanitizacja** - automatyczne trimowanie stringów
3. **Bezpieczeństwo** - ochrona przed injection i nieprawidłowymi danymi
4. **Type Safety** - automatyczna generacja typów TypeScript

### Przykład Użycia

```typescript
// Parsowanie i walidacja
const result = schema.safeParse(inputData);

if (result.success) {
  // result.data jest typem bezpiecznym
  processData(result.data);
} else {
  // result.error zawiera szczegółowe błędy
  return validationErrorResponse(result.error.errors);
}
```

---

## 🔐 Schematy Auth

### Login Schema

```typescript
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
});
```

**Przykład prawidłowych danych:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Register Schema

```typescript
export const registerSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters"),

  confirmPassword: z.string()
    .min(1, "Please confirm your password")
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
```

**Przykład prawidłowych danych:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

### Reset Password Schemas

```typescript
export const resetPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
});

export const resetPasswordConfirmSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters"),

  confirmPassword: z.string()
    .min(1, "Please confirm your password")
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
```

---

## 📚 Schematy Fiszek

### Content Schema (Podstawowy)

```typescript
const flashcardContentSchema = z.object({
  front: z.string()
    .min(1, "Front side is required")
    .max(200, "Front side must be less than 200 characters")
    .trim(),

  back: z.string()
    .min(1, "Back side is required")
    .max(500, "Back side must be less than 500 characters")
    .trim()
});
```

### Source Schema

```typescript
const sourceSchema = z.enum(["ai-full", "ai-edited", "manual"] as const);
```

**Wartości źródłowe:**
- `"ai-full"` - Fiszk wygenerowana przez AI, bez edycji
- `"ai-edited"` - Fiszk wygenerowana przez AI i później edytowana
- `"manual"` - Fiszk utworzona ręcznie przez użytkownika

### Create Flashcard Schema

```typescript
export const createFlashcardSchema = flashcardContentSchema.extend({
  source: sourceSchema,
  generation_id: z.number().nullable()
});
```

**Zasady walidacji:**
- `generation_id` musi być `null` dla `source: "manual"`
- `generation_id` musi być liczbą dla `source: "ai-full"` lub `"ai-edited"`

**Przykład prawidłowych danych:**
```json
{
  "front": "Czym jest TypeScript?",
  "back": "TypeScript to nadzbiór JavaScript z typami statycznymi",
  "source": "manual",
  "generation_id": null
}
```

```json
{
  "front": "Jak działa garbage collector w JavaScript?",
  "back": "GC automatycznie zwalnia pamięć zajmowaną przez obiekty, które nie są już osiągalne",
  "source": "ai-full",
  "generation_id": 123
}
```

### Update Flashcard Schema

```typescript
export const updateFlashcardSchema = flashcardContentSchema.partial().extend({
  source: sourceSchema.optional(),
  generation_id: z.number().nullable().optional()
});
```

**Wszystkie pola są opcjonalne** - można aktualizować tylko wybrane właściwości.

**Przykład prawidłowych danych:**
```json
{
  "front": "Zaktualizowane pytanie",
  "back": "Zaktualizowana odpowiedź"
}
```

### Manual Flashcard Schema

```typescript
export const manualFlashcardSchema = flashcardContentSchema;
```

**Uproszczony schemat** dla ręcznego tworzenia fiszek w formularzach.

---

## 📤 API Request Schemas

### Generate Flashcards Schema

```typescript
export const generateFlashcardsSchema = z.object({
  source_text: z.string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must be less than 10000 characters")
    .trim()
});
```

**Wymagania:**
- Minimum 1000 znaków
- Maksimum 10000 znaków
- Automatyczne trimowanie białych znaków

### Search Flashcards Schema

```typescript
export const searchFlashcardsSchema = z.object({
  query: z.string()
    .max(100, "Search query must be less than 100 characters")
    .optional(),

  limit: z.number()
    .min(1)
    .max(100)
    .default(20)
    .optional(),

  offset: z.number()
    .min(0)
    .default(0)
    .optional()
});
```

### Study Session Schemas

**Review Schema (używany w POST /api/study-session):**
```typescript
const reviewSchema = z.object({
  flashcard_id: z.number().int().positive(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
});
```

**Oceny:**
- `1` - Again
- `2` - Hard
- `3` - Good
- `4` - Easy

---

## 🚨 Komunikaty Błędów

### Struktura Błędów Walidacji

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "front",
      "message": "Front side must be less than 200 characters",
      "code": "too_big"
    },
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "code": "invalid_string"
    }
  ]
}
```

### Najczęstsze Błędy

#### Długość Stringów
```json
{
  "field": "front",
  "message": "Front side must be less than 200 characters",
  "code": "too_big"
}
```

#### Wymagane Pola
```json
{
  "field": "back",
  "message": "Back side is required",
  "code": "too_small"
}
```

#### Format Email
```json
{
  "field": "email",
  "message": "Please enter a valid email address",
  "code": "invalid_string"
}
```

#### Nierówne Hasła
```json
{
  "field": "confirmPassword",
  "message": "Passwords do not match",
  "code": "custom"
}
```

#### Zakres Liczbowy
```json
{
  "field": "rating",
  "message": "Number must be greater than or equal to 1",
  "code": "too_small"
}
```

---

## 🔒 Type Safety

### Automatyczna Generacja Typów

Wszystkie schematy Zod automatycznie generują typy TypeScript:

```typescript
// Typy wygenerowane ze schematów
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateFlashcardFormData = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardFormData = z.infer<typeof updateFlashcardSchema>;
export type GenerateFlashcardsFormData = z.infer<typeof generateFlashcardsSchema>;
export type SearchFlashcardsFormData = z.infer<typeof searchFlashcardsSchema>;
```

### Użycie w Komponentach

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = (data: LoginFormData) => {
    // data jest w pełni typowane i zwalidowane
    loginUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### Użycie w API

```typescript
import type { APIRoute } from "astro";
import { loginSchema } from "@/lib/validations";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return validationErrorResponse(result.error.errors);
  }

  // result.data jest typem LoginFormData
  const { email, password } = result.data;
  // ... dalsza logika
};
```

---

## 🧪 Testowanie Schematów

### Testy Jednostkowe

```typescript
describe("flashcardContentSchema", () => {
  it("should validate correct flashcard content", () => {
    const validData = {
      front: "What is TypeScript?",
      back: "TypeScript is a superset of JavaScript with static typing"
    };

    const result = flashcardContentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject front text that is too long", () => {
    const longFront = "a".repeat(201);
    const invalidData = {
      front: longFront,
      back: "Valid back"
    };

    const result = flashcardContentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain("200 characters");
  });
});
```

### Testy Integracyjne

```typescript
describe("API Validation", () => {
  it("should validate flashcard creation request", async () => {
    const response = await request(app)
      .post("/api/flashcards")
      .send({
        flashcards: [{
          front: "", // Invalid: empty
          back: "Valid back",
          source: "manual",
          generation_id: null
        }]
      });

    expect(response.status).toBe(422);
    expect(response.body.details[0].field).toBe("front");
  });
});
```

---

## 📚 Dodatkowe Zasoby

- [Zod Documentation](https://zod.dev/) - Oficjalna dokumentacja Zod
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Typy TypeScript
- [RFC 7807](https://tools.ietf.org/html/rfc7807) - Problem Details for HTTP APIs

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletna dokumentacja
**Zod Version**: 3.25.76
