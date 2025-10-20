import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { email, password } = registerSchema.parse(body);

        const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

        const { data, error } = await supabase.auth.signUp({
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

        // Check if email confirmation is required
        const emailConfirmationRequired = !data.session;

        return new Response(
            JSON.stringify({
                user: data.user,
                status: "success",
                emailConfirmationRequired,
                message: emailConfirmationRequired
                    ? "Please check your email to confirm your account"
                    : "Account created successfully",
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
