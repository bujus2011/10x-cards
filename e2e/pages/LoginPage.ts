/**
 * Login Page Object Model
 *
 * Encapsulates the login page structure and interactions.
 * Uses data-testid selectors for resilient element selection.
 */

import { type Page, type Locator, expect } from "@playwright/test";
import { AuthPage } from "./AuthPage";

export class LoginPage extends AuthPage {
  // Form elements
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  // Error and feedback
  readonly errorMessage: Locator;

  // Navigation links
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);

    // Form locators
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");

    // Error locators
    this.errorMessage = page.getByTestId("login-error-message");

    // Navigation locators
    this.forgotPasswordLink = page.getByTestId("login-forgot-password-link");
    this.registerLink = page.getByTestId("login-register-link");
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto("/auth/login");
    await this.waitForPageLoad();
  }

  /**
   * Wait for the login page to be fully loaded
   */
  async waitForPageLoad() {
    await super.waitForPageLoad();
    await expect(this.loginForm).toBeVisible();
  }

  /**
   * Perform login with email and password
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string) {
    // Fill email and ensure it's committed to the DOM
    await this.emailInput.click();
    await this.emailInput.fill(email);

    // Wait and verify the value persists - retry mechanism for high server load
    for (let i = 0; i < 3; i++) {
      await this.page.waitForTimeout(300);
      const currentValue = await this.emailInput.inputValue();
      if (currentValue === email) break;
      if (i < 2) await this.emailInput.fill(email); // Retry if needed
    }
    await expect(this.emailInput).toHaveValue(email);

    // Fill password and ensure it's committed to the DOM
    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    // Wait and verify the value persists
    for (let i = 0; i < 3; i++) {
      await this.page.waitForTimeout(300);
      const currentValue = await this.passwordInput.inputValue();
      if (currentValue === password) break;
      if (i < 2) await this.passwordInput.fill(password); // Retry if needed
    }
    await expect(this.passwordInput).toHaveValue(password);

    // Blur the last input to trigger any pending React state updates
    await this.passwordInput.blur();

    // Final wait for React to process onChange events and update state
    await this.page.waitForTimeout(500);

    await this.submitButton.click();
  }

  /**
   * Fill only the email field
   * @param email - User email address
   */
  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);

    // Wait and verify the value persists - retry mechanism
    for (let i = 0; i < 3; i++) {
      await this.page.waitForTimeout(250);
      const currentValue = await this.emailInput.inputValue();
      if (currentValue === email) break;
      if (i < 2) await this.emailInput.fill(email);
    }
    await expect(this.emailInput).toHaveValue(email);
  }

  /**
   * Fill only the password field
   * @param password - User password
   */
  async fillPassword(password: string) {
    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    // Wait and verify the value persists - retry mechanism
    for (let i = 0; i < 3; i++) {
      await this.page.waitForTimeout(250);
      const currentValue = await this.passwordInput.inputValue();
      if (currentValue === password) break;
      if (i < 2) await this.passwordInput.fill(password);
    }
    await expect(this.passwordInput).toHaveValue(password);
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
    return await this.errorMessage.isVisible();
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Navigate to register page
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if the form is in submitting state
   */
  async isSubmitting(): Promise<boolean> {
    const text = await this.submitButton.textContent();
    return text?.includes("Signing in...") ?? false;
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
