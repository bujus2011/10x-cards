/**
 * Authentication Setup Test
 *
 * IMPORTANT: This test MUST run FIRST in the auth test suite.
 * It authenticates and saves the session state to .auth/user.json
 * for all subsequent tests that require authentication.
 *
 * The 00- prefix ensures this file runs first alphabetically.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import { TEST_USERS } from "../helpers";

test.describe("Setup - Authentication State", () => {
  test("authenticate and save state", async ({ page, context }) => {
    // Increase timeout for this critical setup test
    test.setTimeout(60000);

    // Clear cookies to ensure clean state
    await context.clearCookies();

    // Clear any existing auth state file
    const fs = await import("fs/promises");
    const authFile = ".auth/user.json";
    try {
      await fs.writeFile(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    } catch {
      // File might not exist yet, that's ok
    }

    // Navigate to login page
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify we're on the login page
    await loginPage.verifyPageContent("Welcome back", "Sign in to your account to continue");

    // Login with valid test user credentials
    await loginPage.login(TEST_USERS.valid.email, TEST_USERS.valid.password);

    // Wait for successful authentication and redirect to /generate
    // The LoginForm component redirects to /generate on successful login
    // We need to wait for both the API response AND the page navigation
    await page.waitForURL("/generate", { timeout: 60000, waitUntil: "networkidle" });

    // Verify we're authenticated by checking we're on the generate page
    await expect(page).toHaveURL("/generate");

    // Save the authenticated state to file
    await context.storageState({ path: authFile });

    console.log("✓ Authentication state saved successfully to", authFile);
  });
});
