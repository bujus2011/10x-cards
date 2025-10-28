/**
 * Cleanup Test - Clear Database and Authentication State
 *
 * This test MUST run LAST in the entire test suite.
 * It performs two critical cleanup operations:
 * 1. Clears all test data from Supabase database (flashcards, generations, review_logs)
 * 2. Clears the .auth/user.json file to ensure no sensitive auth data remains
 *
 * Environment Variables Required (from .env.test):
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_KEY: Supabase anonymous key
 * - E2E_USERNAME_ID: User ID to clean up (from auth state)
 */

import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import type { Database } from "../../src/db/database.types";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

test.describe("Cleanup", () => {
  // Initialize Supabase client for database cleanup
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const e2eUserId = process.env.E2E_USERNAME_ID;

  test("clear database and authentication state", async () => {
    console.log("\n🧹 Starting cleanup process...\n");

    // Step 1: Clean up database
    if (supabaseUrl && supabaseKey && e2eUserId) {
      await cleanupDatabase(supabaseUrl, supabaseKey, e2eUserId);
    } else {
      console.warn(
        "⚠️  Database cleanup skipped - missing environment variables:",
      );
      if (!supabaseUrl) console.warn("   - SUPABASE_URL");
      if (!supabaseKey) console.warn("   - SUPABASE_KEY");
      if (!e2eUserId) console.warn("   - E2E_USERNAME_ID");
    }

    // Step 2: Clear authentication state file
    await clearAuthenticationState();

    console.log("\n✓ Cleanup completed successfully\n");
  });
});

/**
 * Clean up all test data from Supabase database
 * Deletes entries from: flashcards, generations, review_logs
 */
async function cleanupDatabase(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string,
) {
  console.log("📊 Cleaning up Supabase database...\n");

  try {
    // Create Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Table cleanup order: review_logs first (has FK to flashcards), then flashcards and generations
    const tables = [
      {
        name: "review_logs",
        description: "Review logs entries",
      },
      {
        name: "flashcards",
        description: "Flashcards",
      },
      {
        name: "generations",
        description: "Generation records",
      },
    ];

    for (const table of tables) {
      try {
        console.log(`  Deleting ${table.description}...`);

        const { count, error } = await supabase
          .from(table.name as never)
          .delete()
          .match({ user_id: userId })
          .select("id", { count: "exact", head: true });

        if (error) {
          console.error(
            `  ❌ Error deleting from ${table.name}:`,
            error.message,
          );
          throw error;
        }

        console.log(
          `  ✓ Deleted ${count} ${table.description} record(s)`,
        );
      } catch (error) {
        console.error(
          `  ❌ Failed to clean ${table.name}:`,
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      }
    }

    console.log("\n✓ Database cleanup completed successfully\n");
  } catch (error) {
    console.error(
      "❌ Database cleanup failed:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

/**
 * Clear authentication state file
 * Removes sensitive auth data to ensure clean state for next test run
 */
async function clearAuthenticationState() {
  console.log("🔐 Clearing authentication state...\n");

  try {
    const authFile = path.resolve(process.cwd(), ".auth/user.json");

    // Create empty auth state structure
    const emptyAuthState = {
      cookies: [],
      origins: [],
    };

    // Write empty state to file
    await fs.writeFile(authFile, JSON.stringify(emptyAuthState, null, 2), "utf-8");

    console.log("  ✓ Authentication state cleared");
    console.log(`  ✓ File: ${authFile}\n`);
  } catch (error) {
    console.error(
      "❌ Failed to clear authentication state:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
