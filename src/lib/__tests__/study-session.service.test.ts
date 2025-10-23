import { describe, it, expect, vi, beforeEach } from "vitest";
import { StudySessionService } from "../study-session.service";
import { DatabaseError } from "../flashcard.service";
import type { Rating, State } from "../../types";

// Mock ts-fsrs module
vi.mock("ts-fsrs", () => ({
    fsrs: vi.fn(() => ({
        repeat: vi.fn((card, now) => {
            // Mock FSRS scheduler behavior
            const ratings = {
                1: {
                    card: {
                        ...card,
                        state: 1, // Learning
                        reps: card.reps + 1,
                        lapses: card.lapses + 1,
                        due: new Date(Date.now() + 60000), // 1 minute later
                        stability: 1,
                        difficulty: 8,
                        elapsed_days: 0,
                        scheduled_days: 0,
                        last_review: now,
                    },
                },
                2: {
                    card: {
                        ...card,
                        state: 1, // Learning
                        reps: card.reps + 1,
                        lapses: card.lapses,
                        due: new Date(Date.now() + 600000), // 10 minutes later
                        stability: 5,
                        difficulty: 7,
                        elapsed_days: 0,
                        scheduled_days: 0,
                        last_review: now,
                    },
                },
                3: {
                    card: {
                        ...card,
                        state: 2, // Review
                        reps: card.reps + 1,
                        lapses: card.lapses,
                        due: new Date(Date.now() + 86400000), // 1 day later
                        stability: 10,
                        difficulty: 5,
                        elapsed_days: 0,
                        scheduled_days: 1,
                        last_review: now,
                    },
                },
                4: {
                    card: {
                        ...card,
                        state: 2, // Review
                        reps: card.reps + 1,
                        lapses: card.lapses,
                        due: new Date(Date.now() + 259200000), // 3 days later
                        stability: 20,
                        difficulty: 3,
                        elapsed_days: 0,
                        scheduled_days: 3,
                        last_review: now,
                    },
                },
            };
            return ratings;
        }),
    })),
    createEmptyCard: vi.fn(() => ({
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 0,
        lapses: 0,
        state: 0,
        last_review: undefined,
    })),
}));

const createMockSupabaseClient = () => ({
    from: vi.fn(),
});

type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

describe("StudySessionService", () => {
    let mockSupabase: MockSupabaseClient;
    let studySessionService: StudySessionService;

    const mockUserId = "user-123";
    const mockFlashcard = {
        id: 1,
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        source: "manual" as const,
        generation_id: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = createMockSupabaseClient();
        studySessionService = new StudySessionService(mockSupabase as any);
    });

    describe("getDueCards", () => {
        it("should retrieve due cards with review data", async () => {
            // Arrange
            const now = new Date().toISOString();
            const mockReviewLogs = [
                {
                    id: 1,
                    flashcard_id: 1,
                    user_id: mockUserId,
                    state: 1,
                    rating: 3,
                    due: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    stability: 5,
                    difficulty: 5,
                    elapsed_days: 0,
                    scheduled_days: 1,
                    reps: 2,
                    lapses: 0,
                    last_review: new Date(Date.now() - 86400000).toISOString(),
                    flashcards: mockFlashcard,
                },
            ];

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: mockReviewLogs,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Mock for existing review IDs query
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: mockReviewLogs,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Mock for fetching existing review IDs
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [{ flashcard_id: 1 }],
                        error: null,
                    }),
                }),
            });

            // Mock for new flashcards
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        not: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getDueCards(mockUserId, 20);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].flashcard.id).toBe(1);
            expect(result[0].review.state).toBe(1);
        });

        it("should include new flashcards without review logs", async () => {
            // Arrange
            const mockNewFlashcard = {
                id: 2,
                front: "What is React?",
                back: "A JavaScript library",
                source: "manual" as const,
                generation_id: null,
                created_at: "2024-01-02T00:00:00Z",
                updated_at: "2024-01-02T00:00:00Z",
            };

            // Mock for review logs (empty)
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Mock for existing review IDs (empty)
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            // Mock for new flashcards
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        not: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [mockNewFlashcard],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getDueCards(mockUserId, 20);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].flashcard.id).toBe(2);
            expect(result[0].review.state).toBe(0); // New
            expect(result[0].review.reps).toBe(0);
        });

        it("should respect the limit parameter", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        not: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act
            await studySessionService.getDueCards(mockUserId, 10);

            // Assert - verify method completes successfully
            expect(mockSupabase.from).toHaveBeenCalled();
        });

        it("should throw DatabaseError when fetching review logs fails", async () => {
            // Arrange
            const mockError = {
                message: "Database error",
                code: "DB_ERROR",
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: mockError,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(studySessionService.getDueCards(mockUserId)).rejects.toThrow(DatabaseError);
            await expect(studySessionService.getDueCards(mockUserId)).rejects.toThrow("Failed to fetch due cards");
        });

        it("should throw DatabaseError when fetching new flashcards fails", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        lte: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: [],
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            const mockError = {
                message: "Database error",
                code: "DB_ERROR",
            };

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        not: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: mockError,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(studySessionService.getDueCards(mockUserId)).rejects.toThrow(DatabaseError);
        });
    });

    describe("submitReview", () => {
        it("should create new review log for first review", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 3; // Good

            // Mock: no existing review log
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            // Mock: insert new review log
            const mockInsert = vi.fn().mockResolvedValue({
                error: null,
            });

            mockSupabase.from.mockReturnValueOnce({
                insert: mockInsert,
            });

            // Act
            const result = await studySessionService.submitReview(mockUserId, flashcardId, rating);

            // Assert
            expect(mockInsert).toHaveBeenCalled();
            expect(result).toHaveProperty("next_due");
            expect(result).toHaveProperty("state");
            expect(typeof result.state).toBe("number");
        });

        it("should update existing review log for subsequent reviews", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 3;

            const existingLog = {
                id: 1,
                flashcard_id: flashcardId,
                user_id: mockUserId,
                state: 1,
                rating: 2,
                due: new Date().toISOString(),
                stability: 5,
                difficulty: 5,
                elapsed_days: 0,
                scheduled_days: 1,
                reps: 1,
                lapses: 0,
                last_review: new Date(Date.now() - 86400000).toISOString(),
            };

            // Mock: existing review log found
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: existingLog,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            // Mock: update review log
            const mockUpdate = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                update: mockUpdate,
            });

            // Act
            const result = await studySessionService.submitReview(mockUserId, flashcardId, rating);

            // Assert
            expect(mockUpdate).toHaveBeenCalled();
            expect(result).toHaveProperty("next_due");
            expect(result).toHaveProperty("state");
        });

        it("should handle rating 1 (Again)", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 1;

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            // Act
            const result = await studySessionService.submitReview(mockUserId, flashcardId, rating);

            // Assert
            expect(result).toBeDefined();
            expect(result.state).toBeDefined();
        });

        it("should handle rating 4 (Easy)", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 4;

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            // Act
            const result = await studySessionService.submitReview(mockUserId, flashcardId, rating);

            // Assert
            expect(result).toBeDefined();
            expect(result.next_due).toBeDefined();
        });

        it("should throw DatabaseError when insert fails", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 3;

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const mockError = {
                message: "Insert failed",
                code: "INSERT_ERROR",
            };

            mockSupabase.from.mockReturnValueOnce({
                insert: vi.fn().mockResolvedValue({
                    error: mockError,
                }),
            });

            // Act & Assert
            await expect(studySessionService.submitReview(mockUserId, flashcardId, rating)).rejects.toThrow(DatabaseError);
        });

        it("should throw DatabaseError when update fails", async () => {
            // Arrange
            const flashcardId = 1;
            const rating: Rating = 3;

            const existingLog = {
                id: 1,
                flashcard_id: flashcardId,
                user_id: mockUserId,
                state: 1,
                rating: 2,
                due: new Date().toISOString(),
                stability: 5,
                difficulty: 5,
                elapsed_days: 0,
                scheduled_days: 1,
                reps: 1,
                lapses: 0,
                last_review: new Date().toISOString(),
            };

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: existingLog,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const mockError = {
                message: "Update failed",
                code: "UPDATE_ERROR",
            };

            mockSupabase.from.mockReturnValueOnce({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: mockError,
                    }),
                }),
            });

            // Act & Assert
            await expect(studySessionService.submitReview(mockUserId, flashcardId, rating)).rejects.toThrow(DatabaseError);
        });
    });

    describe("getStudyStats", () => {
        it("should return statistics about study progress", async () => {
            // Arrange
            const mockReviewLogs = [
                { state: 0, due: new Date(Date.now() - 3600000).toISOString() }, // New, due
                { state: 1, due: new Date(Date.now() - 3600000).toISOString() }, // Learning, due
                { state: 2, due: new Date(Date.now() + 86400000).toISOString() }, // Review, not due
                { state: 2, due: new Date(Date.now() - 3600000).toISOString() }, // Review, due
            ];

            // Mock: total flashcards count
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        count: 10,
                        error: null,
                    }),
                }),
            });

            // Mock: review logs
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: mockReviewLogs,
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getStudyStats(mockUserId);

            // Assert
            expect(result).toHaveProperty("total_cards", 10);
            expect(result).toHaveProperty("new_cards");
            expect(result).toHaveProperty("learning_cards");
            expect(result).toHaveProperty("review_cards");
            expect(result).toHaveProperty("due_today");
            expect(result.total_cards).toBe(10);
        });

        it("should calculate new cards correctly", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        count: 20,
                        error: null,
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { state: 1, due: new Date().toISOString() },
                            { state: 2, due: new Date().toISOString() },
                        ],
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getStudyStats(mockUserId);

            // Assert
            expect(result.new_cards).toBe(18); // 20 total - 2 reviewed
        });

        it("should count learning cards (state 1 and 3)", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        count: 10,
                        error: null,
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { state: 1, due: new Date().toISOString() },
                            { state: 3, due: new Date().toISOString() },
                            { state: 2, due: new Date().toISOString() },
                        ],
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getStudyStats(mockUserId);

            // Assert
            expect(result.learning_cards).toBe(2);
        });

        it("should count review cards (state 2)", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        count: 10,
                        error: null,
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [
                            { state: 2, due: new Date().toISOString() },
                            { state: 2, due: new Date().toISOString() },
                            { state: 1, due: new Date().toISOString() },
                        ],
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getStudyStats(mockUserId);

            // Assert
            expect(result.review_cards).toBe(2);
        });

        it("should handle user with no flashcards", async () => {
            // Arrange
            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        count: 0,
                        error: null,
                    }),
                }),
            });

            mockSupabase.from.mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await studySessionService.getStudyStats(mockUserId);

            // Assert
            expect(result.total_cards).toBe(0);
            expect(result.new_cards).toBe(0);
            expect(result.learning_cards).toBe(0);
            expect(result.review_cards).toBe(0);
            expect(result.due_today).toBe(0);
        });
    });
});

