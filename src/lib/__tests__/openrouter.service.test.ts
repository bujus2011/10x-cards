import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "../openrouter.service";
import { OpenRouterError } from "../openrouter.types";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OpenRouterService", () => {
  let openRouterService: OpenRouterService;

  const mockApiKey = "test-api-key-123";
  const mockApiUrl = "https://test-openrouter.ai/api/v1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should initialize with valid configuration", () => {
      // Act & Assert
      expect(() => {
        new OpenRouterService({
          apiKey: mockApiKey,
          apiUrl: mockApiUrl,
          timeout: 30000,
          maxRetries: 3,
        });
      }).not.toThrow();
    });

    it("should throw error for empty API key", () => {
      // Act & Assert
      expect(() => {
        new OpenRouterService({ apiKey: "" });
      }).toThrow();
    });

    it("should throw error for missing API key", () => {
      // Act & Assert
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new OpenRouterService({ apiKey: undefined as any });
      }).toThrow();
    });

    it("should use default values when optional params not provided", () => {
      // Act
      const service = new OpenRouterService({ apiKey: mockApiKey });

      // Assert - service should be created successfully
      expect(service).toBeDefined();
    });

    it("should validate configuration with Zod schema", () => {
      // Act & Assert
      expect(() => {
        new OpenRouterService({
          apiKey: mockApiKey,
          timeout: -1000, // Invalid: negative timeout
        });
      }).toThrow();
    });
  });

  describe("setSystemMessage", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({ apiKey: mockApiKey });
    });

    it("should set system message successfully", () => {
      // Arrange
      const systemMessage = "You are a helpful assistant";

      // Act & Assert
      expect(() => {
        openRouterService.setSystemMessage(systemMessage);
      }).not.toThrow();
    });

    it("should throw error for empty system message", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setSystemMessage("");
      }).toThrow(OpenRouterError);
      expect(() => {
        openRouterService.setSystemMessage("");
      }).toThrow("System message cannot be empty");
    });

    it("should throw error for whitespace-only system message", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setSystemMessage("   \n\t  ");
      }).toThrow(OpenRouterError);
    });
  });

  describe("setUserMessage", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({ apiKey: mockApiKey });
    });

    it("should set user message successfully", () => {
      // Arrange
      const userMessage = "What is TypeScript?";

      // Act & Assert
      expect(() => {
        openRouterService.setUserMessage(userMessage);
      }).not.toThrow();
    });

    it("should throw error for empty user message", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setUserMessage("");
      }).toThrow(OpenRouterError);
      expect(() => {
        openRouterService.setUserMessage("");
      }).toThrow("User message cannot be empty");
    });

    it("should throw error for whitespace-only user message", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setUserMessage("   ");
      }).toThrow(OpenRouterError);
    });
  });

  describe("setResponseFormat", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({ apiKey: mockApiKey });
    });

    it("should set response format with valid schema", () => {
      // Arrange
      const schema = {
        name: "flashcards",
        schema: {
          type: "object",
          properties: {
            flashcards: { type: "array" },
          },
          required: ["flashcards"],
        },
      };

      // Act & Assert
      expect(() => {
        openRouterService.setResponseFormat(schema);
      }).not.toThrow();
    });

    it("should handle empty schema object", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setResponseFormat({});
      }).not.toThrow();
    });
  });

  describe("setModel", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({ apiKey: mockApiKey });
    });

    it("should set model name and parameters", () => {
      // Arrange
      const modelName = "openai/gpt-4";
      const parameters = {
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      // Act & Assert
      expect(() => {
        openRouterService.setModel(modelName, parameters);
      }).not.toThrow();
    });

    it("should throw error for empty model name", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setModel("");
      }).toThrow(OpenRouterError);
      expect(() => {
        openRouterService.setModel("");
      }).toThrow("Model name cannot be empty");
    });

    it("should set model without parameters", () => {
      // Act & Assert
      expect(() => {
        openRouterService.setModel("openai/gpt-4");
      }).not.toThrow();
    });

    it("should merge parameters with defaults", () => {
      // Arrange
      const modelName = "openai/gpt-4";
      const partialParams = { temperature: 0.5 };

      // Act & Assert
      expect(() => {
        openRouterService.setModel(modelName, partialParams);
      }).not.toThrow();
    });
  });

  describe("sendChatMessage", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({
        apiKey: mockApiKey,
        apiUrl: mockApiUrl,
        maxRetries: 3,
      });
    });

    it("should send chat message successfully", async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: '{"flashcards": [{"front": "Q", "back": "A"}]}',
              role: "assistant",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      openRouterService.setSystemMessage("You are a helpful assistant");
      openRouterService.setUserMessage("Generate flashcards");

      // Act
      const result = await openRouterService.sendChatMessage();

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
      expect(result).toBe('{"flashcards": [{"front": "Q", "back": "A"}]}');
    });

    it("should throw error when user message is missing", async () => {
      // Arrange
      openRouterService.setSystemMessage("System message");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow(OpenRouterError);
      await expect(openRouterService.sendChatMessage()).rejects.toThrow("User message is required");
    });

    it("should include system message in request when set", async () => {
      // Arrange
      const mockResponse = {
        choices: [{ message: { content: "response", role: "assistant" } }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      openRouterService.setSystemMessage("You are a helpful assistant");
      openRouterService.setUserMessage("Hello");

      // Act
      await openRouterService.sendChatMessage();

      // Assert
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe("system");
      expect(requestBody.messages[0].content).toBe("You are a helpful assistant");
    });

    it("should handle API errors with status code", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      openRouterService.setUserMessage("Test message");

      // Act & Assert
      try {
        await openRouterService.sendChatMessage();
        // Fail test if no error was thrown
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).status).toBe(401);
        expect((error as OpenRouterError).code).toBe("API_ERROR");
      }
    });

    it("should throw error when response has no choices", async () => {
      // Arrange
      const mockResponse = {
        choices: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      try {
        await openRouterService.sendChatMessage();
        // Fail test if no error was thrown
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(OpenRouterError);
        expect((error as OpenRouterError).message).toContain("No response received");
      }
    });

    it("should validate request payload before sending", async () => {
      // Arrange
      openRouterService.setUserMessage("Test");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "response", role: "assistant" } }],
        }),
      });

      // Act
      await openRouterService.sendChatMessage();

      // Assert
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody).toHaveProperty("messages");
      expect(requestBody).toHaveProperty("model");
      expect(Array.isArray(requestBody.messages)).toBe(true);
    });

    it("should validate response structure", async () => {
      // Arrange
      const invalidResponse = {
        invalid: "structure",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse,
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow();
    });
  });

  describe("retry logic", () => {
    beforeEach(() => {
      vi.useRealTimers(); // Use real timers for retry logic tests
      openRouterService = new OpenRouterService({
        apiKey: mockApiKey,
        apiUrl: mockApiUrl,
        maxRetries: 2, // Reduce retries for faster tests
        timeout: 5000,
      });
    });

    it("should not retry on 401 authentication error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow(OpenRouterError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should not retry on 400 bad request error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad request" }),
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow(OpenRouterError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("request payload building", () => {
    beforeEach(() => {
      openRouterService = new OpenRouterService({
        apiKey: mockApiKey,
        apiUrl: mockApiUrl,
      });
    });

    it("should include response format when set", async () => {
      // Arrange
      const schema = {
        name: "flashcards",
        schema: {
          type: "object",
          properties: { flashcards: { type: "array" } },
          required: ["flashcards"],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "response", role: "assistant" } }],
        }),
      });

      openRouterService.setUserMessage("Test");
      openRouterService.setResponseFormat(schema);

      // Act
      await openRouterService.sendChatMessage();

      // Assert
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.response_format).toBeDefined();
      expect(requestBody.response_format.type).toBe("json_schema");
      expect(requestBody.response_format.json_schema).toEqual(schema);
    });

    it("should include model parameters", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "response", role: "assistant" } }],
        }),
      });

      openRouterService.setModel("openai/gpt-4", {
        temperature: 0.8,
        top_p: 0.9,
      });
      openRouterService.setUserMessage("Test");

      // Act
      await openRouterService.sendChatMessage();

      // Assert
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.temperature).toBe(0.8);
      expect(requestBody.top_p).toBe(0.9);
    });
  });

  describe("error handling and logging", () => {
    beforeEach(() => {
      vi.useRealTimers();
      openRouterService = new OpenRouterService({
        apiKey: mockApiKey,
        maxRetries: 1,
      });
    });

    it("should throw OpenRouterError for API errors", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow(OpenRouterError);
    });

    it("should handle JSON parse errors in error response", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("JSON parse error");
        },
      });

      openRouterService.setUserMessage("Test");

      // Act & Assert
      await expect(openRouterService.sendChatMessage()).rejects.toThrow(OpenRouterError);
    });
  });
});
