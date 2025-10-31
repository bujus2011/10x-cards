import { useState, useCallback, useId, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Save, X, Copy } from "lucide-react";
import { toast } from "sonner";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onUpdate: (id: number, data: FlashcardUpdateDto) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

const FlashcardCardComponent = memo(function FlashcardCard({
  flashcard,
  onUpdate,
  onDelete,
  isLoading = false,
}: FlashcardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate unique IDs for accessibility
  const frontInputId = useId();
  const backInputId = useId();

  const handleSave = useCallback(async () => {
    if (!editedFront.trim() || !editedBack.trim()) {
      toast.error("Front and back content cannot be empty");
      return;
    }

    if (editedFront.length > 200 || editedBack.length > 500) {
      toast.error("Text exceeds maximum length");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(flashcard.id, {
        front: editedFront,
        back: editedBack,
        source: flashcard.source,
        generation_id: flashcard.generation_id,
      });
      setIsEditing(false);
      toast.success("Flashcard updated successfully");
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    } finally {
      setIsSaving(false);
    }
  }, [editedFront, editedBack, flashcard, onUpdate]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(flashcard.id);
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    } finally {
      setIsDeleting(false);
    }
  }, [flashcard.id, onDelete]);

  const handleCopy = useCallback(() => {
    const text = `Front: ${flashcard.front}\n\nBack: ${flashcard.back}`;
    navigator.clipboard.writeText(text);
    toast.success("Flashcard copied to clipboard");
  }, [flashcard.front, flashcard.back]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  }, [flashcard.front, flashcard.back]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <Card className="h-full" data-testid={`flashcard-edit-form-${flashcard.id}`}>
        <CardHeader>
          <CardTitle className="text-sm">Edit Flashcard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={frontInputId} className="text-sm font-medium">
              Front
            </label>
            <Textarea
              id={frontInputId}
              value={editedFront}
              onChange={(e) => setEditedFront(e.target.value)}
              placeholder="Front side of the flashcard"
              maxLength={200}
              className="resize-none"
              rows={3}
              aria-describedby="front-char-count"
              data-testid={`edit-flashcard-front-${flashcard.id}`}
            />
            <div id="front-char-count" className="text-xs text-muted-foreground">
              {editedFront.length}/200 characters
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={backInputId} className="text-sm font-medium">
              Back
            </label>
            <Textarea
              id={backInputId}
              value={editedBack}
              onChange={(e) => setEditedBack(e.target.value)}
              placeholder="Back side of the flashcard"
              maxLength={500}
              className="resize-none"
              rows={4}
              aria-describedby="back-char-count"
              data-testid={`edit-flashcard-back-${flashcard.id}`}
            />
            <div id="back-char-count" className="text-xs text-muted-foreground">
              {editedBack.length}/500 characters
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              aria-label="Cancel editing flashcard"
              data-testid={`cancel-edit-flashcard-${flashcard.id}`}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !editedFront.trim() || !editedBack.trim()}
              aria-label="Save flashcard changes"
              data-testid={`save-flashcard-${flashcard.id}`}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="h-full cursor-pointer transition-all hover:shadow-lg"
      onClick={handleToggleFlip}
      role="button"
      tabIndex={0}
      aria-label={`Flashcard: ${flashcard.front}. Click to flip`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggleFlip();
        }
      }}
      data-testid={`flashcard-card-${flashcard.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm line-clamp-2" data-testid={`flashcard-front-${flashcard.id}`}>
            {flashcard.front}
          </CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              disabled={isLoading}
              aria-label="Copy flashcard to clipboard"
              title="Copy flashcard content"
              data-testid={`copy-flashcard-${flashcard.id}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              disabled={isLoading}
              aria-label="Edit flashcard"
              title="Edit this flashcard"
              data-testid={`edit-flashcard-${flashcard.id}`}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isLoading || isDeleting}
              aria-label="Delete flashcard"
              title="Delete this flashcard permanently"
              data-testid={`delete-flashcard-${flashcard.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{formatDate(flashcard.created_at)}</div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[100px] flex items-center">
          <p className="text-sm text-muted-foreground line-clamp-4" data-testid={`flashcard-content-${flashcard.id}`}>
            {isFlipped ? flashcard.back : flashcard.front}
          </p>
        </div>
        <div className="text-xs text-center text-muted-foreground mt-2">
          {isFlipped ? "Click to see front" : "Click to see back"}
        </div>
      </CardContent>
    </Card>
  );
});

FlashcardCardComponent.displayName = "FlashcardCard";

export const FlashcardCard = FlashcardCardComponent;
