-- Create review_logs table to track flashcard review sessions for spaced repetition
-- Based on FSRS algorithm requirements

CREATE TABLE IF NOT EXISTS review_logs (
    id SERIAL PRIMARY KEY,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- FSRS state (0=New, 1=Learning, 2=Review, 3=Relearning)
    state INTEGER NOT NULL DEFAULT 0,

    -- FSRS rating (1=Again, 2=Hard, 3=Good, 4=Easy)
    rating INTEGER,

    -- Scheduling information
    due TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    stability FLOAT NOT NULL DEFAULT 0,
    difficulty FLOAT NOT NULL DEFAULT 0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,

    -- Last review timestamp
    last_review TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX idx_review_logs_flashcard_id ON review_logs(flashcard_id);
CREATE INDEX idx_review_logs_due ON review_logs(due);
CREATE INDEX idx_review_logs_user_due ON review_logs(user_id, due);

-- Create unique constraint to ensure one review log per flashcard
CREATE UNIQUE INDEX idx_review_logs_flashcard_user ON review_logs(flashcard_id, user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_logs_updated_at
    BEFORE UPDATE ON review_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_review_logs_updated_at();
