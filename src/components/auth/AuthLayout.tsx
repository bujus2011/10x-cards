import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      data-testid="auth-layout"
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900" data-testid="auth-title">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-muted-foreground" data-testid="auth-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10" data-testid="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
}
