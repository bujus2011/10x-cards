/**
 * My Flashcards - Edit Flashcard E2E Tests
 *
 * Tests the complete workflow of editing an existing flashcard:
 * 1. Wait for flashcards list to load from database
 * 2. Click edit button on a flashcard
 * 3. Wait for edit form to load with data
 * 4. Change both front and back fields
 * 5. Click save button
 * 6. Wait for data to save
 * 7. Wait for page reload and success notification
 */

import { test, expect } from "@playwright/test";
import { MyFlashcardsPage } from "../pages/MyFlashcardsPage";

// Use authenticated user storage state
test.use({ storageState: ".auth/user.json" });

test.describe("My Flashcards - Edit Flashcard", () => {

  test("should successfully edit a flashcard", async ({ page }) => {
    const myFlashcardsPage = new MyFlashcardsPage(page);

    // Step 1: Navigate and wait for flashcards to load from database
    await myFlashcardsPage.goto();
    await myFlashcardsPage.waitForFlashcardsLoaded();

    // Verify grid is visible
    await myFlashcardsPage.verifyGridVisible();

    // Get the first available flashcard ID
    const flashcardIds = await myFlashcardsPage.getAllFlashcardIds();
    expect(flashcardIds.length).toBeGreaterThan(0);

    const flashcardId = flashcardIds[0];
    const flashcard = myFlashcardsPage.getFlashcard(flashcardId);

    // Verify flashcard is visible
    await flashcard.verifyVisible();

    // Get original content for comparison
    const originalFront = await flashcard.getFrontText();
    console.log(`Original front text: "${originalFront}"`);

    // Step 2: Click edit button
    await flashcard.clickEdit();

    // Step 3: Wait for edit form to load with data
    await flashcard.waitForEditFormVisible();

    // Verify form loaded with correct data
    const editFrontValue = await flashcard.getEditFrontValue();
    const editBackValue = await flashcard.getEditBackValue();

    expect(editFrontValue).toBe(originalFront);
    console.log(`Edit form loaded with front: "${editFrontValue}"`);

    // Step 4: Change both front and back fields
    const newFront = `Edited Front ${Date.now()}`;
    const newBack = `Edited Back ${Date.now()}`;

    await flashcard.editFront(newFront);
    await flashcard.editBack(newBack);

    // Verify fields were updated
    expect(await flashcard.getEditFrontValue()).toBe(newFront);
    expect(await flashcard.getEditBackValue()).toBe(newBack);

    // Step 5: Click save button
    await flashcard.clickSave();

    // Step 6: Wait for data to save
    // The save button should show "Saving..." state briefly
    await flashcard.waitForSaveComplete();

    // Step 7: Wait for page reload and success notification
    await myFlashcardsPage.waitForSaveSuccess();

    // Verify flashcard is back in display mode with updated content
    await flashcard.verifyVisible();
    await flashcard.verifyContent(newFront);

    // Verify we're no longer in edit mode
    expect(await flashcard.isInEditMode()).toBe(false);
  });

  test("should cancel edit without saving changes", async ({ page }) => {
    const myFlashcardsPage = new MyFlashcardsPage(page);

    await myFlashcardsPage.goto();
    await myFlashcardsPage.waitForFlashcardsLoaded();

    const flashcardIds = await myFlashcardsPage.getAllFlashcardIds();
    expect(flashcardIds.length).toBeGreaterThan(0);

    const flashcard = myFlashcardsPage.getFlashcard(flashcardIds[0]);

    // Get original content
    const originalFront = await flashcard.getFrontText();

    // Enter edit mode
    await flashcard.clickEdit();
    await flashcard.waitForEditFormVisible();

    // Make changes
    await flashcard.editFront("This should not be saved");
    await flashcard.editBack("This should not be saved either");

    // Cancel instead of save
    await flashcard.clickCancel();

    // Verify we're back in display mode
    expect(await flashcard.isInEditMode()).toBe(false);

    // Verify original content is still displayed
    const currentFront = await flashcard.getFrontText();
    expect(currentFront).toBe(originalFront);
  });

  test("should disable save button when fields are empty", async ({ page }) => {
    const myFlashcardsPage = new MyFlashcardsPage(page);

    await myFlashcardsPage.goto();
    await myFlashcardsPage.waitForFlashcardsLoaded();

    const flashcardIds = await myFlashcardsPage.getAllFlashcardIds();
    expect(flashcardIds.length).toBeGreaterThan(0);

    const flashcard = myFlashcardsPage.getFlashcard(flashcardIds[0]);

    // Enter edit mode
    await flashcard.clickEdit();
    await flashcard.waitForEditFormVisible();

    // Clear front field
    await flashcard.editFront("");

    // Save button should be disabled
    expect(await flashcard.isSaveEnabled()).toBe(false);

    // Restore front, clear back
    await flashcard.editFront("Valid front");
    await flashcard.editBack("");

    // Save button should still be disabled
    expect(await flashcard.isSaveEnabled()).toBe(false);
  });

  test("should show character count in edit mode", async ({ page }) => {
    const myFlashcardsPage = new MyFlashcardsPage(page);

    await myFlashcardsPage.goto();
    await myFlashcardsPage.waitForFlashcardsLoaded();

    const flashcardIds = await myFlashcardsPage.getAllFlashcardIds();
    expect(flashcardIds.length).toBeGreaterThan(0);

    const flashcard = myFlashcardsPage.getFlashcard(flashcardIds[0]);

    // Enter edit mode
    await flashcard.clickEdit();
    await flashcard.waitForEditFormVisible();

    // Verify character count displays are present
    const frontCharCount = page.locator("#front-char-count");
    const backCharCount = page.locator("#back-char-count");

    await expect(frontCharCount).toBeVisible();
    await expect(backCharCount).toBeVisible();

    // Verify they show the format "X/Y characters"
    await expect(frontCharCount).toContainText("/200 characters");
    await expect(backCharCount).toContainText("/500 characters");
  });

  test("should complete full edit workflow using helper method", async ({ page }) => {
    const myFlashcardsPage = new MyFlashcardsPage(page);

    await myFlashcardsPage.goto();
    await myFlashcardsPage.waitForFlashcardsLoaded();

    const flashcardIds = await myFlashcardsPage.getAllFlashcardIds();
    expect(flashcardIds.length).toBeGreaterThan(0);

    const flashcard = myFlashcardsPage.getFlashcard(flashcardIds[0]);

    // Use the complete edit workflow helper
    const newFront = `Quick Edit Front ${Date.now()}`;
    const newBack = `Quick Edit Back ${Date.now()}`;

    await flashcard.edit(newFront, newBack);

    // Wait for success notification
    await myFlashcardsPage.waitForSaveSuccess();

    // Verify updated content
    await flashcard.verifyContent(newFront);
  });
});
