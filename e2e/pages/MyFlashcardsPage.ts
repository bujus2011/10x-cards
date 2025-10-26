/**
 * My Flashcards Page Object Model
 *
 * Encapsulates the My Flashcards page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 *
 * @example
 * const myFlashcardsPage = new MyFlashcardsPage(page);
 * await myFlashcardsPage.goto();
 * await myFlashcardsPage.waitForFlashcardsLoaded();
 * const flashcard = myFlashcardsPage.getFlashcard(123);
 * await flashcard.clickEdit();
 * await flashcard.editFront("New front");
 * await flashcard.editBack("New back");
 * await flashcard.clickSave();
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class MyFlashcardsPage {
  readonly page: Page;

  // Loading state
  readonly loadingSkeleton: Locator;

  // Create form
  readonly createButton: Locator;

  // Search
  readonly searchInput: Locator;

  // Flashcards grid
  readonly flashcardsGrid: Locator;

  // Error state
  readonly errorAlert: Locator;
  readonly retryButton: Locator;

  // Count display
  readonly countDisplay: Locator;

  constructor(page: Page) {
    this.page = page;

    // Loading
    this.loadingSkeleton = page.getByTestId("flashcards-loading");

    // Create form
    this.createButton = page.getByTestId("create-flashcard-button");

    // Search
    this.searchInput = page.getByLabel("Search flashcards by front or back text");

    // Grid
    this.flashcardsGrid = page.getByTestId("flashcards-grid");

    // Error
    this.errorAlert = page.locator('[role="alert"]');
    this.retryButton = page.getByTestId("retry-button");

    // Count
    this.countDisplay = page.locator('[aria-live="polite"]');
  }

  /**
   * Navigate to the My Flashcards page
   */
  async goto() {
    await this.page.goto("/my-flashcards");
  }

  /**
   * Wait for flashcards to finish loading
   * @param timeout - Maximum wait time in milliseconds (default: 10000ms)
   */
  async waitForFlashcardsLoaded(timeout = 10000) {
    // Wait for loading skeleton to disappear
    await expect(this.loadingSkeleton).toBeHidden({ timeout });

    // Wait for either grid or empty state to appear
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for the loading state to appear
   */
  async waitForLoading() {
    await expect(this.loadingSkeleton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Check if flashcards are currently loading
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSkeleton.isVisible();
  }

  /**
   * Get a specific flashcard by ID
   * @param id - Flashcard database ID
   * @returns MyFlashcard helper object
   */
  getFlashcard(id: number): MyFlashcard {
    return new MyFlashcard(id, this.page);
  }

  /**
   * Get all visible flashcard IDs
   * @returns Array of flashcard IDs
   */
  async getAllFlashcardIds(): Promise<number[]> {
    const cards = await this.page.locator('[data-testid^="flashcard-card-"]').all();
    const ids: number[] = [];

    for (const card of cards) {
      const testId = await card.getAttribute("data-testid");
      if (testId) {
        const match = testId.match(/flashcard-card-(\d+)/);
        if (match) {
          ids.push(parseInt(match[1], 10));
        }
      }
    }

    return ids;
  }

  /**
   * Get the number of visible flashcards
   */
  async getFlashcardCount(): Promise<number> {
    const ids = await this.getAllFlashcardIds();
    return ids.length;
  }

  /**
   * Search for flashcards
   * @param query - Search query
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for filter to apply
    await this.page.waitForTimeout(300);
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the search result count text
   * @returns Count text (e.g., "5 of 10 flashcards")
   */
  async getCountText(): Promise<string> {
    return (await this.countDisplay.textContent()) || "";
  }

  /**
   * Click the create new flashcard button
   */
  async clickCreate() {
    await expect(this.createButton).toBeVisible();
    await this.createButton.click();
  }

  /**
   * Verify error is visible
   * @param expectedMessage - Optional expected error message
   */
  async verifyErrorVisible(expectedMessage?: string) {
    await expect(this.errorAlert).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorAlert).toContainText(expectedMessage);
    }
  }

  /**
   * Check if error is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Click the retry button after an error
   */
  async clickRetry() {
    await expect(this.retryButton).toBeVisible();
    await this.retryButton.click();
  }

  /**
   * Verify the flashcards grid is visible
   */
  async verifyGridVisible() {
    await expect(this.flashcardsGrid).toBeVisible();
  }

  /**
   * Check if the grid is visible
   */
  async isGridVisible(): Promise<boolean> {
    return await this.flashcardsGrid.isVisible();
  }

  /**
   * Verify empty state is shown
   * @param message - Expected empty state message
   */
  async verifyEmptyState(message?: string) {
    const emptyState = this.page.locator(".text-center.py-12");
    await expect(emptyState).toBeVisible();
    if (message) {
      await expect(emptyState).toContainText(message);
    }
  }

  /**
   * Wait for a toast notification
   * @param message - Expected toast message (regex or string)
   * @param timeout - Maximum wait time
   */
  async waitForToast(message: string | RegExp, timeout = 5000) {
    const toast = this.page.locator("[data-sonner-toast]", { hasText: message });
    await expect(toast).toBeVisible({ timeout });
  }

  /**
   * Wait for success toast after save
   */
  async waitForSaveSuccess() {
    await this.waitForToast(/updated successfully|created successfully/i);
  }

  /**
   * Wait for delete success toast
   */
  async waitForDeleteSuccess() {
    await this.waitForToast(/deleted successfully/i);
  }
}

/**
 * MyFlashcard helper class
 * Encapsulates interactions with a single flashcard in My Flashcards view
 */
export class MyFlashcard {
  readonly id: number;
  readonly page: Page;

  // Card container
  readonly card: Locator;

  // Display mode elements
  readonly frontText: Locator;
  readonly contentText: Locator;
  readonly copyButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;

  // Edit mode elements
  readonly editForm: Locator;
  readonly editFrontTextarea: Locator;
  readonly editBackTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(id: number, page: Page) {
    this.id = id;
    this.page = page;

    // Card container
    this.card = page.getByTestId(`flashcard-card-${id}`);

    // Display mode
    this.frontText = page.getByTestId(`flashcard-front-${id}`);
    this.contentText = page.getByTestId(`flashcard-content-${id}`);
    this.copyButton = page.getByTestId(`copy-flashcard-${id}`);
    this.editButton = page.getByTestId(`edit-flashcard-${id}`);
    this.deleteButton = page.getByTestId(`delete-flashcard-${id}`);

    // Edit mode
    this.editForm = page.getByTestId(`flashcard-edit-form-${id}`);
    this.editFrontTextarea = page.getByTestId(`edit-flashcard-front-${id}`);
    this.editBackTextarea = page.getByTestId(`edit-flashcard-back-${id}`);
    this.saveButton = page.getByTestId(`save-flashcard-${id}`);
    this.cancelButton = page.getByTestId(`cancel-edit-flashcard-${id}`);
  }

  /**
   * Wait for the flashcard to be visible
   */
  async waitForVisible(timeout = 5000) {
    await expect(this.card).toBeVisible({ timeout });
  }

  /**
   * Verify the flashcard is visible
   */
  async verifyVisible() {
    await expect(this.card).toBeVisible();
  }

  /**
   * Click the flashcard to flip it
   */
  async clickFlip() {
    await this.card.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Get the front text content
   */
  async getFrontText(): Promise<string> {
    return (await this.frontText.textContent()) || "";
  }

  /**
   * Get the currently displayed content (front or back depending on flip state)
   */
  async getContentText(): Promise<string> {
    return (await this.contentText.textContent()) || "";
  }

  /**
   * Click the copy button
   */
  async clickCopy() {
    await expect(this.copyButton).toBeVisible();
    await this.copyButton.click();
  }

  /**
   * Click the edit button to enter edit mode
   */
  async clickEdit() {
    await expect(this.editButton).toBeVisible();
    await this.editButton.click();
    // Wait for edit form to appear
    await expect(this.editForm).toBeVisible();
  }

  /**
   * Wait for edit form to be loaded and visible
   */
  async waitForEditFormVisible(timeout = 5000) {
    await expect(this.editForm).toBeVisible({ timeout });
    await expect(this.editFrontTextarea).toBeVisible();
    await expect(this.editBackTextarea).toBeVisible();
  }

  /**
   * Check if currently in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.editForm.isVisible();
  }

  /**
   * Get the current value in the front edit textarea
   */
  async getEditFrontValue(): Promise<string> {
    return await this.editFrontTextarea.inputValue();
  }

  /**
   * Get the current value in the back edit textarea
   */
  async getEditBackValue(): Promise<string> {
    return await this.editBackTextarea.inputValue();
  }

  /**
   * Fill the front textarea in edit mode
   * @param text - New front text
   */
  async editFront(text: string) {
    await expect(this.editFrontTextarea).toBeVisible();
    await this.editFrontTextarea.clear();
    await this.editFrontTextarea.fill(text);
  }

  /**
   * Fill the back textarea in edit mode
   * @param text - New back text
   */
  async editBack(text: string) {
    await expect(this.editBackTextarea).toBeVisible();
    await this.editBackTextarea.clear();
    await this.editBackTextarea.fill(text);
  }

  /**
   * Click the save button
   */
  async clickSave() {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
  }

  /**
   * Wait for save operation to complete
   * Waits for edit form to disappear and card to reappear
   */
  async waitForSaveComplete(timeout = 5000) {
    // Wait for edit form to disappear
    await expect(this.editForm).toBeHidden({ timeout });
    // Wait for card to be visible again
    await expect(this.card).toBeVisible();
  }

  /**
   * Check if save button is enabled
   */
  async isSaveEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled();
  }

  /**
   * Check if save button shows "Saving..." state
   */
  async isSaving(): Promise<boolean> {
    const text = await this.saveButton.textContent();
    return text?.includes("Saving...") ?? false;
  }

  /**
   * Click the cancel button
   */
  async clickCancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
    // Wait for edit form to disappear
    await expect(this.editForm).toBeHidden();
  }

  /**
   * Click the delete button
   */
  async clickDelete() {
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();
  }

  /**
   * Wait for flashcard to be deleted (disappear from DOM)
   */
  async waitForDeleted(timeout = 5000) {
    await expect(this.card).toBeHidden({ timeout });
  }

  /**
   * Complete edit workflow: click edit, change both fields, save
   * @param newFront - New front text
   * @param newBack - New back text
   */
  async edit(newFront: string, newBack: string) {
    await this.clickEdit();
    await this.waitForEditFormVisible();
    await this.editFront(newFront);
    await this.editBack(newBack);
    await this.clickSave();
    await this.waitForSaveComplete();
  }

  /**
   * Verify the flashcard content
   * @param expectedFront - Expected front text
   * @param expectedContent - Expected content text (visible side)
   */
  async verifyContent(expectedFront: string, expectedContent?: string) {
    await expect(this.frontText).toHaveText(expectedFront);
    if (expectedContent) {
      await expect(this.contentText).toHaveText(expectedContent);
    }
  }

  /**
   * Verify edit form has expected values
   * @param expectedFront - Expected front value
   * @param expectedBack - Expected back value
   */
  async verifyEditFormValues(expectedFront: string, expectedBack: string) {
    const frontValue = await this.getEditFrontValue();
    const backValue = await this.getEditBackValue();

    expect(frontValue).toBe(expectedFront);
    expect(backValue).toBe(expectedBack);
  }
}
