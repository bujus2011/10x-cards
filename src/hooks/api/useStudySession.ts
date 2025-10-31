import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { StudyCardDto, Rating, SubmitReviewResponseDto } from "@/types";

interface StudySessionResponse {
  cards: StudyCardDto[];
}

export function useStudySession() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDueCards = useCallback(async (limit = 20): Promise<{ data: StudyCardDto[]; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/study-session?limit=${limit}`);

      if (!response.ok) {
        throw new Error("Failed to fetch due cards");
      }

      const result: StudySessionResponse = await response.json();
      return { data: result.cards || [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch flashcards for study";
      console.error("Fetch due cards error:", error);
      toast.error(message);
      return { data: [], error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitReview = useCallback(
    async (
      flashcardId: number,
      rating: Rating
    ): Promise<{ success: boolean; error?: string; data?: SubmitReviewResponseDto }> => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/study-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flashcard_id: flashcardId,
            rating,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit review");
        }

        const result: SubmitReviewResponseDto = await response.json();
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to submit review";
        console.error("Submit review error:", error);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return {
    fetchDueCards,
    submitReview,
    isLoading,
    isSubmitting,
  };
}
