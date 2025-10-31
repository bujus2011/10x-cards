/**
 * Script to create a test user in Supabase for E2E testing
 *
 * Usage:
 *   npm run test:e2e:create-user
 *
 * This script reads credentials from .env.test and creates a user
 * in your Supabase database for testing purposes.
 */

/* eslint-env node */
/* eslint-disable no-console, no-undef */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.test
const envPath = path.resolve(process.cwd(), ".env.test");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Error: Could not find .env.test file");
  console.error("\n📝 Please create a .env.test file in the 10x-cards/ directory with the following content:");
  console.error(`
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
E2E_USERNAME=test@example.com
E2E_PASSWORD=TestPassword123!
BASE_URL=http://localhost:4321
  `);
  console.error("\n💡 See E2E_TEST_SETUP_GUIDE.md for detailed instructions.\n");
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const testEmail = process.env.E2E_USERNAME;
const testPassword = process.env.E2E_PASSWORD;

// Validate environment variables
if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
  console.error("❌ Error: Missing required environment variables in .env.test");
  console.error("\nRequired variables:");
  console.error("  - SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("  - SUPABASE_KEY:", supabaseKey ? "✓" : "✗");
  console.error("  - E2E_USERNAME:", testEmail ? "✓" : "✗");
  console.error("  - E2E_PASSWORD:", testPassword ? "✓" : "✗");
  console.error("\n💡 See E2E_TEST_SETUP_GUIDE.md for detailed instructions.\n");
  process.exit(1);
}

async function createTestUser() {
  console.log("🔧 Creating test user for E2E tests...\n");
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined, // Don't send confirmation email
      },
    });

    if (error) {
      // Check if user already exists
      if (error.message.includes("already registered")) {
        console.log("ℹ️  User already exists. Attempting to verify...\n");

        // Try to sign in to verify credentials work
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (signInError) {
          console.error("❌ User exists but credentials do not work!");
          console.error("   Error:", signInError.message);
          console.error("\n💡 Suggestions:");
          console.error("   1. Delete the user from Supabase Dashboard (Authentication → Users)");
          console.error("   2. Run this script again");
          console.error("   3. Or update .env.test with the correct password\n");
          process.exit(1);
        }

        console.log("✅ Test user already exists and credentials are valid!");
        console.log("\n✨ You can now run E2E tests:");
        console.log("   npm run dev      # Start dev server");
        console.log("   npm run test:e2e # Run tests in another terminal\n");
        process.exit(0);
      }

      throw error;
    }

    if (data.user) {
      console.log("✅ Test user created successfully!");
      console.log(`   User ID: ${data.user.id}`);

      if (data.user.confirmed_at) {
        console.log("   Status: Email confirmed ✓");
      } else {
        console.log("   Status: Email not confirmed (this is OK for testing)");
        console.log("\n💡 Note: Some Supabase instances require email confirmation.");
        console.log("   If tests fail, confirm the email in Supabase Dashboard:");
        console.log("   Authentication → Users → Select user → Confirm email");
      }

      console.log("\n✨ You can now run E2E tests:");
      console.log("   npm run dev      # Start dev server");
      console.log("   npm run test:e2e # Run tests in another terminal\n");
    } else {
      console.log("⚠️  User created but no data returned");
      console.log("   Please verify in Supabase Dashboard\n");
    }
  } catch (err) {
    console.error("❌ Error creating test user:");
    console.error("  ", err instanceof Error ? err.message : String(err));
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Verify SUPABASE_URL and SUPABASE_KEY are correct");
    console.error("   2. Check your internet connection");
    console.error("   3. Verify Supabase project is accessible");
    console.error("   4. Check Supabase Dashboard for any issues");
    console.error("\n💡 See E2E_TEST_SETUP_GUIDE.md for more help.\n");
    process.exit(1);
  }
}

// Run the script
createTestUser();
