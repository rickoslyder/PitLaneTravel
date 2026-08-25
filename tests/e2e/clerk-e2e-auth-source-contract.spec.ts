import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8")
}

function jobBlock(ci: string, job: string): string {
  const start = ci.search(new RegExp(`^  ${job}:\\s*$`, "m"))
  expect(start, `missing CI job ${job}`).toBeGreaterThanOrEqual(0)
  const tail = ci.slice(start + 1)
  const next = tail.search(/\n  [A-Za-z0-9_-]+:\s*$/m)
  return next === -1 ? ci.slice(start) : ci.slice(start, start + 1 + next)
}

describe("PLT-014 Packet B ephemeral Clerk e2e source contract", () => {
  it("routes canonical test:e2e through the wrapper then the production build/Playwright base", () => {
    const pkg = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>
    }

    expect(pkg.scripts["test:e2e"]).toMatch(/run-clerk-e2e-auth/)
    expect(pkg.scripts["test:e2e"]).toMatch(/test:e2e:base/)
    expect(pkg.scripts["test:e2e"]).not.toMatch(/npm run test:e2e(?:\s|$)/)
    expect(pkg.scripts["test:e2e:base"]).toMatch(/npm run build/)
    expect(pkg.scripts["test:e2e:base"]).toMatch(/playwright test/)
  })

  it("keeps CI Production-build E2E on the canonical npm run test:e2e path", () => {
    const ci = read(".github/workflows/ci.yml")
    const e2e = jobBlock(ci, "e2e")
    expect(e2e).toMatch(/name:\s*Production-build E2E/)
    expect(e2e).toMatch(/npm run test:e2e\s*$/m)
    expect(e2e).not.toMatch(/test:e2e:base/)
    expect(ci).not.toMatch(/\$\{\{\s*secrets\./)
    expect(ci).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
  })

  it("selects exactly the three production Playwright suites", () => {
    const playwright = read("playwright.config.ts")
    expect(playwright).toMatch(
      /testMatch:\s*\[\s*["']smoke\.spec\.ts["']\s*,\s*["']catalogue-matrix\.spec\.ts["']\s*,\s*["']admin-coverage\.spec\.ts["']\s*\]/
    )
    expect(playwright).toMatch(/retries:\s*0/)
    expect(playwright).toMatch(/localhost:3100/)
    expect(playwright).toMatch(/npm run start/)
    expect(playwright).toMatch(/workers:\s*process\.env\.CI \? 1/)
  })

  it("keeps official Clerk middleware/auth and requireAdmin with no product auth bypass", () => {
    const middleware = read("middleware.ts")
    const auth = read("lib/auth.ts")
    const action = read("actions/db/coverage-actions.ts")
    const runner = read("scripts/run-clerk-e2e-auth.ts")
    const fixtures = read("tests/e2e/fixtures.ts")
    const spec = read("tests/e2e/admin-coverage.spec.ts")

    expect(middleware).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middleware).toMatch(/await auth\(\)/)
    expect(middleware).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI)\b/)
    expect(middleware).not.toMatch(/PLAYWRIGHT/)
    expect(auth).toMatch(/export async function requireAdmin/)
    expect(action).toMatch(/await requireAdmin\(\)/)
    expect(action).not.toMatch(/process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)\b/)
    expect(fixtures).toMatch(/PLAYWRIGHT_E2E_CLERK_SESSION_ADMIN/)
    expect(fixtures).toMatch(/PLAYWRIGHT_E2E_CLERK_SESSION_NONADMIN/)
    expect(fixtures).toMatch(/PLAYWRIGHT_E2E_CLERK_CLIENT_UAT/)
    expect(runner).toMatch(/PLAYWRIGHT_E2E_CLERK_SESSION_ADMIN/)
    expect(runner).toMatch(/PLAYWRIGHT_E2E_CLERK_SESSION_NONADMIN/)
    expect(runner).toMatch(/PLAYWRIGHT_E2E_CLERK_CLIENT_UAT/)
    expect(runner).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(fixtures).toMatch(/user_plt014_admin/)
    expect(fixtures).toMatch(/user_plt014_nonadmin/)
    expect(fixtures).toMatch(/cleanupDisposableCoverage/)
    expect(fixtures).toMatch(/coverage_evidence/)
    expect(fixtures).not.toMatch(/TRUNCATE|DROP TABLE|schema reset/i)
    expect(fixtures).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(fixtures).toMatch(/name:\s*["']__session["']/)
    expect(fixtures).toMatch(/name:\s*["']__client_uat["']/)
    expect(spec).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(spec).not.toMatch(/\.(only|skip|fixme)\(/)
    expect(spec).not.toMatch(/waitForTimeout|test\.retry|force:/)
    expect(spec).toMatch(/applyEphemeralClerkSession/)
    expect(spec).not.toMatch(/console\.(log|info|debug)\([^)]*(session|token|jwtKey)/i)
  })
})
