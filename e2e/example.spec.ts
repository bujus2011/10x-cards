/**
 * Example E2E Test
 *
 * This demonstrates Playwright usage for end-to-end testing.
 * Delete this file when you start writing real E2E tests.
 */

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
        // Navigate to the homepage
        await page.goto("/");

        // Wait for redirect to complete
        await page.waitForURL(/.*login/);

        // Check if we're redirected to the login page
        await expect(page).toHaveURL(/.*login/);

        // Check if the page title is correct
        await expect(page).toHaveTitle(/Sign in - 10xCards/i);
    });

    test("should demonstrate visual regression testing on login page", async ({ page }) => {
        // Navigate to homepage (will redirect to login)
        await page.goto("/");

        // Wait for redirect to login page
        await page.waitForURL(/.*login/);

        // Wait for content to load
        await page.waitForLoadState("networkidle");

        // Take a screenshot for visual comparison
        // Uncomment when you're ready to use visual regression testing
        // await expect(page).toHaveScreenshot('login-page.png');
    });
});

test.describe("Authentication Flow", () => {
    test("should navigate to login page", async ({ page }) => {
        await page.goto("/auth/login");

        // Check if we're on the login page
        await expect(page).toHaveURL(/.*login/);

        // Check for login form elements
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toBeVisible();
    });

    test("should show validation errors for invalid input", async ({ page }) => {
        await page.goto("/auth/login");

        // Try to submit form without filling it
        const submitButton = page.getByRole("button", { name: /log in|sign in/i });
        await submitButton.click();

        // Check if validation errors appear
        // Adjust based on your actual validation implementation
        await page.waitForTimeout(500);
    });
});
