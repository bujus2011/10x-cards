# Page Object Model (POM) - Testy E2E

Ten katalog zawiera modele Page Object Model do testów E2E z Playwright. Wzorzec POM enkapsuluje strukturę strony i interakcje, czyniąc testy bardziej łatwymi w utrzymaniu i czytelnymi.

## 📁 Struktura

```
e2e/pages/
├── index.ts                      # Centralny plik eksportujący
├── AuthPage.ts                   # Klasa bazowa dla stron autoryzacji
├── LoginPage.ts                  # POM strony logowania
├── RegisterPage.ts               # POM strony rejestracji
├── ResetPasswordPage.ts          # POM strony resetowania hasła
├── GenerateFlashcardsPage.ts     # POM strony generowania fiszek
├── MyFlashcardsPage.ts           # POM strony Moje Fiszki
├── StudySessionPage.ts           # POM strony sesji nauki
└── README.md                     # Ten plik
```

## 🎯 Zasady projektowania

### 1. **Hierarchia dziedziczenia**

- `AuthPage` - Klasa bazowa dla wszystkich stron autoryzacji
  - `LoginPage` - Rozszerza AuthPage
  - `RegisterPage` - Rozszerza AuthPage
  - `ResetPasswordPage` - Rozszerza AuthPage

### 2. **Strategia lokatorów**

Wszystkie strony używają atrybutów `data-testid` dla odpornego wyboru elementów:

- `page.getByTestId('element-name')` - Główna strategia
- Selektory semantyczne jako fallback dla elementów bez data-testid

### 3. **Organizacja metod**

#### Metody nawigacji

```typescript
async goto(): Promise<void>
async waitForPageLoad(): Promise<void>
```

#### Metody interakcji

```typescript
async fillEmail(email: string): Promise<void>
async fillPassword(password: string): Promise<void>
async clickSubmit(): Promise<void>
```

#### Helpery asercji

```typescript
async hasError(): Promise<boolean>
async getErrorText(): Promise<string | null>
async isFormVisible(): Promise<boolean>
```

#### Złożone akcje

```typescript
async login(email: string, password: string): Promise<void>
async register(email: string, password: string): Promise<void>
```

## 📚 Przykłady użycia

### Podstawowe użycie

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test("użytkownik może się zalogować", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Nawigacja do strony
  await loginPage.goto();

  // Wykonaj logowanie
  await loginPage.login("user@example.com", "password123");

  // Weryfikuj przekierowanie
  await expect(page).toHaveURL("/");
});
```

### Używanie poszczególnych metod

```typescript
test("weryfikuj komunikat błędu", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Wypełnij pola indywidualnie
  await loginPage.fillEmail("invalid@example.com");
  await loginPage.fillPassword("wrong");
  await loginPage.clickSubmit();

  // Sprawdź błąd
  await expect(loginPage.errorMessage).toBeVisible();
  const errorText = await loginPage.getErrorText();
  expect(errorText).toContain("Invalid");
});
```

### Używanie współdzielonych metod z AuthPage

```typescript
test("weryfikuj zawartość strony", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Metoda odziedziczona z AuthPage
  await loginPage.verifyPageContent("Welcome back", "Sign in to your account");

  // Sprawdź widoczność layoutu
  const isVisible = await loginPage.isLayoutVisible();
  expect(isVisible).toBe(true);
});
```

### Testowanie nawigacji

```typescript
test("przejdź do strony rejestracji", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await loginPage.goToRegister();
  await expect(page).toHaveURL("/auth/register");
});
```

## 🔧 Dodawanie nowych stron

### 1. Utwórz nową klasę strony

```typescript
// e2e/pages/NewPage.ts
import { type Page, type Locator } from "@playwright/test";

export class NewPage {
  readonly page: Page;
  readonly someElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someElement = page.getByTestId("some-element");
  }

  async goto() {
    await this.page.goto("/some-path");
  }

  async doSomething() {
    await this.someElement.click();
  }
}
```

### 2. Eksportuj z pliku index

```typescript
// e2e/pages/index.ts
export { NewPage } from "./NewPage";
```

### 3. Użyj w testach

```typescript
import { NewPage } from "../pages/NewPage";

test("test nowej strony", async ({ page }) => {
  const newPage = new NewPage(page);
  await newPage.goto();
  await newPage.doSomething();
});
```

## 🎨 Najlepsze praktyki

### ✅ RÓB

- Używaj `data-testid` dla wszystkich interaktywnych elementów
- Utrzymuj metody skoncentrowane i jednocelowe
- Używaj opisowych nazw metod (`login` zamiast `submit`)
- Zwracaj promisy dla operacji asynchronicznych
- Dodawaj komentarze JSDoc dla złożonych metod
- Grupuj powiązane lokatory razem

### ❌ NIE RÓB

- Nie umieszczaj asercji w obiektach Page Object (używaj w testach)
- Nie twórz Page Objects świadomych innych stron
- Nie używaj złożonych selektorów (CSS/XPath) jako głównej strategii
- Nie twórz obiektów boga z zbyt wieloma odpowiedzialnościami
- Nie duplikuj metod między stronami (używaj dziedziczenia)

## 📖 Referencje

### AuthPage (Klasa bazowa)

**Lokatory:**

- `authLayout` - Główny kontener autoryzacji
- `authTitle` - Tytuł strony
- `authSubtitle` - Podtytuł strony
- `authContent` - Wrapper zawartości

**Metody:**

- `goto()` - Nawigacja do strony (abstrakcyjna)
- `waitForPageLoad()` - Czekaj na załadowanie strony
- `verifyPageContent(title, subtitle?)` - Weryfikuj tytuł/podtytuł
- `isLayoutVisible()` - Sprawdź widoczność layoutu

### LoginPage

**Lokatory:**

- Wszystkie z `AuthPage`
- `loginForm` - Element formularza
- `emailInput` - Pole email
- `passwordInput` - Pole hasła
- `submitButton` - Przycisk submit
- `errorMessage` - Kontener komunikatu błędu
- `forgotPasswordLink` - Link do resetowania hasła
- `registerLink` - Link do rejestracji

**Metody:**

- Wszystkie z `AuthPage`
- `login(email, password)` - Kompletny proces logowania
- `fillEmail(email)` - Wypełnij pole email
- `fillPassword(password)` - Wypełnij pole hasła
- `clickSubmit()` - Kliknij przycisk submit
- `getErrorText()` - Pobierz tekst komunikatu błędu
- `hasError()` - Sprawdź czy błąd jest widoczny
- `goToForgotPassword()` - Przejdź do resetowania hasła
- `goToRegister()` - Przejdź do rejestracji
- `isSubmitDisabled()` - Sprawdź czy przycisk jest wyłączony
- `isSubmitting()` - Sprawdź czy formularz jest wysyłany
- `isFormVisible()` - Sprawdź czy formularz jest widoczny

### RegisterPage & ResetPasswordPage

Zobacz poszczególne pliki klas dla pełnej dokumentacji metod.

### GenerateFlashcardsPage

**Lokatory:**

- `sourceTextarea` - Pole tekstowe źródłowe
- `textCounter` - Wyświetlacz licznika znaków
- `generateButton` - Przycisk generowania fiszek
- `flashcardList` - Kontener listy fiszek
- `flashcardItems` - Wszystkie elementy fiszek
- `saveAcceptedButton` - Przycisk zapisz zaakceptowane fiszki
- `saveAllButton` - Przycisk zapisz wszystkie fiszki
- `errorNotification` - Kontener komunikatu błędu
- `loadingSkeletons` - Wskaźniki stanu ładowania

**Metody:**

- `goto()` - Przejdź do strony generowania
- `waitForPageLoad()` - Czekaj na załadowanie strony
- `fillSourceText(text)` - Wypełnij pole tekstowe źródłowe
- `clearSourceText()` - Wyczyść pole tekstowe źródłowe
- `getCharacterCount()` - Pobierz aktualną liczbę znaków
- `isGenerateButtonEnabled()` - Sprawdź czy przycisk generowania jest aktywny
- `clickGenerate()` - Kliknij przycisk generowania
- `waitForFlashcards(timeout?)` - Czekaj na fiszki (domyślnie 90s)
- `waitForLoading()` - Czekaj na stan ładowania
- `waitForLoadingToDisappear()` - Czekaj na zakończenie ładowania
- `getFlashcardCount()` - Pobierz liczbę wygenerowanych fiszek
- `getFlashcardItem(index)` - Pobierz helper FlashcardItem według indeksu
- `acceptFlashcard(index)` - Zaakceptuj fiszkę
- `acceptMultipleFlashcards(indices)` - Zaakceptuj wiele fiszek
- `rejectFlashcard(index)` - Odrzuć fiszkę
- `editFlashcard(index, front, back)` - Edytuj fiszkę
- `clickSaveAccepted()` - Kliknij przycisk Zapisz zaakceptowane
- `clickSaveAll()` - Kliknij przycisk Zapisz wszystkie
- `waitForSaveSuccess()` - Czekaj na powiadomienie o udanym zapisie
- `verifyErrorVisible(message?)` - Weryfikuj czy błąd jest widoczny
- `hasError()` - Sprawdź czy błąd jest widoczny
- `verifySaveButtonsVisible()` - Weryfikuj czy przyciski zapisu są widoczne
- `verifySaveAcceptedState(enabled)` - Weryfikuj stan przycisku Zapisz zaakceptowane
- `generateFlashcardsFromText(text, timeout?)` - Kompletny workflow generowania
- `getAllFlashcardContents()` - Pobierz wszystkie pary przód/tył fiszek

**Helper FlashcardItem:**

- `accept()` - Zaakceptuj fiszkę
- `reject()` - Odrzuć fiszkę
- `clickEdit()` - Wejdź w tryb edycji
- `edit(front, back)` - Edytuj i zapisz fiszkę
- `getFrontText()` - Pobierz tekst z przodu
- `getBackText()` - Pobierz tekst z tyłu
- `isAccepted()` - Sprawdź czy zaakceptowana
- `isEdited()` - Sprawdź czy edytowana
- `isInEditMode()` - Sprawdź czy w trybie edycji
- `verifyContent(front, back)` - Weryfikuj zawartość
- `verifyVisible()` - Weryfikuj czy fiszka jest widoczna

### MyFlashcardsPage

**Lokatory:**

- `loadingSkeleton` - Wyświetlacz szkieletu ładowania
- `createButton` - Przycisk utwórz nową fiszkę
- `searchInput` - Pole wyszukiwania
- `flashcardsGrid` - Kontener siatki fiszek
- `errorAlert` - Kontener alertu błędu
- `retryButton` - Przycisk ponów po błędzie
- `countDisplay` - Wyświetlacz liczby fiszek

**Metody:**

- `goto()` - Przejdź do strony Moje Fiszki
- `waitForFlashcardsLoaded(timeout?)` - Czekaj na zakończenie ładowania fiszek
- `waitForLoading()` - Czekaj na pojawienie się stanu ładowania
- `isLoading()` - Sprawdź czy fiszki są aktualnie ładowane
- `getFlashcard(id)` - Pobierz helper MyFlashcard według ID z bazy danych
- `getAllFlashcardIds()` - Pobierz wszystkie widoczne ID fiszek
- `getFlashcardCount()` - Pobierz liczbę widocznych fiszek
- `search(query)` - Wyszukaj fiszki
- `clearSearch()` - Wyczyść wyszukiwanie
- `getCountText()` - Pobierz tekst liczby wyników wyszukiwania
- `clickCreate()` - Kliknij przycisk utwórz nową fiszkę
- `verifyErrorVisible(message?)` - Weryfikuj czy błąd jest widoczny
- `hasError()` - Sprawdź czy błąd jest widoczny
- `clickRetry()` - Kliknij przycisk ponów po błędzie
- `verifyGridVisible()` - Weryfikuj czy siatka fiszek jest widoczna
- `isGridVisible()` - Sprawdź czy siatka jest widoczna
- `verifyEmptyState(message?)` - Weryfikuj czy pusty stan jest wyświetlony
- `waitForToast(message, timeout?)` - Czekaj na powiadomienie toast
- `waitForSaveSuccess()` - Czekaj na toast sukcesu zapisu
- `waitForDeleteSuccess()` - Czekaj na toast sukcesu usunięcia

**Helper MyFlashcard:**

- `waitForVisible(timeout?)` - Czekaj aż fiszka będzie widoczna
- `verifyVisible()` - Weryfikuj czy fiszka jest widoczna
- `clickFlip()` - Kliknij fiszkę aby ją odwrócić
- `getFrontText()` - Pobierz tekst z przodu
- `getContentText()` - Pobierz aktualnie wyświetlaną zawartość
- `clickCopy()` - Kliknij przycisk kopiuj
- `clickEdit()` - Kliknij przycisk edytuj aby wejść w tryb edycji
- `waitForEditFormVisible(timeout?)` - Czekaj na załadowanie formularza edycji
- `isInEditMode()` - Sprawdź czy w trybie edycji
- `getEditFrontValue()` - Pobierz wartość pola textarea przód
- `getEditBackValue()` - Pobierz wartość pola textarea tył
- `editFront(text)` - Wypełnij pole textarea przód
- `editBack(text)` - Wypełnij pole textarea tył
- `clickSave()` - Kliknij przycisk zapisz
- `waitForSaveComplete(timeout?)` - Czekaj na zakończenie zapisu
- `isSaveEnabled()` - Sprawdź czy przycisk zapisz jest aktywny
- `isSaving()` - Sprawdź czy zapis jest w toku
- `clickCancel()` - Kliknij przycisk anuluj
- `clickDelete()` - Kliknij przycisk usuń
- `waitForDeleted(timeout?)` - Czekaj aż fiszka zostanie usunięta
- `edit(newFront, newBack)` - Kompletny workflow edycji
- `verifyContent(expectedFront, expectedContent?)` - Weryfikuj zawartość fiszki
- `verifyEditFormValues(expectedFront, expectedBack)` - Weryfikuj wartości formularza edycji

## 🔗 Powiązane pliki

- `/10x-cards/src/components/auth/` - Komponenty React
- `/10x-cards/e2e/auth/` - Specyfikacje testów E2E
- `/10x-cards/playwright.config.ts` - Konfiguracja Playwright
