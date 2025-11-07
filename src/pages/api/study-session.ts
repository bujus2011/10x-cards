import type { APIRoute } from "astro";
import { StudySessionService } from "../../lib/study-session.service";
import { z } from "astro/zod";
import { Logger } from "../../lib/logger";
import {
  jsonResponse,
  unauthorizedResponse,
  validationErrorResponse,
  badRequestResponse,
  notFoundResponse,
} from "../../lib/api-response";

const studySessionApiLogger = Logger.forContext("api/study-session");

export const prerender = false;

/**
 * GET /api/study-session
 * Get flashcards due for review
 */
export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  if (!locals.supabase) {
    return jsonResponse({ error: "Database connection failed" }, 500);
  }

  try {
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return badRequestResponse("Invalid limit parameter. Must be between 1 and 100");
    }

    const studySessionService = new StudySessionService(locals.supabase);
    const dueCards = await studySessionService.getDueCards(locals.user.id, limit);

    return jsonResponse({ cards: dueCards });
  } catch (error) {
    studySessionApiLogger.error("Error fetching due cards", error, { userId: locals.user?.id });
    return jsonResponse({ error: "Failed to fetch due cards" }, 500);
  }
};

/**
 * POST /api/study-session
 * Submit a review for a flashcard
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  if (!locals.supabase) {
    return jsonResponse({ error: "Database connection failed" }, 500);
  }

  try {
    const body = await request.json();

    // Validate request body
    const reviewSchema = z.object({
      flashcard_id: z.number().int().positive(),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    });

    const validationResult = reviewSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors, "Invalid request body");
    }

    const { flashcard_id, rating } = validationResult.data;

    // Verify flashcard belongs to user
    const { data: flashcard, error: flashcardError } = await locals.supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcard_id)
      .eq("user_id", locals.user.id)
      .single();

    if (flashcardError || !flashcard) {
      return notFoundResponse("Flashcard not found or unauthorized");
    }

    const studySessionService = new StudySessionService(locals.supabase);
    const result = await studySessionService.submitReview(locals.user.id, flashcard_id, rating);

    return jsonResponse({ success: true, ...result });
  } catch (error) {
    studySessionApiLogger.error("Error submitting review", error, { userId: locals.user?.id });
    return jsonResponse({ error: "Failed to submit review" }, 500);
  }
};
