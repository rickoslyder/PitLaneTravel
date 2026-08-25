import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const INVALID_FAPI_B64 = "Y2kuaW52YWxpZCQ="
const SCOPED = [
  ".github/workflows/ci.yml",
  ".env.test.example",
  "lib/clerk-middleware-options.test.ts",
  "tests/e2e/clerk-ci-sentinels.spec.ts"
] as const

const CONTIGUOUS_LIVE_SECRET = /\bsk_live_[A-Za-z0-9+/=._-]+/
const CLERK_SECRET_ASSIGNMENT = /^CLERK_SECRET_KEY=[ \t]*\S+/m

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

function stepNames(job: string): string[] {
  return [...job.matchAll(/^\s+- name:\s*(.+)\s*$/gm)].map(match => match[1])
}

function stepIndex(names: string[], pattern: RegExp): number {
  return names.findIndex(name => pattern.test(name))
}

describe("PLT-009 production-shaped synthetic Clerk sentinels", () => {
  it("keeps a production-shaped .invalid publishable key and public jwtKey", () => {
    const example = read(".env.test.example")
    const ci = read(".github/workflows/ci.yml")

    for (const [label, source] of [
      [".env.test.example", example],
      ["ci.yml", ci]
    ] as const) {
      const publishable = [
        ...source.matchAll(
          /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\s*[:=]\s*["']?([A-Za-z0-9_.=+-]+)/g
        )
      ].map(match => match[1])
      expect(publishable.length, label).toBeGreaterThan(0)
      for (const value of publishable) {
        expect(value.startsWith("pk_live_"), `${label} publishable`).toBe(true)
        expect(value.includes(INVALID_FAPI_B64), `${label} fapi`).toBe(true)
        expect(value.startsWith("pk_test_")).toBe(false)
      }
      expect(source).toMatch(/BEGIN PUBLIC KEY/)
      expect(source).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
      expect(source).toMatch(/synthetic|non-production|invalid/i)
    }

    expect(example).toMatch(/production-shaped|pk_live_|not a secret/i)
    expect(ci).not.toMatch(/\$\{\{\s*secrets\./)
    expect(ci).toMatch(/permissions:\s*\n\s*contents:\s*read/)
  })

  it("leaves .env.test.example Clerk secret blank and documents the CI sentinel", () => {
    const example = read(".env.test.example")
    expect(example).toMatch(/^CLERK_SECRET_KEY=\s*$/m)
    expect(example).not.toMatch(CLERK_SECRET_ASSIGNMENT)
    expect(example).toMatch(/CI constructs a synthetic runtime sentinel/i)
    expect(example).not.toMatch(/paste your|replace with your (live|production|secret)/i)
    expect(example).not.toContain(`sk_live_${INVALID_FAPI_B64}`)
  })

  it("does not commit a contiguous Clerk secret token in the four scoped files", () => {
    for (const rel of SCOPED) {
      const source = read(rel)
      expect(source, rel).not.toMatch(CONTIGUOUS_LIVE_SECRET)
      expect(source, rel).not.toContain(`sk_live_${INVALID_FAPI_B64}`)
      expect(source, rel).not.toContain(`sk_test_${INVALID_FAPI_B64}`)
    }
  })

  it("gives build and e2e a runtime production-prefix synthetic secret via GITHUB_ENV", () => {
    const ci = read(".github/workflows/ci.yml")
    expect(ci).toMatch(/^  quality:\s*$/m)
    expect(ci).toMatch(/^  build:\s*$/m)
    expect(ci).toMatch(/^  dependency-audit:\s*$/m)
    expect(ci).toMatch(/^  e2e:\s*$/m)

    for (const jobName of ["build", "e2e"] as const) {
      const job = jobBlock(ci, jobName)
      const names = stepNames(job)
      const construct = stepIndex(
        names,
        /construct|synthetic Clerk secret|GITHUB_ENV/i
      )
      const use = names
        .map((name, index) => ({ name, index }))
        .filter(({ name }) =>
          /Prove synthetic sentinels|Apply split migrations|Production build|Production-build E2E/i.test(
            name
          )
        )
      expect(construct, `${jobName} construct step`).toBeGreaterThanOrEqual(0)
      expect(use.length, `${jobName} use steps`).toBeGreaterThan(0)
      for (const { name, index } of use) {
        expect(construct, `${jobName} ${name}`).toBeLessThan(index)
      }

      expect(job, jobName).toMatch(/GITHUB_ENV/)
      expect(job, jobName).toMatch(/CLERK_SECRET_KEY=/)
      expect(job, jobName).toMatch(/["']sk_["']/)
      expect(job, jobName).toMatch(/["']live["']/)
      expect(job, jobName).toMatch(/synthetic|not_production|non-production/i)
      expect(job, jobName).not.toMatch(CONTIGUOUS_LIVE_SECRET)
      expect(job, jobName).not.toMatch(/\$\{\{\s*secrets\./)
      expect(job, jobName).not.toMatch(/echo .*CLERK_SECRET_KEY/)
    }
  })

  it("keeps CI sentinel checks pinned to the production-shaped stubs", () => {
    const ci = read(".github/workflows/ci.yml")
    const build = jobBlock(ci, "build")
    expect(build).toMatch(
      /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY-.*" = "pk_live_Y2kuaW52YWxpZCQ="/
    )
    expect(build).toMatch(/CLERK_SECRET_KEY-/)
    expect(build).toMatch(/sk_["']/)
    expect(build).toMatch(/["']live["']/)
    expect(build).toMatch(/synthetic|not_production|non-production|ci_invalid/)
    expect(build).not.toMatch(/pk_test_Y2kuaW52YWxpZCQ=/)
    expect(build).not.toContain(`sk_test_${INVALID_FAPI_B64}`)
    expect(build).not.toMatch(CONTIGUOUS_LIVE_SECRET)
    expect(build).toMatch(/sentinel checks passed=/)
    expect(build.match(/ok [A-Z_]+/g)?.length).toBeGreaterThanOrEqual(10)
  })

  it("does not put those stubs in production .env.example", () => {
    const example = read(".env.example")
    expect(example).not.toMatch(/pk_live_Y2kuaW52YWxpZCQ=/)
    expect(example).not.toContain(`sk_live_${INVALID_FAPI_B64}`)
    expect(example).not.toMatch(/BEGIN PUBLIC KEY/)
    expect(example).not.toMatch(/CLERK_JWT_KEY=/)
  })

  it("keeps money and auth flags off and never adds private key or secrets context", () => {
    const ci = read(".github/workflows/ci.yml")
    expect(ci).toMatch(/FLIGHTS_BOOKING_ENABLED:\s*"false"/)
    expect(ci).toMatch(/RECONCILE_AUTO_REFUND:\s*"false"/)
    expect(ci).toMatch(/AI_PLANNER_PRO_GATE:\s*"false"/)
    expect(ci).not.toMatch(/\$\{\{\s*secrets\./)
    expect(ci).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(ci).toMatch(/BEGIN PUBLIC KEY/)
  })
})
