import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInputArea } from "./TextInputArea";
import { GenerateButton } from "./GenerateButton";
import { FlashcardList } from "./FlashcardList";
import { SkeletonLoader } from "./SkeletonLoader";
import { BulkSaveButton } from "./BulkSaveButton";
import { ErrorNotification } from "./ErrorNotification";
import { generateFlashcardsSchema, type GenerateFlashcardsFormData } from "@/lib/validations";
import { useFlashcardGeneration } from "@/hooks/useFlashcardGeneration";

export function FlashcardGenerationView() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GenerateFlashcardsFormData>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      source_text: "",
    },
  });

  const {
    generationId,
    flashcards,
    error,
    isLoading,
    handleGenerateFlashcards,
    handleFlashcardAccept,
    handleFlashcardReject,
    handleFlashcardEdit,
    handleSaveAcceptedFlashcards,
    handleSaveAllFlashcards,
  } = useFlashcardGeneration(() => reset());

  const textValue = watch("source_text");

  const onSubmit = async (data: GenerateFlashcardsFormData) => {
    await handleGenerateFlashcards(data);
  };

  const isFormValid = textValue.length >= 1000 && textValue.length <= 10000;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <ErrorNotification message={error} />}

      <div className="space-y-2">
        <TextInputArea {...register("source_text")} value={textValue} disabled={isLoading} />
        {errors.source_text && <p className="text-sm text-destructive">{errors.source_text.message}</p>}
      </div>

      <GenerateButton
        type="submit"
        disabled={isLoading || !isFormValid}
        isLoading={isLoading}
        data-testid="generate-button"
      />

      {isLoading && <SkeletonLoader />}

      {flashcards.length > 0 && (
        <>
          {generationId !== null && (
            <BulkSaveButton
              flashcards={flashcards}
              disabled={isLoading}
              isLoading={isLoading}
              onSaveAccepted={handleSaveAcceptedFlashcards}
              onSaveAll={handleSaveAllFlashcards}
            />
          )}
          <FlashcardList
            flashcards={flashcards}
            onAccept={handleFlashcardAccept}
            onReject={handleFlashcardReject}
            onEdit={handleFlashcardEdit}
            data-testid="flashcard-list"
          />
        </>
      )}
    </form>
  );
}
