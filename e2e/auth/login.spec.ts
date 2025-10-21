/**
 * Login E2E Tests
 * 
 * Tests the authentication flow using the Page Object Model pattern.
 * This is an example - adjust based on your actual implementation.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should display login form', async () => {
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
    });

    test('should show validation error for empty fields', async () => {
        await loginPage.submitButton.click();

        // Wait for validation to trigger
        await loginPage.page.waitForTimeout(500);

        // Check if HTML5 validation or custom validation appears
        // Adjust based on your actual validation implementation
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await loginPage.login('invalid@example.com', 'wrongpassword');

        // Wait for API response
        await page.waitForTimeout(1000);

        // Check for error message (adjust based on your implementation)
        // Example: await expect(loginPage.errorMessage).toBeVisible();
    });

    // This test would require a test user in your database
    test.skip('should successfully log in with valid credentials', async ({ page }) => {
        await loginPage.login('test@example.com', 'validpassword');

        // Should redirect to dashboard or home page
        await expect(page).toHaveURL(/\/generate|\/dashboard/);
    });
});

