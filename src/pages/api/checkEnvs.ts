import type { APIRoute } from "astro";

/**
 * Health check endpoint for environment variables
 * Returns the status of required environment variables without exposing their values
 *
 * @returns JSON response with environment variable status
 */
export const GET: APIRoute = () => {
  const envStatus = {
    supabase_url: import.meta.env.SUPABASE_URL ? "SET" : "MISSING",
    supabase_key: import.meta.env.SUPABASE_KEY ? "SET" : "MISSING",
    openrouter_key: import.meta.env.OPENROUTER_API_KEY ? "SET" : "MISSING",
  };

  return new Response(JSON.stringify(envStatus), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    });
};