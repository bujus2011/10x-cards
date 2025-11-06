import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Health check endpoint for environment variables
 * Returns the status of required environment variables without exposing their values
 *
 * In Cloudflare Pages, environment variables are accessed through:
 * - import.meta.env (build-time variables)
 * - context.locals.runtime.env (runtime variables from Cloudflare dashboard)
 *
 * @returns JSON response with environment variable status
 */
export const GET: APIRoute = ({ locals }) => {
  // Access runtime environment variables from Cloudflare Pages
  // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
  const runtime = locals.runtime?.env || {};

  // Fallback to import.meta.env for local development
  const env = import.meta.env.PROD ? runtime : import.meta.env;

  const envStatus = {
    supabase_url: env.SUPABASE_URL ? "SET" : "MISSING",
    supabase_key: env.SUPABASE_KEY ? "SET" : "MISSING",
    openrouter_key: env.OPENROUTER_API_KEY ? "SET" : "MISSING",
  };

  return new Response(JSON.stringify(envStatus), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
