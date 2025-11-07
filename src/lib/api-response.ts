import { DatabaseError } from "./flashcard.service";
import type { Logger } from "./logger";
import { z } from "zod";

/**
 * Creates a JSON response with proper headers
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates a JSON response without Content-Type header (for auth endpoints)
 */
export function jsonResponseWithoutHeaders(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status });
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse(): Response {
  return jsonResponse({ error: "Unauthorized" }, 401);
}

/**
 * Returns a 400 Bad Request response with validation errors
 */
export function validationErrorResponse(details: unknown, message = "Invalid input"): Response {
  return jsonResponse({ error: message, details }, 400);
}

/**
 * Returns a 400 Bad Request response with custom error message
 */
export function badRequestResponse(error: string, details?: unknown): Response {
  return jsonResponse({ error, details }, 400);
}

/**
 * Returns a 404 Not Found response
 */
export function notFoundResponse(message = "Resource not found"): Response {
  return jsonResponse({ error: message }, 404);
}

/**
 * Handles API errors consistently across all endpoints
 * Logs the error and returns appropriate response based on error type
 */
export function handleApiError(
  error: unknown,
  logger: ReturnType<typeof Logger.forContext>,
  context?: Record<string, unknown>
): Response {
  logger.error("API error", error, context);

  if (error instanceof DatabaseError) {
    return jsonResponse(
      {
        error: error.message,
        details: error.details,
        code: error.code,
      },
      400
    );
  }

  return jsonResponse({ error: "Internal server error" }, 500);
}

/**
 * Handles auth endpoint errors (Zod validation + generic errors)
 * Returns responses without Content-Type header to match auth endpoint pattern
 */
export function handleAuthError(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return jsonResponseWithoutHeaders(
      {
        error: error.errors[0].message,
        status: "error",
      },
      400
    );
  }

  return jsonResponseWithoutHeaders(
    {
      error: "An unexpected error occurred",
      status: "error",
    },
    500
  );
}