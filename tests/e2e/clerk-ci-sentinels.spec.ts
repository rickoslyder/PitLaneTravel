import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const INVALID_FAPI_B64 = "Y2kuaW52YWxpZCQ="

function clerkAssignments(source: string): {
  publishable: string[]
  secret: string[]
} {
  return {
    publishable: [
      ...source.matchAll(
        /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\s*[:=]\s*["']?([A-Za-z0-9_.=+-]+)/g
      )
    ].map(match => match[1]),
    secret: [
      ...source.matchAll(/CLERK_SECRET_KEY\s*[:=]\s*["']?([A-Za-z0-9_.=+-]+)/g)
    ].map(match => match[1])
  }
}

describe("PLT-009 production-shaped synthetic Clerk sentinels", () => {
  it("uses pk_live_/sk_live_ .invalid stubs in CI and .env.test.example", () => {
    const example = readFileSync(path.join(root, ".env.test.example"), "utf8")
    const ci = readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8")

    for (const [label, source] of [
      [".env.test.example", example],
      ["ci.yml", ci]
    ] as const) {
      const { publishable, secret } = clerkAssignments(source)
      expect(publishable.length, label).toBeGreaterThan(0)
      expect(secret.length, label).toBeGreaterThan(0)

      for (const value of publishable) {
        expect(value.startsWith("pk_live_"), `${label} publishable`).toBe(true)
        expect(value.includes(INVALID_FAPI_B64), `${label} fapi`).toBe(true)
        expect(value.startsWith("pk_test_")).toBe(false)
      }

      for (const value of secret) {
        expect(value.startsWith("sk_live_"), `${label} secret`).toBe(true)
        expect(value.includes(INVALID_FAPI_B64), `${label} secret fapi`).toBe(
          true
        )
        expect(value.startsWith("sk_test_")).toBe(false)
      }

      expect(source).toMatch(/BEGIN PUBLIC KEY/)
      expect(source).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
      expect(source).toMatch(/synthetic|non-production|invalid/i)
    }

    expect(example).toMatch(/production-shaped|pk_live_|not a secret/i)
    expect(ci).not.toMatch(/\$\{\{\s*secrets\./)
    expect(ci).toMatch(/permissions:\s*\n\s*contents:\s*read/)
  })

  it("keeps CI sentinel checks pinned to the production-shaped stubs", () => {
    const ci = readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8")
    expect(ci).toMatch(
      /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY-.*" = "pk_live_Y2kuaW52YWxpZCQ="/
    )
    expect(ci).toMatch(/CLERK_SECRET_KEY-.*" = "sk_live_Y2kuaW52YWxpZCQ="/)
    expect(ci).not.toMatch(/pk_test_Y2kuaW52YWxpZCQ=/)
    expect(ci).not.toMatch(/sk_test_Y2kuaW52YWxpZCQ=/)
  })

  it("does not put those stubs in production .env.example", () => {
    const example = readFileSync(path.join(root, ".env.example"), "utf8")
    expect(example).not.toMatch(/pk_live_Y2kuaW52YWxpZCQ=/)
    expect(example).not.toMatch(/sk_live_Y2kuaW52YWxpZCQ=/)
    expect(example).not.toMatch(/BEGIN PUBLIC KEY/)
    expect(example).not.toMatch(/CLERK_JWT_KEY=/)
  })
})
