import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/api";

interface ResetPasswordFormProps {
  isLoading?: boolean;
}

export function ResetPasswordForm({ isLoading = false }: ResetPasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading: isAuthLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const result = await resetPassword(data);
    
    if (result.success) {
      setSuccess(true);
      reset();
    } else if (result.error) {
      setError("root", {
        type: "manual",
        message: result.error,
      });
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
            reset();
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

  const isFormLoading = isSubmitting || isAuthLoading || isLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
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
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isFormLoading}>
        {isFormLoading ? "Sending instructions..." : "Reset password"}
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
