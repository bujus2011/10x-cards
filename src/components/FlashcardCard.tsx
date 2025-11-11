import { useState, useCallback, useId, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Save, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";
import { Logger } from "@/lib/logger";

const flashcardLogger = Logger.forContext("FlashcardCard");

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
  const { t, language } = useTranslation();
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
      toast.error(t("errors.flashcard.emptyContent"));
      return;
    }

    if (editedFront.length > 200 || editedBack.length > 500) {
      toast.error(t("errors.flashcard.textTooLong"));
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
      toast.success(t("errors.flashcard.updatedSuccess"));
    } catch (error) {
      flashcardLogger.error("Error updating flashcard", error, { flashcardId: flashcard.id });
      toast.error(t("errors.flashcard.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  }, [editedFront, editedBack, flashcard, onUpdate, t]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete(flashcard.id);
      toast.success(t("errors.flashcard.deletedSuccess"));
    } catch (error) {
      flashcardLogger.error("Error deleting flashcard", error, { flashcardId: flashcard.id });
      toast.error(t("errors.flashcard.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  }, [flashcard.id, onDelete, t]);

  const handleCopy = useCallback(() => {
    const text = `Front: ${flashcard.front}\n\nBack: ${flashcard.back}`;
    navigator.clipboard.writeText(text);
    toast.success(t("errors.flashcard.copiedSuccess"));
  }, [flashcard.front, flashcard.back, t]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  }, [flashcard.front, flashcard.back]);

  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const formatDate = (date: string) => {
    const languageMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      pl: "pl-PL",
    };
    const locale = languageMap[language] || "en-US";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <Card className="h-full" data-testid={`flashcard-edit-form-${flashcard.id}`}>
        <CardHeader>
          <CardTitle className="text-sm">{t("pages.myFlashcards.editForm.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={frontInputId} className="text-sm font-medium">
              {t("pages.myFlashcards.editForm.frontLabel")}
            </label>
            <Textarea
              id={frontInputId}
              value={editedFront}
              onChange={(e) => setEditedFront(e.target.value)}
              placeholder={t("pages.myFlashcards.editForm.frontPlaceholder")}
              maxLength={200}
              className="resize-none"
              rows={3}
              aria-describedby="front-char-count"
              data-testid={`edit-flashcard-front-${flashcard.id}`}
            />
            <div id="front-char-count" className="text-xs text-muted-foreground">
              {t("pages.myFlashcards.editForm.frontCharCount", { count: editedFront.length })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={backInputId} className="text-sm font-medium">
              {t("pages.myFlashcards.editForm.backLabel")}
            </label>
            <Textarea
              id={backInputId}
              value={editedBack}
              onChange={(e) => setEditedBack(e.target.value)}
              placeholder={t("pages.myFlashcards.editForm.backPlaceholder")}
              maxLength={500}
              className="resize-none"
              rows={4}
              aria-describedby="back-char-count"
              data-testid={`edit-flashcard-back-${flashcard.id}`}
            />
            <div id="back-char-count" className="text-xs text-muted-foreground">
              {t("pages.myFlashcards.editForm.backCharCount", { count: editedBack.length })}
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
              {t("pages.myFlashcards.editForm.cancelButton")}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !editedFront.trim() || !editedBack.trim()}
              aria-label="Save flashcard changes"
              data-testid={`save-flashcard-${flashcard.id}`}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? t("pages.myFlashcards.editForm.saving") : t("pages.myFlashcards.editForm.saveButton")}
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
              aria-label={t("pages.myFlashcards.card.copyTooltip")}
              title={t("pages.myFlashcards.card.copyTooltip")}
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
              aria-label={t("pages.myFlashcards.card.editTooltip")}
              title={t("pages.myFlashcards.card.editTooltip")}
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
              aria-label={t("pages.myFlashcards.card.deleteTooltip")}
              title={t("pages.myFlashcards.card.deleteTooltip")}
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
          {isFlipped ? t("pages.myFlashcards.card.clickToSeeFront") : t("pages.myFlashcards.card.clickToSeeBack")}
        </div>
      </CardContent>
    </Card>
  );
});

FlashcardCardComponent.displayName = "FlashcardCard";

export const FlashcardCard = FlashcardCardComponent;
