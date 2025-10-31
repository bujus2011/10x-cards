import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../logger";

describe("Logger", () => {
  let logger: Logger;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console methods
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger = new Logger("TestContext");
  });

  afterEach(() => {
    // Restore original console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("constructor", () => {
    it("should create logger with context", () => {
      // Act
      const logger = new Logger("MyContext");

      // Assert
      expect(logger).toBeDefined();
    });
  });

  describe("error", () => {
    it("should log error with context and timestamp", () => {
      // Arrange
      const error = new Error("Test error message");

      // Act
      logger.error(error);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData).toHaveProperty("context", "TestContext");
      expect(loggedData).toHaveProperty("error");
      expect(loggedData.error).toHaveProperty("name", "Error");
      expect(loggedData.error).toHaveProperty("message", "Test error message");
      expect(loggedData).toHaveProperty("timestamp");
    });

    it("should include error stack trace when available", () => {
      // Arrange
      const error = new Error("Test error");

      // Act
      logger.error(error);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.error).toHaveProperty("stack");
      expect(loggedData.error.stack).toBeDefined();
    });

    it("should log error with metadata", () => {
      // Arrange
      const error = new Error("Test error");
      const metadata = {
        userId: "user-123",
        action: "createFlashcard",
        attemptNumber: 3,
      };

      // Act
      logger.error(error, metadata);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData).toHaveProperty("metadata");
      expect(loggedData.metadata).toEqual(metadata);
    });

    it("should sanitize sensitive data in metadata", () => {
      // Arrange
      const error = new Error("Test error");
      const metadata = {
        apiKey: "secret-api-key-123",
        token: "secret-token-456",
        password: "secret-password-789",
        userId: "user-123",
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.apiKey).toBe("[REDACTED]");
      expect(loggedData.metadata.token).toBe("[REDACTED]");
      expect(loggedData.metadata.password).toBe("[REDACTED]");
      expect(loggedData.metadata.userId).toBe("user-123");
    });

    it("should handle top-level sensitive keys only", () => {
      // Arrange - Logger only sanitizes top-level keys, not nested ones
      const error = new Error("Test error");
      const metadata = {
        myApiKey: "secret", // Contains "apikey" substring
        authToken: "token123",
        normalData: "value",
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.myApiKey).toBe("[REDACTED]");
      expect(loggedData.metadata.authToken).toBe("[REDACTED]");
      expect(loggedData.metadata.normalData).toBe("value");
    });

    it("should handle errors without metadata", () => {
      // Arrange
      const error = new Error("Test error");

      // Act
      logger.error(error);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData).not.toHaveProperty("metadata");
    });

    it("should format timestamp as ISO string", () => {
      // Arrange
      const error = new Error("Test error");
      const beforeTimestamp = new Date().toISOString();

      // Act
      logger.error(error);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      const afterTimestamp = new Date().toISOString();
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(loggedData.timestamp >= beforeTimestamp).toBe(true);
      expect(loggedData.timestamp <= afterTimestamp).toBe(true);
    });
  });

  describe("warn", () => {
    it("should log warning with context and timestamp", () => {
      // Arrange
      const message = "This is a warning message";

      // Act
      logger.warn(message);

      // Assert
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedData = consoleWarnSpy.mock.calls[0][0];
      expect(loggedData).toHaveProperty("context", "TestContext");
      expect(loggedData).toHaveProperty("message", message);
      expect(loggedData).toHaveProperty("timestamp");
    });

    it("should log warning with metadata", () => {
      // Arrange
      const message = "Warning: rate limit approaching";
      const metadata = {
        currentRequests: 95,
        maxRequests: 100,
        resetTime: "2024-01-01T00:00:00Z",
      };

      // Act
      logger.warn(message, metadata);

      // Assert
      const loggedData = consoleWarnSpy.mock.calls[0][0];
      expect(loggedData).toHaveProperty("metadata");
      expect(loggedData.metadata).toEqual(metadata);
    });

    it("should sanitize sensitive data in warning metadata", () => {
      // Arrange
      const message = "API configuration warning";
      const metadata = {
        apiKey: "secret-key",
        secret: "secret-value",
        authorization: "Bearer token123",
        endpoint: "https://api.example.com",
      };

      // Act
      logger.warn(message, metadata);

      // Assert
      const loggedData = consoleWarnSpy.mock.calls[0][0];
      expect(loggedData.metadata.apiKey).toBe("[REDACTED]");
      expect(loggedData.metadata.secret).toBe("[REDACTED]");
      expect(loggedData.metadata.authorization).toBe("[REDACTED]");
      expect(loggedData.metadata.endpoint).toBe("https://api.example.com");
    });

    it("should handle warnings without metadata", () => {
      // Arrange
      const message = "Simple warning";

      // Act
      logger.warn(message);

      // Assert
      const loggedData = consoleWarnSpy.mock.calls[0][0];
      expect(loggedData).not.toHaveProperty("metadata");
    });
  });

  describe("sanitizeMetadata", () => {
    it("should redact apiKey field", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = { apiKey: "secret123" };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.apiKey).toBe("[REDACTED]");
    });

    it("should redact token field", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = { token: "token123" };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.token).toBe("[REDACTED]");
    });

    it("should redact password field", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = { password: "pass123" };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.password).toBe("[REDACTED]");
    });

    it("should redact secret field", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = { secret: "secret123" };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.secret).toBe("[REDACTED]");
    });

    it("should redact authorization field", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = { authorization: "Bearer token" };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.authorization).toBe("[REDACTED]");
    });

    it("should be case-insensitive for sensitive keys", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {
        APIKEY: "secret",
        Token: "token",
        PassWord: "pass",
        SECRET: "secret",
        Authorization: "auth",
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.APIKEY).toBe("[REDACTED]");
      expect(loggedData.metadata.Token).toBe("[REDACTED]");
      expect(loggedData.metadata.PassWord).toBe("[REDACTED]");
      expect(loggedData.metadata.SECRET).toBe("[REDACTED]");
      expect(loggedData.metadata.Authorization).toBe("[REDACTED]");
    });

    it("should handle partial key matches", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {
        myApiKeyValue: "secret",
        userToken: "token",
        configSecret: "secret",
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.myApiKeyValue).toBe("[REDACTED]");
      expect(loggedData.metadata.userToken).toBe("[REDACTED]");
      expect(loggedData.metadata.configSecret).toBe("[REDACTED]");
    });

    it("should not modify original metadata object", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {
        apiKey: "secret",
        normalField: "value",
      };
      const originalMetadata = { ...metadata };

      // Act
      logger.error(error, metadata);

      // Assert
      expect(metadata).toEqual(originalMetadata);
    });

    it("should preserve non-sensitive data", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {
        userId: "user-123",
        action: "createFlashcard",
        timestamp: "2024-01-01",
        count: 5,
        isActive: true,
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata).toEqual(metadata);
    });

    it("should handle empty metadata object", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {};

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata).toEqual({});
    });

    it("should return undefined for undefined metadata", () => {
      // Arrange
      const error = new Error("Test");

      // Act
      logger.error(error, undefined);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData).not.toHaveProperty("metadata");
    });
  });

  describe("multiple logger instances", () => {
    it("should maintain separate contexts for different instances", () => {
      // Arrange
      const logger1 = new Logger("Context1");
      const logger2 = new Logger("Context2");
      const error = new Error("Test");

      // Act
      logger1.error(error);
      logger2.error(error);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      const log1 = consoleErrorSpy.mock.calls[0][0];
      const log2 = consoleErrorSpy.mock.calls[1][0];
      expect(log1.context).toBe("Context1");
      expect(log2.context).toBe("Context2");
    });
  });

  describe("edge cases", () => {
    it("should handle errors without stack trace", () => {
      // Arrange
      const error = new Error("Test");
      delete error.stack;

      // Act
      logger.error(error);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.error).not.toHaveProperty("stack");
    });

    it("should not sanitize nested structures (only top-level keys)", () => {
      // Arrange - Logger only sanitizes top-level keys
      const error = new Error("Test");
      const metadata = {
        apiKey: "top-level-secret",
        level1: {
          level2: {
            apiKey: "nested-secret",
            normalData: "value",
          },
        },
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.apiKey).toBe("[REDACTED]");
      expect(loggedData.metadata.level1.level2.apiKey).toBe("nested-secret"); // Not sanitized
      expect(loggedData.metadata.level1.level2.normalData).toBe("value");
    });

    it("should handle metadata with arrays", () => {
      // Arrange
      const error = new Error("Test");
      const metadata = {
        items: ["item1", "item2"],
        apiKey: "secret",
      };

      // Act
      logger.error(error, metadata);

      // Assert
      const loggedData = consoleErrorSpy.mock.calls[0][0];
      expect(loggedData.metadata.items).toEqual(["item1", "item2"]);
      expect(loggedData.metadata.apiKey).toBe("[REDACTED]");
    });
  });
});
