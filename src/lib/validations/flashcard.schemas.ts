import { z } from "zod";
import type { Source } from "@/types";

// Flashcard content validation
const flashcardContentSchema = z.object({
  front: z
    .string()
    .min(1, "Front side is required")
    .max(200, "Front side must be less than 200 characters")
    .trim(),
  back: z
    .string()
    .min(1, "Back side is required")
    .max(500, "Back side must be less than 500 characters")
    .trim(),
});

// Source validation
const sourceSchema = z.enum(["ai-full", "ai-edited", "manual"] as const) satisfies z.ZodType<Source>;

// Create flashcard schema
export const createFlashcardSchema = flashcardContentSchema.extend({
  source: sourceSchema,
  generation_id: z.number().nullable(),
});

// Update flashcard schema (all fields optional)
export const updateFlashcardSchema = flashcardContentSchema.partial().extend({
  source: sourceSchema.optional(),
  generation_id: z.number().nullable().optional(),
});

// Manual flashcard creation schema (simplified for user input)
export const manualFlashcardSchema = flashcardContentSchema;

// Text input for generation schema
export const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must be less than 10000 characters")
    .trim(),
});

// Search flashcards schema
export const searchFlashcardsSchema = z.object({
  query: z.string().max(100, "Search query must be less than 100 characters").optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
});

// TypeScript types derived from schemas
export type CreateFlashcardFormData = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardFormData = z.infer<typeof updateFlashcardSchema>;
export type ManualFlashcardFormData = z.infer<typeof manualFlashcardSchema>;
export type GenerateFlashcardsFormData = z.infer<typeof generateFlashcardsSchema>;
export type SearchFlashcardsFormData = z.infer<typeof searchFlashcardsSchema>;
