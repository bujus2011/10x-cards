import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { FlashcardCard } from "./FlashcardCard";
import { CreateFlashcardForm } from "./CreateFlashcardForm";
import { AlertCircle, Search } from "lucide-react";
import { useFlashcardManagement } from "@/hooks/useFlashcardManagement";
import { useFlashcardSearch } from "@/hooks/useFlashcardSearch";

export function MyFlashcardsView() {
  const {
    flashcards,
    error,
    isLoading,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleRetry,
  } = useFlashcardManagement();

  const {
    searchQuery,
    setSearchQuery,
    filteredFlashcards,
    searchStats,
  } = useFlashcardSearch({ flashcards });

  if (isLoading) {
    return <SkeletonLoader data-testid="flashcards-loading" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex gap-3" role="alert">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-medium text-destructive">Error</h3>
            <p className="text-sm text-destructive/80">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="mt-2"
              aria-label="Retry loading flashcards"
              data-testid="retry-button"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <CreateFlashcardForm onSubmit={handleCreateFlashcard} isLoading={isLoading} />

      {searchStats.total > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search flashcards by front or back text"
            />
          </div>

          <div className="text-sm text-muted-foreground" aria-live="polite">
            {searchStats.filtered} of {searchStats.total} flashcard
            {searchStats.total !== 1 ? "s" : ""}
            {searchStats.hasQuery && ` (filtered)`}
          </div>
        </div>
      )}

      {searchStats.filtered === 0 && searchStats.total === 0 && (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">No flashcards yet</div>
          <p className="text-sm text-muted-foreground">Create your first flashcard to get started</p>
        </div>
      )}

      {searchStats.filtered === 0 && searchStats.total > 0 && (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">No matching flashcards</div>
          <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
        </div>
      )}

      {filteredFlashcards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="flashcards-grid">
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
