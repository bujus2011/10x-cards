/**
 * Cleanup Test - Clear Authentication State
 *
 * This test MUST run LAST in the entire test suite.
 * It clears the .auth/user.json file to ensure no sensitive data remains.
 */

import { test } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

test.describe("Cleanup", () => {
    test("clear authentication state file", async () => {
        const authFile = path.resolve(process.cwd(), ".auth/user.json");

        console.log("🧹 Cleaning up authentication state...");

        // Create empty auth state structure
        const emptyAuthState = {
            cookies: [],
            origins: [],
        };

        // Write empty state to file
        await fs.writeFile(authFile, JSON.stringify(emptyAuthState, null, 2), "utf-8");

        console.log("✓ Authentication state cleared successfully");
        console.log("✓ File:", authFile);
    });
});

