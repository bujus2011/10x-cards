import { useState, useCallback } from "react";
import type { FlashcardCreateDto } from "@/types";
import type { GenerateFlashcardsFormData } from "@/lib/validations";
import { useGeneration } from "@/hooks/api";

export type FlashcardProposalViewModel = {
    front: string;
    back: string;
    accepted: boolean;
    edited: boolean;
    source: "ai-full" | "ai-edited";
};

export function useFlashcardGeneration(onSaveSuccess?: () => void) {
    const [generationId, setGenerationId] = useState<number | null>(null);
    const [flashcards, setFlashcards] = useState<FlashcardProposalViewModel[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { generateFlashcards, saveFlashcards, isLoading } = useGeneration();

    const handleGenerateFlashcards = useCallback(async (data: GenerateFlashcardsFormData) => {
        setError(null);
        const result = await generateFlashcards(data);

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.data) {
            setGenerationId(result.data.generation_id);
            setFlashcards(
                result.data.flashcards_proposals.map((proposal) => ({
                    ...proposal,
                    accepted: false,
                    edited: false,
                    source: "ai-full" as const,
                }))
            );
        }
    }, [generateFlashcards]);

    const handleFlashcardAccept = useCallback((index: number) => {
        setFlashcards((prev) =>
            prev.map((card, i) => (i === index ? { ...card, accepted: true } : card))
        );
    }, []);

    const handleFlashcardReject = useCallback((index: number) => {
        setFlashcards((prev) =>
            prev.map((card, i) => (i === index ? { ...card, accepted: false } : card))
        );
    }, []);

    const handleFlashcardEdit = useCallback((index: number, front: string, back: string) => {
        setFlashcards((prev) =>
            prev.map((card, i) =>
                i === index
                    ? { ...card, front, back, edited: true, source: "ai-edited" as const }
                    : card
            )
        );
    }, []);

    const handleSaveFlashcards = useCallback(async (onlyAccepted: boolean = true) => {
        if (!generationId) {
            setError("No generation ID available");
            return { success: false };
        }

        const flashcardsToSave: FlashcardCreateDto[] = flashcards
            .filter((card) => !onlyAccepted || card.accepted)
            .map((card) => ({
                front: card.front,
                back: card.back,
                source: card.source,
                generation_id: generationId,
            }));

        const result = await saveFlashcards(flashcardsToSave);

        if (result.success) {
            // Reset state after successful save
            setFlashcards([]);
            setGenerationId(null);
            setError(null);

            // Call onSuccess callback if provided
            onSaveSuccess?.();
        } else if (result.error) {
            setError(result.error);
        }

        return result;
    }, [flashcards, generationId, saveFlashcards, onSaveSuccess]);

    const handleSaveAcceptedFlashcards = useCallback(async () => {
        await handleSaveFlashcards(true);
    }, [handleSaveFlashcards]);

    const handleSaveAllFlashcards = useCallback(async () => {
        await handleSaveFlashcards(false);
    }, [handleSaveFlashcards]);

    const resetGeneration = useCallback(() => {
        setFlashcards([]);
        setGenerationId(null);
        setError(null);
    }, []);

    return {
        generationId,
        flashcards,
        error,
        isLoading,
        handleGenerateFlashcards,
        handleFlashcardAccept,
        handleFlashcardReject,
        handleFlashcardEdit,
        handleSaveFlashcards,
        handleSaveAcceptedFlashcards,
        handleSaveAllFlashcards,
        resetGeneration,
    };
}
