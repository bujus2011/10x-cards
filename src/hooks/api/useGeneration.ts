import { useCallback } from "react";
import { toast } from "sonner";
import type { GenerationCreateResponseDto, FlashcardCreateDto } from "@/types";
import type { GenerateFlashcardsFormData } from "@/lib/validations";
import { Logger } from "@/lib/logger";
import { useApiRequest } from "./useApiRequest";

const generationLogger = Logger.forContext("useGeneration");

interface BulkSaveResponse {
  flashcards: { id: number; front: string; back: string }[];
  saved_count: number;
}

export function useGeneration() {
  const { request, isLoading } = useApiRequest();

  const generateFlashcards = useCallback(
    async (data: GenerateFlashcardsFormData): Promise<{ data?: GenerationCreateResponseDto; error?: string }> => {
      const result = await request<GenerationCreateResponseDto>(
        "/api/generations",
        {
          method: "POST",
          body: { source_text: data.source_text },
        },
        generationLogger,
        { textLength: data.source_text.length }
      );

      if (result.error) {
        toast.error(result.error);
        return { error: result.error };
      }

      toast.success(`Generated ${result.data?.generated_count} flashcards`);
      return { data: result.data };
    },
    [request]
  );

  const saveFlashcards = useCallback(
    async (flashcards: FlashcardCreateDto[]): Promise<{ success: boolean; error?: string; savedCount?: number }> => {
      if (flashcards.length === 0) {
        toast.error("No flashcards to save");
        return { success: false, error: "No flashcards to save" };
      }

      const result = await request<BulkSaveResponse>(
        "/api/flashcards",
        {
          method: "POST",
          body: { flashcards },
        },
        generationLogger,
        { draftCount: flashcards.length }
      );

      if (result.error) {
        toast.error(result.error);
        return { success: false, error: result.error };
      }

      const savedCount = result.data?.saved_count || 0;
      toast.success(`Successfully saved ${savedCount} flashcard${savedCount !== 1 ? "s" : ""}`);
      return { success: true, savedCount };
    },
    [request]
  );

  return {
    generateFlashcards,
    saveFlashcards,
    isLoading,
  };
}
