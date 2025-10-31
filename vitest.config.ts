import { defineConfig } from "vitest/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/components/**/*.{ts,tsx}",
        "src/hooks/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/",
        "src/tests/",
        "src/hooks/api/**",
        "src/components/ui/**",
        "src/components/auth/**",
        "src/components/__tests__/**",
        "src/lib/__tests__/**",
        "src/**/*.d.ts",
        "src/**/*.astro",
        "src/pages/**",
        "src/middleware/**",
        "**/*.config.*",
        "**/dist/**",
        "e2e/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
