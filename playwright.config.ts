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

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI, limit workers locally for stability */
  workers: process.env.CI ? 1 : 3,

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
    // 1. Auth tests - test login functionality WITHOUT saved auth state (run FIRST)
    // The last test in this suite ("authenticate and save state") saves auth state for other tests
    {
      name: "auth-tests",
      testMatch: /auth\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
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
    },

    // 3. Study Session tests - run after flashcard-generation
    {
      name: "study-session",
      testMatch: /study-session\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["flashcard-generation"],
    },

    // 4. Cleanup - MUST run LAST to clear authentication state
    {
      name: "cleanup",
      testMatch: /cleanup\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["study-session"],
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
