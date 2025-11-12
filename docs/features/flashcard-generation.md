# 🤖 Generowanie Fiszek AI

## Przegląd

Funkcja generowania fiszek AI umożliwia automatyczne tworzenie wysokiej jakości fiszek z tekstu dostarczonego przez użytkownika. System wykorzystuje OpenRouter.ai API z modelem GPT-4o-mini do analizy tekstu i generowania fiszek w formacie pytanie-odpowiedź.

---

## 📑 Spis Treści

- [Jak Działa](#jak-działa)
- [Wymagania Techniczne](#wymagania-techniczne)
- [Proces Generowania](#proces-generowania)
- [Format Fiszek](#format-fiszek)
- [Zarządzanie Wygenerowanymi Fiskami](#zarządzanie-wygenerowanymi-fiskami)
- [Walidacja i Bezpieczeństwo](#walidacja-i-bezpieczeństwo)
- [Obsługa Błędów](#obsługa-błędów)
- [Metryki i Statystyki](#metryki-i-statystyki)

---

## 🔧 Jak Działa

### Architektura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  OpenRouter API  │───▶│  JSON Response  │
│   (Source Text) │    │  (GPT-4o-mini)   │    │  (Structured)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Flashcard       │───▶│  User Review     │───▶│   Database      │
│ Proposals       │    │  (Accept/Reject) │    │   (Save)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Komponenty

1. **Frontend**: `FlashcardGenerationView.tsx` - Interfejs użytkownika
2. **API Endpoint**: `/api/generations` - Obsługa żądań generowania
3. **GenerationService**: Logika biznesowa i integracja z AI
4. **OpenRouterService**: Komunikacja z API OpenRouter.ai

---

## ⚙️ Wymagania Techniczne

### Limity Tekstu

- **Minimalna długość**: 1,000 znaków
- **Maksymalna długość**: 10,000 znaków
- **Format**: Zwykły tekst (bez formatowania HTML)

### Wymagania Systemowe

- **Node.js**: 22.14.0
- **OpenRouter API Key**: Ważny klucz API
- **Supabase**: Dostęp do bazy danych
- **Timeout**: 60 sekund na pojedyncze żądanie

### Zmienne Środowiskowe

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx

# Supabase (w runtime dla Cloudflare)
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_KEY=anon-key
```

---

## 🔄 Proces Generowania

### Krok 1: Walidacja Wejścia

```typescript
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});
```

### Krok 2: Przygotowanie Prompt AI

System wykorzystuje strukturalny prompt dla modelu GPT-4o-mini:

```typescript
// System Message
"You are an AI assistant specialized in creating high-quality flashcards from provided text.
Generate concise, clear, and effective flashcards that capture key concepts and knowledge.
Each flashcard should have a front (question/prompt) and back (answer/explanation).
Focus on important facts, definitions, concepts, and relationships."

// JSON Schema for Response
{
  "name": "flashcards",
  "schema": {
    "type": "object",
    "properties": {
      "flashcards": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "front": { "type": "string" },
            "back": { "type": "string" }
          },
          "required": ["front", "back"]
        }
      }
    },
    "required": ["flashcards"]
  }
}
```

### Krok 3: Wywołanie API

```typescript
// Konfiguracja modelu
this.openRouter.setModel("openai/gpt-4o-mini", {
  temperature: 0.7,
  top_p: 1,
});

// Timeout i retry logic
this.openRouter = new OpenRouterService({
  apiKey: openRouterApiKey,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
});
```

### Krok 4: Przetwarzanie Odpowiedzi

1. **Parsowanie JSON**: Walidacja struktury odpowiedzi
2. **Konwersja formatu**: Przekształcenie na `FlashcardProposalDto[]`
3. **Zapis metadanych**: Logowanie do tabeli `generations`

---

## 📋 Format Fiszek

### Struktura Pojedynczej Fisżki

```typescript
interface FlashcardProposalDto {
  front: string;        // Pytanie/prompt (max 200 znaków)
  back: string;         // Odpowiedź/wyjaśnienie (max 500 znaków)
  source: "ai-full";    // Źródło generowania
}
```

### Przykład Wygenerowanych Fiszek

```json
{
  "flashcards": [
    {
      "front": "Czym różni się class od struct w C#?",
      "back": "class to typ referencyjny kopiowany przez referencję, struct to typ wartościowy kopiowany przez wartość."
    },
    {
      "front": "Jak działa Garbage Collector w C#?",
      "back": "GC automatycznie zarządza pamięcią, zwalniając obiekty, które nie są już osiągalne. Dla deterministycznego zwalniania używa się IDisposable."
    }
  ]
}
```

### Kryteria Jakości

- **Concise**: Krótkie, ale kompletne odpowiedzi
- **Accurate**: Dokładne informacje z tekstu źródłowego
- **Clear**: Jasne i zrozumiałe pytania
- **Focused**: Koncentracja na kluczowych koncepcjach

---

## 🎛️ Zarządzanie Wygenerowanymi Fiskami

### Interfejs Użytkownika

1. **Lista propozycji**: Wyświetlanie wygenerowanych fiszek
2. **Akceptacja/Odrzucenie**: Przyciski ✓/✗ dla każdej fiszki
3. **Edycja**: Możliwość modyfikacji przed zapisem
4. **Zapis zbiorczy**: Zapisywanie zaakceptowanych fiszek

### Przepływ Użytkownika

```
1. Wprowadź tekst źródłowy (1000-10000 znaków)
2. Kliknij "Generuj Fiszk"
3. Przejrzyj wygenerowane propozycje
4. Zaakceptuj/Edytuj/Odrzuć poszczególne fiszki
5. Zapisz zaakceptowane fiszki do kolekcji
```

### Stan Aplikacji

```typescript
interface GenerationState {
  generationId: number | null;        // ID generowania
  flashcards: FlashcardProposal[];    // Lista propozycji
  error: string | null;              // Błąd (jeśli wystąpił)
  isLoading: boolean;                // Stan ładowania
}
```

---

## 🛡️ Walidacja i Bezpieczeństwo

### Walidacja Wejścia

- **Długość tekstu**: 1000-10000 znaków
- **Typ danych**: Tylko string (żaden HTML/JavaScript)
- **Autentyfikacja**: Wymagane zalogowanie użytkownika

### Walidacja Wyjścia

```typescript
// Zod schema dla odpowiedzi API
const apiResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string(),
    }),
  })),
});

// Parsowanie i walidacja JSON
const data = JSON.parse(response);
if (!data.flashcards || !Array.isArray(data.flashcards)) {
  throw new Error("Invalid response format");
}
```

### Bezpieczeństwo API

- **Rate Limiting**: Ograniczenie liczby żądań
- **API Key Protection**: Klucz nie jest logowany
- **Error Handling**: Szczegółowe logowanie błędów bez wrażliwych danych
- **Timeout Protection**: 60-sekundowy timeout

---

## 🚨 Obsługa Błędów

### Typy Błędów

```typescript
class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
  }
}
```

### Kody Błędów

| Kod | Opis | Akcja |
|-----|------|-------|
| `INVALID_SYSTEM_MESSAGE` | Nieprawidłowa wiadomość systemowa | Sprawdź konfigurację |
| `INVALID_USER_MESSAGE` | Pusta wiadomość użytkownika | Sprawdź tekst wejściowy |
| `INVALID_MODEL_NAME` | Nieprawidłowa nazwa modelu | Sprawdź konfigurację |
| `EMPTY_RESPONSE` | Brak odpowiedzi od AI | Spróbuj ponownie |
| `API_ERROR` | Błąd API OpenRouter | Sprawdź klucz API |
| `VALIDATION_ERROR` | Błąd walidacji | Sprawdź format danych |
| `MAX_RETRIES_EXCEEDED` | Przekroczono limit prób | Spróbuj później |

### Logowanie Błędów

Wszystkie błędy są logowane do tabeli `generation_error_logs`:

```sql
CREATE TABLE generation_error_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  model TEXT NOT NULL,
  source_text_hash TEXT NOT NULL,
  source_text_length INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Metryki i Statystyki

### Tabela Generations

```sql
CREATE TABLE generations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  source_text_hash TEXT NOT NULL,
  source_text_length INTEGER NOT NULL,
  generated_count INTEGER NOT NULL,
  generation_duration INTEGER NOT NULL, -- w milisekundach
  model TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Śledzone Metryki

- **Czas generowania**: Od wysłania request do otrzymania odpowiedzi
- **Liczba wygenerowanych fiszek**: Ilość propozycji na jedno żądanie
- **Success/Failure Rate**: Procent udanych generowań
- **Błędy API**: Szczegóły błędów OpenRouter

### Przykład Metryki

```typescript
const startTime = Date.now();
// ... wywołanie API ...
const durationMs = Date.now() - startTime;

// Zapis do bazy
await supabase.from("generations").insert({
  user_id: userId,
  source_text_hash: hash,
  source_text_length: text.length,
  generated_count: proposals.length,
  generation_duration: durationMs,
  model: "openai/gpt-4o-mini",
});
```

---

## 🧪 Testowanie

### Testy Jednostkowe

- **OpenRouterService**: Mockowanie API, testy błędów
- **GenerationService**: Testy logiki biznesowej
- **Validation**: Testy schematów Zod

### Testy E2E

```typescript
test("complete workflow from article to saved flashcards", async ({ page }) => {
  // 1. Wypełnij tekst źródłowy
  // 2. Kliknij Generate
  // 3. Zaakceptuj fiszki
  // 4. Zapisz do bazy
});
```

### Test Data

Używany artykuł o C# (ponad 1000 znaków) do testów end-to-end.

---

## 🚀 Optymalizacje Przyszłe

### Wydajność

- **Streaming Response**: Przetwarzanie odpowiedzi w czasie rzeczywistym
- **Batch Processing**: Generowanie wielu fiszek równolegle
- **Caching**: Zapisywanie wyników dla podobnych tekstów

### Jakość

- **Fine-tuning**: Dostrojenie modelu dla fiszek edukacyjnych
- **Multi-language**: Wsparcie dla różnych języków
- **Difficulty Levels**: Dostosowanie poziomu trudności

### Funkcjonalność

- **Templates**: Różne formaty fiszek (np. cloze deletion)
- **Categories**: Automatyczne kategoryzowanie fiszek
- **Review Cycles**: Integracja z systemem spaced repetition

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletna implementacja
**Test Coverage**: ✅ Pełne pokrycie E2E
