import type { AstroCookies } from "astro";
import { createBrowserClient, createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Get environment variables from the appropriate source
 * In Cloudflare Pages production: uses runtime.env
 * In local development: uses import.meta.env
 *
 * Note: Using PUBLIC_* variables for simplicity. In production, consider
 * using separate server-side variables for enhanced security.
 */
function getEnvVars(runtimeEnv?: Record<string, string>) {
  // In production (Cloudflare Pages), use runtime environment variables
  // In development, use import.meta.env
  if (import.meta.env.PROD && runtimeEnv) {
    return {
      supabaseUrl: runtimeEnv.PUBLIC_SUPABASE_URL || runtimeEnv.SUPABASE_URL,
      supabaseAnonKey: runtimeEnv.PUBLIC_SUPABASE_KEY || runtimeEnv.SUPABASE_KEY,
    };
  }

  // Fallback to build-time env vars (local development)
  // Use PUBLIC_* variables which are available everywhere
  return {
    supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.PUBLIC_SUPABASE_KEY,
  };
}

// Client-side uses PUBLIC_ prefixed env vars (accessible in browser)
// Note: Client-side should ONLY use PUBLIC_ variables, no fallback to non-PUBLIC versions
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_KEY;

// Client instance (for client-side components)
// Lazy initialization to avoid errors when env vars are missing
let _supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!_supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Key are required. Please check your environment variables.");
    }
    // Use createBrowserClient from @supabase/ssr for proper SSR support
    // This handles PKCE flow and cookie management compatible with server-side
    _supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
};

// For backward compatibility and type exports
export const supabaseClient = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient<Database>>];
  },
});

export type SupabaseClient = ReturnType<typeof getSupabaseClient>;

// Cookie options for server-side auth
// Note: In local dev/tests over HTTP, cookies cannot be set with `Secure`
// which would break session persistence and auth redirects in E2E.
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: "lax",
};

// Helper function to parse cookie header
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server instance creator (for API routes and server-side auth)
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  runtimeEnv?: Record<string, string>;
}) => {
  // Get environment variables from appropriate source (runtime or build-time)
  const { supabaseUrl: url, supabaseAnonKey: key } = getEnvVars(context.runtimeEnv);

  // Check if environment variables are available
  if (!url || !key) {
    throw new Error("Supabase URL and Key are required. Please check your environment variables.");
  }

  const supabase = createServerClient<Database>(url, key, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
