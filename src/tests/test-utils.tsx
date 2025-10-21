/**
 * Test Utilities
 * 
 * Common utilities and helpers for unit tests.
 * Includes custom render function with providers.
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Custom render function that wraps components with necessary providers
 * Extend this as needed (e.g., with Router, Theme providers, etc.)
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  // You can add providers here as needed
  // Example:
  // const Wrapper = ({ children }: { children: React.ReactNode }) => (
  //   <ThemeProvider>
  //     {children}
  //   </ThemeProvider>
  // );

  return render(ui, { ...options });
}

/**
 * Mock factory for Supabase client
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
});

/**
 * Wait for async state updates
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock fetch response helper
 */
export const createMockFetchResponse = <T,>(data: T, ok = true) => ({
  ok,
  json: async () => data,
  text: async () => JSON.stringify(data),
  status: ok ? 200 : 400,
});

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

