import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"

const root = process.cwd()

const issueAllowlist = [
  "app/(marketing)/pricing/page.tsx",
  "app/sitemap.ts",
  "config/features.ts",
  "tests/e2e/no-subscription.spec.ts"
] as const

const activePublicChromeFiles = [
  "app/(marketing)/layout.tsx",
  "app/not-found.tsx",
  "components/header.tsx",
  "components/Footer.tsx"
] as const

const preservedStripeFiles = [
  "lib/stripe.ts",
  "actions/stripe-actions.ts",
  "app/api/stripe/webhooks/route.ts",
  "app/api/flights/payment-intent/route.ts",
  "app/api/flights/book/route.ts",
  "app/api/cron/reconcile-flight-payments/route.ts",
  "db/schema/profiles-schema.ts"
] as const

const generatedOrTestDirNames = new Set([
  "node_modules",
  ".next",
  "generated",
  "coverage",
  "__snapshots__"
])

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404")
  })
}))

function readPublicSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

function collectRenderSourceFiles(relativeDir: string): string[] {
  const results: string[] = []

  function walk(absoluteDir: string) {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (generatedOrTestDirNames.has(entry.name)) continue
        walk(path.join(absoluteDir, entry.name))
        continue
      }

      if (/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) continue
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) continue
      results.push(path.join(absoluteDir, entry.name))
    }
  }

  walk(path.join(root, relativeDir))
  return results
}

describe("PLT-007 disable valueless subscription surface", () => {
  describe("pricing route uses a real Next 404 boundary", () => {
    it("calls notFound when the pricing page function runs", async () => {
      const { notFound } = await import("next/navigation")
      const { default: PricingPage } = await import(
        "@/app/(marketing)/pricing/page"
      )

      await expect(PricingPage()).rejects.toThrow(
        "NEXT_HTTP_ERROR_FALLBACK;404"
      )
      expect(notFound).toHaveBeenCalled()
    })
  })

  describe("pricing source cannot initiate a subscription", () => {
    const pricingSource = readPublicSource("app/(marketing)/pricing/page.tsx")

    it("does not import auth or pricing UI cards", () => {
      expect(pricingSource).not.toMatch(/@clerk\/nextjs/)
      expect(pricingSource).not.toMatch(/@\/components\/ui\/card/)
      expect(pricingSource).not.toMatch(/@\/components\/ui\/button/)
      expect(pricingSource).not.toMatch(/\bPricingCard\b/)
    })

    it("does not render $10/$100 plan copy or subscription CTAs", () => {
      expect(pricingSource).not.toMatch(/Monthly Plan/)
      expect(pricingSource).not.toMatch(/Yearly Plan/)
      expect(pricingSource).not.toMatch(/\$10\b/)
      expect(pricingSource).not.toMatch(/\$100\b/)
      expect(pricingSource).not.toMatch(/Subscribe Monthly/)
      expect(pricingSource).not.toMatch(/Subscribe Yearly/)
    })

    it("does not append client_reference_id or read Stripe payment-link env", () => {
      expect(pricingSource).not.toMatch(/client_reference_id/)
      expect(pricingSource).not.toMatch(/NEXT_PUBLIC_STRIPE_PAYMENT_LINK_/)
    })
  })

  describe("sitemap", () => {
    it("excludes /pricing from the static route list", () => {
      const sitemapSource = readPublicSource("app/sitemap.ts")
      const staticUrls = [
        ...sitemapSource.matchAll(/\$\{BASE_URL\}(\/[^"`\s,]+)/g)
      ].map(match => match[1])

      expect(staticUrls).not.toContain("/pricing")
      expect(sitemapSource).not.toMatch(/`\$\{BASE_URL\}\/pricing`/)
    })
  })

  describe("active public chrome has no pricing navigation", () => {
    it("uses an explicit chrome allowlist rather than a repo-global word ban", () => {
      expect(activePublicChromeFiles).toEqual([
        "app/(marketing)/layout.tsx",
        "app/not-found.tsx",
        "components/header.tsx",
        "components/Footer.tsx"
      ])
    })

    it("excludes /pricing hrefs and user-facing Pricing labels", () => {
      for (const relativePath of activePublicChromeFiles) {
        const source = readPublicSource(relativePath)
        expect(
          source,
          `${relativePath} must not link to /pricing`
        ).not.toMatch(/href\s*=\s*(?:\{\s*)?["'`]\/pricing["'`]/)
        expect(
          source,
          `${relativePath} must not expose a Pricing nav label`
        ).not.toMatch(/label:\s*["']Pricing["']/)
        expect(
          source,
          `${relativePath} must not render a Pricing nav label`
        ).not.toMatch(/>\s*Pricing\s*</)
      }
    })
  })

  describe("feature truth", () => {
    it("exposes disabled recurring subscriptions that cannot be reactivated from env", async () => {
      const source = readPublicSource("config/features.ts")
      expect(source).toMatch(/subscriptionsEnabled:\s*false\b/)
      expect(source).not.toMatch(/subscriptionsEnabled:\s*flag\(/)
      expect(source).not.toMatch(
        /process\.env\[[^\]]*(SUBSCR|PRICING)[^\]]*\]/i
      )
      expect(source).not.toMatch(/process\.env\.[A-Z0-9_]*(SUBSCR|PRICING)/i)

      const previous = {
        SUBSCRIPTIONS_ENABLED: process.env.SUBSCRIPTIONS_ENABLED,
        NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED:
          process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED,
        FEATURE_SUBSCRIPTIONS: process.env.FEATURE_SUBSCRIPTIONS
      }

      process.env.SUBSCRIPTIONS_ENABLED = "true"
      process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = "true"
      process.env.FEATURE_SUBSCRIPTIONS = "true"

      try {
        vi.resetModules()
        const { features } = await import("@/config/features")
        expect(features.subscriptionsEnabled).toBe(false)
      } finally {
        if (previous.SUBSCRIPTIONS_ENABLED === undefined) {
          delete process.env.SUBSCRIPTIONS_ENABLED
        } else {
          process.env.SUBSCRIPTIONS_ENABLED = previous.SUBSCRIPTIONS_ENABLED
        }
        if (previous.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === undefined) {
          delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
        } else {
          process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED =
            previous.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
        }
        if (previous.FEATURE_SUBSCRIPTIONS === undefined) {
          delete process.env.FEATURE_SUBSCRIPTIONS
        } else {
          process.env.FEATURE_SUBSCRIPTIONS = previous.FEATURE_SUBSCRIPTIONS
        }
      }
    })
  })

  describe("public render sources cannot start a Stripe payment-link subscription", () => {
    it("finds no NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ references under app or components", () => {
      const hits: string[] = []

      for (const relativeDir of ["app", "components"] as const) {
        for (const absolutePath of collectRenderSourceFiles(relativeDir)) {
          const source = readFileSync(absolutePath, "utf8")
          if (source.includes("NEXT_PUBLIC_STRIPE_PAYMENT_LINK_")) {
            hits.push(path.relative(root, absolutePath))
          }
        }
      }

      expect(hits).toEqual([])
    })
  })

  describe("safe Stripe and subscriber data stay outside this issue", () => {
    it("keeps Stripe implementation files present and off the allowlist", () => {
      for (const relativePath of preservedStripeFiles) {
        expect(existsSync(path.join(root, relativePath))).toBe(true)
        expect(issueAllowlist).not.toContain(relativePath)
      }
    })
  })
})
