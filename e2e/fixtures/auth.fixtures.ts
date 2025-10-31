/**
 * Authentication Fixtures
 *
 * Custom Playwright fixtures for handling authentication state in tests.
 * These fixtures ensure clean state between tests without localStorage errors.
 */

import { test as base } from "@playwright/test";

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend({
  /**
   * Provides a page with cleared authentication state
   * This fixture automatically clears cookies before each test
   */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  authenticatedPage: async ({ page, context }, use) => {
    // Clear cookies before test
    await context.clearCookies();

    // Provide the page to the test
    await use(page);

    // Cleanup after test (optional)
    await context.clearCookies();
  },
});

export { expect } from "@playwright/test";
