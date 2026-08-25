import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { vendorCookieDeletionStrings } from "./analytics-vendors"

const EXPIRED = "Thu, 01 Jan 1970 00:00:00 GMT"
const UNRELATED_DOMAINS =
  /google\.com|googletagmanager|google-analytics|doubleclick|clarity\.ms|posthog\.com|vercel-insights|example\.com|evil\.test/i

function cookiePath(value: string): string {
  return value.match(/;\s*path=([^;]*)/i)?.[1] ?? ""
}

function cookieDomain(value: string): string | null {
  return value.match(/;\s*Domain=([^;]*)/i)?.[1] ?? null
}

function pairs(values: string[]): Array<{ path: string; domain: string | null }> {
  const seen = new Set<string>()
  const out: Array<{ path: string; domain: string | null }> = []
  for (const value of values) {
    const pathValue = cookiePath(value)
    const domain = cookieDomain(value)
    const key = `${pathValue}\0${domain ?? ""}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ path: pathValue, domain })
  }
  return out
}

describe("vendorCookieDeletionStrings", () => {
  it("covers www.pitlanetravel.com /races/foo host-only, dotted host, parent, and path prefixes", () => {
    const values = vendorCookieDeletionStrings({
      name: "_ga",
      hostname: "www.pitlanetravel.com",
      pathname: "/races/foo"
    })

    expect(values.length).toBeGreaterThan(0)
    expect(new Set(values).size).toBe(values.length)
    expect(values.every(value => value.startsWith("_ga=;"))).toBe(true)
    expect(values.every(value => value.includes("Max-Age=0"))).toBe(true)
    expect(values.every(value => value.includes(`Expires=${EXPIRED}`))).toBe(
      true
    )

    const observed = pairs(values)
    for (const pathValue of ["/", "/races", "/races/foo"]) {
      for (const domain of [
        null,
        "www.pitlanetravel.com",
        ".www.pitlanetravel.com",
        "pitlanetravel.com",
        ".pitlanetravel.com"
      ]) {
        expect(
          observed,
          `missing path=${pathValue} domain=${domain ?? "host-only"}`
        ).toContainEqual({ path: pathValue, domain })
      }
    }

    expect(observed.some(item => item.domain === "com")).toBe(false)
    expect(observed.some(item => item.domain === ".com")).toBe(false)
    expect(values.join("\n")).not.toMatch(UNRELATED_DOMAINS)
  })

  it("does not invent parent domains for localhost /", () => {
    const values = vendorCookieDeletionStrings({
      name: "_clck",
      hostname: "localhost",
      pathname: "/"
    })

    expect(values.length).toBeGreaterThan(0)
    expect(new Set(values).size).toBe(values.length)
    expect(values.every(value => value.startsWith("_clck=;"))).toBe(true)
    expect(values.every(value => value.includes("Max-Age=0"))).toBe(true)
    expect(values.every(value => value.includes(`Expires=${EXPIRED}`))).toBe(
      true
    )
    expect(values.every(value => cookiePath(value) === "/")).toBe(true)
    expect(values.every(value => cookieDomain(value) === null)).toBe(true)
    expect(values.join("\n")).not.toMatch(/Domain=/i)
    expect(values.join("\n")).not.toMatch(UNRELATED_DOMAINS)
    expect(values.join("\n")).not.toMatch(/pitlanetravel/i)
  })

  it("emits unique deletion strings and no unrelated domains", () => {
    const values = vendorCookieDeletionStrings({
      name: "_gid",
      hostname: "www.pitlanetravel.com",
      pathname: "/races/foo"
    })
    const localhost = vendorCookieDeletionStrings({
      name: "ph_test",
      hostname: "localhost",
      pathname: "/"
    })

    expect(new Set(values).size).toBe(values.length)
    expect(new Set(localhost).size).toBe(localhost.length)
    expect(values.join("\n")).not.toMatch(UNRELATED_DOMAINS)
    expect(localhost.join("\n")).not.toMatch(UNRELATED_DOMAINS)
    expect(localhost.join("\n")).not.toMatch(/Domain=/i)
  })

  it("uses the deletion-string generator instead of path=/ only", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib/analytics-vendors.ts"),
      "utf8"
    )
    expect(source).toMatch(/export function vendorCookieDeletionStrings/)
    expect(source).toMatch(/vendorCookieDeletionStrings\(/)
    expect(source).not.toMatch(/\$\{name\}=; Max-Age=0; path=\//)
    expect(source).not.toMatch(/console\.(log|info|debug|warn|error)\s*\(/)
  })
})
