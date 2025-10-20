import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface ResetPasswordFormProps {
  onSubmit?: (email: string) => void;
  isLoading?: boolean;
}

export function ResetPasswordForm({ isLoading = false }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === "error") {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 text-green-900 text-sm p-4 rounded-md border border-green-200">
          <p className="font-semibold mb-2">Check your email</p>
          <p className="text-sm">
            We've sent a password reset link to your email. Please follow the link in the email to set a new password.
          </p>
          <p className="text-sm mt-3 text-green-800">
            Note: You'll be able to set your new password and confirm it on the next page.
          </p>
        </div>

        <Button
          onClick={() => {
            setSuccess(false);
            setEmail("");
          }}
          variant="outline"
          className="w-full"
        >
          Send another email
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Remember your password? </span>
          <a href="/auth/login" className="text-primary hover:text-primary/90">
            Sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{error}</div>}

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
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
        {isSubmitting ? "Sending instructions..." : "Reset password"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Remember your password? </span>
        <a href="/auth/login" className="text-primary hover:text-primary/90">
          Sign in
        </a>
      </div>
    </form>
  );
}
