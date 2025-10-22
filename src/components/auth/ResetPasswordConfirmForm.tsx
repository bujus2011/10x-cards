import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle } from "lucide-react";

interface ResetPasswordConfirmFormProps {
  isLoading?: boolean;
}

export function ResetPasswordConfirmForm({ isLoading = false }: ResetPasswordConfirmFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token") || params.get("token_hash");
    if (!resetToken) {
      setError("Invalid password reset link. Please request a new one.");
    } else {
      setToken(resetToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, token }),
      });

      const data = await response.json();

      if (data.status === "error") {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md border border-destructive/30">
          <p className="font-semibold mb-2">Invalid Reset Link</p>
          <p className="text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
        </div>

        <a href="/auth/reset-password" className="block">
          <Button className="w-full" data-testid="reset-password-confirm-request-new-link-button">Request New Reset Link</Button>
        </a>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Remember your password? </span>
          <a href="/auth/login" className="text-primary hover:text-primary/90">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 text-green-900 text-sm p-4 rounded-md border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5" />
            <p className="font-semibold">Password Reset Successfully</p>
          </div>
          <p className="text-sm">
            Your password has been reset successfully. You'll be redirected to the login page in a moment.
          </p>
        </div>

        <a href="/auth/login" className="block">
          <Button className="w-full" data-testid="reset-password-confirm-go-to-login-button">Go to Login</Button>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="pl-10"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            data-testid="reset-password-confirm-password-input"
          />
        </div>
        <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="pl-10"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            data-testid="reset-password-confirm-confirm-password-input"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Remember your password? </span>
        <a
          href="/auth/login"
          className="text-primary hover:text-primary/90"
          data-testid="reset-password-confirm-sign-in-link"
        >
          Sign in
        </a>
      </div>
    </form>
  );
}
