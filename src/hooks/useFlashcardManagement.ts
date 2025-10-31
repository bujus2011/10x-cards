import { useState, useEffect, useCallback } from "react";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import type { ManualFlashcardFormData } from "@/lib/validations";
import { useFlashcards } from "@/hooks/api";

export function useFlashcardManagement() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { fetchFlashcards, createFlashcard, updateFlashcard, deleteFlashcard, isLoading } = useFlashcards();

  // Load flashcards on mount
  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = useCallback(async () => {
    setError(null);
    const result = await fetchFlashcards();

    if (result.error) {
      setError(result.error);
    } else {
      setFlashcards(result.data);
    }
  }, [fetchFlashcards]);

  const handleCreateFlashcard = useCallback(
    async (data: ManualFlashcardFormData) => {
      const result = await createFlashcard(data);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setFlashcards((prev) => [result.data as FlashcardDto, ...prev]);
      }
    },
    [createFlashcard]
  );

  const handleUpdateFlashcard = useCallback(
    async (id: number, updates: FlashcardUpdateDto) => {
      const result = await updateFlashcard(id, updates);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setFlashcards((prev) => prev.map((fc) => (fc.id === id ? (result.data as FlashcardDto) : fc)));
      }
    },
    [updateFlashcard]
  );

  const handleDeleteFlashcard = useCallback(
    async (id: number) => {
      const result = await deleteFlashcard(id);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success) {
        setFlashcards((prev) => prev.filter((fc) => fc.id !== id));
      }
    },
    [deleteFlashcard]
  );

  const handleRetry = useCallback(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  return {
    flashcards,
    error,
    isLoading,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleRetry,
    refetch: loadFlashcards,
  };
}
