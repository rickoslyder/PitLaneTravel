import { defineConfig, devices } from "@playwright/test"

const baseURL = "http://localhost:3100"

export default defineConfig({
  testDir: "tests/e2e",
  // Other *.spec.ts in this dir are Vitest; Playwright must select smoke only.
  // https://playwright.dev/docs/test-configuration#filtering-tests
  testMatch: "smoke.spec.ts",
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Official CI guidance: one worker for stability/reproducibility.
  // https://playwright.dev/docs/ci#workers
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  outputDir: "/tmp/playwright-test-results",
  use: {
    baseURL,
    // No retries, so retain traces on failure instead of on-first-retry.
    // https://playwright.dev/docs/trace-viewer#tracing-on-ci
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run start -- --hostname localhost --port 3100",
    url: baseURL,
    // Reuse a local production server only outside CI.
    // https://playwright.dev/docs/test-webserver
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
