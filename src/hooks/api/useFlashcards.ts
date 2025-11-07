import { useCallback } from "react";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import type { ManualFlashcardFormData } from "@/lib/validations";
import { Logger } from "@/lib/logger";
import { useApiRequest } from "./useApiRequest";

interface FlashcardsResponse {
  flashcards: FlashcardDto[];
}

interface FlashcardResponse {
  flashcard: FlashcardDto;
}

const flashcardsLogger = Logger.forContext("useFlashcards");

export function useFlashcards() {
  const { request, isLoading } = useApiRequest();

  const fetchFlashcards = useCallback(async (): Promise<{ data: FlashcardDto[]; error?: string }> => {
    const result = await request<FlashcardsResponse>("/api/flashcards", { method: "GET" }, flashcardsLogger);

    if (result.error) {
      return { data: [], error: result.error };
    }

    return { data: result.data?.flashcards || [] };
  }, [request]);

  const createFlashcard = useCallback(
    async (data: ManualFlashcardFormData): Promise<{ data?: FlashcardDto; error?: string }> => {
      const result = await request<FlashcardsResponse>(
        "/api/flashcards",
        {
          method: "POST",
          body: {
            flashcards: [
              {
                front: data.front,
                back: data.back,
                source: "manual",
                generation_id: null,
              },
            ],
          },
        },
        flashcardsLogger,
        { frontLength: data.front.length, backLength: data.back.length }
      );

      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data?.flashcards[0] };
    },
    [request]
  );

  const updateFlashcard = useCallback(
    async (id: number, updates: FlashcardUpdateDto): Promise<{ data?: FlashcardDto; error?: string }> => {
      const result = await request<FlashcardResponse>(
        "/api/flashcards",
        {
          method: "PUT",
          body: { id, ...updates },
        },
        flashcardsLogger,
        { id }
      );

      if (result.error) {
        return { error: result.error };
      }

      return { data: result.data?.flashcard };
    },
    [request]
  );

  const deleteFlashcard = useCallback(
    async (id: number): Promise<{ success: boolean; error?: string }> => {
      const result = await request<{ success: boolean }>(
        "/api/flashcards",
        {
          method: "DELETE",
          body: { id },
        },
        flashcardsLogger,
        { id }
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    },
    [request]
  );

  return {
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    isLoading,
  };
}
