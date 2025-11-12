# 🔌 API Reference - Endpoints

## Przegląd

Dokumentacja wszystkich endpointów API aplikacji 10xCards. Wszystkie endpointy wymagają uwierzytelnienia JWT i zwracają odpowiedzi w formacie JSON.

---

## 📑 Spis Treści

- [Uwierzytelnianie](#uwierzytelnianie)
- [Fiszki](#fiszki)
- [Generowanie Fiszek](#generowanie-fiszek)
- [Sesje Nauki](#sesje-nauki)
- [Statystyki](#statystyki)
- [Diagnostyka](#diagnostyka)

---

## 🔐 Uwierzytelnianie

Wszystkie endpointy (oprócz `/api/checkEnvs`) wymagają uwierzytelnienia. Używa się JWT tokenów z Supabase Auth.

### Nagłówki Uwierzytelniania

```http
Authorization: Bearer <jwt_token>
Cookie: sb-<project_ref>-auth-token=<token>
```

### Kody Błędów Uwierzytelniania

| Kod | Opis |
|-----|------|
| `401` | Brak uwierzytelnienia lub nieprawidłowy token |
| `403` | Brak dostępu do zasobu |

---

## 📚 Fiszki

Zarządzanie fiszkami użytkownika - CRUD operations.

### GET /api/flashcards

Pobierz wszystkie fiszki zalogowanego użytkownika.

**Parametry:** Brak

**Odpowiedź:**
```json
{
  "flashcards": [
    {
      "id": 123,
      "user_id": "uuid",
      "front": "Pytanie",
      "back": "Odpowiedź",
      "source": "manual",
      "generation_id": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Kody odpowiedzi:**
- `200` - Sukces
- `401` - Brak uwierzytelnienia

### POST /api/flashcards

Utwórz nowe fiszki.

**Treść zapytania:**
```json
{
  "flashcards": [
    {
      "front": "Pytanie",
      "back": "Odpowiedź",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

**Walidacja:**
- `front`: max 200 znaków
- `back`: max 500 znaków
- `source`: `"manual"` | `"ai-full"` | `"ai-edited"`
- Maksymalnie 100 fiszek na raz

**Odpowiedź:**
```json
{
  "flashcards": [...],
  "saved_count": 5
}
```

**Kody odpowiedzi:**
- `201` - Utworzono
- `400` - Nieprawidłowe dane
- `401` - Brak uwierzytelnienia

### PUT /api/flashcards

Aktualizuj istniejącą fiszkę.

**Treść zapytania:**
```json
{
  "id": 123,
  "front": "Zaktualizowane pytanie",
  "back": "Zaktualizowana odpowiedź"
}
```

**Odpowiedź:**
```json
{
  "flashcard": {
    "id": 123,
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

**Kody odpowiedzi:**
- `200` - Zaktualizowano
- `400` - Nieprawidłowe dane
- `404` - Fiszk nie znaleziono

### DELETE /api/flashcards

Usuń fiszkę.

**Treść zapytania:**
```json
{
  "id": 123
}
```

**Odpowiedź:**
```json
{
  "success": true
}
```

**Kody odpowiedzi:**
- `200` - Usunięto
- `404` - Fiszk nie znaleziono

---

## 🤖 Generowanie Fiszek

Generowanie fiszek przy użyciu AI.

### POST /api/generations

Wygeneruj fiszki z tekstu źródłowego przy użyciu OpenRouter AI.

**Treść zapytania:**
```json
{
  "source_text": "Twój tekst źródłowy do analizy..."
}
```

**Wymagania:**
- `source_text`: 1000-10000 znaków
- Użytkownik musi być zalogowany

**Odpowiedź:**
```json
{
  "generation_id": 456,
  "flashcards_proposals": [
    {
      "front": "Wygenerowane pytanie",
      "back": "Wygenerowana odpowiedź",
      "source": "ai-full"
    }
  ],
  "generated_count": 5
}
```

**Kody odpowiedzi:**
- `201` - Wygenerowano
- `400` - Nieprawidłowy tekst lub długość
- `401` - Brak uwierzytelnienia
- `500` - Błąd AI/OpenRouter

---

## 📖 Sesje Nauki

Zarządzanie sesjami nauki z algorytmem FSRS.

### GET /api/study-session

Pobierz fiszki wymagające powtórki.

**Parametry zapytania:**
- `limit` (opcjonalny): Liczba kart (1-100, domyślnie 20)

**Przykład:**
```
GET /api/study-session?limit=10
```

**Odpowiedź:**
```json
{
  "cards": [
    {
      "flashcard": {
        "id": 123,
        "front": "Pytanie",
        "back": "Odpowiedź"
      },
      "reviewLog": {
        "state": 2,
        "due": "2024-01-15T10:00:00Z",
        "stability": 15.5,
        "difficulty": 6.2
      },
      "state": "review",
      "due": "2024-01-15T10:00:00Z",
      "stability": 15.5,
      "difficulty": 6.2
    }
  ]
}
```

**Kody odpowiedzi:**
- `200` - Sukces
- `400` - Nieprawidłowy parametr limit
- `401` - Brak uwierzytelnienia

### POST /api/study-session

Prześlij ocenę dla fiszki w sesji nauki.

**Treść zapytania:**
```json
{
  "flashcard_id": 123,
  "rating": 3
}
```

**Oceny:**
- `1` - Again (ponownie)
- `2` - Hard (trudne)
- `3` - Good (dobre)
- `4` - Easy (łatwe)

**Odpowiedź:**
```json
{
  "success": true,
  "next_due": "2024-01-20T10:00:00Z",
  "updated_stability": 18.2
}
```

**Kody odpowiedzi:**
- `200` - Ocena zapisana
- `400` - Nieprawidłowe dane
- `401` - Brak uwierzytelnienia
- `404` - Fiszk nie znaleziono

---

## 📊 Statystyki

Statystyki nauki i postępów.

### GET /api/study-stats

Pobierz statystyki sesji nauki dla użytkownika.

**Parametry:** Brak

**Odpowiedź:**
```json
{
  "total_reviews": 150,
  "total_flashcards": 45,
  "average_rating": 3.2,
  "study_streak": 7,
  "cards_by_state": {
    "new": 10,
    "learning": 15,
    "review": 18,
    "relearning": 2
  },
  "today_stats": {
    "reviews_completed": 25,
    "time_spent_minutes": 15,
    "average_rating": 3.4
  }
}
```

**Kody odpowiedzi:**
- `200` - Sukces
- `401` - Brak uwierzytelnienia

---

## 🔍 Diagnostyka

Endpointy diagnostyczne.

### GET /api/checkEnvs

Sprawdź status zmiennych środowiskowych (bez ujawniania wartości).

**Odpowiedź:**
```json
{
  "supabase_url": "SET",
  "supabase_key": "SET",
  "openrouter_key": "SET"
}
```

**Możliwe wartości:**
- `"SET"` - Zmienna jest skonfigurowana
- `"MISSING"` - Zmienna nie jest skonfigurowana

**Kody odpowiedzi:**
- `200` - Zawsze (endpoint diagnostyczny)

---

## 🔐 Endpointy Auth

### POST /api/auth/login

Zaloguj użytkownika.

**Treść zapytania:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/register

Zarejestruj nowego użytkownika.

**Treść zapytania:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout

Wyloguj użytkownika.

**Treść zapytania:** Brak

### POST /api/auth/reset-password

Wyślij link resetowania hasła.

**Treść zapytania:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password-confirm

Potwierdź reset hasła z tokenem.

**Treść zapytania:**
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

---

## 📋 Typowe Kody Błędów

### Kody HTTP

| Kod | Opis |
|-----|------|
| `200` | Sukces |
| `201` | Utworzono |
| `400` | Nieprawidłowe dane wejściowe |
| `401` | Brak uwierzytelnienia |
| `403` | Brak dostępu |
| `404` | Zasób nie znaleziony |
| `422` | Błąd walidacji |
| `500` | Błąd serwera |

### Struktura Odpowiedzi Błędów

```json
{
  "error": "Opis błędu",
  "details": "Dodatkowe informacje",
  "validation_errors": [
    {
      "field": "source_text",
      "message": "Text must be at least 1000 characters long"
    }
  ]
}
```

---

## 🔄 Rate Limiting

API nie ma obecnie rate limiting, ale zalecane jest rozsądne używanie:

- Generowanie fiszek: Maksymalnie 5-10 razy dziennie
- Sesje nauki: Bez ograniczeń praktycznych
- CRUD fiszek: Standardowe limity aplikacji webowej

---

## 🧪 Testowanie API

### Narzędzia

- **Thunder Client** (VS Code extension)
- **Postman** lub **Insomnia**
- **curl** dla testów wiersza poleceń

### Przykład Testowania

```bash
# Pobierz fiszki
curl -X GET "http://localhost:3000/api/flashcards" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Utwórz fiszkę
curl -X POST "http://localhost:3000/api/flashcards" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "flashcards": [{
      "front": "Test question",
      "back": "Test answer",
      "source": "manual",
      "generation_id": null
    }]
  }'
```

---

**Ostatnia aktualizacja**: 2024-11-13
**Status**: ✅ Kompletna dokumentacja
**Wersja API**: v1.0
