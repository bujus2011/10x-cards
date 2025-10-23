import type { APIRoute } from "astro";
import { StudySessionService } from "../../lib/study-session.service";
import { z } from "astro/zod";

export const prerender = false;

/**
 * GET /api/study-session
 * Get flashcards due for review
 */
export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  const supabase = locals.supabase;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Database connection failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(JSON.stringify({ error: "Invalid limit parameter. Must be between 1 and 100" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const studySessionService = new StudySessionService(supabase);
    const dueCards = await studySessionService.getDueCards(user.id, limit);

    return new Response(JSON.stringify({ cards: dueCards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching due cards:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch due cards" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/study-session
 * Submit a review for a flashcard
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  const supabase = locals.supabase;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Database connection failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcard_id, rating } = validationResult.data;

    // Verify flashcard belongs to user
    const { data: flashcard, error: flashcardError } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", flashcard_id)
      .eq("user_id", user.id)
      .single();

    if (flashcardError || !flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const studySessionService = new StudySessionService(supabase);
    const result = await studySessionService.submitReview(user.id, flashcard_id, rating);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return new Response(JSON.stringify({ error: "Failed to submit review" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
