import type { APIRoute } from "astro";
import { StudySessionService } from "../../lib/study-session.service";
import { Logger } from "../../lib/logger";
import { jsonResponse, unauthorizedResponse } from "../../lib/api-response";

const studyStatsLogger = Logger.forContext("api/study-stats");

export const prerender = false;

/**
 * GET /api/study-stats
 * Get study session statistics for the current user
 */
export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) {
    return unauthorizedResponse();
  }

  if (!locals.supabase) {
    return jsonResponse({ error: "Database connection failed" }, 500);
  }

  try {
    const studySessionService = new StudySessionService(locals.supabase);
    const stats = await studySessionService.getStudyStats(locals.user.id);

    return jsonResponse(stats);
  } catch (error) {
    studyStatsLogger.error("Error fetching study stats", error, { userId: locals.user?.id });
    return jsonResponse({ error: "Failed to fetch study statistics" }, 500);
  }
};
