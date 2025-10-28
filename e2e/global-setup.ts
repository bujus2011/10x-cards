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
    console.log("🚀 Setting up E2E test environment...");

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

        console.log("✓ Authentication state cleared before test run");
        console.log(`✓ File: ${authFile}`);
    } catch (error) {
        console.error(
            "❌ Failed to clear authentication state in global setup:",
            error instanceof Error ? error.message : String(error),
        );
        throw error;
    }
}

export default globalSetup;
