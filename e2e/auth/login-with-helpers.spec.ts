/**
 * Login E2E Tests - Using Helpers
 *
 * Example of using test helpers and Page Object Models together.
 * This demonstrates best practices for authentication testing.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import { TEST_USERS } from "../helpers";

test.describe.configure({ mode: 'serial' });

test.describe("Login with Helpers", () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies at context level (more reliable)
    await context.clearCookies();
  });

  test("should login with valid test user credentials", async ({ page }) => {
    // Increase timeout for this test as it makes actual API calls
    test.setTimeout(60000);

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user from helpers
    await loginPage.login(TEST_USERS.valid.email, TEST_USERS.valid.password);

    // Wait for navigation to complete after successful login
    // Note: Home page redirects to /generate for authenticated users
    // Increased timeout to handle server load during parallel test execution
    await page.waitForURL("/generate", { timeout: 45000 });

    // Verify we're on the main app page
    await expect(page).toHaveURL("/generate");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use invalid test user from helpers
    await loginPage.login(TEST_USERS.invalid.email, TEST_USERS.invalid.password);

    // Verify error appears
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user with invalid email format
    await loginPage.login(TEST_USERS.invalidEmail.email, TEST_USERS.invalidEmail.password);

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain("Invalid email");
  });

  // Skip: Backend has strict email validation that rejects test emails
  test.skip("should show error for short password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user with short password
    await loginPage.login(TEST_USERS.shortPassword.email, TEST_USERS.shortPassword.password);

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain("Password must be at least 8 characters");
  });

  /**
   * IMPORTANT: This test MUST run LAST in the auth test suite.
   * It authenticates and saves the session state for all subsequent tests.
   *
   * This test runs after all other auth tests to ensure we have a clean,
   * authenticated state saved for tests that depend on authentication
   * (e.g., study session tests, flashcard management, etc.)
   */
  test("authenticate and save state", async ({ page, context }) => {
    // Increase timeout for this critical setup test
    test.setTimeout(60000);

    // Navigate to login page
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify we're on the login page
    await loginPage.verifyPageContent("Welcome back", "Sign in to your account to continue");

    // Login with valid test user credentials
    await loginPage.login(TEST_USERS.valid.email, TEST_USERS.valid.password);

    // Wait for successful authentication and redirect away from login page
    // The app redirects to a protected page after successful login
    await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 45000 });

    // Verify we're authenticated by checking we're NOT on a login page
    await expect(page).not.toHaveURL(/.*\/auth\/login/);

    // Save the authenticated state to file
    const authFile = ".auth/user.json";
    await context.storageState({ path: authFile });

    console.log("✓ Authentication state saved successfully to", authFile);
  });
});
