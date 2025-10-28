import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",

  /* Global setup - runs before all tests */
  globalSetup: "./e2e/global-setup.ts",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI, limit workers locally for stability */
  workers: process.env.CI ? 1 : 1,

  /* Global test timeout - increased for AI generation tasks */
  timeout: 120000,

  /* Reporter to use */
  reporter: "html",

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers - using only Chromium as per guidelines */
  projects: [
    // 1. Auth tests - test login functionality (run FIRST)
    // The 00-setup-auth.spec.ts test runs first (alphabetically) and saves auth state for other tests
    {
      name: "auth-tests",
      testMatch: /auth\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      timeout: 60000,
    },

    // 2. Flashcard Generation tests - run AFTER auth-tests, use saved auth state
    {
      name: "flashcard-generation",
      testMatch: /flashcard-generation\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["auth-tests"],
      timeout: 180000, // Increase timeout for flashcard generation (AI can be slow)
    },

    // 3. My Flashcards tests - run after flashcard-generation, use saved auth state
    {
      name: "my-flashcards",
      testMatch: /my-flashcards\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["flashcard-generation"],
      timeout: 60000,
    },

    // 4. Study Session tests - run after my-flashcards
    {
      name: "study-session",
      testMatch: /study-session\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["my-flashcards"],
      timeout: 60000,
    },

    // 5. Cleanup - MUST run LAST to clear authentication state
    {
      name: "cleanup",
      testMatch: /cleanup\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["study-session"],
      timeout: 30000,
    },
  ],

  /* Run your local dev server before starting the tests */
  // Commented out - run dev server manually with: npm run dev:e2e
  // webServer: {
  //     command: 'npm run dev:e2e',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: true,
  //     timeout: 120 * 1000,
  // },
});
