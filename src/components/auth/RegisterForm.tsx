import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/api";

interface RegisterFormProps {
  isLoading?: boolean;
}

export function RegisterForm({ isLoading = false }: RegisterFormProps) {
  const { register: registerUser, isLoading: isAuthLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data);

    if (!result.success && result.error) {
      setError("root", {
        type: "manual",
        message: result.error,
      });
    }
  };

  const isFormLoading = isSubmitting || isAuthLoading || isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">{errors.root.message}</div>
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
            className={cn("pl-10", errors.email && "border-destructive")}
            placeholder="Enter your email"
            data-testid="register-email-input"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive" data-testid="register-email-error">
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
            autoComplete="new-password"
            className={cn("pl-10", errors.password && "border-destructive")}
            placeholder="Enter your password"
            data-testid="register-password-input"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" data-testid="register-password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={cn("pl-10", errors.confirmPassword && "border-destructive")}
            placeholder="Confirm your password"
            data-testid="register-confirm-password-input"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive" data-testid="register-confirm-password-error">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isFormLoading} data-testid="register-submit-button">
        {isFormLoading ? "Creating account..." : "Create account"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <a href="/auth/login" className="text-primary hover:text-primary/90">
          Sign in
        </a>
      </div>
    </form>
  );
}
