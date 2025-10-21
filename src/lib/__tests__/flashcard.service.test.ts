import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { FlashcardService, DatabaseError } from "../flashcard.service";
import type { FlashcardCreateDto, FlashcardUpdateDto } from "../../types";

// Mock Supabase client with proper typing
const createMockSupabaseClient = () => ({
    from: vi.fn(),
});

type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

describe("FlashcardService", () => {
    let mockSupabase: MockSupabaseClient;
    let flashcardService: FlashcardService;

    const mockUserId = "user-123";
    const mockFlashcardDto: FlashcardCreateDto = {
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        source: "manual",
        generation_id: null,
    };

    const mockFlashcardResponse = {
        id: 1,
        front: "What is TypeScript?",
        back: "A typed superset of JavaScript",
        source: "manual",
        generation_id: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    };

    beforeEach(() => {
        mockSupabase = createMockSupabaseClient();
        flashcardService = new FlashcardService(mockSupabase as any);
    });

    describe("createBatch", () => {
        it("should create multiple flashcards successfully", async () => {
            // Arrange
            const flashcards: FlashcardCreateDto[] = [
                mockFlashcardDto,
                {
                    front: "What is React?",
                    back: "A JavaScript library for building user interfaces",
                    source: "ai-full",
                    generation_id: 5,
                },
            ];

            const expectedResults = [
                { ...mockFlashcardResponse, id: 1 },
                { ...mockFlashcardResponse, id: 2, front: "What is React?" },
            ];

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: expectedResults,
                        error: null,
                    }),
                }),
            });

            // Act
            const result = await flashcardService.createBatch(mockUserId, flashcards);

            // Assert
            expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(2);
        });

        it("should add user_id to all flashcards", async () => {
            // Arrange
            const flashcards: FlashcardCreateDto[] = [mockFlashcardDto];
            const mockInsert = vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                    data: [mockFlashcardResponse],
                    error: null,
                }),
            });

            mockSupabase.from.mockReturnValue({
                insert: mockInsert,
            });

            // Act
            await flashcardService.createBatch(mockUserId, flashcards);

            // Assert
            expect(mockInsert).toHaveBeenCalledWith([
                {
                    ...mockFlashcardDto,
                    user_id: mockUserId,
                },
            ]);
        });

        it("should throw DatabaseError on foreign key violation", async () => {
            // Arrange
            const mockError = {
                message: "Foreign key violation",
                code: "23503",
                details: "generation_id does not exist",
            };

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: mockError,
                    }),
                }),
            });

            // Act & Assert
            await expect(
                flashcardService.createBatch(mockUserId, [{ ...mockFlashcardDto, generation_id: 999 }])
            ).rejects.toThrow(DatabaseError);

            try {
                await flashcardService.createBatch(mockUserId, [
                    { ...mockFlashcardDto, generation_id: 999 },
                ]);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe("23503");
                expect((error as DatabaseError).message).toBe("Referenced record does not exist");
            }
        });

        it("should throw DatabaseError on insert failure", async () => {
            // Arrange
            const mockError = {
                message: "Database connection failed",
                code: "CONNECTION_ERROR",
                details: "Connection timeout",
            };

            mockSupabase.from.mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockResolvedValue({
                        data: null,
                        error: mockError,
                    }),
                }),
            });

            // Act & Assert
            await expect(
                flashcardService.createBatch(mockUserId, [mockFlashcardDto])
            ).rejects.toThrow(DatabaseError);
        });
    });

    describe("getByUserId", () => {
        it("should retrieve all flashcards for a user ordered by created_at desc", async () => {
            // Arrange
            const mockData = [
                mockFlashcardResponse,
                { ...mockFlashcardResponse, id: 2, front: "Second flashcard" },
            ];

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: mockData,
                            error: null,
                        }),
                    }),
                }),
            });

            // Act
            const result = await flashcardService.getByUserId(mockUserId);

            // Assert
            expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
            expect(result).toEqual(mockData);
            expect(result).toHaveLength(2);
        });

        it("should return empty array when user has no flashcards", async () => {
            // Arrange
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [],
                            error: null,
                        }),
                    }),
                }),
            });

            // Act
            const result = await flashcardService.getByUserId(mockUserId);

            // Assert
            expect(result).toEqual([]);
        });

        it("should throw DatabaseError when query fails", async () => {
            // Arrange
            const mockError = {
                message: "Query failed",
                code: "QUERY_ERROR",
                details: "Error details",
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: mockError,
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(flashcardService.getByUserId(mockUserId)).rejects.toThrow(DatabaseError);
        });
    });

    describe("getById", () => {
        it("should retrieve a single flashcard by id and userId", async () => {
            // Arrange
            const flashcardId = 1;

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: mockFlashcardResponse,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            // Act
            const result = await flashcardService.getById(flashcardId, mockUserId);

            // Assert
            expect(result).toEqual(mockFlashcardResponse);
            expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
        });

        it("should return null when flashcard not found (PGRST116)", async () => {
            // Arrange
            const flashcardId = 999;
            const mockError = {
                message: "Not found",
                code: "PGRST116",
                details: "No rows found",
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: mockError,
                            }),
                        }),
                    }),
                }),
            });

            // Act
            const result = await flashcardService.getById(flashcardId, mockUserId);

            // Assert
            expect(result).toBeNull();
        });

        it("should throw DatabaseError for non-PGRST116 errors", async () => {
            // Arrange
            const flashcardId = 1;
            const mockError = {
                message: "Database error",
                code: "DB_ERROR",
                details: "Some error",
            };

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: mockError,
                            }),
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(flashcardService.getById(flashcardId, mockUserId)).rejects.toThrow(
                DatabaseError
            );
        });
    });

    describe("update", () => {
        it("should update flashcard with partial data", async () => {
            // Arrange
            const flashcardId = 1;
            const updates: FlashcardUpdateDto = {
                front: "Updated question",
                back: "Updated answer",
            };

            const updatedFlashcard = { ...mockFlashcardResponse, ...updates };

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: updatedFlashcard,
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act
            const result = await flashcardService.update(flashcardId, mockUserId, updates);

            // Assert
            expect(result).toEqual(updatedFlashcard);
            expect(result.front).toBe("Updated question");
            expect(result.back).toBe("Updated answer");
        });

        it("should throw DatabaseError when update fails", async () => {
            // Arrange
            const flashcardId = 1;
            const updates: FlashcardUpdateDto = { front: "Updated" };
            const mockError = {
                message: "Update failed",
                code: "UPDATE_ERROR",
                details: "Error details",
            };

            mockSupabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: mockError,
                                }),
                            }),
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(
                flashcardService.update(flashcardId, mockUserId, updates)
            ).rejects.toThrow(DatabaseError);
        });
    });

    describe("delete", () => {
        it("should delete a flashcard successfully", async () => {
            // Arrange
            const flashcardId = 1;

            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({
                            error: null,
                        }),
                    }),
                }),
            });

            // Act
            await flashcardService.delete(flashcardId, mockUserId);

            // Assert
            expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
        });

        it("should throw DatabaseError when delete fails", async () => {
            // Arrange
            const flashcardId = 1;
            const mockError = {
                message: "Delete failed",
                code: "DELETE_ERROR",
                details: "Error details",
            };

            mockSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({
                            error: mockError,
                        }),
                    }),
                }),
            });

            // Act & Assert
            await expect(flashcardService.delete(flashcardId, mockUserId)).rejects.toThrow(
                DatabaseError
            );
        });
    });

    describe("validateGenerationIds", () => {
        it("should validate existing generation IDs successfully", async () => {
            // Arrange
            const generationIds = [1, 2, 3];

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                        count: 3,
                        error: null,
                    }),
                }),
            });

            // Act & Assert
            await expect(
                flashcardService.validateGenerationIds(generationIds)
            ).resolves.not.toThrow();
        });

        it("should handle empty array without making database call", async () => {
            // Act
            await flashcardService.validateGenerationIds([]);

            // Assert
            expect(mockSupabase.from).not.toHaveBeenCalled();
        });

        it("should deduplicate generation IDs before validation", async () => {
            // Arrange
            const generationIds = [1, 2, 2, 3, 3, 3];
            const mockIn = vi.fn().mockResolvedValue({ count: 3, error: null });

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    in: mockIn,
                }),
            });

            // Act
            await flashcardService.validateGenerationIds(generationIds);

            // Assert
            expect(mockIn).toHaveBeenCalledWith("id", [1, 2, 3]);
        });

        it("should throw DatabaseError when generation IDs count mismatch", async () => {
            // Arrange
            const generationIds = [1, 2, 3];

            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    in: vi.fn().mockResolvedValue({
                        count: 2,
                        error: null,
                    }),
                }),
            });

            // Act & Assert
            await expect(flashcardService.validateGenerationIds(generationIds)).rejects.toThrow(
                DatabaseError
            );

            try {
                await flashcardService.validateGenerationIds(generationIds);
            } catch (error) {
                expect(error).toBeInstanceOf(DatabaseError);
                expect((error as DatabaseError).code).toBe("INVALID_GENERATION_ID");
                expect((error as DatabaseError).message).toBe("Invalid generation IDs");
            }
        });
    });

    describe("DatabaseError", () => {
        it("should create DatabaseError with correct properties", () => {
            // Arrange & Act
            const error = new DatabaseError("Test message", "TEST_CODE", "Test details");

            // Assert
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toBe("DatabaseError");
            expect(error.message).toBe("Test message");
            expect(error.code).toBe("TEST_CODE");
            expect(error.details).toBe("Test details");
        });

        it("should be throwable and catchable", () => {
            // Arrange
            const error = new DatabaseError("Test error", "CODE", "Details");

            // Act & Assert
            expect(() => {
                throw error;
            }).toThrow(DatabaseError);
        });
    });
});

