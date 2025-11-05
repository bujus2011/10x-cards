/**
 * Global Setup for E2E Tests
 *
 * This setup runs BEFORE any tests are executed.
 * It ensures that the authentication state file (.auth/user.json)
 * is cleared to prevent any leftover sensitive data from previous test runs.
 */

import fs from "fs/promises";
import path from "path";

async function globalSetup() {
  process.stdout.write("🚀 Setting up E2E test environment...\n");

  const authDir = path.resolve(process.cwd(), "10x-cards", ".auth");
  const authFile = path.join(authDir, "user.json");

  try {
    // Ensure .auth directory exists
    try {
      await fs.access(authDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(authDir, { recursive: true });
    }

    // Create empty auth state structure (same as cleanup)
    const emptyAuthState = {
      cookies: [],
      origins: [],
    };

    // Write empty state to file
    await fs.writeFile(authFile, JSON.stringify(emptyAuthState, null, 2), "utf-8");

    process.stdout.write("✓ Authentication state cleared before test run\n");
    process.stdout.write(`✓ File: ${authFile}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`❌ Failed to clear authentication state in global setup: ${message}\n`);
    throw error;
  }
}

export default globalSetup;
