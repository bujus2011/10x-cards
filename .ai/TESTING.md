# Testing Guide

This document provides comprehensive guidance for testing the 10xCards application.

## Table of Contents

- [Overview](#overview)
- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)

## Overview

This project uses two complementary testing frameworks:

- **Vitest** - Fast unit testing framework for components and utilities
- **Playwright** - End-to-end testing framework for user flows

## Unit Testing with Vitest

### Configuration

Vitest is configured in `vitest.config.ts` with:

- jsdom environment for DOM testing
- React Testing Library integration
- Path aliases matching the main project
- Coverage reporting with v8

### Test Location

Place unit tests in one of these locations:

- `src/tests/` - General unit tests
- `src/components/__tests__/` - Component tests (next to the component)
- `src/lib/__tests__/` - Service/utility tests

### Writing Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    const element = screen.getByRole('button');
    expect(element).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockFn = vi.fn();
    const { user } = render(<MyComponent onClick={mockFn} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockFn).toHaveBeenCalledOnce();
  });
});
```

### Vitest Best Practices

1. **Use `vi` object for mocks** - Leverage `vi.fn()`, `vi.spyOn()`, and `vi.mock()`
2. **Factory patterns** - Place mock factories at the top level
3. **Setup files** - Use `src/tests/setup.ts` for global configuration
4. **Inline snapshots** - Use `toMatchInlineSnapshot()` for readable assertions
5. **Watch mode** - Run `npm run test:watch` during development
6. **UI mode** - Use `npm run test:ui` for visual test exploration
7. **Type safety** - Ensure mocks preserve original type signatures

## E2E Testing with Playwright

### Configuration

Playwright is configured in `playwright.config.ts` with:

- Chromium/Desktop Chrome as the test browser (as per guidelines)
- Automatic dev server startup
- Visual regression testing support
- Trace collection on first retry

### Test Location

Place E2E tests in:

- `e2e/` - All end-to-end test files (\*.spec.ts)

### Writing E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("User Authentication", () => {
  test("should allow user to log in", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill form
    await page.getByLabel(/email/i).fill("user@example.com");
    await page.getByLabel(/password/i).fill("password123");

    // Submit
    await page.getByRole("button", { name: /log in/i }).click();

    // Verify redirect
    await expect(page).toHaveURL(/\/generate/);
  });

  test("should capture visual regression", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Visual comparison
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
```

### Playwright Best Practices

1. **Page Object Model** - Organize tests with reusable page objects
2. **Resilient locators** - Use `getByRole`, `getByLabel` over CSS selectors
3. **API testing** - Use Playwright's request context for backend validation
4. **Visual regression** - Implement `toHaveScreenshot()` for UI consistency
5. **Codegen tool** - Use `npm run test:e2e:codegen` for test recording
6. **Trace viewer** - Debug with traces on failure
7. **Test hooks** - Use `beforeEach`/`afterEach` for setup/teardown
8. **Parallel execution** - Tests run in parallel by default

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode (recommended for development)
npm run test:watch

# Run all tests once
npm run test:run

# Run with UI for visual exploration
npm run test:ui

# Run with coverage report
npm run test:coverage

# Filter tests by name
npm run test -- -t "component name"
```

### E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Run with Playwright UI mode
npm run test:e2e:ui

# Debug mode with inspector
npm run test:e2e:debug

# Generate test code using codegen
npm run test:e2e:codegen
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Best Practices

### General Testing Principles

1. **Early returns** - Handle edge cases at the beginning
2. **Error handling** - Test both success and failure paths
3. **Meaningful names** - Use descriptive test and `describe` block names
4. **AAA pattern** - Arrange, Act, Assert structure
5. **Isolated tests** - Each test should be independent
6. **Clean up** - Use hooks to clean up after tests

### Component Testing

1. **User-centric** - Test from the user's perspective
2. **Accessibility** - Use semantic queries (getByRole, getByLabel)
3. **Avoid implementation details** - Don't test internal state
4. **Mock external dependencies** - Isolate component behavior

### E2E Testing

1. **User flows** - Test complete user journeys
2. **Critical paths** - Focus on essential functionality
3. **State management** - Use browser contexts for isolation
4. **Network conditions** - Test with realistic network behavior
5. **Visual regression** - Catch unintended UI changes

### Mocking

1. **Mock at boundaries** - Mock external APIs, not internal functions
2. **Realistic mocks** - Keep mocks close to real behavior
3. **Mock factories** - Create reusable mock data generators
4. **Conditional mocks** - Handle optional dependencies gracefully

## Coverage

Coverage reports are generated in `coverage/` directory after running:

```bash
npm run test:coverage
```

Focus on meaningful tests rather than arbitrary coverage percentages. Critical paths should always be covered.

## Continuous Integration

Tests should be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run unit tests
  run: npm run test:run

- name: Run E2E tests
  run: npm run test:e2e
```

## Debugging

### Vitest Debugging

- Use `console.log()` in tests
- Add `.only` to run a single test: `it.only('test name', ...)`
- Use UI mode: `npm run test:ui`

### Playwright Debugging

- Use debug mode: `npm run test:e2e:debug`
- View traces in browser after test run
- Use headed mode to watch tests: `npm run test:e2e:headed`
- Add `await page.pause()` in tests for inspection

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
