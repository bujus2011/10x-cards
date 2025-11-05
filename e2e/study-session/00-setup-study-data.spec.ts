/**
 * Study Session Data Setup
 *
 * This preparatory test makes sure the authenticated E2E user has enough
 * flashcards to run the study session scenarios reliably. Without this seed
 * the first test run could exhaust the queue and leave later specs without
 * cards to review.
 *
 * The 00- prefix guarantees it runs before the rest of the study-session suite.
 */

import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

const MIN_FLASHCARDS = 80;

test.describe("Setup - Study Session Data", () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-pattern
  test("ensure minimum flashcards exist", async ({}, testInfo) => {
    test.setTimeout(60000);
    const log = (message: string) => {
      testInfo.annotations.push({ type: "log", description: message });
    };

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const userId = process.env.E2E_USERNAME_ID;

    if (!supabaseUrl || !supabaseKey || !userId) {
      test.skip(true, "Supabase credentials or test user ID missing - cannot seed study session data");
      return;
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const { error: cleanupError } = await supabase.from("review_logs").delete().eq("user_id", userId);

    if (cleanupError) {
      throw new Error(`Failed to reset review logs: ${cleanupError.message}`);
    }

    const { count: existingCount, error: countError } = await supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new Error(`Failed to count flashcards: ${countError.message}`);
    }

    const currentTotal = existingCount ?? 0;

    if (currentTotal >= MIN_FLASHCARDS) {
      log(
        `✓ Study session seed skipped (already have ${currentTotal} flashcards). Review logs reset to fetch fresh cards.`
      );
      expect(currentTotal).toBeGreaterThanOrEqual(MIN_FLASHCARDS);
      return;
    }

    const cardsToCreate = MIN_FLASHCARDS - currentTotal;
    const timestamp = new Date().toISOString();

    const newFlashcards = Array.from({ length: cardsToCreate }, (_, index) => {
      const sequence = currentTotal + index + 1;
      return {
        user_id: userId,
        front: `Study Session Seed ${sequence}`,
        back: `Auto-generated flashcard content #${sequence}`,
        source: "manual" as const,
        generation_id: null,
        created_at: timestamp,
        updated_at: timestamp,
      };
    });

    const { error: insertError } = await supabase.from("flashcards").insert(newFlashcards);

    if (insertError) {
      throw new Error(`Failed to insert study session flashcards: ${insertError.message}`);
    }

    log(`✓ Seeded ${cardsToCreate} flashcards for study session tests (total now ${MIN_FLASHCARDS})`);

    const { count: finalCount, error: finalCountError } = await supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (finalCountError) {
      throw new Error(`Failed to verify flashcard total: ${finalCountError.message}`);
    }

    expect(finalCount ?? 0).toBeGreaterThanOrEqual(MIN_FLASHCARDS);
  });
});
