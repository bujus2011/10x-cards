import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { email } = resetPasswordSchema.parse(body);

        const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

        // Send password reset link to user's email
        // Supabase will handle sending the email with reset link
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${new URL(request.url).origin}/auth/reset-password-confirm`,
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
                status: "success",
                message: "Password reset link has been sent to your email",
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
