import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

function read(rel: string): string {
  const filePath = path.join(ROOT, rel)
  expect(existsSync(filePath), `missing ${rel}`).toBe(true)
  return readFileSync(filePath, "utf8")
}

const PLAYWRIGHT_TEST_MATCH =
  /testMatch:\s*\[\s*["']smoke\.spec\.ts["']\s*,\s*["']catalogue-matrix\.spec\.ts["']\s*,\s*["']admin-coverage\.spec\.ts["']\s*,\s*["']public-coverage\.spec\.ts["']\s*,\s*["']analytics-consent\.spec\.ts["']\s*,\s*["']typed-analytics\.spec\.ts["']\s*\]/

const SIX_DEPTH_LABELS = [
  "No verified coverage",
  "Calendar only",
  "Logistics",
  "Decision guide",
  "Live offers",
  "Personalized plan"
] as const

const NEW_RACE_IDS = [
  "b1070009-e2e0-4000-8000-000000000008",
  "b1070009-e2e0-4000-8000-000000000009"
] as const

const NEW_EVIDENCE_IDS = [
  "b1070009-e2e0-4000-8000-000000000130",
  "b1070009-e2e0-4000-8000-000000000131",
  "b1070009-e2e0-4000-8000-000000000140",
  "b1070009-e2e0-4000-8000-000000000150",
  "b1070009-e2e0-4000-8000-000000000151",
  "b1070009-e2e0-4000-8000-000000000152",
  "b1070009-e2e0-4000-8000-000000000153",
  "b1070009-e2e0-4000-8000-000000000154"
] as const

describe("PLT-015 public coverage browser source contract", () => {
  it("adds public-coverage.spec.ts to the production Playwright testMatch only", () => {
    const playwright = read("playwright.config.ts")
    const vitest = read("vitest.config.ts")

    expect(playwright).toMatch(PLAYWRIGHT_TEST_MATCH)
    expect(playwright).toMatch(/retries:\s*0/)
    expect(playwright).toMatch(/workers:\s*process\.env\.CI \? 1/)
    expect(playwright).toMatch(/reuseExistingServer:\s*!process\.env\.CI/)
    expect(playwright).not.toMatch(/testIgnore/)

    expect(vitest).toMatch(/tests\/e2e\/smoke\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/catalogue-matrix\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/admin-coverage\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/public-coverage\.spec\.ts/)
    expect(vitest).not.toMatch(
      /exclude:\s*\[[^\]]*["']tests\/e2e\/\*\.spec\.ts["']/
    )
  })

  it("seeds and cleans only exact synthetic IDs including the six-tier matrix", () => {
    const fixtures = read("tests/e2e/fixtures.ts")

    expect(fixtures).toMatch(/PLAYWRIGHT_E2E_ALLOW_DISPOSABLE_DB/)
    expect(fixtures).toMatch(/hostname !== "127\.0\.0\.1"/)
    expect(fixtures).toMatch(/pitlane_ci/)
    expect(fixtures).toMatch(/pitlane_e2e/)
    expect(fixtures).not.toMatch(/TRUNCATE|DROP TABLE|schema reset/i)
    expect(fixtures).not.toMatch(/DELETE FROM races(?! WHERE id =)/)
    expect(fixtures).not.toMatch(/DELETE FROM coverage_evidence(?! WHERE id =)/)

    expect(fixtures).toMatch(/b1070009-e2e0-4000-8000-000000000003/)
    expect(fixtures).toMatch(/b1070009-e2e0-4000-8000-000000000005/)
    expect(fixtures).toMatch(/b1070009-e2e0-4000-8000-000000000006/)
    expect(fixtures).toMatch(/b1070009-e2e0-4000-8000-000000000007/)

    for (const id of NEW_RACE_IDS) {
      expect(fixtures).toContain(id)
      expect(fixtures).toMatch(
        new RegExp(`DELETE FROM races WHERE id = \\$\\{[^}]*\\}::uuid`)
      )
    }
    for (const id of NEW_EVIDENCE_IDS) {
      expect(fixtures).toContain(id)
    }

    expect(fixtures).toMatch(/personalized_plan/)
    expect(fixtures).toMatch(/completeInputs/)
    expect(fixtures).toMatch(/sourceBackedRecommendations/)
    expect(fixtures).toMatch(/handoffsTracked/)
    expect(fixtures).toMatch(/PUBLIC_COVERAGE_TIER_CASES/)
    expect(fixtures).toMatch(/CATALOGUE_STATUS_RACES/)
    expect(fixtures).toMatch(/E2E_COVERAGE_EVIDENCE_IDS/)
  })

  it("proves the six honest labels, muted null/tier-0, viewports, and screenshot attachments", () => {
    const spec = read("tests/e2e/public-coverage.spec.ts")

    for (const label of SIX_DEPTH_LABELS) {
      expect(spec).toContain(label)
    }
    expect(spec).toContain("No current offers")
    expect(spec).toContain("Current offers")
    expect(spec).toMatch(/data-coverage-tone/)
    expect(spec).toMatch(/muted/)
    expect(spec).toMatch(/full guide/i)
    expect(spec).toMatch(/1440/)
    expect(spec).toMatch(/1000/)
    expect(spec).toMatch(/390/)
    expect(spec).toMatch(/844/)
    expect(spec).toMatch(/scrollWidth/)
    expect(spec).toMatch(/innerWidth/)
    expect(spec).toMatch(/public-coverage-desktop\.png/)
    expect(spec).toMatch(/public-coverage-mobile\.png/)
    expect(spec).toMatch(/testInfo\.attach/)
    expect(spec).toMatch(/#tab-content|tab-content/)
    expect(spec).toMatch(/coverage\.invalid|source_url|sourceUrl|token=/)
    expect(spec.match(/^\s*test\(/gm)?.length).toBe(2)
  })

  it("keeps anonymous public semantics and adds no auth/env/browser bypasses", () => {
    const spec = read("tests/e2e/public-coverage.spec.ts")
    const playwright = read("playwright.config.ts")
    const middleware = read("middleware.ts")
    const adminSpec = read("tests/e2e/admin-coverage.spec.ts")

    expect(middleware).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middleware).toMatch(/await auth\(\)/)
    expect(middleware).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI)\b/)
    expect(middleware).not.toMatch(/PLAYWRIGHT/)
    expect(playwright).toMatch(/retries:\s*0/)
    expect(spec).not.toMatch(/\.(only|skip|fixme)\(/)
    expect(spec).not.toMatch(/waitForTimeout|test\.retry|force:/)
    expect(spec).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)\b/)
    expect(spec).not.toMatch(/overflow:\s*hidden|overflow-x:\s*hidden/)
    expect(spec).not.toMatch(/applyEphemeralClerkSession/)
    expect(spec).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(adminSpec).toMatch(/applyEphemeralClerkSession/)
    expect(adminSpec).toMatch(/anonymous \/admin\/coverage/)
  })
})
