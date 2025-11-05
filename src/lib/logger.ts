/* eslint-disable no-console */
/**
 * Logger utility for consistent error logging across the application
 */
export class Logger {
  constructor(private readonly context: string) {}

  static forContext(context: string) {
    return new Logger(context);
  }

  /**
   * Logs an informational message with optional metadata
   */
  info(message: string, metadata?: Record<string, unknown>) {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    console.info({
      level: "info",
      context: this.context,
      message,
      ...(sanitizedMetadata ? { metadata: sanitizedMetadata } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs a warning message with context and optional metadata
   */
  warn(message: string, metadata?: Record<string, unknown>) {
    const sanitizedMetadata = this.sanitizeMetadata(metadata);

    console.warn({
      level: "warn",
      context: this.context,
      message,
      ...(sanitizedMetadata ? { metadata: sanitizedMetadata } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs an error with context, message, optional error and metadata
   * Ensures sensitive data is never logged
   */
  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void;
  error(error: unknown, metadata?: Record<string, unknown>): void;
  error(
    messageOrError: string | unknown,
    errorOrMetadata?: unknown | Record<string, unknown>,
    metadataOrUndefined?: Record<string, unknown>
  ) {
    const { message, error, metadata } = this.normalizeArguments(messageOrError, errorOrMetadata, metadataOrUndefined);

    const sanitizedMetadata = this.sanitizeMetadata(metadata);
    const normalizedError = this.normalizeError(error);

    console.error({
      level: "error",
      context: this.context,
      ...(message ? { message } : {}),
      ...(normalizedError ? { error: normalizedError } : {}),
      ...(sanitizedMetadata ? { metadata: sanitizedMetadata } : {}),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Removes sensitive data from metadata before logging
   */
  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!metadata) return undefined;

    const sensitiveKeys = ["apiKey", "token", "password", "secret", "authorization"];
    const sanitized = { ...metadata };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey.toLowerCase()))) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  private normalizeError(error?: unknown): Record<string, unknown> | undefined {
    if (!error) return undefined;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        ...(error.stack ? { stack: error.stack } : {}),
      };
    }

    if (typeof error === "string") {
      return { name: "Error", message: error };
    }

    return { name: "Error", message: JSON.stringify(error) };
  }

  private normalizeArguments(
    messageOrError: string | unknown,
    errorOrMetadata?: unknown | Record<string, unknown>,
    metadataOrUndefined?: Record<string, unknown>
  ) {
    if (typeof messageOrError === "string") {
      if (metadataOrUndefined !== undefined) {
        return {
          message: messageOrError,
          error: errorOrMetadata,
          metadata: metadataOrUndefined,
        };
      }

      if (this.isPlainObject(errorOrMetadata) && !(errorOrMetadata instanceof Error)) {
        return {
          message: messageOrError,
          error: undefined,
          metadata: errorOrMetadata as Record<string, unknown>,
        };
      }

      return {
        message: messageOrError,
        error: errorOrMetadata,
        metadata: undefined,
      };
    }

    return {
      message: undefined,
      error: messageOrError,
      metadata: errorOrMetadata as Record<string, unknown> | undefined,
    };
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}

export const logger = Logger.forContext("app");
