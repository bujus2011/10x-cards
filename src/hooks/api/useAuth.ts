import { useState } from "react";
import type { LoginFormData, RegisterFormData, ResetPasswordFormData } from "@/lib/validations";

interface AuthResponse {
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  status?: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginFormData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result: AuthResponse;
      try {
        result = await response.json();
      } catch {
        return { success: false, error: "Failed to process server response" };
      }

      if (!response.ok || result.status === "error") {
        return { success: false, error: result.error || "An error occurred during login" };
      }

      // Reload the page to update server-side session and go to app home
      window.location.href = "/generate";
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result: AuthResponse = await response.json();

      if (result.status === "error") {
        return { success: false, error: result.error };
      }

      // Reload the page to update server-side session
      window.location.href = "/";
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordFormData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AuthResponse = await response.json();

      if (result.status === "error") {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        return { success: false, error: result.error || "Failed to logout" };
      }

      // Reload the page to update server-side session
      window.location.href = "/auth/login";
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    resetPassword,
    logout,
    isLoading,
  };
}
