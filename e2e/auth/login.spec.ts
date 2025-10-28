/**
 * Login E2E Tests
 *
 * Tests the authentication flow using the Page Object Model pattern.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { TEST_USERS } from "../helpers";

test.describe.configure({ mode: "serial" });

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe("Page Layout", () => {
    test("should display auth layout with correct title and subtitle", async () => {
      await loginPage.verifyPageContent("Welcome back", "Sign in to your account to continue");
      await expect(loginPage.authLayout).toBeVisible();
    });

    test("should display all login form elements", async () => {
      await expect(loginPage.loginForm).toBeVisible();
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test("should display navigation links", async () => {
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.registerLink).toBeVisible();
    });
  });

  test.describe("Form Interactions", () => {
    test("should allow filling email and password fields", async ({ page }) => {
      await loginPage.fillEmail("test@example.com");
      await loginPage.fillPassword("password123");

      // The fillEmail and fillPassword methods already verify values are set correctly
      // This test verifies the form interaction methods work correctly
    });

    test("should show submit button as enabled by default", async () => {
      const isDisabled = await loginPage.isSubmitDisabled();
      expect(isDisabled).toBe(false);
    });

    // Skip: This test is too timing-sensitive and can be flaky
    // The behavior is tested in integration tests
    test.skip("should disable submit button while submitting", async ({ page }) => {
      // Fill form with valid format credentials that will trigger API call
      await loginPage.fillEmail("test@example.com");
      await loginPage.fillPassword("validpassword123");

      // Click submit button
      await loginPage.clickSubmit();

      // Button should show "Signing in..." or be disabled
      await expect(loginPage.submitButton).toHaveText(/Signing in\.\.\./, { timeout: 2000 });
    });
  });

  test.describe("Error Handling", () => {
    test("should show error for invalid credentials", async () => {
      await loginPage.login("invalid@example.com", "wrongpassword");

      // Wait for error message to appear - increased timeout for React 19 state propagation
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });

      // Verify error is detected
      const hasError = await loginPage.hasError();
      expect(hasError).toBe(true);
    });

    // Skip: Backend has strict email validation that rejects test emails
    test.skip("should show error for short password", async () => {
      await loginPage.login("test@example.com", "short");

      // Wait for error message - increased timeout for React 19 state propagation
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });

      const errorText = await loginPage.getErrorText();
      expect(errorText).toContain("Password must be at least 8 characters");
    });

    test("should show error for invalid email format", async () => {
      await loginPage.login("invalid-email", "password123");

      // Field-level validation error should appear for invalid email
      const hasEmailError = await loginPage.hasFieldError("email");
      expect(hasEmailError).toBe(true);

      const errorText = await loginPage.getFieldErrorText("email");
      expect(errorText).toContain("valid email");
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to register page when clicking sign up link", async ({ page }) => {
      await loginPage.goToRegister();
      await expect(page).toHaveURL("/auth/register");
    });

    test("should navigate to reset password page when clicking forgot password link", async ({ page }) => {
      await loginPage.goToForgotPassword();
      await expect(page).toHaveURL("/auth/reset-password");
    });
  });

  test.describe("Successful Login", () => {
    // This test uses the test user created in 00-setup-auth.spec.ts
    test("should successfully log in with valid credentials", async ({ page }) => {
      // Use the actual test user credentials from environment
      await loginPage.login(TEST_USERS.valid.email, TEST_USERS.valid.password);

      // Should redirect to /generate page after successful login
      await expect(page).toHaveURL("/generate", { timeout: 10000 });

      // Verify we're actually logged in by checking page content
      await expect(page.getByTestId("generate-button")).toBeVisible();
    });
  });
});
