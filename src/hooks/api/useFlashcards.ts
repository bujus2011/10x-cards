import { useState, useCallback } from "react";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import type { ManualFlashcardFormData } from "@/lib/validations";
import { Logger } from "@/lib/logger";

interface FlashcardsResponse {
  flashcards: FlashcardDto[];
  error?: string;
}

interface FlashcardResponse {
  flashcard: FlashcardDto;
  error?: string;
}

const flashcardsLogger = Logger.forContext("useFlashcards");

export function useFlashcards() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchFlashcards = useCallback(async (): Promise<{ data: FlashcardDto[]; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data: FlashcardsResponse = await response.json();
      return { data: data.flashcards || [] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      flashcardsLogger.error("Fetch flashcards error", error);
      return { data: [], error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFlashcard = useCallback(
    async (data: ManualFlashcardFormData): Promise<{ data?: FlashcardDto; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flashcards: [
              {
                front: data.front,
                back: data.back,
                source: "manual",
                generation_id: null,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create flashcard");
        }

        const result: FlashcardsResponse = await response.json();
        const flashcard = result.flashcards[0];

        return { data: flashcard };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        flashcardsLogger.error("Create flashcard error", error, {
          frontLength: data.front.length,
          backLength: data.back.length,
        });
        return { error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateFlashcard = useCallback(
    async (id: number, updates: FlashcardUpdateDto): Promise<{ data?: FlashcardDto; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/flashcards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update flashcard");
        }

        const result: FlashcardResponse = await response.json();

        return { data: result.flashcard };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        flashcardsLogger.error("Update flashcard error", error, { id });
        return { error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteFlashcard = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete flashcard");
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      flashcardsLogger.error("Delete flashcard error", error, { id });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    isLoading,
  };
}
