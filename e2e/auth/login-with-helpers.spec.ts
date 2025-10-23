/**
 * Login E2E Tests - Using Helpers
 * 
 * Example of using test helpers and Page Object Models together.
 * This demonstrates best practices for authentication testing.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { TEST_USERS } from '../helpers';

test.describe('Login with Helpers', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies at context level (more reliable)
    await context.clearCookies();
  });

  test('should login with valid test user credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user from helpers
    await loginPage.login(TEST_USERS.valid.email, TEST_USERS.valid.password);

    // Wait for navigation to complete after successful login
    // Note: Home page redirects to /generate for authenticated users
    await page.waitForURL('/generate');

    // Verify we're on the main app page
    await expect(page).toHaveURL('/generate');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use invalid test user from helpers
    await loginPage.login(TEST_USERS.invalid.email, TEST_USERS.invalid.password);

    // Verify error appears
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user with invalid email format
    await loginPage.login(TEST_USERS.invalidEmail.email, TEST_USERS.invalidEmail.password);

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Invalid email');
  });

  test('should show error for short password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Use test user with short password
    await loginPage.login(TEST_USERS.shortPassword.email, TEST_USERS.shortPassword.password);

    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('Password must be at least 8 characters');
  });
});

