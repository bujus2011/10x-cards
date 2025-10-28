import { useState, useEffect, useMemo } from "react";
import type { FlashcardDto } from "@/types";

interface UseFlashcardSearchProps {
    flashcards: FlashcardDto[];
}

export function useFlashcardSearch({ flashcards }: UseFlashcardSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFlashcards = useMemo(() => {
        if (!searchQuery.trim()) {
            return flashcards;
        }

        const query = searchQuery.toLowerCase().trim();
        return flashcards.filter(
            (flashcard) =>
                flashcard.front.toLowerCase().includes(query) ||
                flashcard.back.toLowerCase().includes(query)
        );
    }, [flashcards, searchQuery]);

    const searchStats = useMemo(() => ({
        total: flashcards.length,
        filtered: filteredFlashcards.length,
        hasQuery: searchQuery.trim().length > 0,
    }), [flashcards.length, filteredFlashcards.length, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        filteredFlashcards,
        searchStats,
    };
}
