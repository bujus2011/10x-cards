import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  isLoading?: boolean;
}

export function LoginForm({ isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email || !email.includes("@")) {
      setError("Invalid email");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        setError("Failed to process server response");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok || data.status === "error") {
        setError(data.error || "An error occurred during login");
        setIsSubmitting(false);
        return;
      }

      // Reload the page to update server-side session and go to app home
      window.location.href = "/generate";
    } catch {
      setIsSubmitting(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form" noValidate>
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md" data-testid="login-error-message">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="pl-10"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="login-email-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="pl-10"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="login-password-input"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a
            href="/auth/reset-password"
            className="text-primary hover:text-primary/90"
            data-testid="login-forgot-password-link"
          >
            Forgot your password?
          </a>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || isLoading} data-testid="login-submit-button">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don&apos;t have an account? </span>
        <a href="/auth/register" className="text-primary hover:text-primary/90" data-testid="login-register-link">
          Sign up
        </a>
      </div>
    </form>
  );
}
