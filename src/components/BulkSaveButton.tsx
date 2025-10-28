import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { FlashcardProposalViewModel } from "@/hooks/useFlashcardGeneration";

interface BulkSaveButtonProps {
  flashcards: FlashcardProposalViewModel[];
  disabled: boolean;
  isLoading: boolean;
  onSaveAccepted: () => Promise<void>;
  onSaveAll: () => Promise<void>;
}

export function BulkSaveButton({ flashcards, disabled, isLoading, onSaveAccepted, onSaveAll }: BulkSaveButtonProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-md">
      <Button
        onClick={onSaveAccepted}
        disabled={disabled || isLoading || !flashcards.some((card) => card.accepted)}
        className="flex-1"
        type="button"
        data-testid="save-accepted-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Accepted"
        )}
      </Button>

      <Button
        onClick={onSaveAll}
        disabled={disabled || isLoading}
        variant="outline"
        className="flex-1"
        type="button"
        data-testid="save-all-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save All"
        )}
      </Button>
    </div>
  );
}
