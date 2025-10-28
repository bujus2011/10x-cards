import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/api";

interface LoginFormProps {
  isLoading?: boolean;
}

export function LoginForm({ isLoading = false }: LoginFormProps) {
  const { login, isLoading: isAuthLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data);

    if (!result.success && result.error) {
      setError("root", {
        type: "manual",
        message: result.error,
      });
    }
  };

  const isFormLoading = isSubmitting || isAuthLoading || isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="login-form" noValidate>
      {errors.root && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md" data-testid="login-error-message">
          {errors.root.message}
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
            type="email"
            autoComplete="email"
            className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
            placeholder="Enter your email"
            data-testid="login-email-input"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive" data-testid="login-email-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
            placeholder="Enter your password"
            data-testid="login-password-input"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" data-testid="login-password-error">
            {errors.password.message}
          </p>
        )}
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

      <Button type="submit" className="w-full" disabled={isFormLoading} data-testid="login-submit-button">
        {isFormLoading ? "Signing in..." : "Sign in"}
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
