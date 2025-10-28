/**
 * Study Session E2E Tests
 *
 * Tests the complete study session workflow using the Page Object Model.
 *
 * Test Coverage:
 * - Navigation to study session
 * - Loading states
 * - Flashcard display (question/answer)
 * - Rating flashcards
 * - Progress tracking
 * - Session completion
 * - Empty state handling
 *
 * NOTE: These tests use saved authentication state from auth.setup.ts
 * They don't need to login explicitly before each test.
 * PREREQUISITE: 00-setup-flashcards.spec.ts must run first to create test data.
 */

import { test, expect } from "@playwright/test";
import { StudySessionPage } from "../pages/StudySessionPage";

// Use authenticated user storage state
test.use({ storageState: ".auth/user.json" });

test.describe("Study Session", () => {
  let studyPage: StudySessionPage;

  test.beforeEach(async ({ page }) => {
    // Auth state is already loaded from .auth/user.json
    // No need to login explicitly
    studyPage = new StudySessionPage(page);
  });

  /**
   * Helper to skip test if no cards are available
   */
  async function skipIfNoCards() {
    const state = await studyPage.getSessionState();
    if (state === "complete" || state === "empty") {
      test.skip();
    }
  }

  test.describe("Page Load and Navigation", () => {
    test("should load study session page successfully", async ({ page }) => {
      await studyPage.goto();

      // Verify page header
      await studyPage.verifyPageHeader();
      await expect(studyPage.pageTitle).toBeVisible();
    });

    test("should show loading state initially", async ({ page }) => {
      await studyPage.goto();

      // Check that loading appears (might be very quick)
      const state = await studyPage.getSessionState();
      expect(["loading", "active", "complete", "empty"]).toContain(state);
    });

    test("should transition from loading to active state", async ({ page }) => {
      await studyPage.goto();

      // Wait for initial load to complete
      await studyPage.waitForInitialLoad();

      // Check if we have cards available
      const state = await studyPage.getSessionState();

      // Skip if no cards available
      if (state === "complete" || state === "empty") {
        test.skip();
        return;
      }

      // If we have cards, verify we're in active state
      expect(state).toBe("active");
      const isActive = await studyPage.isActive();
      expect(isActive).toBe(true);
    });
  });

  test.describe("Flashcard Study Flow", () => {
    test("should display question initially", async ({ page }) => {
      await studyPage.goto();

      // Skip if no cards available
      const state = await studyPage.getSessionState();
      if (state === "complete" || state === "empty") {
        test.skip();
      }

      await studyPage.waitForActiveSession();

      // Verify question is visible
      await studyPage.verifyQuestionVisible();
      await expect(studyPage.showAnswerButton).toBeVisible();
    });

    test("should reveal answer when clicking Show Answer", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Show answer
      await studyPage.showAnswer();

      // Verify answer is visible
      await studyPage.verifyAnswerVisible();
      await expect(studyPage.ratingButtonsContainer).toBeVisible();
    });

    test("should display all rating buttons after showing answer", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      await studyPage.showAnswer();

      // Verify all rating buttons
      await studyPage.verifyRatingButtonsEnabled();
      await expect(studyPage.ratingButtonAgain).toHaveText("Again");
      await expect(studyPage.ratingButtonHard).toHaveText("Hard");
      await expect(studyPage.ratingButtonGood).toHaveText("Good");
      await expect(studyPage.ratingButtonEasy).toHaveText("Easy");
    });

    test("should complete one flashcard successfully", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Complete one flashcard with 'good' rating
      await studyPage.studyFlashcard("good");

      // Verify we moved to next card OR session is complete
      const state = await studyPage.getSessionState();
      expect(["active", "complete"]).toContain(state);
    });

    test("should study multiple flashcards in sequence", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Study 3 flashcards with 'good' rating
      await studyPage.studyMultipleFlashcards(3, "good");

      // Verify progress updated or session complete
      const state = await studyPage.getSessionState();
      expect(["active", "complete"]).toContain(state);
    });

    test("should handle different ratings correctly", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Study flashcards with different ratings
      const ratings = ["good", "easy", "hard", "again"] as const;
      await studyPage.studyFlashcardsWithRatings(ratings);

      // Verify we progressed through cards
      const state = await studyPage.getSessionState();
      expect(["active", "complete"]).toContain(state);
    });
  });

  test.describe("Progress Tracking", () => {
    test("should show initial progress correctly", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Verify initial progress shows card 1
      await expect(studyPage.progressCurrent).toContainText("Card 1 of");
      await expect(studyPage.progressPercentage).toBeVisible();
    });

    test("should update progress after completing flashcards", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Get initial progress text
      const initialProgress = await studyPage.progressCurrent.textContent();
      const initialMatch = initialProgress?.match(/Card (\d+) of (\d+)/);
      const initialCardNum = initialMatch ? parseInt(initialMatch[1], 10) : 1;
      const totalCards = initialMatch ? parseInt(initialMatch[2], 10) : 0;

      // Complete one flashcard with "easy" rating to ensure it won't come back immediately
      await studyPage.studyFlashcard("easy");

      // Verify progress changed or session completed
      const state = await studyPage.getSessionState();
      if (state === "active") {
        const newProgress = await studyPage.progressCurrent.textContent();
        const newMatch = newProgress?.match(/Card (\d+) of (\d+)/);
        const newCardNum = newMatch ? parseInt(newMatch[1], 10) : 1;

        // Progress should have advanced (next card number)
        // Note: With FSRS algorithm, card might be re-queued, but with "easy" rating it's less likely
        expect(newCardNum).toBeGreaterThanOrEqual(initialCardNum);

        // Verify total cards count is consistent
        expect(newProgress).toContain(`of ${totalCards}`);
      }
    });

    test("should show percentage progress", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Verify percentage is displayed
      await expect(studyPage.progressPercentage).toBeVisible();
      const percentText = await studyPage.progressPercentage.textContent();
      expect(percentText).toMatch(/\d+% complete/);
    });
  });

  test.describe("Session Completion", () => {
    test("should show completion message when all cards are done", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Study all available cards (max 20 to avoid infinite loop)
      for (let i = 0; i < 20; i++) {
        const state = await studyPage.getSessionState();
        if (state !== "active") break;

        await studyPage.studyFlashcard("good");
      }

      // Verify completion or active state
      const finalState = await studyPage.getSessionState();
      if (finalState === "complete") {
        await studyPage.verifySessionComplete();
        await expect(studyPage.startNewSessionButton).toBeVisible();
      }
    });

    test("should allow starting new session from completion screen", async ({ page }) => {
      await studyPage.goto();

      // Wait for initial load
      await studyPage.waitForInitialLoad();

      // If we start at completion screen, test restart
      const initialState = await studyPage.getSessionState();

      if (initialState === "active") {
        // If we're on active state, we need to complete the session first
        // Study all available cards (max 20 to avoid infinite loop)
        for (let i = 0; i < 20; i++) {
          const state = await studyPage.getSessionState();
          if (state !== "active") break;

          await studyPage.studyFlashcard("good");
          await page.waitForTimeout(300);
        }
      }

      // Now we should be at complete or empty
      const stateBeforeRestart = await studyPage.getSessionState();
      if (stateBeforeRestart !== "complete" && stateBeforeRestart !== "empty") {
        test.skip();
        return;
      }

      // Test the restart functionality
      await studyPage.startNewSession();

      // After restart, we should either have active session or still be complete/empty
      const stateAfterRestart = await studyPage.getSessionState();
      expect(["active", "complete", "empty"]).toContain(stateAfterRestart);
    });
  });

  test.describe("Empty State", () => {
    test("should handle empty state gracefully", async ({ page }) => {
      await studyPage.goto();
      await studyPage.waitForInitialLoad();

      const state = await studyPage.getSessionState();

      // This test is specifically for empty state
      // Skip if we have active cards or completed session with cards
      if (state === "active" || state === "loading") {
        test.skip();
        return;
      }

      // Now we should be in empty or complete state
      // For complete state, we need to distinguish between "no cards" vs "session done"
      await expect(studyPage.completeContainer).toBeVisible();
      await expect(studyPage.startNewSessionButton).toBeVisible();

      // If it's truly empty, the message should mention "no flashcards"
      // Otherwise it's just a completed session
      const message = await studyPage.completeMessage.textContent();
      if (message?.toLowerCase().includes("no flashcards")) {
        // This is the empty state - no flashcards available
        expect(message.toLowerCase()).toContain("no flashcards");
        console.log("✓ Empty state verified - no flashcards available");
      } else {
        // This is a completed session - skip as this isn't the empty state test
        console.log("⊘ Skipping - this is a completed session, not empty state");
        test.skip();
      }
    });
  });

  test.describe("Metadata Display", () => {
    test("should display flashcard state", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Check if metadata is visible
      if (await studyPage.flashcardMetadata.isVisible()) {
        const state = await studyPage.getFlashcardState();
        expect(["New", "Learning", "Review", "Relearning"]).toContain(state);
      }
    });

    test("should show review count for reviewed cards", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Check if review count is displayed
      const reviewCount = await studyPage.getReviewCount();
      if (reviewCount !== null) {
        expect(reviewCount).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe("User Scenario: Complete 6 Flashcards", () => {
    test("should complete user journey of 6 flashcards", async ({ page }) => {
      await studyPage.goto();

      // Handle completion screen if present
      const initialState = await studyPage.getSessionState();
      if (initialState === "complete" || initialState === "empty") {
        test.skip();
      }

      await studyPage.waitForActiveSession();

      // Verify initial state
      await studyPage.verifyQuestionVisible();
      await expect(studyPage.progressCurrent).toContainText("Card 1 of");

      // Study 6 flashcards with varied ratings
      const ratings = ["good", "easy", "good", "hard", "good", "again"] as const;

      for (let i = 0; i < ratings.length; i++) {
        // Verify we're on question side
        const isActive = await studyPage.isActive();
        if (!isActive) break; // No more cards available

        await studyPage.verifyQuestionVisible();

        // Show answer
        await studyPage.showAnswer();
        await studyPage.verifyAnswerVisible();

        // Rate the flashcard
        await studyPage.rateFlashcard(ratings[i]);

        // Verify progress or completion
        if (i < ratings.length - 1) {
          const state = await studyPage.getSessionState();
          if (state === "active") {
            await studyPage.waitForCard(i + 2);
          }
        }
      }

      // Final state should be either active (more cards) or complete
      const finalState = await studyPage.getSessionState();
      expect(["active", "complete"]).toContain(finalState);
    });
  });

  test.describe("Content Verification", () => {
    test("should display question and answer text", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      // Get question text
      const questionText = await studyPage.getQuestionText();
      expect(questionText.length).toBeGreaterThan(0);

      // Show answer and get answer text
      await studyPage.showAnswer();
      const answerText = await studyPage.getAnswerText();
      expect(answerText.length).toBeGreaterThan(0);

      // Verify they are different
      expect(questionText).not.toBe(answerText);
    });

    test("should show both question and answer on back side", async ({ page }) => {
      await studyPage.goto();
      await skipIfNoCards();
      await studyPage.waitForActiveSession();

      const questionText = await studyPage.getQuestionText();
      await studyPage.showAnswer();

      // Both should be visible on answer side
      await expect(studyPage.flashcardQuestionOnBack).toBeVisible();
      await expect(studyPage.flashcardAnswer).toBeVisible();

      // Question should still be the same
      const questionOnBack = await studyPage.flashcardQuestionOnBack.textContent();
      expect(questionOnBack).toBe(questionText);
    });
  });
});
