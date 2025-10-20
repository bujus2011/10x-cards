'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { FlashcardCard } from './FlashcardCard';
import { CreateFlashcardForm } from './CreateFlashcardForm';
import { AlertCircle, Search } from 'lucide-react';
import type { FlashcardDto } from '@/types';
import { toast } from 'sonner';

export function MyFlashcardsView() {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<FlashcardDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch flashcards on mount
  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Filter flashcards when search query changes
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = flashcards.filter(
      (fc) =>
        fc.front.toLowerCase().includes(query) ||
        fc.back.toLowerCase().includes(query)
    );
    setFilteredFlashcards(filtered);
  }, [searchQuery, flashcards]);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/flashcards', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateFlashcard = useCallback(
    async (front: string, back: string) => {
      try {
        const response = await fetch('/api/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flashcards: [
              {
                front,
                back,
                source: 'manual',
                generation_id: null,
              },
            ],
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create flashcard');
        }

        const data = await response.json();
        setFlashcards((prev) => [data.flashcards[0], ...prev]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(message);
      }
    },
    []
  );

  const handleUpdateFlashcard = useCallback(
    async (id: number, updates: any) => {
      try {
        const response = await fetch('/api/flashcards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update flashcard');
        }

        const data = await response.json();
        setFlashcards((prev) =>
          prev.map((fc) => (fc.id === id ? data.flashcard : fc))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        throw new Error(message);
      }
    },
    []
  );

  const handleDeleteFlashcard = useCallback(async (id: number) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete flashcard');
      }

      setFlashcards((prev) => prev.filter((fc) => fc.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      throw new Error(message);
    }
  }, []);

  if (isLoading) {
    return <SkeletonLoader count={6} />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-destructive">Error</h3>
            <p className="text-sm text-destructive/80">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                fetchFlashcards();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <CreateFlashcardForm onSubmit={handleCreateFlashcard} isLoading={isLoading} />

      {flashcards.length > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredFlashcards.length} of {flashcards.length} flashcard
            {flashcards.length !== 1 ? 's' : ''}
            {searchQuery && ` (filtered)`}
          </div>
        </div>
      )}

      {filteredFlashcards.length === 0 && flashcards.length === 0 && (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No flashcards yet
          </div>
          <p className="text-sm text-muted-foreground">
            Create your first flashcard to get started
          </p>
        </div>
      )}

      {filteredFlashcards.length === 0 && flashcards.length > 0 && (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">
            No matching flashcards
          </div>
          <p className="text-sm text-muted-foreground">
            Try searching with different keywords
          </p>
        </div>
      )}

      {filteredFlashcards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onUpdate={handleUpdateFlashcard}
              onDelete={handleDeleteFlashcard}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
