import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.ts"],
    // Playwright owns tests/e2e/smoke.spec.ts. Other tests/e2e/*.spec.ts stay Vitest source-contracts.
    exclude: ["node_modules", ".next", "android", "tests/e2e/smoke.spec.ts"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
})
