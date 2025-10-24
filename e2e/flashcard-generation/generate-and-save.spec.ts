/**
 * Flashcard Generation E2E Tests
 *
 * Tests the complete workflow of generating, editing, and saving flashcards.
 * Uses authenticated user storage state.
 */

import { test, expect } from "@playwright/test";
import { GenerateFlashcardsPage } from "../pages";

// Use authenticated user storage state
test.use({ storageState: ".auth/user.json" });

const SAMPLE_ARTICLE = `PODSTAWY C#: Typy wartości (int, struct, enum) są kopiowane; referencyjne (class, string, array) przekazywane przez referencję. class = referencja, struct = wartość; record/record struct ułatwiają niezmienność i porównanie przez wartości. Dziedziczenie tylko dla class; interfejsy definiują kontrakty. Polimorfizm: virtual/override, new ukrywa metodę. Konstruktor bezparametrowy domyślny tylko gdy nie zdefiniowano innych. GC zarządza pamięcią; deterministyczne zwalnianie zasobów przez IDisposable i using/await using. Stos vs sterta: stos dla ramek wywołań i większości wartości, sterta dla obiektów. Boxing/unboxing dla typów wartości ↔ object; unikaj w gorących ścieżkach. Equals/GetHashCode muszą być spójne; override przy użyciu w słownikach. string jest niemutowalny; StringBuilder do konkatenacji w pętli. Kolekcje: List<T> (sekwencja), Dictionary<K,V> (mapa), HashSet<T> (zbiór), ConcurrentDictionary dla wielowątkowości. IEnumerable<T> – wykonanie lokalne/leniwe; IQueryable<T> – deleguje do dostawcy (np. EF). LINQ: select/where/orderby; operatory leniwe do momentu materializacji (ToList/ToArray). async/await obsługuje I/O; Task vs ValueTask; ConfigureAwait(false) w bibliotekach; unikaj async void poza zdarzeniami. Blokady: lock nad prywatnym obiektem; unikaj deadlocków i nadmiernej sekcji krytycznej; Interlocked do atomowych operacji.`;

test.describe("Flashcard Generation Workflow", () => {
    let generatePage: GenerateFlashcardsPage;

    test.beforeEach(async ({ page }) => {
        generatePage = new GenerateFlashcardsPage(page);
        await generatePage.goto();
    });

    test("should complete full workflow: generate, edit, accept, and save flashcards", async () => {
        // Krok 1: Wypełnij pole artykułem
        await test.step("Fill source text with article", async () => {
            await generatePage.fillSourceText(SAMPLE_ARTICLE);

            const charCount = await generatePage.getCharacterCount();
            expect(charCount).toBeGreaterThanOrEqual(1000);
            expect(charCount).toBeLessThanOrEqual(10000);

            // Verify generate button is enabled
            await expect(generatePage.generateButton).toBeEnabled();
        });

        // Krok 2: Naciśnij przycisk Generate
        await test.step("Click generate button", async () => {
            await generatePage.clickGenerate();

            // Verify loading state appears
            await expect(generatePage.generateButton).toBeDisabled();
            await expect(generatePage.generateButton).toContainText(/Generating/i);
        });

        // Krok 3: Poczekaj do 90 sekund na wynik kolekcję fiszek
        await test.step("Wait for flashcards to be generated (max 90s)", async () => {
            await generatePage.waitForFlashcards(90000);

            // Verify flashcards are visible
            const count = await generatePage.getFlashcardCount();
            expect(count).toBeGreaterThan(0);
            console.log(`Generated ${count} flashcards`);
        });

        // Krok 4: Zaakceptuj 3 fiszki bez edycji
        await test.step("Accept first 3 flashcards without editing", async () => {
            await generatePage.acceptFlashcard(0);
            await generatePage.acceptFlashcard(1);
            await generatePage.acceptFlashcard(2);

            // Verify they are accepted
            const card0 = generatePage.getFlashcardItem(0);
            const card1 = generatePage.getFlashcardItem(1);
            const card2 = generatePage.getFlashcardItem(2);

            expect(await card0.isAccepted()).toBe(true);
            expect(await card1.isAccepted()).toBe(true);
            expect(await card2.isAccepted()).toBe(true);
        });

        // Krok 5: Edytuj 1 fiszkę i zmień jej pierwszą i drugą stronę, następnie kliknij przycisk Zapisz
        await test.step("Edit 4th flashcard and save changes", async () => {
            const card3 = generatePage.getFlashcardItem(3);

            // Get original content for comparison
            const originalFront = await card3.getFrontText();
            const originalBack = await card3.getBackText();
            console.log(`Original card 3 - Front: ${originalFront.substring(0, 50)}...`);

            // Edit the flashcard
            const newFront = "Co to jest typ wartości w C#?";
            const newBack = "Typy wartości (int, struct, enum) są kopiowane przy przypisaniu i przekazywaniu jako parametr.";

            await card3.edit(newFront, newBack);

            // Verify content was changed
            expect(await card3.getFrontText()).toBe(newFront);
            expect(await card3.getBackText()).toBe(newBack);

            // Verify edited badge is visible
            expect(await card3.isEdited()).toBe(true);
        });

        // Krok 6: Zaakceptuj edytowaną fiszkę
        await test.step("Accept the edited flashcard", async () => {
            const card3 = generatePage.getFlashcardItem(3);
            await card3.accept();

            expect(await card3.isAccepted()).toBe(true);
        });

        // Krok 7: Naciśnij przycisk Save Accepted
        await test.step("Click 'Save Accepted' button", async () => {
            // Verify button is enabled (at least 1 card is accepted)
            await generatePage.verifySaveAcceptedState(true);

            // Click save
            await generatePage.clickSaveAccepted();
        });

        // Krok 8: Poczekaj na przeładowanie strony i notyfikację o zapisie do bazy danych
        await test.step("Wait for save success notification and page reload", async () => {
            await generatePage.waitForSaveSuccess();

            // Verify page is reset to initial state
            await expect(generatePage.sourceTextarea).toBeVisible();
            await expect(generatePage.generateButton).toBeEnabled();
            await expect(generatePage.flashcardList).toBeHidden();
        });
    });

    test("should disable generate button when text is too short", async () => {
        await generatePage.fillSourceText("Too short text");
        await expect(generatePage.generateButton).toBeDisabled();
    });

    test("should disable generate button when text is too long", async () => {
        const longText = "A".repeat(10001);
        await generatePage.fillSourceText(longText);
        await expect(generatePage.generateButton).toBeDisabled();
    });

    test("should enable generate button when text length is valid", async () => {
        const validText = "A".repeat(5000);
        await generatePage.fillSourceText(validText);
        await expect(generatePage.generateButton).toBeEnabled();
    });

    test("should save all flashcards without accepting", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        // Click Save All (no need to accept any)
        await generatePage.clickSaveAll();

        // Wait for success
        await generatePage.waitForSaveSuccess();
    });

    test("should allow rejecting flashcards", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        // Accept first flashcard
        await generatePage.acceptFlashcard(0);

        const card0 = generatePage.getFlashcardItem(0);
        expect(await card0.isAccepted()).toBe(true);

        // Reject it
        await card0.reject();

        // Note: The reject button changes the visual state but doesn't remove the card
        // It just sets accepted to false
    });

    test("should validate edit textarea character limits", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        const card0 = generatePage.getFlashcardItem(0);

        // Enter edit mode
        await card0.clickEdit();

        // Try to enter text exceeding limits
        const tooLongFront = "A".repeat(201);
        const tooLongBack = "B".repeat(501);

        await card0.editFrontTextarea.fill(tooLongFront);
        await card0.editBackTextarea.fill(tooLongBack);

        // Save button should be disabled
        await expect(card0.saveEditButton).toBeDisabled();
    });

    test("should show character counter in edit mode", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        const card0 = generatePage.getFlashcardItem(0);

        // Enter edit mode
        await card0.clickEdit();

        // Verify character counters are visible
        await expect(card0.container.locator(".text-sm.text-muted-foreground", { hasText: "/200 characters" })).toBeVisible();
        await expect(card0.container.locator(".text-sm.text-muted-foreground", { hasText: "/500 characters" })).toBeVisible();
    });

    test("should disable Save Accepted when no flashcards are accepted", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        // Don't accept any flashcards
        await generatePage.verifySaveAcceptedState(false);
    });

    test("should enable Save Accepted when at least one flashcard is accepted", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        // Accept one flashcard
        await generatePage.acceptFlashcard(0);

        // Save Accepted should be enabled
        await generatePage.verifySaveAcceptedState(true);
    });
});

test.describe("Flashcard Generation - Error Handling", () => {
    let generatePage: GenerateFlashcardsPage;

    test.beforeEach(async ({ page }) => {
        generatePage = new GenerateFlashcardsPage(page);
        await generatePage.goto();
    });

    test("should show error notification on API failure", async ({ page }) => {
        // Mock API to return error
        await page.route("**/api/generations", (route) => {
            route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ error: "Internal server error" }),
            });
        });

        // Fill valid text
        await generatePage.fillSourceText(SAMPLE_ARTICLE);

        // Try to generate
        await generatePage.clickGenerate();

        // Wait for error notification
        await generatePage.verifyErrorVisible();
    });
});

test.describe("Flashcard Generation - Multiple Edits", () => {
    let generatePage: GenerateFlashcardsPage;

    test.beforeEach(async ({ page }) => {
        generatePage = new GenerateFlashcardsPage(page);
        await generatePage.goto();
    });

    test("should allow editing multiple flashcards", async () => {
        // Generate flashcards
        await generatePage.generateFlashcardsFromText(SAMPLE_ARTICLE);

        // Edit first 3 flashcards
        await generatePage.editFlashcard(0, "Question 1", "Answer 1");
        await generatePage.editFlashcard(1, "Question 2", "Answer 2");
        await generatePage.editFlashcard(2, "Question 3", "Answer 3");

        // Verify all are edited
        const card0 = generatePage.getFlashcardItem(0);
        const card1 = generatePage.getFlashcardItem(1);
        const card2 = generatePage.getFlashcardItem(2);

        expect(await card0.isEdited()).toBe(true);
        expect(await card1.isEdited()).toBe(true);
        expect(await card2.isEdited()).toBe(true);

        // Accept all edited flashcards
        await generatePage.acceptMultipleFlashcards([0, 1, 2]);

        // Save accepted
        await generatePage.clickSaveAccepted();
        await generatePage.waitForSaveSuccess();
    });
});

