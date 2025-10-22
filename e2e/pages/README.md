# Page Object Model (POM) - E2E Testing

This directory contains Page Object Models for E2E testing with Playwright. The POM pattern encapsulates page structure and interactions, making tests more maintainable and readable.

## 📁 Structure

```
e2e/pages/
├── index.ts                  # Central export file
├── AuthPage.ts              # Base class for auth pages
├── LoginPage.ts             # Login page POM
├── RegisterPage.ts          # Register page POM
├── ResetPasswordPage.ts     # Reset password page POM
└── README.md                # This file
```

## 🎯 Design Principles

### 1. **Inheritance Hierarchy**
- `AuthPage` - Base class for all authentication pages
  - `LoginPage` - Extends AuthPage
  - `RegisterPage` - Extends AuthPage
  - `ResetPasswordPage` - Extends AuthPage

### 2. **Locator Strategy**
All pages use `data-testid` attributes for resilient element selection:
- `page.getByTestId('element-name')` - Primary strategy
- Semantic selectors as fallback for elements without data-testid

### 3. **Method Organization**

#### Navigation Methods
```typescript
async goto(): Promise<void>
async waitForPageLoad(): Promise<void>
```

#### Interaction Methods
```typescript
async fillEmail(email: string): Promise<void>
async fillPassword(password: string): Promise<void>
async clickSubmit(): Promise<void>
```

#### Assertion Helpers
```typescript
async hasError(): Promise<boolean>
async getErrorText(): Promise<string | null>
async isFormVisible(): Promise<boolean>
```

#### Complex Actions
```typescript
async login(email: string, password: string): Promise<void>
async register(email: string, password: string): Promise<void>
```

## 📚 Usage Examples

### Basic Usage

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Navigate to page
  await loginPage.goto();
  
  // Perform login
  await loginPage.login('user@example.com', 'password123');
  
  // Verify redirect
  await expect(page).toHaveURL('/');
});
```

### Using Individual Methods

```typescript
test('verify error message', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Fill fields individually
  await loginPage.fillEmail('invalid@example.com');
  await loginPage.fillPassword('wrong');
  await loginPage.clickSubmit();
  
  // Check for error
  await expect(loginPage.errorMessage).toBeVisible();
  const errorText = await loginPage.getErrorText();
  expect(errorText).toContain('Invalid');
});
```

### Using Shared Methods from AuthPage

```typescript
test('verify page content', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Method inherited from AuthPage
  await loginPage.verifyPageContent('Welcome back', 'Sign in to your account');
  
  // Check layout visibility
  const isVisible = await loginPage.isLayoutVisible();
  expect(isVisible).toBe(true);
});
```

### Testing Navigation

```typescript
test('navigate to register page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.goToRegister();
  await expect(page).toHaveURL('/auth/register');
});
```

## 🔧 Adding New Pages

### 1. Create New Page Class

```typescript
// e2e/pages/NewPage.ts
import { type Page, type Locator } from '@playwright/test';

export class NewPage {
  readonly page: Page;
  readonly someElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.someElement = page.getByTestId('some-element');
  }

  async goto() {
    await this.page.goto('/some-path');
  }

  async doSomething() {
    await this.someElement.click();
  }
}
```

### 2. Export from Index

```typescript
// e2e/pages/index.ts
export { NewPage } from './NewPage';
```

### 3. Use in Tests

```typescript
import { NewPage } from '../pages/NewPage';

test('new page test', async ({ page }) => {
  const newPage = new NewPage(page);
  await newPage.goto();
  await newPage.doSomething();
});
```

## 🎨 Best Practices

### ✅ DO

- Use `data-testid` for all interactive elements
- Keep methods focused and single-purpose
- Use descriptive method names (`login` not `submit`)
- Return promises for async operations
- Add JSDoc comments for complex methods
- Group related locators together

### ❌ DON'T

- Include assertions in Page Objects (use in tests)
- Make Page Objects aware of other pages
- Use complex selectors (CSS/XPath) as primary strategy
- Create god objects with too many responsibilities
- Duplicate methods across pages (use inheritance)

## 📖 Reference

### AuthPage (Base Class)

**Locators:**
- `authLayout` - Main auth container
- `authTitle` - Page title
- `authSubtitle` - Page subtitle
- `authContent` - Content wrapper

**Methods:**
- `goto()` - Navigate to page (abstract)
- `waitForPageLoad()` - Wait for page to load
- `verifyPageContent(title, subtitle?)` - Verify title/subtitle
- `isLayoutVisible()` - Check layout visibility

### LoginPage

**Locators:**
- All from `AuthPage`
- `loginForm` - Form element
- `emailInput` - Email input field
- `passwordInput` - Password input field
- `submitButton` - Submit button
- `errorMessage` - Error message container
- `forgotPasswordLink` - Forgot password link
- `registerLink` - Register link

**Methods:**
- All from `AuthPage`
- `login(email, password)` - Complete login flow
- `fillEmail(email)` - Fill email field
- `fillPassword(password)` - Fill password field
- `clickSubmit()` - Click submit button
- `getErrorText()` - Get error message text
- `hasError()` - Check if error is visible
- `goToForgotPassword()` - Navigate to reset password
- `goToRegister()` - Navigate to register
- `isSubmitDisabled()` - Check if button is disabled
- `isSubmitting()` - Check if form is submitting
- `isFormVisible()` - Check if form is visible

### RegisterPage & ResetPasswordPage

See individual class files for full method documentation.

## 🔗 Related Files

- `/10x-cards/src/components/auth/` - React components
- `/10x-cards/e2e/auth/` - E2E test specs
- `/10x-cards/playwright.config.ts` - Playwright configuration

