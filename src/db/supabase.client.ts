import type { AstroCookies } from "astro";
import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Get environment variables from the appropriate source
 * In Cloudflare Pages production: uses runtime.env
 * In local development: uses import.meta.env
 */
function getEnvVars(runtimeEnv?: Record<string, string>) {
  // In production (Cloudflare Pages), use runtime environment variables
  // In development, use import.meta.env
  if (import.meta.env.PROD && runtimeEnv) {
    return {
      supabaseUrl: runtimeEnv.SUPABASE_URL,
      supabaseAnonKey: runtimeEnv.SUPABASE_KEY,
    };
  }

  // Fallback to build-time env vars (local development)
  return {
    supabaseUrl: import.meta.env.SUPABASE_URL,
    supabaseAnonKey: import.meta.env.SUPABASE_KEY,
  };
}

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Client instance (for client-side components)
// Lazy initialization to avoid errors when env vars are missing
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!_supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Key are required. Please check your environment variables.");
    }
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
};

// For backward compatibility and type exports
export const supabaseClient = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient<Database>>];
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
