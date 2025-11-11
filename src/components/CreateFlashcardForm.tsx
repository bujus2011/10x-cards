import { useState, useCallback, useId, memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import { Logger } from "@/lib/logger";

const createFlashcardLogger = Logger.forContext("CreateFlashcardForm");

interface CreateFlashcardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateFlashcardFormComponent = memo(function CreateFlashcardForm({
  onSubmit,
  isLoading = false,
}: CreateFlashcardFormProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique IDs for accessibility
  const frontInputId = useId();
  const backInputId = useId();

  const handleSubmit = useCallback(async () => {
    if (!front.trim() || !back.trim()) {
      toast.error(t("errors.flashcard.emptyContent"));
      return;
    }

    if (front.length > 200 || back.length > 500) {
      toast.error(t("errors.flashcard.textTooLong"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(front, back);
      setFront("");
      setBack("");
      setIsOpen(false);
      toast.success(t("errors.flashcard.createdSuccess"));
    } catch (error) {
      toast.error(t("errors.flashcard.createFailed"));
      createFlashcardLogger.error("Failed to create flashcard", error, {
        frontLength: front.length,
        backLength: back.length,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [front, back, onSubmit, t]);

  const handleReset = useCallback(() => {
    setIsOpen(false);
    setFront("");
    setBack("");
  }, []);

  if (isOpen) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("pages.myFlashcards.createNewForm.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={frontInputId} className="text-sm font-medium">
              {t("pages.myFlashcards.createNewForm.frontLabel")}
            </label>
            <Textarea
              id={frontInputId}
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder={t("pages.myFlashcards.createNewForm.frontPlaceholder")}
              maxLength={200}
              className="resize-none"
              rows={3}
              disabled={isSubmitting}
              aria-describedby="front-char-count"
            />
            <div id="front-char-count" className="text-xs text-muted-foreground">
              {t("pages.myFlashcards.createNewForm.frontCharCount", { count: front.length })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={backInputId} className="text-sm font-medium">
              {t("pages.myFlashcards.createNewForm.backLabel")}
            </label>
            <Textarea
              id={backInputId}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder={t("pages.myFlashcards.createNewForm.backPlaceholder")}
              maxLength={500}
              className="resize-none"
              rows={4}
              disabled={isSubmitting}
              aria-describedby="back-char-count"
            />
            <div id="back-char-count" className="text-xs text-muted-foreground">
              {t("pages.myFlashcards.createNewForm.backCharCount", { count: back.length })}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              aria-label="Cancel creating flashcard"
            >
              <X className="h-4 w-4 mr-2" />
              {t("pages.myFlashcards.createNewForm.cancelButton")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !front.trim() || !back.trim() || isLoading}
              aria-label="Create new flashcard"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting
                ? t("pages.myFlashcards.createNewForm.creating")
                : t("pages.myFlashcards.createNewForm.createButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => setIsOpen(true)}
      disabled={isLoading}
      className="mb-6"
      aria-label="Open create flashcard form"
      data-testid="create-flashcard-button"
    >
      <Plus className="h-4 w-4 mr-2" />
      {t("pages.myFlashcards.createNewButton")}
    </Button>
  );
});

CreateFlashcardFormComponent.displayName = "CreateFlashcardForm";

export const CreateFlashcardForm = CreateFlashcardFormComponent;
