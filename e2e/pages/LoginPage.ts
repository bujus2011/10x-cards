/**
 * Login Page Object Model
 * 
 * This is an example of the Page Object Model pattern for Playwright.
 * It encapsulates the login page structure and interactions.
 */

import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByLabel(/email/i);
        this.passwordInput = page.getByLabel(/password/i);
        this.submitButton = page.getByRole('button', { name: /log in|sign in/i });
        this.errorMessage = page.getByRole('alert');
    }

    async goto() {
        await this.page.goto('/auth/login');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async getErrorText() {
        return await this.errorMessage.textContent();
    }

    async isVisible() {
        return await this.emailInput.isVisible();
    }
}

