import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const resetPasswordConfirmSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().min(1, "Reset token is required"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const body = await request.json();
    const { password, token } = resetPasswordConfirmSchema.parse(body);

    // Access Cloudflare runtime environment variables
    // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
    const runtimeEnv = locals.runtime?.env;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers, runtimeEnv });

    // First, verify the token and get the user session
    // In Supabase, the token from email is used to create a session via verifyOtp
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired reset token. Please request a new password reset.",
          status: "error",
        }),
        { status: 400 }
      );
    }

    // Now update the user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      return new Response(
        JSON.stringify({
          error: updateError.message,
          status: "error",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Password has been reset successfully",
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
