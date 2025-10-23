import { useState, useEffect } from "react";
import type { StudyCardDto, Rating } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { BookOpen, RotateCw } from "lucide-react";

export function StudySessionView() {
  const [cards, setCards] = useState<StudyCardDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/study-session?limit=20");

      if (!response.ok) {
        throw new Error("Failed to fetch due cards");
      }

      const data = await response.json();
      setCards(data.cards || []);

      if (data.cards.length === 0) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error("Error fetching due cards:", error);
      toast.error("Failed to fetch flashcards for study");
    } finally {
      setLoading(false);
    }
  };

  const handleShowBack = () => {
    setShowBack(true);
  };

  const handleRating = async (rating: Rating) => {
    if (submitting || !cards[currentIndex]) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcard_id: cards[currentIndex].flashcard.id,
          rating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowBack(false);
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSessionComplete(false);
    setCurrentIndex(0);
    setShowBack(false);
    fetchDueCards();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" data-testid="study-session-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (sessionComplete || cards.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-8" data-testid="study-session-complete">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Session Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-lg mb-4" data-testid="session-complete-message">
            {cards.length === 0
              ? "You have no flashcards to review. Add new flashcards or come back later."
              : "Great job! You've completed the study session."}
          </p>
          <Button onClick={handleRestart} className="mt-4" data-testid="start-new-session-button">
            <RotateCw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4" data-testid="study-session-active">
      {/* Progress indicator */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4" data-testid="study-progress-indicator">
        <span data-testid="study-progress-current">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span data-testid="study-progress-percentage">{Math.round(((currentIndex + 1) / cards.length) * 100)}% complete</span>
      </div>

      {/* Flashcard */}
      <Card data-testid="flashcard-container">
        <CardHeader>
          <CardTitle className="text-center" data-testid="flashcard-side-label">{showBack ? "Answer" : "Question"}</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            {!showBack ? (
              <p className="text-xl" data-testid="flashcard-question">{currentCard.flashcard.front}</p>
            ) : (
              <div className="space-y-4" data-testid="flashcard-answer-container">
                <p className="text-lg text-gray-600" data-testid="flashcard-question-on-back">{currentCard.flashcard.front}</p>
                <p className="text-xl font-semibold" data-testid="flashcard-answer">{currentCard.flashcard.back}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {!showBack ? (
            <Button onClick={handleShowBack} size="lg" className="w-full max-w-xs" data-testid="show-answer-button">
              Show Answer
            </Button>
          ) : (
            <div className="w-full space-y-4" data-testid="rating-buttons-container">
              <p className="text-center text-sm text-gray-600 mb-4" data-testid="rating-prompt">How well do you know this flashcard?</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Button onClick={() => handleRating(1)} disabled={submitting} variant="destructive" className="w-full" data-testid="rating-button-again">
                  Again
                </Button>
                <Button
                  onClick={() => handleRating(2)}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  data-testid="rating-button-hard"
                >
                  Hard
                </Button>
                <Button
                  onClick={() => handleRating(3)}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                  data-testid="rating-button-good"
                >
                  Good
                </Button>
                <Button
                  onClick={() => handleRating(4)}
                  disabled={submitting}
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="rating-button-easy"
                >
                  Easy
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Card info */}
      <div className="text-xs text-gray-500 text-center space-y-1" data-testid="flashcard-metadata">
        <p data-testid="flashcard-state">
          State: {currentCard.review.state === 0 && "New"}
          {currentCard.review.state === 1 && "Learning"}
          {currentCard.review.state === 2 && "Review"}
          {currentCard.review.state === 3 && "Relearning"}
        </p>
        {currentCard.review.reps > 0 && <p data-testid="flashcard-reviews-count">Reviews: {currentCard.review.reps}</p>}
      </div>
    </div>
  );
}
