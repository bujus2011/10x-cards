/**
 * User Scenario Test - Complete Flashcard Generation Workflow
 *
 * This test implements the exact user scenario:
 * 1. Fill source text with C# article
 * 2. Click Generate button
 * 3. Wait up to 90 seconds for flashcard collection
 * 4. Accept 3 flashcards without editing
 * 5. Edit 1 flashcard (change front and back) and save
 * 6. Accept the edited flashcard
 * 7. Click Save Accepted button
 * 8. Wait for page reload and database save notification
 */

import { test, expect } from "@playwright/test";
import { GenerateFlashcardsPage } from "../pages";

// Use authenticated user storage state
test.use({ storageState: ".auth/user.json" });

const C_SHARP_ARTICLE = `PODSTAWY C#: Typy wartości (int, struct, enum) są kopiowane; referencyjne (class, string, array) przekazywane przez referencję. class = referencja, struct = wartość; record/record struct ułatwiają niezmienność i porównanie przez wartości. Dziedziczenie tylko dla class; interfejsy definiują kontrakty. Polimorfizm: virtual/override, new ukrywa metodę. Konstruktor bezparametrowy domyślny tylko gdy nie zdefiniowano innych. GC zarządza pamięcią; deterministyczne zwalnianie zasobów przez IDisposable i using/await using. Stos vs sterta: stos dla ramek wywołań i większości wartości, sterta dla obiektów. Boxing/unboxing dla typów wartości ↔ object; unikaj w gorących ścieżkach. Equals/GetHashCode muszą być spójne; override przy użyciu w słownikach. string jest niemutowalny; StringBuilder do konkatenacji w pętli. Kolekcje: List<T> (sekwencja), Dictionary<K,V> (mapa), HashSet<T> (zbiór), ConcurrentDictionary dla wielowątkowości. IEnumerable<T> – wykonanie lokalne/leniwe; IQueryable<T> – deleguje do dostawcy (np. EF). LINQ: select/where/orderby; operatory leniwe do momentu materializacji (ToList/ToArray). async/await obsługuje I/O; Task vs ValueTask; ConfigureAwait(false) w bibliotekach; unikaj async void poza zdarzeniami. Blokady: lock nad prywatnym obiektem; unikaj deadlocków i nadmiernej sekcji krytycznej; Interlocked do atomowych operacji.`;

test.describe("User Scenario: Generate, Edit, and Save Flashcards", () => {
  test("complete workflow from article to saved flashcards", async ({ page }) => {
    const generatePage = new GenerateFlashcardsPage(page);

    // Navigate to generate page
    await generatePage.goto();

    // KROK 1: Wypełnij pole artykułem o C#
    await test.step("1. Fill source text field with C# article", async () => {
      console.log("📝 Filling source text with C# article...");
      await generatePage.fillSourceText(C_SHARP_ARTICLE);

      // Verify text was filled
      const charCount = await generatePage.getCharacterCount();
      console.log(`   Character count: ${charCount}`);
      expect(charCount).toBeGreaterThanOrEqual(1000);
      expect(charCount).toBeLessThanOrEqual(10000);
    });

    // KROK 2: Naciśnij przycisk Generate
    await test.step("2. Click Generate button", async () => {
      console.log("🔄 Clicking Generate button...");
      await generatePage.clickGenerate();

      // Verify button shows loading state
      await expect(generatePage.generateButton).toContainText(/Generating/i);
    });

    // KROK 3: Poczekaj do 70 sekund na wynik kolekcję fiszek
    await test.step("3. Wait up to 70 seconds for flashcard collection", async () => {
      console.log("⏳ Waiting for flashcards to be generated (max 70 seconds)...");
      const startTime = Date.now();

      await generatePage.waitForFlashcards(70000);

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      console.log(`   ✅ Flashcards generated in ${duration} seconds`);

      const count = await generatePage.getFlashcardCount();
      console.log(`   📚 Total flashcards: ${count}`);
      expect(count).toBeGreaterThan(0);
    });

    // KROK 4: Zaakceptuj 3 fiszki bez edycji
    await test.step("4. Accept 3 flashcards without editing", async () => {
      console.log("✅ Accepting first 3 flashcards...");

      // Accept flashcards 0, 1, 2
      await generatePage.acceptFlashcard(0);
      console.log("   ✓ Flashcard 1 accepted");

      await generatePage.acceptFlashcard(1);
      console.log("   ✓ Flashcard 2 accepted");

      await generatePage.acceptFlashcard(2);
      console.log("   ✓ Flashcard 3 accepted");

      // Verify all 3 are accepted
      const card0 = generatePage.getFlashcardItem(0);
      const card1 = generatePage.getFlashcardItem(1);
      const card2 = generatePage.getFlashcardItem(2);

      expect(await card0.isAccepted()).toBe(true);
      expect(await card1.isAccepted()).toBe(true);
      expect(await card2.isAccepted()).toBe(true);
    });

    // KROK 5: Edytuj 1 fiszkę i zmień jej pierwszą i drugą stronę, następnie kliknij Zapisz
    await test.step("5. Edit 1 flashcard (change front and back) and click Save", async () => {
      console.log("✏️  Editing 4th flashcard...");

      const card3 = generatePage.getFlashcardItem(3);

      // Log original content
      const originalFront = await card3.getFrontText();
      const originalBack = await card3.getBackText();
      console.log(`   Original front: "${originalFront.substring(0, 60)}..."`);
      console.log(`   Original back: "${originalBack.substring(0, 60)}..."`);

      // New content
      const newFront = "Jaka jest różnica między typem wartości a typem referencyjnym w C#?";
      const newBack =
        "Typ wartości (int, struct, enum) jest kopiowany przy przypisaniu, typ referencyjny (class, string, array) przekazuje referencję do tego samego obiektu w pamięci.";

      // Edit the flashcard
      await card3.edit(newFront, newBack);

      console.log(`   ✓ New front: "${newFront}"`);
      console.log(`   ✓ New back: "${newBack}"`);

      // Verify content changed
      expect(await card3.getFrontText()).toBe(newFront);
      expect(await card3.getBackText()).toBe(newBack);

      // Verify "Edited" badge appears
      expect(await card3.isEdited()).toBe(true);
      console.log("   ✓ Flashcard marked as edited");
    });

    // KROK 6: Zaakceptuj edytowaną fiszkę
    await test.step("6. Accept the edited flashcard", async () => {
      console.log("✅ Accepting the edited flashcard...");

      const card3 = generatePage.getFlashcardItem(3);
      await card3.accept();

      expect(await card3.isAccepted()).toBe(true);
      console.log("   ✓ Edited flashcard accepted");

      // Wait for React state to update in BulkSaveButton
      // The visual update (CSS classes) happens faster than React state update
      await page.waitForTimeout(300);
    });

    // KROK 7: Naciśnij przycisk Save Accepted
    await test.step("7. Click 'Save Accepted' button", async () => {
      console.log("💾 Clicking Save Accepted button...");

      // Verify button is enabled (we have 4 accepted flashcards)
      await generatePage.verifySaveAcceptedState(true);

      // Click the save button
      await generatePage.clickSaveAccepted();
      console.log("   ✓ Save Accepted clicked");
    });

    // KROK 8: Poczekaj na przeładowanie strony i notyfikację o zapisie do bazy danych
    await test.step("8. Wait for page reload and database save notification", async () => {
      console.log("📡 Waiting for save confirmation...");

      // Wait for success toast notification
      const toast = page.locator("[data-sonner-toast]", { hasText: /Successfully saved/i });
      await expect(toast).toBeVisible({ timeout: 10000 });

      const toastText = await toast.textContent();
      console.log(`   ✓ Success notification: "${toastText}"`);

      // Verify toast mentions 4 flashcards
      expect(toastText).toContain("4");

      // Wait for page to reset
      await expect(generatePage.flashcardList).toBeHidden({ timeout: 5000 });

      // Verify form is cleared
      const textValue = await generatePage.sourceTextarea.inputValue();
      expect(textValue).toBe("");
      console.log("   ✓ Page reset to initial state");

      // Wait up to 70 seconds for button to be ready for next generation
      // (in case any async operations are still completing)
      await generatePage.page.waitForTimeout(1000);
      console.log("   ✓ Ready for new generation");
    });

    console.log("\n🎉 Complete workflow finished successfully!");
  });
});
