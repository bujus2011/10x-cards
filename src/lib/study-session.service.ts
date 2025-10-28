import type { SupabaseClient } from "../db/supabase.client";
import type { FlashcardDto, StudyCardDto, Rating, State, ReviewLogInsert, ReviewLogUpdate } from "../types";
import { fsrs, type Card, type State as FSRSState, createEmptyCard } from "ts-fsrs";
import { DatabaseError } from "./flashcard.service";

/**
 * Service for managing study sessions with spaced repetition
 * Uses FSRS (Free Spaced Repetition Scheduler) algorithm
 */
export class StudySessionService {
  private fsrsScheduler = fsrs();

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get flashcards due for review
   * @param userId - The ID of the user
   * @param limit - Maximum number of cards to return (default: 20)
   * @returns Array of flashcards with review data
   */
  async getDueCards(userId: string, limit = 20): Promise<StudyCardDto[]> {
    const now = new Date().toISOString();

    // Get flashcards with their review logs
    const { data: reviewLogs, error: reviewError } = await this.supabase
      .from("review_logs")
      .select(
        `
        *,
        flashcards:flashcard_id (
          id, front, back, source, generation_id, created_at, updated_at
        )
      `
      )
      .eq("user_id", userId)
      .lte("due", now)
      .order("due", { ascending: true })
      .limit(limit);

    if (reviewError) {
      throw new DatabaseError("Failed to fetch due cards", reviewError.code || "UNKNOWN", reviewError.message);
    }

    // Get flashcards that don't have review logs yet (new cards)
    const { data: existingReviewIds } = await this.supabase
      .from("review_logs")
      .select("flashcard_id")
      .eq("user_id", userId);

    const existingIds = existingReviewIds?.map((r) => r.flashcard_id) || [];

    const { data: newFlashcards, error: flashcardsError } = await this.supabase
      .from("flashcards")
      .select("id, front, back, source, generation_id, created_at, updated_at")
      .eq("user_id", userId)
      .not("id", "in", `(${existingIds.length > 0 ? existingIds.join(",") : "-1"})`)
      .order("created_at", { ascending: true })
      .limit(Math.max(0, limit - (reviewLogs?.length || 0)));

    if (flashcardsError) {
      throw new DatabaseError(
        "Failed to fetch new flashcards",
        flashcardsError.code || "UNKNOWN",
        flashcardsError.message
      );
    }

    // Map review logs to StudyCardDto
    const dueCards: StudyCardDto[] =
      reviewLogs?.map((log) => ({
        flashcard: log.flashcards as unknown as FlashcardDto,
        review: {
          state: log.state as State,
          due: log.due,
          stability: log.stability,
          difficulty: log.difficulty,
          elapsed_days: log.elapsed_days,
          scheduled_days: log.scheduled_days,
          reps: log.reps,
          lapses: log.lapses,
          last_review: log.last_review,
        },
      })) || [];

    // Add new flashcards with default review state
    const newCards: StudyCardDto[] =
      newFlashcards?.map((flashcard) => ({
        flashcard: flashcard as FlashcardDto,
        review: {
          state: 0 as State, // New
          due: new Date().toISOString(),
          stability: 0,
          difficulty: 0,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 0,
          lapses: 0,
          last_review: null,
        },
      })) || [];

    return [...dueCards, ...newCards];
  }

  /**
   * Submit a review for a flashcard
   * @param userId - The ID of the user
   * @param flashcardId - The ID of the flashcard being reviewed
   * @param rating - The rating given by the user (1=Again, 2=Hard, 3=Good, 4=Easy)
   * @returns Updated review data
   */
  async submitReview(userId: string, flashcardId: number, rating: Rating): Promise<{ next_due: string; state: State }> {
    // Get existing review log or create new one
    const { data: existingLog } = await this.supabase
      .from("review_logs")
      .select("*")
      .eq("flashcard_id", flashcardId)
      .eq("user_id", userId)
      .single();

    let card: Card;
    let now = new Date();

    if (existingLog) {
      // Convert database record to FSRS Card
      card = {
        due: new Date(existingLog.due),
        stability: existingLog.stability,
        difficulty: existingLog.difficulty,
        elapsed_days: existingLog.elapsed_days,
        scheduled_days: existingLog.scheduled_days,
        reps: existingLog.reps,
        lapses: existingLog.lapses,
        state: existingLog.state as FSRSState,
        last_review: existingLog.last_review ? new Date(existingLog.last_review) : undefined,
      };
    } else {
      // Create new card
      card = createEmptyCard();
      now = new Date(card.due);
    }

    // Schedule the card with the given rating
    const schedulingInfo = this.fsrsScheduler.repeat(card, now)[rating];
    const updatedCard = schedulingInfo.card;

    // Prepare review log data
    const reviewLogData = {
      flashcard_id: flashcardId,
      user_id: userId,
      state: updatedCard.state as number,
      rating: rating,
      due: updatedCard.due.toISOString(),
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      elapsed_days: updatedCard.elapsed_days,
      scheduled_days: updatedCard.scheduled_days,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
      last_review: updatedCard.last_review ? updatedCard.last_review.toISOString() : null,
    };

    if (existingLog) {
      // Update existing review log
      const { error: updateError } = await this.supabase
        .from("review_logs")
        .update(reviewLogData as ReviewLogUpdate)
        .eq("id", existingLog.id);

      if (updateError) {
        throw new DatabaseError("Failed to update review log", updateError.code || "UNKNOWN", updateError.message);
      }
    } else {
      // Insert new review log
      const { error: insertError } = await this.supabase.from("review_logs").insert(reviewLogData as ReviewLogInsert);

      if (insertError) {
        throw new DatabaseError("Failed to create review log", insertError.code || "UNKNOWN", insertError.message);
      }
    }

    return {
      next_due: updatedCard.due.toISOString(),
      state: updatedCard.state as State,
    };
  }

  /**
   * Get statistics about study progress
   * @param userId - The ID of the user
   * @returns Statistics about flashcard reviews
   */
  async getStudyStats(userId: string): Promise<{
    total_cards: number;
    new_cards: number;
    learning_cards: number;
    review_cards: number;
    due_today: number;
  }> {
    const now = new Date().toISOString();

    // Get total flashcards count
    const { count: totalCards } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get review logs statistics
    const { data: reviewLogs } = await this.supabase.from("review_logs").select("state, due").eq("user_id", userId);

    const existingReviewIds = reviewLogs?.length || 0;
    const newCards = (totalCards || 0) - existingReviewIds;
    const learningCards = reviewLogs?.filter((log) => log.state === 1 || log.state === 3).length || 0;
    const reviewCards = reviewLogs?.filter((log) => log.state === 2).length || 0;
    const dueToday = reviewLogs?.filter((log) => new Date(log.due) <= new Date(now)).length || 0;

    return {
      total_cards: totalCards || 0,
      new_cards: newCards,
      learning_cards: learningCards,
      review_cards: reviewCards,
      due_today: dueToday + Math.min(newCards, 10), // Include up to 10 new cards in due count
    };
  }
}
