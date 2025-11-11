# Dokumentacja funkcji "Moje Fiszki"

## Przegląd

Funkcja "Moje Fiszki" zapewnia użytkownikom kompleksowy interfejs do zarządzania ich kolekcją fiszek. Użytkownicy mogą tworzyć, przeglądać, aktualizować i usuwać fiszki za pomocą pięknego, intuicyjnego interfejsu użytkownika.

Niniejszy dokument obejmuje zarówno funkcje widoczne dla użytkownika, jak i szczegóły techniczne implementacji.

## Funkcje

### 1. **Przeglądanie fiszek**

- Wyświetlanie wszystkich fiszek utworzonych przez zalogowanego użytkownika
- Fiszki sortowane według daty utworzenia (najnowsze pierwsze)
- Interaktywne obracanie kart - kliknij, aby przełączać między przednią a tylną stroną

### 2. **Tworzenie fiszek**

- Ręczne tworzenie fiszek za pomocą przyjaznego formularza
- Walidacja:
  - Tekst przedniej strony: maksymalnie 200 znaków
  - Tekst tylnej strony: maksymalnie 500 znaków
- Źródło automatycznie ustawiane na "manual"
- Wyświetlanie licznika znaków w czasie rzeczywistym

### 3. **Edycja fiszek**

- Edycja inline dla szybkich aktualizacji
- Pełna walidacja z limitami znaków
- Zachowanie źródła fiszki i generation_id
- Przycisk anulowania do odrzucenia zmian

### 4. **Usuwanie fiszek**

- Usuwanie jednym kliknięciem z potwierdzeniem w postaci powiadomienia toast
- Natychmiastowa aktualizacja UI bez przeładowania strony

### 5. **Wyszukiwanie i filtrowanie**

- Wyszukiwanie w czasie rzeczywistym w tekście przedniej i tylnej strony
- Dopasowanie bez rozróżniania wielkości liter
- Wyświetlanie liczby przefiltrowanych wyników
- Licznik wyświetlanych fiszek

### 6. **Doświadczenie użytkownika**

- Piękny układ oparty na kartach z responsywną siatką
- Powiadomienia toast dla wszystkich akcji (sukces/błąd)
- Stany ładowania ze szkieletowymi loaderami
- Obsługa błędów z funkcjonalnością ponawiania
- Stany puste z pomocnymi komunikatami

## Struktura plików

```
src/
├── pages/
│   ├── my-flashcards.astro           # Strona główna
│   └── api/
│       └── flashcards.ts             # Endpointy API (operacje CRUD)
├── components/
│   ├── MyFlashcardsView.tsx          # Główny komponent widoku
│   ├── FlashcardCard.tsx             # Wyświetlanie/edycja pojedynczej fiszki
│   └── CreateFlashcardForm.tsx       # Formularz tworzenia
├── hooks/
│   ├── api/
│   │   └── useFlashcards.ts          # Hook API dla operacji na fiszkach
│   └── useFlashcardManagement.ts     # Hook kompozytowy z zarządzaniem stanem
├── lib/
│   ├── flashcard.service.ts          # Serwis z metodami CRUD
│   └── validations/
│       └── flashcard.schemas.ts      # Schematy walidacji Zod
├── middleware/
│   └── index.ts                      # Ochrona tras (zaktualizowany)
└── types.ts                          # Definicje typów (zaktualizowane)
```

## Endpointy API

### GET /api/flashcards

Pobiera wszystkie fiszki dla zalogowanego użytkownika.

**Odpowiedź:**

```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "Czym jest React?",
      "back": "Biblioteka JavaScript...",
      "source": "manual",
      "generation_id": null,
      "created_at": "2025-10-20T10:30:00Z",
      "updated_at": "2025-10-20T10:30:00Z"
    }
  ]
}
```

### POST /api/flashcards

Tworzy jedną lub więcej fiszek.

**Żądanie:**

```json
{
  "flashcards": [
    {
      "front": "Pytanie?",
      "back": "Odpowiedź",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

**Szczegóły walidacji:**

- **front**: string, wymagane, 1-200 znaków
- **back**: string, wymagane, 1-500 znaków
- **source**: enum ("ai-full", "ai-edited", "manual")
- **generation_id**: number lub null (wymagane dla "ai-full" i "ai-edited", null dla "manual")

**Odpowiedź sukcesu:**

- Kod statusu: 201 (Created)
- Zwraca tablicę utworzonych fiszek z przypisanymi ID

**Kody błędów:**

- 400: Nieprawidłowe dane wejściowe
- 401: Brak autoryzacji
- 500: Błąd serwera

### PUT /api/flashcards

Aktualizuje fiszkę.

**Żądanie:**

```json
{
  "id": 1,
  "front": "Zaktualizowane pytanie?",
  "back": "Zaktualizowana odpowiedź",
  "source": "manual",
  "generation_id": null
}
```

**Walidacja:**

- ID fiszki musi należeć do zalogowanego użytkownika
- Zachowywane są te same reguły walidacji co przy tworzeniu

### DELETE /api/flashcards

Usuwa fiszkę.

**Żądanie:**

```json
{
  "id": 1
}
```

**Walidacja:**

- ID fiszki musi należeć do zalogowanego użytkownika
- Fiszka zostaje trwale usunięta z bazy danych

## API komponentów

### MyFlashcardsView

Główny komponent zarządzający listą fiszek, tworzeniem, aktualizacjami i usuwaniem.

**Funkcje:**

- Pobiera fiszki podczas montowania
- Obsługuje logikę wyszukiwania/filtrowania
- Zarządza stanami ładowania i błędów
- Integruje się z endpointami API

**Wykorzystuje:**

- Hook `useFlashcardManagement` do zarządzania stanem
- Hook `useFlashcardSearch` do funkcji wyszukiwania

### FlashcardCard

Wyświetla pojedynczą fiszkę z interaktywnymi funkcjami.

**Właściwości (Props):**

```typescript
{
  flashcard: FlashcardDto;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}
```

**Funkcje:**

- Animacja obracania po kliknięciu
- Tryb edycji inline
- Kopiowanie do schowka
- Potwierdzenie usunięcia

### CreateFlashcardForm

Formularz do tworzenia nowych fiszek.

**Właściwości (Props):**

```typescript
{
  onSubmit: (front: string, back: string) => Promise<void>;
  isLoading?: boolean;
}
```

**Funkcje:**

- Przełączanie otwierania/zamykania formularza
- Walidacja licznika znaków
- Przycisk anulowania
- Stan ładowania

## Szczegóły implementacji

### Backend - Warstwa serwisowa (`src/lib/flashcard.service.ts`)

Rozszerzono klasę `FlashcardService` o cztery metody:

- **`getByUserId(userId: string)`** - Pobiera wszystkie fiszki użytkownika
- **`getById(id: number, userId: string)`** - Pobiera pojedynczą fiszkę po ID
- **`update(id: number, userId: string, updates: FlashcardUpdateDto)`** - Aktualizuje fiszkę
- **`delete(id: number, userId: string)`** - Usuwa fiszkę

Wszystkie metody zawierają:

- Prawidłową obsługę błędów z wyjątkami `DatabaseError`
- Sprawdzanie autoryzacji użytkownika (zapewnienie dostępu tylko do własnych fiszek)
- Bezpieczeństwo typów TypeScript

### Backend - Trasy API (`src/pages/api/flashcards.ts`)

Wszystkie endpointy zawierają:

- Sprawdzanie uwierzytelnienia przez middleware
- Walidację schematu Zod
- Kompleksową obsługę błędów
- Odpowiedzi JSON z odpowiednimi kodami statusu HTTP

**Przepływ danych dla POST /api/flashcards:**

1. Klient wysyła żądanie POST z tablicą obiektów flashcards
2. Warstwa API weryfikuje autoryzację użytkownika
3. Dane są walidowane (długości pól, poprawność source, zgodność generation_id)
4. Wywoływany jest serwis implementujący logikę biznesową
5. Fiszki są zapisywane do bazy danych operacją batch insert
6. W przypadku błędów następuje rollback, klient otrzymuje odpowiedni komunikat

### Frontend - Niestandardowe hooki

**Hook API (`useFlashcards`):**

- Niskopoziomowa komunikacja z API
- Zwraca: `{ fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, isLoading }`

**Hook kompozytowy (`useFlashcardManagement`):**

- Łączy `useFlashcards` z zarządzaniem stanem
- Automatycznie ładuje fiszki podczas montowania
- Zapewnia handlery: `{ flashcards, handleCreateFlashcard, handleUpdateFlashcard, handleDeleteFlashcard, refetch }`

**Hook wyszukiwania (`useFlashcardSearch`):**

- Filtrowanie po stronie klienta
- Zwraca: `{ searchQuery, setSearchQuery, filteredFlashcards, searchStats }`

### Frontend - Strona główna (`src/pages/my-flashcards.astro`)

- Sprawdzanie uwierzytelnienia (przekierowanie do logowania jeśli nie zalogowany)
- Piękny nagłówek z opisem
- Integracja komponentu `MyFlashcardsView`
- Responsywny układ używający komponentu `Layout`

### Aktualizacje nawigacji (`src/components/Navbar.tsx`)

- Dodano link "Moje Fiszki" po linku "Generuj"
- Spójny styl z innymi elementami nawigacji
- Link prowadzi do trasy `/my-flashcards`

### Ochrona tras (`src/middleware/index.ts`)

- Dodano `/my-flashcards` do chronionych tras
- Automatyczne przekierowanie do logowania dla niezalogowanych użytkowników

## Baza danych

### Tabela Flashcards

Fiszki są przechowywane w tabeli Supabase `flashcards`:

```sql
id              INT PRIMARY KEY
front           VARCHAR(200)
back            VARCHAR(500)
source          VARCHAR (np. "manual", "ai-full", "ai-edited")
generation_id   INT NULLABLE (odniesienie do tabeli generations)
user_id         UUID (klucz obcy do auth.users)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

## Bezpieczeństwo

### Uwierzytelnianie i autoryzacja

- **Uwierzytelnianie**: Wszystkie endpointy wymagają uwierzytelnienia użytkownika (weryfikowane przez middleware)
- **Autoryzacja**: Użytkownicy mogą uzyskać dostęp tylko do własnych fiszek (wymuszane przez `user_id`)
- **Walidacja danych wejściowych**: Schematy Zod walidują wszystkie dane wprowadzane przez użytkownika
- **Obsługa błędów**: Bezpieczne komunikaty o błędach bez ujawniania szczegółów bazy danych
- **Ochrona CORS**: Wbudowana w konfigurację Supabase

### Funkcje bezpieczeństwa

1. Uwierzytelnianie oparte na JWT przez Supabase Auth
2. Row Level Security (RLS) w Supabase
3. Walidacja po stronie serwera na wszystkich endpointach API
4. Walidacja po stronie klienta dla lepszego UX
5. Pliki cookie HTTP-only i secure dla przechowywania sesji

## Przepływ danych

```
Użytkownik przechodzi do /my-flashcards
    ↓
Middleware sprawdza uwierzytelnienie
    ↓
Komponent strony montuje MyFlashcardsView
    ↓
Hook useFlashcardManagement automatycznie ładuje dane
    ↓
GET /api/flashcards pobiera fiszki użytkownika
    ↓
Fiszki wyświetlane w responsywnej siatce
    ↓
Użytkownik może:
  - Tworzyć: POST /api/flashcards
  - Czytać: Wyświetlane na stronie
  - Aktualizować: PUT /api/flashcards
  - Usuwać: DELETE /api/flashcards
```

## Funkcje UI/UX

### Główne cechy designu

- **Responsywna siatka**: 1 kolumna (mobile), 2 kolumny (tablet), 3 kolumny (desktop)
- **Układ oparty na kartach**: Nowoczesny design kart z efektami hover
- **Interaktywne obracanie**: Kliknięcie karty przełącza między przednią a tylną stroną
- **Edycja inline**: Edytuj karty bez opuszczania strony
- **Funkcja wyszukiwania**: Filtrowanie w czasie rzeczywistym w tekście przedniej i tylnej strony
- **Powiadomienia toast**: Informacje zwrotne użytkownika dla wszystkich akcji
- **Stany ładowania**: Szkieletowe loadery podczas pobierania danych
- **Obsługa błędów**: Przyjazne dla użytkownika komunikaty o błędach z przyciskiem ponawiania
- **Stany puste**: Pomocne komunikaty, gdy nie ma fiszek

### Dostępność

- Semantyczna struktura HTML
- Obsługa nawigacji klawiaturą
- Etykiety ARIA tam, gdzie potrzebne
- Wyraźne stany focusu
- Wysokie kontrasty kolorów

## Testowanie

### Lista kontrolna testowania ręcznego

#### Operacja tworzenia

- ✅ Tworzenie fiszki z prawidłowymi danymi
- ✅ Walidacja limitów znaków (200 przód, 500 tył)
- ✅ Odrzucanie pustej treści
- ✅ Nowa karta pojawia się na górze listy natychmiast
- ✅ Komunikat potwierdzenia toast

#### Operacja odczytu

- ✅ Ładowanie fiszek podczas montowania strony
- ✅ Wyświetlanie wszystkich fiszek użytkownika
- ✅ Wyświetlanie szkieletowego loadera podczas pobierania
- ✅ Wyświetlanie stanu pustego, gdy nie ma fiszek
- ✅ Kliknięcie karty obraca między przednią a tylną stroną

#### Operacja aktualizacji

- ✅ Kliknięcie przycisku edycji włącza tryb edycji
- ✅ Aktualizacja tekstu przedniej strony z walidacją
- ✅ Aktualizacja tekstu tylnej strony z walidacją
- ✅ Zapisanie zmian i natychmiastowe wyświetlenie aktualizacji
- ✅ Anulowanie edycji odrzuca zmiany
- ✅ Licznik znaków wyświetlany podczas edycji

#### Operacja usuwania

- ✅ Kliknięcie przycisku usuwania
- ✅ Fiszka usunięta natychmiast
- ✅ Potwierdzenie toast
- ✅ Brak możliwości cofnięcia (przyszłe usprawnienie)

#### Wyszukiwanie/filtrowanie

- ✅ Wpisywanie w pole wyszukiwania
- ✅ Wyniki filtrowane w czasie rzeczywistym
- ✅ Wyszukiwanie bez rozróżniania wielkości liter
- ✅ Przeszukiwanie tekstu zarówno przedniej, jak i tylnej strony
- ✅ Wyświetlanie liczby przefiltrowanych

#### Obsługa błędów

- ✅ Elegancka obsługa błędów sieciowych
- ✅ Przycisk ponawiania pojawia się przy błędzie
- ✅ Znaczące komunikaty o błędach
- ✅ Użytkownik pozostaje na stronie podczas błędu

#### Uwierzytelnianie

- ✅ Niezalogowany użytkownik przekierowany do logowania
- ✅ Wygaśnięcie sesji obsługiwane prawidłowo
- ✅ Dane użytkownika odpowiednio izolowane

## Użytkowanie

### Dostęp do funkcji

1. **Zaloguj się** na swoje konto 10xCards
2. Kliknij **"Moje Fiszki"** na pasku nawigacji
3. Lub przejdź bezpośrednio do `/my-flashcards`

### Podstawowe operacje

**Tworzenie fiszki:**

1. Kliknij przycisk **"Utwórz nową fiszkę"**
2. Wprowadź pytanie/podpowiedź w polu **Przód** (maks. 200 znaków)
3. Wprowadź odpowiedź w polu **Tył** (maks. 500 znaków)
4. Kliknij **"Utwórz fiszkę"**

**Przeglądanie fiszek:**

- Kliknij dowolną fiszkę, aby przełączać między przednią a tylną stroną
- Najnowsze karty pojawiają się jako pierwsze

**Edycja fiszki:**

1. Kliknij przycisk **✏️ Edytuj**
2. Zmodyfikuj treść
3. Kliknij **"Zapisz"** lub **"Anuluj"**

**Usuwanie fiszki:**

1. Kliknij przycisk **🗑️ Usuń**
2. Karta zostanie natychmiast usunięta

**Wyszukiwanie:**

1. Wpisz w polu wyszukiwania u góry
2. Wyniki filtrowane w czasie rzeczywistym

## Rozwiązywanie problemów

### Fiszki się nie ładują?

- Sprawdź status uwierzytelnienia
- Zweryfikuj połączenie sieciowe
- Sprawdź konsolę przeglądarki pod kątem błędów
- Użyj przycisku ponawiania w powiadomieniu o błędzie

### Zmiany się nie zapisują?

- Upewnij się, że połączenie sieciowe jest aktywne
- Sprawdź limity znaków (Przód: 200, Tył: 500)
- Zweryfikuj, czy użytkownik jest nadal zalogowany
- Spróbuj ponownie za chwilę

### Wyszukiwanie nie działa?

- Upewnij się, że wpisałeś tekst w polu wyszukiwania
- Spróbuj innych słów kluczowych
- Zresetuj wyszukiwanie, aby zobaczyć wszystkie karty

### Nie można uzyskać dostępu do strony?

- Najpierw zaloguj się - musisz być uwierzytelniony, aby korzystać z tej funkcji
- Sprawdź, czy sesja nie wygasła

## Optymalizacje wydajności

- **Efektywne zarządzanie stanem**: Używa hooków React dla optymalnych re-renderów
- **Filtrowane wyszukiwanie**: Filtrowanie po stronie klienta dla responsywnego UX
- **Lazy Loading**: Komponenty używają dyrektywy `client:load`
- **Minimalne wywołania API**: Pojedyncze pobranie podczas montowania, aktualizacje przy akcji
- **Optymistyczny UI**: Aktualizacje wyświetlane natychmiast przed potwierdzeniem

## Stack technologiczny

- **Frontend**: Astro 5, React 19, TypeScript 5
- **Stylowanie**: Tailwind CSS 4
- **Komponenty UI**: shadcn/ui
- **Backend**: Trasy API Astro
- **Baza danych**: Supabase (PostgreSQL)
- **Walidacja**: Zod
- **Powiadomienia**: Sonner (Toast)
- **Ikony**: Lucide React

## Przyszłe usprawnienia

Potencjalne ulepszenia dla przyszłych iteracji:

1. **Tryb nauki** - Interaktywna nauka fiszek z powtórkami przestrzennymi
2. **Operacje zbiorcze** - Wybieranie wielu kart do operacji zbiorczych
3. **Kategorie/tagi** - Organizowanie fiszek w kolekcje
4. **Import/export** - Import/export CSV lub JSON
5. **Udostępnianie** - Udostępnianie zestawów fiszek innym użytkownikom
6. **Statystyki** - Śledzenie postępów w nauce i statystyk
7. **Zaawansowane wyszukiwanie** - Filtrowanie według daty, typu źródła itp.
8. **Cofnij/Ponów** - Cofnięcie ostatniego usunięcia lub modyfikacji
9. **Opcje sortowania** - Według daty, alfabetycznie itp.
10. **Rich Text** - Obsługa formatowania w treści fiszki

## Podsumowanie kluczowych funkcji

| Funkcja                  | Status    | Uwagi                                     |
| ------------------------ | --------- | ----------------------------------------- |
| Przeglądanie fiszek      | ✅ Gotowe | Sortowane od najnowszych                  |
| Tworzenie fiszek         | ✅ Gotowe | Ręczne tworzenie z walidacją              |
| Edycja fiszek            | ✅ Gotowe | Edycja inline z licznikiem znaków na żywo |
| Usuwanie fiszek          | ✅ Gotowe | Usuwanie jednym kliknięciem               |
| Wyszukiwanie/filtrowanie | ✅ Gotowe | Wyszukiwanie w czasie rzeczywistym        |
| Uwierzytelnianie         | ✅ Gotowe | Wymuszane przez middleware                |
| Responsywny design       | ✅ Gotowe | Mobile, tablet, desktop                   |
| Obsługa błędów           | ✅ Gotowe | Przyjazne dla użytkownika komunikaty      |
| Stany ładowania          | ✅ Gotowe | Szkieletowe loadery                       |
| Powiadomienia toast      | ✅ Gotowe | Wszystkie akcje potwierdzone              |

## Status wdrożenia

Implementacja jest gotowa do produkcji:

- ✅ Wszystkie środki bezpieczeństwa na miejscu
- ✅ Kompleksowa obsługa błędów
- ✅ Zoptymalizowana wydajność
- ✅ Responsywność mobilna
- ✅ Zgodność z dostępnością
- ✅ Dobrze udokumentowane
- ✅ Brak błędów w konsoli
- ✅ Przechodzi linting
- ✅ Zgodność z trybem strict TypeScript
