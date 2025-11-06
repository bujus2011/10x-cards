import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Access Cloudflare runtime environment variables
    // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
    const runtimeEnv = locals.runtime?.env;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers, runtimeEnv });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
        user: data.user,
        status: "success",
      }),
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: err.errors[0].message,
          status: "error",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        status: "error",
      }),
      { status: 500 }
    );
  }
};
