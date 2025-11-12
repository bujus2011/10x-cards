/**
 * Vitest Setup File
 *
 * This file runs before all tests and configures the test environment.
 * It includes global mocks, custom matchers, and environment setup.
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n";
import type { ReactElement } from "react";
import React from "react";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Custom render function that wraps components with I18nProvider
export const customRender = (ui: ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => React.createElement(I18nProvider, null, children),
    ...options,
  });

// Mock environment variables for testing
process.env.PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.PUBLIC_SUPABASE_KEY = "test-anon-key";

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}
  takeRecords() {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
} as unknown as typeof IntersectionObserver;
