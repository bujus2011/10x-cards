/**
 * Reset Password Page Object Model
 * 
 * Encapsulates the reset password page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { AuthPage } from './AuthPage';

export class ResetPasswordPage extends AuthPage {
  // Form elements (to be added when reset password form gets data-testid attributes)
  readonly resetPasswordForm: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  
  // Error and feedback
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  
  // Navigation links
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form locators - placeholder selectors (update when data-testid attributes are added)
    this.resetPasswordForm = page.locator('form');
    this.emailInput = page.getByLabel(/email/i);
    this.submitButton = page.getByRole('button', { name: /reset|send/i });
    
    // Error and success locators
    this.errorMessage = page.locator('[role="alert"]').first();
    this.successMessage = page.locator('.success-message, [role="status"]').first();
    
    // Navigation locators
    this.loginLink = page.getByRole('link', { name: /back to login|sign in/i });
  }

  /**
   * Navigate to the reset password page
   */
  async goto() {
    await this.page.goto('/auth/reset-password');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the reset password page to be fully loaded
   */
  async waitForPageLoad() {
    await super.waitForPageLoad();
    await expect(this.resetPasswordForm).toBeVisible();
  }

  /**
   * Request password reset for email
   * @param email - User email address
   */
  async requestReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Fill only the email field
   * @param email - User email address
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Click the submit button
   */
  async clickSubmit() {
    await this.submitButton.click();
  }

  /**
   * Get error message text
   * @returns Error message text or null if not visible
   */
  async getErrorText(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Get success message text
   * @returns Success message text or null if not visible
   */
  async getSuccessText(): Promise<string | null> {
    if (await this.successMessage.isVisible()) {
      return await this.successMessage.textContent();
    }
    return null;
  }

  /**
   * Check if error message is visible
   */
  async hasError(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if success message is visible
   */
  async hasSuccess(): Promise<boolean> {
    try {
      return await this.successMessage.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.loginLink.click();
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if form is visible
   */
  async isFormVisible(): Promise<boolean> {
    return (
      (await this.emailInput.isVisible()) &&
      (await this.submitButton.isVisible())
    );
  }
}

