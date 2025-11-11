import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { Logger } from "@/lib/logger";

const logger = Logger.forContext("oauthCallback");

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // After Supabase OAuth flow, we lose custom params
  // So we default to /generate for all OAuth logins
  const redirectToParam = "/generate";
  const provider = "oauth"; // Generic since we can't reliably determine provider

  // DEBUG: Log wszystkie parametry URL
  logger.info("OAuth callback received", {
    hasCode: !!code,
    hasError: !!error,
    allParams: Object.fromEntries(requestUrl.searchParams.entries()),
    fullUrl: request.url,
    origin: requestUrl.origin,
    pathname: requestUrl.pathname,
    search: requestUrl.search,
    headers: {
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
    },
  });

  const buildRedirectResponse = (location: string) =>
    new Response(null, {
      status: 302,
      headers: {
        Location: location,
      },
    });

  const buildErrorRedirect = (reason: string) => {
    const fallbackPath = "/auth/login";
    const errorUrl = new URL(fallbackPath, requestUrl.origin);
    errorUrl.searchParams.set("authError", reason);
    errorUrl.searchParams.set("provider", provider);
    if (errorDescription) {
      errorUrl.searchParams.set("message", errorDescription);
    }
    return buildRedirectResponse(errorUrl.toString());
  };

  if (error) {
    logger.warn("OAuth provider returned an error", {
      provider,
      error,
      errorDescription,
    });
    return buildErrorRedirect(error);
  }

  if (!code) {
    logger.warn("OAuth callback received without code parameter", { provider });
    return buildErrorRedirect("missing_code");
  }

  let redirectPath = "/generate";
  if (redirectToParam.startsWith("/")) {
    redirectPath = redirectToParam;
  } else {
    logger.warn("Ignoring non-relative redirectTo parameter", {
      redirectToParam,
      provider,
    });
  }

  // Access Cloudflare runtime environment variables if available
  // @ts-expect-error - runtime.env is available in Cloudflare adapter but not typed
  const runtimeEnv = locals.runtime?.env;

  let supabase;
  try {
    supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      runtimeEnv,
    });
  } catch (clientError) {
    logger.error("Failed to create Supabase server instance for OAuth callback", {
      error: clientError,
      provider,
    });
    return buildErrorRedirect("server_configuration_error");
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    logger.error("Failed to exchange OAuth code for session", {
      provider,
      exchangeError,
    });
    return buildErrorRedirect("session_exchange_failed");
  }

  logger.info("Successfully exchanged OAuth code for session", { provider });
  const finalRedirectUrl = new URL(redirectPath, requestUrl.origin);
  return buildRedirectResponse(finalRedirectUrl.toString());
};
