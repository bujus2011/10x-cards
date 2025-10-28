/**
 * Environment Variables Helper
 *
 * Provides utilities for loading and validating environment variables
 * required for E2E tests from .env.test file.
 *
 * Required Environment Variables:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_KEY: Supabase anonymous key
 * - E2E_USERNAME: Test user email (default: test@example.com)
 * - E2E_PASSWORD: Test user password (default: Test123456!)
 * - E2E_USERNAME_ID: Test user ID (extracted from auth state)
 * - BASE_URL: Application base URL (default: http://localhost:3000)
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
const envPath = path.resolve(process.cwd(), ".env.test");
dotenv.config({ path: envPath });

/**
 * Environment variables interface for type safety
 */
export interface E2EEnvironment {
    supabaseUrl: string;
    supabaseKey: string;
    e2eUsername: string;
    e2ePassword: string;
    e2eUserId: string | undefined;
    baseUrl: string;
}

/**
 * Load and validate environment variables from .env.test
 *
 * @throws Error if required environment variables are missing
 * @returns Object containing all E2E environment variables
 *
 * @example
 * const env = loadE2EEnvironment();
 * const supabase = createClient(env.supabaseUrl, env.supabaseKey);
 */
export function loadE2EEnvironment(): E2EEnvironment {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const e2eUsername = process.env.E2E_USERNAME || "test@example.com";
    const e2ePassword = process.env.E2E_PASSWORD || "Test123456!";
    const e2eUserId = process.env.E2E_USERNAME_ID;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    return {
        supabaseUrl: supabaseUrl || "",
        supabaseKey: supabaseKey || "",
        e2eUsername,
        e2ePassword,
        e2eUserId,
        baseUrl,
    };
}

/**
 * Validate that all required environment variables are present
 *
 * @param env Environment variables to validate
 * @throws Error if required variables are missing
 *
 * @example
 * const env = loadE2EEnvironment();
 * validateE2EEnvironment(env);
 */
export function validateE2EEnvironment(env: E2EEnvironment): void {
    const missing: string[] = [];

    if (!env.supabaseUrl) missing.push("SUPABASE_URL");
    if (!env.supabaseKey) missing.push("SUPABASE_KEY");
    if (!env.e2eUsername) missing.push("E2E_USERNAME");
    if (!env.e2ePassword) missing.push("E2E_PASSWORD");

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}\n` +
            "Please create a .env.test file with the required variables.",
        );
    }
}

/**
 * Get environment variable with fallback
 *
 * @param key Environment variable key
 * @param fallback Default value if not set
 * @returns Environment variable value or fallback
 */
export function getEnvVariable(key: string, fallback = ""): string {
    return process.env[key] || fallback;
}

/**
 * Check if a specific environment variable is set
 *
 * @param key Environment variable key
 * @returns true if variable is set and not empty
 */
export function isEnvVariableSet(key: string): boolean {
    return !!process.env[key];
}
