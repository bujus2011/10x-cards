import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { GenerationCreateResponseDto, FlashcardCreateDto } from "@/types";
import type { GenerateFlashcardsFormData } from "@/lib/validations";

interface BulkSaveRequest {
    flashcards: FlashcardCreateDto[];
}

interface BulkSaveResponse {
    flashcards: Array<{ id: number; front: string; back: string }>;
    saved_count: number;
}

export function useGeneration() {
    const [isLoading, setIsLoading] = useState(false);

    const generateFlashcards = useCallback(async (data: GenerateFlashcardsFormData): Promise<{ data?: GenerationCreateResponseDto; error?: string }> => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/generations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_text: data.source_text }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate flashcards. Please try again.");
            }

            const result: GenerationCreateResponseDto = await response.json();

            toast.success(`Generated ${result.generated_count} flashcards`);
            return { data: result };
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            console.error("Generate flashcards error:", error);
            toast.error(message);
            return { error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveFlashcards = useCallback(async (flashcards: FlashcardCreateDto[]): Promise<{ success: boolean; error?: string; savedCount?: number }> => {
        if (flashcards.length === 0) {
            toast.error("No flashcards to save");
            return { success: false, error: "No flashcards to save" };
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/flashcards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ flashcards } as BulkSaveRequest),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save flashcards");
            }

            const result: BulkSaveResponse = await response.json();

            toast.success(`Successfully saved ${result.saved_count} flashcard${result.saved_count !== 1 ? 's' : ''}`);
            return { success: true, savedCount: result.saved_count };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Save flashcards error:", error);
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        generateFlashcards,
        saveFlashcards,
        isLoading,
    };
}
