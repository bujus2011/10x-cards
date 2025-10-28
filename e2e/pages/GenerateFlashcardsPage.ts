/**
 * Generate Flashcards Page Object Model
 *
 * Encapsulates the flashcard generation page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 *
 * @example
 * const generatePage = new GenerateFlashcardsPage(page);
 * await generatePage.goto();
 * await generatePage.fillSourceText(articleText);
 * await generatePage.clickGenerate();
 * await generatePage.waitForFlashcards();
 * await generatePage.acceptFlashcard(0);
 * await generatePage.saveAcceptedFlashcards();
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class GenerateFlashcardsPage {
  readonly page: Page;

  // Text input area
  readonly sourceTextarea: Locator;
  readonly textCounter: Locator;

  // Generate button
  readonly generateButton: Locator;

  // Flashcard list
  readonly flashcardList: Locator;
  readonly flashcardItems: Locator;

  // Bulk save buttons
  readonly saveAcceptedButton: Locator;
  readonly saveAllButton: Locator;

  // Error notification
  readonly errorNotification: Locator;

  // Loading state
  readonly loadingSkeletons: Locator;

  constructor(page: Page) {
    this.page = page;

    // Text input locators
    this.sourceTextarea = page.getByTestId("source-text-textarea");
    this.textCounter = page.locator(".text-sm", { hasText: "/ 10000 characters" });

    // Generate button
    this.generateButton = page.getByTestId("generate-button");

    // Flashcard list locators
    this.flashcardList = page.getByTestId("flashcard-list");
    this.flashcardItems = page.locator('[data-testid^="flashcard-list-item-"]');

    // Save buttons
    this.saveAcceptedButton = page.getByTestId("save-accepted-button");
    this.saveAllButton = page.getByTestId("save-all-button");

    // Error notification
    this.errorNotification = page.locator('[role="alert"]');

    // Loading state
    this.loadingSkeletons = page.locator(".border.rounded-lg.p-4.space-y-3");
  }

  /**
   * Navigate to the generate flashcards page
   */
  async goto() {
    await this.page.goto("/generate");
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad() {
    await expect(this.sourceTextarea).toBeVisible();
    await expect(this.generateButton).toBeVisible();
  }

  /**
   * Fill the source text area
   * @param text - Text to fill (1000-10000 characters)
   */
  async fillSourceText(text: string) {
    // Click on textarea to focus it
    await this.sourceTextarea.click();

    // Clear any existing content
    await this.sourceTextarea.press("Control+A");
    await this.sourceTextarea.press("Backspace");

    // Wait a bit after clearing
    await this.page.waitForTimeout(100);

    // For longer texts (>500 chars), use fill() for reliability
    // For very short texts, use pressSequentially to simulate real typing
    if (text.length > 500) {
      await this.sourceTextarea.fill(text);
    } else {
      // Use pressSequentially with delay: 0 for fast but reliable typing
      // This sends real keyboard events that React 19 recognizes
      await this.sourceTextarea.pressSequentially(text, { delay: 0 });
    }

    // Wait for React to process
    await this.page.waitForTimeout(500);

    // Verify the character counter updated
    const expectedCount = text.length;
    await expect(async () => {
      const counterText = await this.textCounter.textContent();
      const match = counterText?.match(/^(\d+)\s*\/\s*10000/);
      const actualCount = match ? parseInt(match[1], 10) : 0;
      if (actualCount !== expectedCount) {
        throw new Error(`Counter shows ${actualCount}, expected ${expectedCount}`);
      }
    }).toPass({ timeout: 15000, intervals: [500] });
  }

  /**
   * Clear the source text area
   */
  async clearSourceText() {
    await this.sourceTextarea.clear();
  }

  /**
   * Get the current character count
   * @returns Current character count
   */
  async getCharacterCount(): Promise<number> {
    // Wait for React to update the character counter
    await this.page.waitForTimeout(500);

    // Read from the visible character counter
    const counterText = await this.textCounter.textContent();

    // Extract number from text like "1234 / 10000 characters"
    const match = counterText?.match(/^(\d+)\s*\/\s*10000/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Fallback to textarea value length
    const text = await this.sourceTextarea.inputValue();
    return text.length;
  }

  /**
   * Check if the generate button is enabled
   */
  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  /**
   * Click the generate button
   * Waits for button to be enabled with multiple attempts to handle React state updates
   */
  async clickGenerate() {
    // Try multiple times with small waits between attempts (max ~10 seconds total)
    let lastError;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        if (await this.generateButton.isEnabled()) {
          await this.generateButton.click();
          return;
        }
      } catch (error) {
        lastError = error;
      }
      await this.page.waitForTimeout(500);
    }

    // If all retries failed, throw the last error
    throw new Error(`Generate button did not become enabled after retries: ${lastError}`);
  }

  /**
   * Wait for flashcards to be generated
   * @param timeout - Maximum wait time in milliseconds (default: 90000ms)
   */
  async waitForFlashcards(timeout = 90000) {
    await expect(this.flashcardList).toBeVisible({ timeout });
    // Wait for at least one flashcard item
    await expect(this.flashcardItems.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for loading state to appear
   */
  async waitForLoading() {
    await expect(this.loadingSkeletons.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Wait for loading state to disappear
   */
  async waitForLoadingToDisappear() {
    await expect(this.loadingSkeletons.first()).toBeHidden({ timeout: 95000 });
  }

  /**
   * Get the number of generated flashcards
   * @returns Number of flashcard items
   */
  async getFlashcardCount(): Promise<number> {
    return await this.flashcardItems.count();
  }

  /**
   * Get a specific flashcard item by index
   * @param index - Zero-based index
   * @returns FlashcardItem helper object
   */
  getFlashcardItem(index: number): FlashcardItem {
    const item = this.page.getByTestId(`flashcard-list-item-${index}`);
    return new FlashcardItem(item, this.page);
  }

  /**
   * Accept a flashcard by index
   * @param index - Zero-based index
   */
  async acceptFlashcard(index: number) {
    const flashcard = this.getFlashcardItem(index);
    await flashcard.accept();
  }

  /**
   * Accept multiple flashcards
   * @param indices - Array of zero-based indices
   */
  async acceptMultipleFlashcards(indices: number[]) {
    for (const index of indices) {
      await this.acceptFlashcard(index);
    }
  }

  /**
   * Reject a flashcard by index
   * @param index - Zero-based index
   */
  async rejectFlashcard(index: number) {
    const flashcard = this.getFlashcardItem(index);
    await flashcard.reject();
  }

  /**
   * Edit a flashcard by index
   * @param index - Zero-based index
   * @param front - New front text
   * @param back - New back text
   */
  async editFlashcard(index: number, front: string, back: string) {
    const flashcard = this.getFlashcardItem(index);
    await flashcard.edit(front, back);
  }

  /**
   * Click the "Save Accepted" button
   */
  async clickSaveAccepted() {
    await expect(this.saveAcceptedButton).toBeEnabled();
    await this.saveAcceptedButton.click();
  }

  /**
   * Click the "Save All" button
   */
  async clickSaveAll() {
    await expect(this.saveAllButton).toBeEnabled();
    await this.saveAllButton.click();
  }

  /**
   * Wait for save success (toast notification and page reset)
   */
  async waitForSaveSuccess() {
    // Wait for success toast
    const toast = this.page.locator("[data-sonner-toast]", { hasText: /Successfully saved/i });
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Wait for page reset (be tolerant of async double-save flows)
    await expect(async () => {
      const listHidden = await this.flashcardList.isHidden();
      const textValue = await this.sourceTextarea.inputValue();
      if (!listHidden || textValue !== "") {
        throw new Error("Page not reset yet");
      }
    }).toPass({ timeout: 15000, intervals: [500] });
  }

  /**
   * Verify error notification is visible
   * @param expectedMessage - Optional expected error message
   */
  async verifyErrorVisible(expectedMessage?: string) {
    await expect(this.errorNotification).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorNotification).toContainText(expectedMessage);
    }
  }

  /**
   * Check if error notification is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorNotification.isVisible();
  }

  /**
   * Verify save buttons are visible
   */
  async verifySaveButtonsVisible() {
    await expect(this.saveAcceptedButton).toBeVisible();
    await expect(this.saveAllButton).toBeVisible();
  }

  /**
   * Verify "Save Accepted" button state
   * @param shouldBeEnabled - Expected enabled state
   */
  async verifySaveAcceptedState(shouldBeEnabled: boolean) {
    if (shouldBeEnabled) {
      // Increased timeout for React 19 state propagation
      await expect(this.saveAcceptedButton).toBeEnabled({ timeout: 10000 });
    } else {
      await expect(this.saveAcceptedButton).toBeDisabled({ timeout: 10000 });
    }
  }

  /**
   * Complete the full generation workflow
   * @param text - Source text to generate from
   * @param timeout - Maximum wait time for generation
   */
  async generateFlashcardsFromText(text: string, timeout = 90000) {
    await this.fillSourceText(text);
    await this.clickGenerate();
    await this.waitForFlashcards(timeout);
  }

  /**
   * Get all flashcard contents
   * @returns Array of flashcard front/back pairs
   */
  async getAllFlashcardContents(): Promise<{ front: string; back: string }[]> {
    const count = await this.getFlashcardCount();
    const flashcards: { front: string; back: string }[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.getFlashcardItem(i);
      const front = await item.getFrontText();
      const back = await item.getBackText();
      flashcards.push({ front, back });
    }

    return flashcards;
  }
}

/**
 * FlashcardItem helper class
 * Encapsulates interactions with a single flashcard item
 */
export class FlashcardItem {
  readonly container: Locator;
  readonly page: Page;
  readonly acceptButton: Locator;
  readonly editButton: Locator;
  readonly rejectButton: Locator;
  readonly saveEditButton: Locator;
  readonly editFrontTextarea: Locator;
  readonly editBackTextarea: Locator;
  readonly frontText: Locator;
  readonly backText: Locator;
  readonly editedBadge: Locator;

  constructor(container: Locator, page: Page) {
    this.container = container;
    this.page = page;

    // Action buttons
    this.acceptButton = container.getByTestId("accept-button");
    this.editButton = container.getByTestId("edit-button");
    this.rejectButton = container.getByTestId("reject-button");
    this.saveEditButton = container.getByTestId("save-edit-button");

    // Edit mode textareas
    this.editFrontTextarea = container.getByTestId("edit-front-textarea");
    this.editBackTextarea = container.getByTestId("edit-back-textarea");

    // Display text
    this.frontText = container.locator("p.font-medium");
    this.backText = container.locator("p.text-muted-foreground").first();
    this.editedBadge = container.locator(".text-sm.text-muted-foreground", { hasText: "Edited" });
  }

  /**
   * Click the accept button
   */
  async accept() {
    await expect(this.acceptButton).toBeVisible();
    await this.acceptButton.click();
    // Wait for React 19 state propagation - increased timeout for concurrent rendering
    await this.page.waitForTimeout(1000);
  }

  /**
   * Click the reject button
   */
  async reject() {
    await expect(this.rejectButton).toBeVisible();
    await this.rejectButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Click the edit button to enter edit mode
   */
  async clickEdit() {
    await expect(this.editButton).toBeVisible();
    await this.editButton.click();
    // Wait for edit mode to activate
    await expect(this.editFrontTextarea).toBeVisible();
  }

  /**
   * Edit the flashcard content
   * @param front - New front text
   * @param back - New back text
   */
  async edit(front: string, back: string) {
    await this.clickEdit();

    // Clear and fill front
    await this.editFrontTextarea.clear();
    await this.editFrontTextarea.fill(front);

    // Clear and fill back
    await this.editBackTextarea.clear();
    await this.editBackTextarea.fill(back);

    // Save
    await expect(this.saveEditButton).toBeEnabled();
    await this.saveEditButton.click();

    // Wait for edit mode to exit
    await expect(this.editFrontTextarea).toBeHidden();
  }

  /**
   * Get the front text content
   */
  async getFrontText(): Promise<string> {
    return (await this.frontText.textContent()) || "";
  }

  /**
   * Get the back text content
   */
  async getBackText(): Promise<string> {
    return (await this.backText.textContent()) || "";
  }

  /**
   * Check if flashcard is accepted (has green background)
   */
  async isAccepted(): Promise<boolean> {
    const classes = await this.container.getAttribute("class");
    return classes?.includes("bg-green-50") ?? false;
  }

  /**
   * Check if flashcard has been edited
   */
  async isEdited(): Promise<boolean> {
    return await this.editedBadge.isVisible();
  }

  /**
   * Check if flashcard is in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    return await this.editFrontTextarea.isVisible();
  }

  /**
   * Verify flashcard content
   * @param expectedFront - Expected front text
   * @param expectedBack - Expected back text
   */
  async verifyContent(expectedFront: string, expectedBack: string) {
    await expect(this.frontText).toHaveText(expectedFront);
    await expect(this.backText).toHaveText(expectedBack);
  }

  /**
   * Verify flashcard is visible
   */
  async verifyVisible() {
    await expect(this.container).toBeVisible();
  }
}
