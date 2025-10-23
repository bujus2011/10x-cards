/**
 * Base Auth Page Object Model
 *
 * Base class for all authentication pages (login, register, reset password).
 * Contains common elements and methods shared across auth pages.
 */

import { type Page, type Locator, expect } from "@playwright/test";

export abstract class AuthPage {
  readonly page: Page;

  // Common layout elements
  readonly authLayout: Locator;
  readonly authTitle: Locator;
  readonly authSubtitle: Locator;
  readonly authContent: Locator;

  constructor(page: Page) {
    this.page = page;

    // Common locators for all auth pages
    this.authLayout = page.getByTestId("auth-layout");
    this.authTitle = page.getByTestId("auth-title");
    this.authSubtitle = page.getByTestId("auth-subtitle");
    this.authContent = page.getByTestId("auth-content");
  }

  /**
   * Navigate to the specific auth page (implemented by subclasses)
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the auth page to be fully loaded
   */
  async waitForPageLoad() {
    await expect(this.authLayout).toBeVisible();
    await expect(this.authTitle).toBeVisible();
  }

  /**
   * Verify page title and subtitle
   * @param title - Expected title text
   * @param subtitle - Expected subtitle text (optional)
   */
  async verifyPageContent(title: string, subtitle?: string) {
    await expect(this.authTitle).toHaveText(title);
    if (subtitle) {
      await expect(this.authSubtitle).toHaveText(subtitle);
    }
  }

  /**
   * Check if auth layout is visible
   */
  async isLayoutVisible(): Promise<boolean> {
    return await this.authLayout.isVisible();
  }
}
