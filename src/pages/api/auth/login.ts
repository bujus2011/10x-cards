import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";
import { jsonResponseWithoutHeaders, handleAuthError } from "@/lib/api-response";

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
      return jsonResponseWithoutHeaders(
        {
          error: error.message,
          status: "error",
        },
        400
      );
    }

    return jsonResponseWithoutHeaders(
      {
        user: data.user,
        status: "success",
      },
      200
    );
  } catch (err) {
    return handleAuthError(err);
  }
};
