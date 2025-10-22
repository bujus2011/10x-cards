# E2E Testing with Playwright

This directory contains End-to-End (E2E) tests for the 10xCards application using Playwright and the Page Object Model pattern.

## 📁 Directory Structure

```
e2e/
├── auth/                          # Authentication-related tests
│   ├── login.spec.ts              # Login tests
│   └── login-with-helpers.spec.ts # Login tests using helpers
├── fixtures/                      # Test fixtures and data
│   └── test-data.ts              # Shared test data
├── helpers/                       # Test helper functions
│   ├── auth.helpers.ts           # Authentication helpers
│   └── index.ts                  # Helpers index
├── pages/                         # Page Object Models
│   ├── AuthPage.ts               # Base auth page class
│   ├── LoginPage.ts              # Login page POM
│   ├── RegisterPage.ts           # Register page POM
│   ├── ResetPasswordPage.ts      # Reset password POM
│   ├── index.ts                  # Pages index
│   └── README.md                 # POM documentation
├── example.spec.ts                # Example test (template)
└── README.md                      # This file
```

## 🚀 Getting Started

### Environment Setup

Create a `.env.test` file in the `10x-cards/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# E2E Test User Credentials
# These credentials should match a real user in your test database
E2E_USERNAME=test@example.com
E2E_PASSWORD=YourSecurePassword123!

# Base URL for testing (optional)
# Default: http://localhost:4321
# For cloud testing: https://your-app.vercel.app
BASE_URL=http://localhost:4321

# Optional: OpenRouter API Key (for AI features testing)
# OPENROUTER_API_KEY=your_api_key
```

**Important:** Make sure to create a test user in your Supabase database with the credentials specified in `E2E_USERNAME` and `E2E_PASSWORD`.

**📖 For detailed setup instructions, see [ENV_SETUP.md](./ENV_SETUP.md)**

### Running Tests

**Local Testing (requires dev server running):**

```bash
# 1. Start dev server in one terminal
npm run dev

# 2. In another terminal, run tests
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # UI mode (recommended)
npm run test:e2e:headed       # Headed mode
npm run test:e2e:debug        # Debug mode

# Run specific test file
npx playwright test e2e/auth/login.spec.ts
```

**Cloud Testing (against deployed app):**

```bash
# 1. Update .env.test with cloud settings:
#    - BASE_URL=https://your-app.vercel.app
#    - SUPABASE_URL and SUPABASE_KEY for cloud instance
#    - E2E_USERNAME and E2E_PASSWORD (user in cloud DB)

# 2. Run tests (no dev server needed)
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # UI mode
npm run test:e2e:headed       # Watch tests run

# Run specific test
npx playwright test e2e/auth/login-with-helpers.spec.ts --headed
```

### Debugging Tests

```bash
# Run tests in debug mode
npx playwright test --debug

# Open trace viewer
npx playwright show-trace

# Generate test with codegen
npx playwright codegen http://localhost:4321/auth/login
```

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  });

  test("should do something", async ({ page }) => {
    // Test implementation
  });
});
```

### Using Page Object Models

```typescript
import { LoginPage } from "../pages";

test("login test", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Navigate
  await loginPage.goto();

  // Interact
  await loginPage.login("user@example.com", "password");

  // Assert
  await expect(page).toHaveURL("/");
});
```

### Using Test Helpers

```typescript
import { TEST_USERS, loginAsUser, clearAuthData } from "../helpers";

test.beforeEach(async ({ page }) => {
  await clearAuthData(page);
});

test("authenticated test", async ({ page }) => {
  // Login using helper
  await loginAsUser(page, TEST_USERS.valid.email, TEST_USERS.valid.password);

  // Continue with test
});
```

## 🎯 Best Practices

### Test Organization

1. **Group related tests** using `test.describe()`
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests independent** - each test should be able to run in isolation
4. **Use beforeEach/afterEach** for common setup/teardown

### Page Object Model

1. **Use data-testid selectors** as primary locator strategy
2. **Create methods for user actions** (login, fillEmail, etc.)
3. **Keep assertions in tests**, not in Page Objects
4. **Return promises** for async operations
5. **Document complex methods** with JSDoc comments

### Locators

```typescript
// ✅ DO: Use data-testid
page.getByTestId("login-email-input");

// ✅ DO: Use semantic selectors
page.getByRole("button", { name: "Sign in" });
page.getByLabel("Email address");

// ❌ DON'T: Use fragile CSS selectors
page.locator(".form > div:nth-child(2) > input");
```

### Assertions

```typescript
// ✅ DO: Use web-first assertions
await expect(page.getByTestId("error")).toBeVisible();
await expect(page).toHaveURL("/dashboard");

// ❌ DON'T: Use non-async assertions for page state
const isVisible = await element.isVisible();
expect(isVisible).toBe(true); // Use toBeVisible() instead
```

## 🔧 Configuration

Tests are configured in `playwright.config.ts`. Key settings:

- **Base URL**: Configurable via `BASE_URL` env var (default: `http://localhost:4321`)
- **Browser**: Chromium (Desktop Chrome)
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30s per test
- **Trace**: On first retry
- **Environment**: Loads from `.env.test` file

## 📊 Test Data

Test data is organized in:

- `fixtures/test-data.ts` - Shared test data
- `helpers/auth.helpers.ts` - Test user credentials
- `.env.test` - Environment-specific credentials (not in git)

### Test Users

Test users are defined in `helpers/auth.helpers.ts` and loaded from environment variables:

```typescript
TEST_USERS.valid; // Valid credentials from E2E_USERNAME/E2E_PASSWORD
TEST_USERS.invalid; // Invalid credentials for error testing
TEST_USERS.invalidEmail; // Invalid email format
TEST_USERS.shortPassword; // Password too short
```

**Environment Variables:**

- `E2E_USERNAME` - Email of the test user (loaded into `TEST_USERS.valid.email`)
- `E2E_PASSWORD` - Password of the test user (loaded into `TEST_USERS.valid.password`)

**Creating a Test User:**
You need to manually create a test user in your Supabase database with the credentials from `.env.test`:

```sql
-- Example (adjust based on your Supabase setup)
-- This is typically done through Supabase Auth UI or API
```

Or use Supabase Dashboard → Authentication → Users → Add User

## 🧪 Test Scenarios

### Authentication Tests

- ✅ Display login form
- ✅ Login with valid credentials
- ✅ Show error for invalid credentials
- ✅ Show error for invalid email format
- ✅ Show error for short password
- ✅ Navigate to register page
- ✅ Navigate to reset password page
- ✅ Disable button while submitting

## 📚 Resources

### Playwright Documentation

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Project Documentation

- [Page Object Models](./pages/README.md)
- [Playwright Config](../playwright.config.ts)
- [Components with data-testid](../src/components/auth/)

## 🐛 Troubleshooting

### Tests Fail on CI but Pass Locally

- Check if base URL is correct for CI environment
- Ensure test data is available in CI database
- Check for timing issues (increase timeout if needed)

### Element Not Found Errors

- Verify data-testid attribute exists in component
- Check if element is rendered conditionally
- Use `page.pause()` to debug interactively

### Flaky Tests

- Use web-first assertions (`toBeVisible()` instead of `isVisible()`)
- Avoid hardcoded waits (`page.waitForTimeout()`)
- Use `waitForLoadState()` or specific element waits

## 🔄 Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Scheduled daily runs

CI Configuration:

- 2 retries for flaky tests
- Trace collection on failure
- Screenshot on failure
- Video on first retry
