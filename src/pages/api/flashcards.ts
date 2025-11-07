import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardsCreateCommand, FlashcardUpdateDto } from "../../types";
import { FlashcardService } from "../../lib/flashcard.service";
import { Logger } from "../../lib/logger";
import {
  jsonResponse,
  unauthorizedResponse,
  validationErrorResponse,
  badRequestResponse,
  handleApiError,
} from "../../lib/api-response";

const flashcardsApiLogger = Logger.forContext("api/flashcards");

export const prerender = false;

// Validation schema for individual flashcard
const flashcardSchema = z
  .object({
    front: z.string().max(200, "Front text cannot exceed 200 characters"),
    back: z.string().max(500, "Back text cannot exceed 500 characters"),
    source: z.enum(["ai-full", "ai-edited", "manual"] as const),
    generation_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // Validate generation_id based on source
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
        return false;
      }
      return true;
    },
    {
      message: "generation_id must be null for manual source and non-null for ai-full/ai-edited sources",
    }
  );

// Validation schema for the entire request body
const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard must be provided")
    .max(100, "Maximum 100 flashcards can be created at once"),
});

// Validation schema for flashcard update
const updateFlashcardSchema = z.object({
  front: z.string().max(200, "Front text cannot exceed 200 characters").optional(),
  back: z.string().max(500, "Back text cannot exceed 500 characters").optional(),
  source: z.enum(["ai-full", "ai-edited", "manual"] as const).optional(),
  generation_id: z.number().nullable().optional(),
});

/**
 * GET /api/flashcards - Retrieve all flashcards for the authenticated user
 */
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  try {
    const flashcardService = new FlashcardService(locals.supabase);
    const flashcards = await flashcardService.getByUserId(locals.user.id);

    return jsonResponse({ flashcards });
  } catch (error) {
    return handleApiError(error, flashcardsApiLogger, { userId: locals.user?.id });
  }
};

/**
 * POST /api/flashcards - Create new flashcards
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const command = validationResult.data as FlashcardsCreateCommand;

    // Validate that all referenced generation_ids exist
    const generationIds = command.flashcards.map((f) => f.generation_id).filter((id): id is number => id !== null);

    // Create flashcards using service
    const flashcardService = new FlashcardService(locals.supabase);

    try {
      await flashcardService.validateGenerationIds(generationIds);
    } catch (error) {
      return handleApiError(error, flashcardsApiLogger, { userId: locals.user.id });
    }

    const createdFlashcards = await flashcardService.createBatch(locals.user.id, command.flashcards);

    return jsonResponse({ flashcards: createdFlashcards, saved_count: createdFlashcards.length }, 201);
  } catch (error) {
    return handleApiError(error, flashcardsApiLogger, { userId: locals.user?.id });
  }
};

/**
 * PUT /api/flashcards - Update a flashcard
 */
export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id || typeof id !== "number") {
      return badRequestResponse("Flashcard ID is required");
    }

    const validationResult = updateFlashcardSchema.safeParse(updateData);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors);
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const updates = validationResult.data as FlashcardUpdateDto;
    const updatedFlashcard = await flashcardService.update(id, locals.user.id, updates);

    return jsonResponse({ flashcard: updatedFlashcard });
  } catch (error) {
    return handleApiError(error, flashcardsApiLogger, { userId: locals.user?.id });
  }
};

/**
 * DELETE /api/flashcards - Delete a flashcard
 */
export const DELETE: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "number") {
      return badRequestResponse("Flashcard ID is required");
    }

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.delete(id, locals.user.id);

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error, flashcardsApiLogger, { userId: locals.user?.id });
  }
};
