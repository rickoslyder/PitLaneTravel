import { readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import posthog from "posthog-js"
import {
  createBrowserAnalyticsAdapters,
  vendorCookieDeletionStrings
} from "./analytics-vendors"

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn()
  }
}))

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

describe("browser PostHog consent-gated init", () => {
  const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const originalHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key"
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com"
    vi.stubGlobal("window", {
      localStorage: { length: 0, key: () => null, removeItem: () => undefined },
      sessionStorage: { length: 0, key: () => null, removeItem: () => undefined },
      document: { cookie: "" },
      location: { hostname: "localhost", pathname: "/" }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
    }
    if (originalHost === undefined) {
      delete process.env.NEXT_PUBLIC_POSTHOG_HOST
    } else {
      process.env.NEXT_PUBLIC_POSTHOG_HOST = originalHost
    }
  })

  function adapters() {
    return createBrowserAnalyticsAdapters({
      onLoadGoogleTagManager() {},
      reload() {}
    })
  }

  function initAfterConsent(): void {
    adapters().initPostHogAfterConsent()
  }

  it("passes a public loaded callback that opts in on the init argument exactly once", () => {
    initAfterConsent()

    expect(posthog.init).toHaveBeenCalledTimes(1)
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled()

    const config = vi.mocked(posthog.init).mock.calls[0]?.[1] as {
      loaded?: (instance: { opt_in_capturing: () => void }) => void
      opt_out_capturing_by_default?: boolean
      opt_out_persistence_by_default?: boolean
      request_batching?: boolean
    }
    expect(typeof config.loaded).toBe("function")

    const instance = { opt_in_capturing: vi.fn() }
    config.loaded?.(instance)

    expect(instance.opt_in_capturing).toHaveBeenCalledTimes(1)
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled()
  })

  it("keeps both opt-out-by-default flags true and does not disable batching", () => {
    initAfterConsent()

    const config = vi.mocked(posthog.init).mock.calls[0]?.[1] as Record<
      string,
      unknown
    >
    expect(config.opt_out_capturing_by_default).toBe(true)
    expect(config.opt_out_persistence_by_default).toBe(true)
    expect(config.request_batching).not.toBe(false)
    expect(config).not.toHaveProperty("send_instantly")
  })

  it("exposes one grant-time PostHog init and no separate opt-in adapter", () => {
    const created = adapters()
    expect(created).toHaveProperty("initPostHogAfterConsent")
    expect(created).not.toHaveProperty("optInPostHog")
    expect(created).not.toHaveProperty("initPostHog")
    expect(created).toHaveProperty("optOutPostHog")
  })
})
