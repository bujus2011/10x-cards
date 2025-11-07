import { useState, useCallback } from "react";
import type { Logger } from "@/lib/logger";

interface ApiRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiRequestResult<T> {
  data?: T;
  error?: string;
}

/**
 * Generic hook for making API requests with consistent error handling
 * Manages loading state and provides unified error handling pattern
 */
export function useApiRequest() {
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async <T>(
      url: string,
      options: ApiRequestOptions,
      logger?: ReturnType<typeof Logger.forContext>,
      logContext?: Record<string, unknown>
    ): Promise<ApiRequestResult<T>> => {
      setIsLoading(true);
      try {
        const response = await fetch(url, {
          method: options.method,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const data: T = await response.json();
        return { data };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        logger?.error(`API request error: ${options.method} ${url}`, error, logContext);
        return { error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    request,
    isLoading,
  };
}
