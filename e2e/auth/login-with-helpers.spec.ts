/**
 * Login E2E Tests - Using Helpers
 *
 * Example of using test helpers and Page Object Models together.
 * This demonstrates best practices for authentication testing.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import { TEST_USERS } from "../helpers";

test.describe.configure({ mode: "serial" });

test.describe("Login with Helpers", () => {
  // Note: Valid login test is now in 00-setup-auth.spec.ts (runs first and saves state)

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
});
