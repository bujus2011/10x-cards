/**
 * Study Session Page Object Model
 *
 * Encapsulates the study session page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 *
 * @example
 * const studyPage = new StudySessionPage(page);
 * await studyPage.goto();
 * await studyPage.studyFlashcard('good');
 * await studyPage.verifyProgress(2, 20);
 */

import { type Page, type Locator, expect } from "@playwright/test";

export type Rating = "again" | "hard" | "good" | "easy";
export type FlashcardState = "New" | "Learning" | "Review" | "Relearning";
export type SessionState = "loading" | "active" | "complete" | "empty";

export class StudySessionPage {
  readonly page: Page;

  // Page-level elements
  readonly pageHeader: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Session state containers
  readonly loadingContainer: Locator;
  readonly completeContainer: Locator;
  readonly activeContainer: Locator;

  // Complete/Empty state elements
  readonly completeMessage: Locator;
  readonly startNewSessionButton: Locator;

  // Progress indicators
  readonly progressIndicator: Locator;
  readonly progressCurrent: Locator;
  readonly progressPercentage: Locator;

  // Flashcard elements
  readonly flashcardContainer: Locator;
  readonly flashcardSideLabel: Locator;
  readonly flashcardQuestion: Locator;
  readonly flashcardAnswerContainer: Locator;
  readonly flashcardQuestionOnBack: Locator;
  readonly flashcardAnswer: Locator;

  // Action buttons
  readonly showAnswerButton: Locator;
  readonly ratingButtonsContainer: Locator;
  readonly ratingPrompt: Locator;
  readonly ratingButtonAgain: Locator;
  readonly ratingButtonHard: Locator;
  readonly ratingButtonGood: Locator;
  readonly ratingButtonEasy: Locator;

  // Metadata
  readonly flashcardMetadata: Locator;
  readonly flashcardState: Locator;
  readonly flashcardReviewsCount: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page-level locators
    this.pageHeader = page.getByTestId("study-session-header");
    this.pageTitle = page.getByTestId("study-session-title");
    this.pageDescription = page.getByTestId("study-session-description");

    // Session state locators
    this.loadingContainer = page.getByTestId("study-session-loading");
    this.completeContainer = page.getByTestId("study-session-complete");
    this.activeContainer = page.getByTestId("study-session-active");

    // Complete/Empty state locators
    this.completeMessage = page.getByTestId("session-complete-message");
    this.startNewSessionButton = page.getByTestId("start-new-session-button");

    // Progress locators
    this.progressIndicator = page.getByTestId("study-progress-indicator");
    this.progressCurrent = page.getByTestId("study-progress-current");
    this.progressPercentage = page.getByTestId("study-progress-percentage");

    // Flashcard locators
    this.flashcardContainer = page.getByTestId("flashcard-container");
    this.flashcardSideLabel = page.getByTestId("flashcard-side-label");
    this.flashcardQuestion = page.getByTestId("flashcard-question");
    this.flashcardAnswerContainer = page.getByTestId("flashcard-answer-container");
    this.flashcardQuestionOnBack = page.getByTestId("flashcard-question-on-back");
    this.flashcardAnswer = page.getByTestId("flashcard-answer");

    // Action button locators
    this.showAnswerButton = page.getByTestId("show-answer-button");
    this.ratingButtonsContainer = page.getByTestId("rating-buttons-container");
    this.ratingPrompt = page.getByTestId("rating-prompt");
    this.ratingButtonAgain = page.getByTestId("rating-button-again");
    this.ratingButtonHard = page.getByTestId("rating-button-hard");
    this.ratingButtonGood = page.getByTestId("rating-button-good");
    this.ratingButtonEasy = page.getByTestId("rating-button-easy");

    // Metadata locators
    this.flashcardMetadata = page.getByTestId("flashcard-metadata");
    this.flashcardState = page.getByTestId("flashcard-state");
    this.flashcardReviewsCount = page.getByTestId("flashcard-reviews-count");
  }

  /**
   * Navigate to the study session page
   */
  async goto() {
    await this.page.goto("/study-session");
    await this.waitForInitialLoad();
  }

  /**
   * Wait for the page to load (either loading or direct to session state)
   */
  async waitForInitialLoad() {
    // Wait for either loading state or one of the session states
    await this.page.waitForSelector(
      '[data-testid="study-session-loading"], [data-testid="study-session-active"], [data-testid="study-session-complete"]',
      { state: "visible" }
    );
  }

  /**
   * Wait for loading to complete and session to become active
   * @throws Error if session is complete/empty instead of active
   */
  async waitForActiveSession() {
    // Wait for loading to disappear (if present)
    const loadingVisible = await this.loadingContainer.isVisible().catch(() => false);
    if (loadingVisible) {
      await expect(this.loadingContainer).toBeHidden({ timeout: 10000 });
    }

    // Check which state we're in
    const isComplete = await this.completeContainer.isVisible().catch(() => false);
    if (isComplete) {
      throw new Error("Session is complete or empty - no cards available to study");
    }

    // Wait for active session to appear
    await expect(this.activeContainer).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get the current session state
   * @returns Current state: 'loading', 'active', 'complete', or 'empty'
   */
  async getSessionState(): Promise<SessionState> {
    // Wait a moment for the UI to stabilize
    await this.page.waitForTimeout(200);

    // Check states with timeout to avoid hanging
    const loadingVisible = await this.loadingContainer.isVisible().catch(() => false);
    if (loadingVisible) {
      return "loading";
    }

    const activeVisible = await this.activeContainer.isVisible().catch(() => false);
    if (activeVisible) {
      return "active";
    }

    const completeVisible = await this.completeContainer.isVisible().catch(() => false);
    if (completeVisible) {
      // Try to get the message text with a short timeout
      try {
        const message = await this.completeMessage.textContent({ timeout: 5000 });
        return message?.toLowerCase().includes("no flashcards") ? "empty" : "complete";
      } catch {
        // If we can't read the message, default to complete
        return "complete";
      }
    }

    // None of the containers are visible - wait a bit longer and try again once
    await this.page.waitForTimeout(500);

    // Check again after waiting
    if (await this.loadingContainer.isVisible().catch(() => false)) return "loading";
    if (await this.activeContainer.isVisible().catch(() => false)) return "active";
    if (await this.completeContainer.isVisible().catch(() => false)) {
      try {
        const message = await this.completeMessage.textContent({ timeout: 5000 });
        return message?.toLowerCase().includes("no flashcards") ? "empty" : "complete";
      } catch {
        return "complete";
      }
    }

    throw new Error("Unknown session state - no container is visible");
  }

  /**
   * Start a new session (clicks the "Start New Session" button)
   */
  async startNewSession() {
    await expect(this.startNewSessionButton).toBeVisible();

    // Click and wait for navigation or state change
    await Promise.all([
      // Wait for either the active container to appear or complete to reappear
      this.page
        .waitForResponse((resp) => resp.url().includes("/api/study-session") && resp.request().method() === "GET", {
          timeout: 10000,
        })
        .catch(() => null),
      this.startNewSessionButton.click(),
    ]);

    // Small delay for UI to update
    await this.page.waitForTimeout(500);

    // Check the new state
    const state = await this.getSessionState();
    if (state !== "active" && state !== "complete" && state !== "empty") {
      throw new Error(`Expected active, complete, or empty state after restart, got: ${state}`);
    }
  }

  /**
   * Click "Show Answer" button and wait for answer to appear
   */
  async showAnswer() {
    await expect(this.showAnswerButton).toBeVisible();
    await this.showAnswerButton.click();

    // Wait for answer to be visible
    await expect(this.flashcardAnswer).toBeVisible();
    await expect(this.flashcardSideLabel).toHaveText("Answer");
    await expect(this.ratingButtonsContainer).toBeVisible();
  }

  /**
   * Rate the current flashcard
   * @param rating - Rating choice: 'again', 'hard', 'good', or 'easy'
   */
  async rateFlashcard(rating: Rating) {
    const buttonMap = {
      again: this.ratingButtonAgain,
      hard: this.ratingButtonHard,
      good: this.ratingButtonGood,
      easy: this.ratingButtonEasy,
    };

    const button = buttonMap[rating];
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();

    // Wait for the button click to be processed
    await this.page.waitForTimeout(300);
  }

  /**
   * Complete one flashcard: show answer and rate it
   * @param rating - Rating choice: 'again', 'hard', 'good', or 'easy'
   */
  async studyFlashcard(rating: Rating) {
    await this.showAnswer();
    await this.rateFlashcard(rating);
  }

  /**
   * Complete multiple flashcards with the same rating
   * @param count - Number of flashcards to complete
   * @param rating - Rating to use for all cards
   */
  async studyMultipleFlashcards(count: number, rating: Rating = "good") {
    for (let i = 0; i < count; i++) {
      // Verify we're on question side before starting
      await expect(this.flashcardQuestion).toBeVisible();
      await this.studyFlashcard(rating);

      // If not the last card, wait for next question
      if (i < count - 1) {
        await expect(this.flashcardQuestion).toBeVisible();
        await expect(this.flashcardSideLabel).toHaveText("Question");
      }
    }
  }

  /**
   * Complete multiple flashcards with custom ratings for each
   * @param ratings - Array of ratings, one for each card
   */
  async studyFlashcardsWithRatings(ratings: Rating[]) {
    for (let i = 0; i < ratings.length; i++) {
      await expect(this.flashcardQuestion).toBeVisible();
      await this.studyFlashcard(ratings[i]);

      // If not the last card, wait for next question
      if (i < ratings.length - 1) {
        await expect(this.flashcardQuestion).toBeVisible();
      }
    }
  }

  /**
   * Verify the current progress
   * @param currentCard - Expected current card number (1-based)
   * @param totalCards - Expected total number of cards
   */
  async verifyProgress(currentCard: number, totalCards: number) {
    await expect(this.progressCurrent).toContainText(`Card ${currentCard} of ${totalCards}`);

    const expectedPercentage = Math.round((currentCard / totalCards) * 100);
    await expect(this.progressPercentage).toContainText(`${expectedPercentage}% complete`);
  }

  /**
   * Verify the question is displayed
   */
  async verifyQuestionVisible() {
    await expect(this.flashcardSideLabel).toHaveText("Question");
    await expect(this.flashcardQuestion).toBeVisible();
    await expect(this.showAnswerButton).toBeVisible();
  }

  /**
   * Verify the answer is displayed
   */
  async verifyAnswerVisible() {
    await expect(this.flashcardSideLabel).toHaveText("Answer");
    await expect(this.flashcardAnswer).toBeVisible();
    await expect(this.ratingButtonsContainer).toBeVisible();
  }

  /**
   * Get the question text
   * @returns Question text content
   */
  async getQuestionText(): Promise<string> {
    return (await this.flashcardQuestion.textContent()) || "";
  }

  /**
   * Get the answer text
   * @returns Answer text content
   */
  async getAnswerText(): Promise<string> {
    return (await this.flashcardAnswer.textContent()) || "";
  }

  /**
   * Get the current flashcard state (New, Learning, Review, Relearning)
   * @returns Flashcard state
   */
  async getFlashcardState(): Promise<FlashcardState | null> {
    if (!(await this.flashcardState.isVisible())) {
      return null;
    }

    const stateText = await this.flashcardState.textContent();
    const match = stateText?.match(/State: (New|Learning|Review|Relearning)/);
    return match ? (match[1] as FlashcardState) : null;
  }

  /**
   * Get the number of reviews for current flashcard
   * @returns Review count or null if not displayed
   */
  async getReviewCount(): Promise<number | null> {
    if (!(await this.flashcardReviewsCount.isVisible())) {
      return null;
    }

    const text = await this.flashcardReviewsCount.textContent();
    const match = text?.match(/Reviews: (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Verify session is complete
   * @param expectedMessage - Optional expected completion message
   */
  async verifySessionComplete(expectedMessage?: string) {
    await expect(this.completeContainer).toBeVisible();
    await expect(this.startNewSessionButton).toBeVisible();

    if (expectedMessage) {
      await expect(this.completeMessage).toContainText(expectedMessage);
    }
  }

  /**
   * Verify session is empty (no cards to review)
   */
  async verifySessionEmpty() {
    await expect(this.completeContainer).toBeVisible();
    // The message should contain "no flashcards" (case-insensitive)
    const message = await this.completeMessage.textContent();
    expect(message?.toLowerCase()).toContain("no flashcards");
  }

  /**
   * Check if the session is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingContainer.isVisible();
  }

  /**
   * Check if the session is active
   */
  async isActive(): Promise<boolean> {
    return await this.activeContainer.isVisible();
  }

  /**
   * Check if the session is complete
   */
  async isComplete(): Promise<boolean> {
    return await this.completeContainer.isVisible();
  }

  /**
   * Check if showing question side
   */
  async isShowingQuestion(): Promise<boolean> {
    if (!(await this.activeContainer.isVisible())) {
      return false;
    }
    return await this.flashcardQuestion.isVisible();
  }

  /**
   * Check if showing answer side
   */
  async isShowingAnswer(): Promise<boolean> {
    if (!(await this.activeContainer.isVisible())) {
      return false;
    }
    return await this.flashcardAnswer.isVisible();
  }

  /**
   * Verify all rating buttons are visible and enabled
   */
  async verifyRatingButtonsEnabled() {
    await expect(this.ratingButtonAgain).toBeVisible();
    await expect(this.ratingButtonAgain).toBeEnabled();
    await expect(this.ratingButtonHard).toBeVisible();
    await expect(this.ratingButtonHard).toBeEnabled();
    await expect(this.ratingButtonGood).toBeVisible();
    await expect(this.ratingButtonGood).toBeEnabled();
    await expect(this.ratingButtonEasy).toBeVisible();
    await expect(this.ratingButtonEasy).toBeEnabled();
  }

  /**
   * Verify page header content
   */
  async verifyPageHeader() {
    await expect(this.pageTitle).toHaveText("Study Session");
    await expect(this.pageDescription).toContainText("spaced repetition");
  }

  /**
   * Wait for a specific number of cards to be studied
   * Useful for waiting between card transitions
   * @param cardNumber - The card number to wait for (1-based)
   */
  async waitForCard(cardNumber: number) {
    await expect(this.progressCurrent).toContainText(`Card ${cardNumber} of`);
  }
}
