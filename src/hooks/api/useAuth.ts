import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from "@/lib/validations";
import { Logger } from "@/lib/logger";
import { useApiRequest } from "./useApiRequest";

const authLogger = Logger.forContext("useAuth");

interface AuthResponse {
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  status?: string;
}

export function useAuth() {
  const { request, isLoading } = useApiRequest();

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    const result = await request<AuthResponse>("/api/auth/login", { method: "POST", body: data }, authLogger, {
      email: data.email,
    });

    if (result.error || result.data?.status === "error") {
      return { success: false, error: result.error || result.data?.error || "An error occurred during login" };
    }

    // Reload the page to update server-side session and go to app home
    window.location.href = "/generate";
    return { success: true };
  };

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    const result = await request<AuthResponse>(
      "/api/auth/register",
      {
        method: "POST",
        body: { email: data.email, password: data.password },
      },
      authLogger,
      { email: data.email }
    );

    if (result.error || result.data?.status === "error") {
      return { success: false, error: result.error || result.data?.error };
    }

    // Reload the page to update server-side session
    window.location.href = "/";
    return { success: true };
  };

  const resetPassword = async (data: ResetPasswordFormData): Promise<{ success: boolean; error?: string }> => {
    const result = await request<AuthResponse>("/api/auth/reset-password", { method: "POST", body: data }, authLogger, {
      email: data.email,
    });

    if (result.error || result.data?.status === "error") {
      return { success: false, error: result.error || result.data?.error };
    }

    return { success: true };
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    const result = await request<AuthResponse>("/api/auth/logout", { method: "POST" }, authLogger);

    if (result.error) {
      return { success: false, error: result.error || "Failed to logout" };
    }

    // Reload the page to update server-side session
    window.location.href = "/auth/login";
    return { success: true };
  };

  return {
    login,
    register,
    resetPassword,
    logout,
    isLoading,
  };
}
