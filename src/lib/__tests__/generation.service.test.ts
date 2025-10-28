import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerationService } from "../generation.service";
import { OpenRouterError } from "../openrouter.types";

// Mock OpenRouterService
vi.mock("../openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    setModel: vi.fn(),
    setSystemMessage: vi.fn(),
    setResponseFormat: vi.fn(),
    setUserMessage: vi.fn(),
    sendChatMessage: vi.fn(),
  })),
}));

// Mock crypto module
vi.mock("crypto", () => ({
  default: {
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn(() => "mock-hash-123"),
    })),
  },
}));

const createMockSupabaseClient = () => ({
  from: vi.fn(),
});

type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;

describe("GenerationService", () => {
  let mockSupabase: MockSupabaseClient;
  let generationService: GenerationService;
  let mockOpenRouter: any;

  const mockUserId = "user-123";
  const mockSourceText = "TypeScript is a typed superset of JavaScript. ".repeat(30); // ~1500 chars

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSupabase = createMockSupabaseClient();

    // Get the mocked OpenRouterService
    const { OpenRouterService } = await import("../openrouter.service");
    generationService = new GenerationService(mockSupabase as any, {
      apiKey: "test-api-key",
    });

    // Get the mock instance
    mockOpenRouter = (generationService as any).openRouter;
  });

  describe("constructor", () => {
    it("should throw error when API key is missing", () => {
      // Act & Assert
      expect(() => {
        new GenerationService(mockSupabase as any, { apiKey: "" });
      }).toThrow("OpenRouter API key is required");
    });

    it("should initialize with valid API key", () => {
      // Act & Assert
      expect(() => {
        new GenerationService(mockSupabase as any, { apiKey: "valid-key" });
      }).not.toThrow();
    });
  });

  describe("generateFlashcards", () => {
    it("should generate flashcards successfully", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [
          { front: "What is TypeScript?", back: "A typed superset of JavaScript" },
          { front: "What is React?", back: "A JavaScript library for UI" },
        ],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1 },
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(result.generation_id).toBe(1);
      expect(result.flashcards_proposals).toHaveLength(2);
      expect(result.generated_count).toBe(2);
      expect(result.flashcards_proposals[0].source).toBe("ai-full");
      expect(result.flashcards_proposals[0].front).toBe("What is TypeScript?");
    });

    it("should calculate source text hash", async () => {
      // Arrange
      const crypto = (await import("crypto")).default;
      const mockAIResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 1 },
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act
      await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(crypto.createHash).toHaveBeenCalledWith("md5");
    });

    it("should save generation metadata with correct fields", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [
          { front: "Q1", back: "A1" },
          { front: "Q2", back: "A2" },
        ],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 5 },
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act
      await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          source_text_hash: "mock-hash-123",
          source_text_length: mockSourceText.length,
          generated_count: 2,
          model: "openai/gpt-4o-mini",
        })
      );
    });

    it("should handle invalid JSON response from AI", async () => {
      // Arrange
      mockOpenRouter.sendChatMessage.mockResolvedValue("invalid json");

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockUserId, mockSourceText)).rejects.toThrow();
    });

    it("should handle missing flashcards array in response", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        data: "wrong format",
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockUserId, mockSourceText)).rejects.toThrow(
        "Invalid response format: missing flashcards array"
      );
    });

    it("should handle OpenRouterError", async () => {
      // Arrange
      const openRouterError = new OpenRouterError("API rate limit exceeded", "RATE_LIMIT", 429);
      mockOpenRouter.sendChatMessage.mockRejectedValue(openRouterError);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockUserId, mockSourceText)).rejects.toThrow(
        "AI Service error: API rate limit exceeded (RATE_LIMIT)"
      );
    });

    it("should log errors to generation_error_logs table", async () => {
      // Arrange
      const testError = new Error("Test error");
      mockOpenRouter.sendChatMessage.mockRejectedValue(testError);

      const mockInsertErrorLog = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === "generation_error_logs") {
          return {
            insert: mockInsertErrorLog,
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        };
      });

      // Act
      try {
        await generationService.generateFlashcards(mockUserId, mockSourceText);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("generation_error_logs");
      expect(mockInsertErrorLog).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          error_code: "Error",
          error_message: "Test error",
          model: "openai/gpt-4o-mini",
          source_text_hash: "mock-hash-123",
          source_text_length: mockSourceText.length,
        })
      );
    });

    it("should convert AI response to FlashcardProposalDto format", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [
          { front: "Question 1", back: "Answer 1" },
          { front: "Question 2", back: "Answer 2" },
          { front: "Question 3", back: "Answer 3" },
        ],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1 },
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(result.flashcards_proposals).toHaveLength(3);
      result.flashcards_proposals.forEach((proposal) => {
        expect(proposal).toHaveProperty("front");
        expect(proposal).toHaveProperty("back");
        expect(proposal.source).toBe("ai-full");
      });
    });

    it("should include generation duration in metadata", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 1 },
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      // Act
      await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          generation_duration: expect.any(Number),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should rethrow error after logging", async () => {
      // Arrange
      const testError = new Error("Database connection failed");
      mockOpenRouter.sendChatMessage.mockRejectedValue(testError);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockUserId, mockSourceText)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle database error when saving generation metadata", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error", code: "DB_ERROR" },
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(generationService.generateFlashcards(mockUserId, mockSourceText)).rejects.toThrow();
    });
  });

  describe("AI service integration", () => {
    it("should set user message with source text", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1 },
              error: null,
            }),
          }),
        }),
      });

      // Act
      await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(mockOpenRouter.setUserMessage).toHaveBeenCalledWith(expect.stringContaining(mockSourceText));
      expect(mockOpenRouter.setUserMessage).toHaveBeenCalledWith(
        expect.stringContaining("Generate flashcards from the following text:")
      );
    });

    it("should call sendChatMessage", async () => {
      // Arrange
      const mockAIResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockOpenRouter.sendChatMessage.mockResolvedValue(mockAIResponse);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 1 },
              error: null,
            }),
          }),
        }),
      });

      // Act
      await generationService.generateFlashcards(mockUserId, mockSourceText);

      // Assert
      expect(mockOpenRouter.sendChatMessage).toHaveBeenCalledTimes(1);
    });
  });
});
