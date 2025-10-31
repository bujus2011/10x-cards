import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

/**
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 *
 * This middleware implements a centralized, configuration-driven route protection system.
 * It runs on EVERY request and is the primary defense against unauthorized access.
 *
 * SECURITY ARCHITECTURE:
 * ====================
 *
 * 1. REQUEST FLOW
 *    Every HTTP request → Middleware validates session → Route access
 *
 * 2. AUTHENTICATION METHOD
 *    - Uses Supabase Auth JWT tokens stored in HTTP-only cookies
 *    - Validates JWTs on every request
 *    - Automatically refreshes expired tokens
 *    - Uses secure, httpOnly, sameSite=lax cookie settings
 *
 * 3. ROUTE PROTECTION STRATEGY
 *    - Whitelisting: Define PUBLIC_PATHS explicitly
 *    - Default: Any route NOT in PUBLIC_PATHS requires authentication
 *    - No hardcoded, scattered auth checks across codebase
 *
 * 4. DEFENSE-IN-DEPTH
 *    - Middleware layer: First line of defense
 *    - Page/Component layer: Defensive checks in individual routes
 *    - API layer: Server-side validation before data access
 *
 * ADDING NEW PROTECTED ROUTES:
 * ===========================
 *
 * Example 1: Protect a new Astro page
 *   - Simply create the page under /src/pages/
 *   - Add defensive checks in the page (see generate.astro for example)
 *   - Middleware automatically protects it (no config needed)
 *
 * Example 2: Protect a new API endpoint
 *   - Create endpoint under /src/pages/api/
 *   - Check Astro.locals.user in the endpoint
 *   - Middleware validates session before endpoint is called
 *
 * IMPORTANT NOTES:
 * ================
 * - Always verify Astro.locals.user exists before using it
 * - Never trust client-side auth checks - always verify server-side
 * - All cookies use httpOnly flag - client JS cannot access them
 * - JWT validation happens server-side on every request
 */

/**
 * Configuration-driven route access control
 *
 * IMPORTANT: This is the single source of truth for route protection
 * Update this configuration when adding new routes that require authentication
 */
const ROUTE_CONFIG = {
  /**
   * Public paths - accessible without authentication
   * These routes do not require user session validation
   */
  public: [
    // Auth pages
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
    "/auth/reset-password-confirm",
    // Auth API endpoints
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/reset-password",
    "/api/auth/reset-password-confirm",
    // Landing page
    "/",
  ] as const,

  /**
   * Protected paths - require authentication
   * Any route NOT in the public array is considered protected
   * Users will be redirected to /auth/login if not authenticated
   */
  protected: [
    "/generate",
    "/my-flashcards",
    "/study-session",
    "/api/flashcards",
    "/api/generations",
    "/api/study-session",
    "/api/study-stats",
  ] as const,
} as const;

/**
 * Check if a path requires authentication
 */
function isProtectedPath(pathname: string): boolean {
  return !ROUTE_CONFIG.public.includes(pathname);
}

/**
 * Main middleware handler for authentication and authorization
 * Runs on every request and validates user sessions
 */
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase server instance for this request
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Store supabase instance in locals for use in API routes
  locals.supabase = supabase;

  // Skip authentication check for public paths
  if (!isProtectedPath(url.pathname)) {
    return next();
  }

  // IMPORTANT: Always get user session before any other operations
  // This validates the JWT token and refreshes it if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Store user data in locals for use in components and routes
    locals.user = {
      email: user.email ?? "",
      id: user.id,
    };
    return next();
  }

  // User is not authenticated, redirect to login
  // Preserve the original URL for potential redirect after login
  return redirect(`/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
});
