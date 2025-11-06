import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    // Access Cloudflare runtime environment variables
    // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
    const runtimeEnv = locals.runtime?.env;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers, runtimeEnv });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
          status: "error",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
      }),
      { status: 200 }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        status: "error",
      }),
      { status: 500 }
    );
  }
};
