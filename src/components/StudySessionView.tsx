import { useState, useEffect, useCallback } from "react";
import type { StudyCardDto, Rating } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, RotateCw } from "lucide-react";
import { useStudySession } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";

export function StudySessionView() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { fetchDueCards, submitReview, isLoading, isSubmitting } = useStudySession();

  const loadDueCards = useCallback(async () => {
    const result = await fetchDueCards(20);

    if (result.data) {
      setCards(result.data);
      setSessionComplete(result.data.length === 0);
    }
  }, [fetchDueCards]);

  useEffect(() => {
    loadDueCards();
  }, [loadDueCards]);

  const handleShowBack = useCallback(() => {
    setShowBack(true);
  }, []);

  const handleRating = useCallback(
    async (rating: Rating) => {
      if (isSubmitting || !cards[currentIndex]) return;

      const result = await submitReview(cards[currentIndex].flashcard.id, rating);

      if (result.success) {
        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowBack(false);
        } else {
          setSessionComplete(true);
        }
      }
    },
    [isSubmitting, cards, currentIndex, submitReview]
  );

  const handleRestart = useCallback(() => {
    setSessionComplete(false);
    setCurrentIndex(0);
    setShowBack(false);
    loadDueCards();
  }, [loadDueCards]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" data-testid="study-session-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (sessionComplete || cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8" data-testid="study-session-header">
            <h1 className="text-3xl font-bold mb-2" data-testid="study-session-title">
              {t("pages.studySession.title")}
            </h1>
            <p className="text-gray-600" data-testid="study-session-description">
              {t("pages.studySession.description")}
            </p>
          </div>

          <Card className="max-w-2xl mx-auto mt-8" data-testid="study-session-complete">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                {t("pages.studySession.sessionComplete")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-lg mb-4" data-testid="session-complete-message">
                {cards.length === 0
                  ? t("pages.studySession.noFlashcardsMessage")
                  : t("pages.studySession.completedMessage")}
              </p>
              <Button onClick={handleRestart} className="mt-4" data-testid="start-new-session-button">
                <RotateCw className="w-4 h-4 mr-2" />
                {t("pages.studySession.startNewSession")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8" data-testid="study-session-header">
          <h1 className="text-3xl font-bold mb-2" data-testid="study-session-title">
            {t("pages.studySession.title")}
          </h1>
          <p className="text-gray-600" data-testid="study-session-description">
            {t("pages.studySession.description")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mt-8 space-y-4" data-testid="study-session-active">
          {/* Progress indicator */}
          <div
            className="flex justify-between items-center text-sm text-gray-600 mb-4"
            data-testid="study-progress-indicator"
          >
            <span data-testid="study-progress-current">
              {t("pages.studySession.cardProgress", {
                current: currentIndex + 1,
                total: cards.length,
              })}
            </span>
            <span data-testid="study-progress-percentage">
              {t("pages.studySession.percentComplete", {
                percent: Math.round(((currentIndex + 1) / cards.length) * 100),
              })}
            </span>
          </div>

          {/* Flashcard */}
          <Card data-testid="flashcard-container">
            <CardHeader>
              <CardTitle className="text-center" data-testid="flashcard-side-label">
                {showBack ? t("pages.studySession.answer") : t("pages.studySession.question")}
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                {!showBack ? (
                  <p className="text-xl" data-testid="flashcard-question">
                    {currentCard.flashcard.front}
                  </p>
                ) : (
                  <div className="space-y-4" data-testid="flashcard-answer-container">
                    <p className="text-lg text-gray-600" data-testid="flashcard-question-on-back">
                      {currentCard.flashcard.front}
                    </p>
                    <p className="text-xl font-semibold" data-testid="flashcard-answer">
                      {currentCard.flashcard.back}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              {!showBack ? (
                <Button onClick={handleShowBack} size="lg" className="w-full max-w-xs" data-testid="show-answer-button">
                  {t("pages.studySession.showAnswer")}
                </Button>
              ) : (
                <div className="w-full space-y-4" data-testid="rating-buttons-container">
                  <p className="text-center text-sm text-gray-600 mb-4" data-testid="rating-prompt">
                    {t("pages.studySession.ratingPrompt")}
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Button
                      onClick={() => handleRating(1)}
                      disabled={isSubmitting}
                      variant="destructive"
                      className="w-full"
                      data-testid="rating-button-again"
                    >
                      {t("pages.studySession.ratingAgain")}
                    </Button>
                    <Button
                      onClick={() => handleRating(2)}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                      data-testid="rating-button-hard"
                    >
                      {t("pages.studySession.ratingHard")}
                    </Button>
                    <Button
                      onClick={() => handleRating(3)}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      data-testid="rating-button-good"
                    >
                      {t("pages.studySession.ratingGood")}
                    </Button>
                    <Button
                      onClick={() => handleRating(4)}
                      disabled={isSubmitting}
                      variant="default"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="rating-button-easy"
                    >
                      {t("pages.studySession.ratingEasy")}
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>

          {/* Card info */}
          <div className="text-xs text-gray-500 text-center space-y-1" data-testid="flashcard-metadata">
            <p data-testid="flashcard-state">
              {t("pages.studySession.state")}: {currentCard.review.state === 0 && t("pages.studySession.stateNew")}
              {currentCard.review.state === 1 && t("pages.studySession.stateLearning")}
              {currentCard.review.state === 2 && t("pages.studySession.stateReview")}
              {currentCard.review.state === 3 && t("pages.studySession.stateRelearning")}
            </p>
            {currentCard.review.reps > 0 && (
              <p data-testid="flashcard-reviews-count">
                {t("pages.studySession.reviews")}: {currentCard.review.reps}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
