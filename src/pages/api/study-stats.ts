import type { APIRoute } from "astro";
import { StudySessionService } from "../../lib/study-session.service";

export const prerender = false;

/**
 * GET /api/study-stats
 * Get study session statistics for the current user
 */
export const GET: APIRoute = async ({ locals }) => {
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
    const studySessionService = new StudySessionService(supabase);
    const stats = await studySessionService.getStudyStats(user.id);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching study stats:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch study statistics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
