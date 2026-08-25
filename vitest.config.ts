import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
    // Playwright owns the selected browser suites. Other tests/e2e/*.spec.ts
    // stay Vitest source-contracts.
    exclude: [
      "node_modules",
      ".next",
      "android",
      "tests/e2e/smoke.spec.ts",
      "tests/e2e/catalogue-matrix.spec.ts",
      "tests/e2e/admin-coverage.spec.ts",
      "tests/e2e/public-coverage.spec.ts",
      "tests/e2e/analytics-consent.spec.ts"
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
})
