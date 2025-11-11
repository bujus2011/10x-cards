import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Github, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/db/supabase.client";
import { Logger } from "@/lib/logger";

type OAuthProvider = "github" | "google";

const logger = Logger.forContext("SocialLoginButtons");

const PROVIDER_CONFIG: Record<
  OAuthProvider,
  {
    label: string;
    icon: ReactNode;
    testId: string;
  }
> = {
  github: {
    label: "Continue with GitHub",
    icon: <Github className="mr-2 h-4 w-4" />,
    testId: "oauth-login-github",
  },
  google: {
    label: "Continue with Google",
    icon: <LogIn className="mr-2 h-4 w-4" />,
    testId: "oauth-login-google",
  },
};

const isBrowser = () => typeof window !== "undefined";

function buildCallbackUrl() {
  if (!isBrowser()) {
    return undefined;
  }

  const origin = window.location.origin;
  // IMPORTANT: Return ONLY base callback URL
  // Supabase will append ?code=XXX automatically after OAuth
  // Additional params like redirectTo are lost in OAuth flow
  const callbackUrl = new URL("/auth/callback", origin);
  return callbackUrl.toString();
}

export function SocialLoginButtons() {
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const disableAll = useMemo(() => activeProvider !== null, [activeProvider]);

  const startOAuthFlow = useCallback(async (provider: OAuthProvider) => {
    setErrorMessage(null);

    if (!isBrowser()) {
      logger.warn("Attempted to start OAuth flow while not in browser environment", { provider });
      setErrorMessage("OAuth login is only available in the browser.");
      return;
    }

    try {
      setActiveProvider(provider);
      const supabase = getSupabaseClient();
      const redirectTo = buildCallbackUrl();

      logger.info("Starting OAuth flow", { provider, redirectTo });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      logger.info("OAuth response", { provider, data, error, hasUrl: !!data?.url });

      if (error) {
        logger.error("Supabase returned an error while starting OAuth flow", error, { provider });
        setErrorMessage("We couldn't connect to the provider. Please try again.");
        setActiveProvider(null);
        return;
      }

      if (!data?.url) {
        logger.error("Supabase did not return a redirect URL", { provider, data });
        setErrorMessage("OAuth configuration error. Please check the console.");
        setActiveProvider(null);
        return;
      }

      logger.info("Redirecting to OAuth provider", { provider, url: data.url });
      // Supabase will redirect the user if successful
    } catch (error) {
      logger.error("Unexpected error while starting OAuth flow", error, { provider });
      setErrorMessage("An unexpected error occurred. Please try again.");
      setActiveProvider(null);
    }
  }, []);

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
      <div className="grid gap-3" aria-live="polite" aria-busy={disableAll}>
        {(Object.keys(PROVIDER_CONFIG) as OAuthProvider[]).map((provider) => {
          const config = PROVIDER_CONFIG[provider];
          const isActive = activeProvider === provider;
          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => startOAuthFlow(provider)}
              disabled={disableAll}
              data-testid={config.testId}
            >
              {isActive ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : config.icon}
              {config.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

