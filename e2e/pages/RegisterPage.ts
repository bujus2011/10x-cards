/**
 * Register Page Object Model
 * 
 * Encapsulates the registration page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { AuthPage } from './AuthPage';

export class RegisterPage extends AuthPage {
  // Form elements (to be added when register form gets data-testid attributes)
  readonly registerForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  
  // Error and feedback
  readonly errorMessage: Locator;
  
  // Navigation links
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form locators - placeholder selectors (update when data-testid attributes are added)
    this.registerForm = page.locator('form');
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole('button', { name: /sign up|register/i });
    
    // Error locators
    this.errorMessage = page.locator('[role="alert"]').first();
    
    // Navigation locators
    this.loginLink = page.getByRole('link', { name: /sign in|log in/i });
  }

  /**
   * Navigate to the register page
   */
  async goto() {
    await this.page.goto('/auth/register');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the register page to be fully loaded
   */
  async waitForPageLoad() {
    await super.waitForPageLoad();
    await expect(this.registerForm).toBeVisible();
  }

  /**
   * Perform registration with email and password
   * @param email - User email address
   * @param password - User password
   * @param confirmPassword - Password confirmation
   */
  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
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
   * Fill only the password field
   * @param password - User password
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill only the confirm password field
   * @param confirmPassword - Password confirmation
   */
  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInput.fill(confirmPassword);
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
   * Check if all form elements are visible
   */
  async isFormVisible(): Promise<boolean> {
    return (
      (await this.emailInput.isVisible()) &&
      (await this.passwordInput.isVisible()) &&
      (await this.submitButton.isVisible())
    );
  }
}

