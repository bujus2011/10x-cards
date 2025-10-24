/**
 * Login E2E Tests
 *
 * Tests the authentication flow using the Page Object Model pattern.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe.configure({ mode: 'serial' });

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
    test("should allow filling email and password fields", async () => {
      await loginPage.fillEmail("test@example.com");
      await loginPage.fillPassword("password123");

      await expect(loginPage.emailInput).toHaveValue("test@example.com");
      await expect(loginPage.passwordInput).toHaveValue("password123");
    });

    test("should show submit button as enabled by default", async () => {
      const isDisabled = await loginPage.isSubmitDisabled();
      expect(isDisabled).toBe(false);
    });

    test("should disable submit button while submitting", async () => {
      // Fill form with valid format credentials that will trigger API call
      await loginPage.fillEmail("test@example.com");
      await loginPage.fillPassword("validpassword123");

      // Click submit and wait for the button to become disabled
      await loginPage.clickSubmit();

      // Wait for the button to become disabled (React state update)
      await expect(loginPage.submitButton).toBeDisabled({ timeout: 1000 });
    });
  });

  test.describe("Error Handling", () => {
    test("should show error for invalid credentials", async () => {
      await loginPage.login("invalid@example.com", "wrongpassword");

      // Wait for error message to appear
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });

      // Verify error is detected
      const hasError = await loginPage.hasError();
      expect(hasError).toBe(true);
    });

    // Skip: Backend has strict email validation that rejects test emails
    test.skip("should show error for short password", async () => {
      await loginPage.login("test@example.com", "short");

      // Wait for error message
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });

      const errorText = await loginPage.getErrorText();
      expect(errorText).toContain("Password must be at least 8 characters");
    });

    test("should show error for invalid email format", async () => {
      await loginPage.login("invalid-email", "password123");

      // Wait for error message
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });

      const errorText = await loginPage.getErrorText();
      expect(errorText).toContain("Invalid email");
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
    // This test would require a test user in your database
    test.skip("should successfully log in with valid credentials", async ({ page }) => {
      await loginPage.login("test@example.com", "validpassword123");

      // Should redirect to home page
      await expect(page).toHaveURL("/");
    });
  });
});
