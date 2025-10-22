/**
 * Authentication Test Helpers
 * 
 * Helper functions and utilities for authentication-related E2E tests.
 */

import { type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Test user credentials for E2E testing
 * These should match users in your test database
 * 
 * Valid user credentials are loaded from environment variables:
 * - E2E_USERNAME (email)
 * - E2E_PASSWORD
 */
export const TEST_USERS = {
  valid: {
    email: process.env.E2E_USERNAME || 'test@example.com',
    password: process.env.E2E_PASSWORD || 'ValidPass123!',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'WrongPassword123',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'ValidPass123!',
  },
  shortPassword: {
    email: process.env.E2E_USERNAME || 'test@example.com',
    password: 'short',
  },
} as const;

/**
 * Login helper function for authenticated tests
 * @param page - Playwright page instance
 * @param email - User email (defaults to valid test user)
 * @param password - User password (defaults to valid test user)
 */
export async function loginAsUser(
  page: Page,
  email: string = TEST_USERS.valid.email,
  password: string = TEST_USERS.valid.password
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);

  // Wait for navigation to complete
  await page.waitForURL('/');
}

/**
 * Check if user is logged in by checking for session indicators
 * @param page - Playwright page instance
 * @returns true if user appears to be logged in
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for logout button or user menu (adjust selector based on your app)
    const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
    return await logoutButton.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/**
 * Logout helper function
 * @param page - Playwright page instance
 */
export async function logout(page: Page): Promise<void> {
  const logoutButton = page.getByRole('button', { name: /log out|sign out/i });
  await logoutButton.click();

  // Wait for redirect to login page
  await page.waitForURL('/auth/login');
}

/**
 * Clear all auth-related cookies and storage
 * @param page - Playwright page instance
 * @param options - Options for clearing auth data
 * @param options.clearStorage - Whether to clear localStorage and sessionStorage (default: true)
 */
export async function clearAuthData(
  page: Page,
  options: { clearStorage?: boolean } = {}
): Promise<void> {
  const { clearStorage = true } = options;

  await page.context().clearCookies();

  if (clearStorage) {
    // Only clear storage if page is navigated to a valid origin
    try {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch {
      // If localStorage access fails (e.g., about:blank), navigate to base URL first
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }
}

/**
 * Verify user is on protected page (redirects to login if not authenticated)
 * @param page - Playwright page instance
 * @param protectedPath - Path to protected resource
 */
export async function verifyAuthRequired(page: Page, protectedPath: string): Promise<void> {
  await page.goto(protectedPath);

  // Should redirect to login if not authenticated
  await page.waitForURL('/auth/login');
}

