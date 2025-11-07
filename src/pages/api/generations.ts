import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand } from "../../types";
import { GenerationService } from "../../lib/generation.service";
import { Logger } from "../../lib/logger";
import { jsonResponse, unauthorizedResponse, validationErrorResponse, handleApiError } from "../../lib/api-response";

const generationsApiLogger = Logger.forContext("api/generations");

export const prerender = false;

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  try {
    // Parse and validate request body
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors, "Invalid request data");
    }

    // Get OpenRouter API key from runtime env (Cloudflare) or build-time env (local dev)
    // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
    const runtimeEnv = locals.runtime?.env;
    const openRouterApiKey =
      import.meta.env.PROD && runtimeEnv ? runtimeEnv.OPENROUTER_API_KEY : import.meta.env.OPENROUTER_API_KEY;

    // Initialize service and generate flashcards
    const generationService = new GenerationService(locals.supabase, {
      apiKey: openRouterApiKey,
    });
    const result = await generationService.generateFlashcards(locals.user.id, body.source_text);

    return jsonResponse(result, 201);
  } catch (error) {
    return handleApiError(error, generationsApiLogger, { userId: locals.user?.id });
  }
};
