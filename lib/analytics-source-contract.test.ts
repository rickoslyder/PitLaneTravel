import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

function read(rel: string): string {
  return readFileSync(path.join(root, rel), "utf8")
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === "android" ||
      entry.name === "coverage"
    ) {
      continue
    }
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

describe("PLT-016 analytics consent source contract", () => {
  it("does not reachability-probe or bootstrap PostHog before consent", () => {
    const provider = read("components/utilities/posthog/posthog-provider.tsx")
    const vendors = read("lib/analytics-vendors.ts")
    expect(provider).not.toMatch(/method:\s*["']HEAD["']/)
    expect(provider).not.toMatch(/opt_in_capturing\(\)/)
    expect(provider).not.toMatch(/bootstrap\s*:/)
    expect(provider).not.toMatch(/distinctID/)
    expect(vendors).toMatch(/opt_out_capturing_by_default:\s*true/)
    expect(vendors).toMatch(/opt_out_persistence_by_default:\s*true/)
    expect(vendors).toMatch(/capture_pageview:\s*false/)
    expect(vendors).not.toMatch(/bootstrap/)
    expect(vendors).not.toMatch(/distinctID/)
    expect(vendors).not.toMatch(/method:\s*["']HEAD["']/)
  })

  it("does not server-render GTM or initialize Clarity in RootLayout", () => {
    const layout = read("app/layout.tsx")
    expect(layout).not.toMatch(/GoogleTagManager/)
    expect(layout).not.toMatch(/Clarity\.init/)
    expect(layout).not.toMatch(/@microsoft\/clarity/)
    expect(layout).toMatch(/AnalyticsController/)
  })

  it("gates Vercel Speed Insights behind granted analytics and names it in consent copy", () => {
    const layout = read("app/layout.tsx")
    const controller = read("components/privacy/analytics-controller.tsx")
    const banner = read("components/privacy/consent-banner.tsx")

    expect(layout).not.toMatch(/SpeedInsights/)
    expect(layout).not.toMatch(/@vercel\/speed-insights/)
    expect(controller).toMatch(/from\s+["']@vercel\/speed-insights\/react["']/)
    expect(controller).toMatch(/gtmEnabled \? \([\s\S]*<SpeedInsights \/>/)
    expect(controller).not.toMatch(/<SpeedInsights \/>\s*\n\s*<ConsentBanner/)
    expect(banner).toMatch(/Vercel Speed Insights/)
    expect(banner).toMatch(/PostHog/)
    expect(banner).toMatch(/Google/)
    expect(banner).toMatch(/Microsoft Clarity/)
  })

  it("keeps direct GTM and PostHog emitters behind the analytics adapter", () => {
    const files = walk(root)
    const gtmImport =
      /import\s*\{[^}]*sendGTMEvent[^}]*\}\s*from\s*["']@next\/third-parties\/google["']/
    const googleTagManagerImport =
      /import\s*\{[^}]*\bGoogleTagManager\b[^}]*\}\s*from\s*["']@next\/third-parties\/google["']/
    const adapter = path.join(root, "lib/analytics-events.ts")
    const vendors = path.join(root, "lib/analytics-vendors.ts")
    const controller = path.join(
      root,
      "components/privacy/analytics-controller.tsx"
    )

    for (const file of files) {
      if (file.endsWith(".test.ts") || file.endsWith(".spec.ts")) {
        continue
      }
      const source = readFileSync(file, "utf8")
      if (file !== adapter) {
        expect(source, file).not.toMatch(gtmImport)
      }
      if (file !== controller && file !== vendors) {
        expect(source, file).not.toMatch(googleTagManagerImport)
      }
      if (
        file !== adapter &&
        !file.endsWith("posthog-provider.tsx") &&
        file !== vendors &&
        file !== controller
      ) {
        expect(source, file).not.toMatch(/posthog\.capture\s*\(/)
        expect(source, file).not.toMatch(/posthog\.identify\s*\(/)
        expect(source, file).not.toMatch(/posthog\.reset\s*\(/)
      }
    }

    expect(read("lib/analytics-events.ts")).toMatch(gtmImport)
  })

  it("does not grant consent from auth, env, geography, CI, or user-agent branches", () => {
    const files = [
      "lib/analytics-consent.ts",
      "lib/analytics-events.ts",
      "lib/analytics-lifecycle.ts",
      "lib/analytics-vendors.ts",
      "components/privacy/analytics-controller.tsx",
      "components/privacy/consent-banner.tsx",
      "components/utilities/posthog/posthog-provider.tsx",
      "components/utilities/posthog/posthog-pageview.tsx",
      "components/utilities/posthog/posthog-user-identity.tsx"
    ]
    for (const rel of files) {
      const source = read(rel)
      expect(source, rel).not.toMatch(
        /process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)/
      )
      expect(source, rel).not.toMatch(/user-agent/i)
      expect(source, rel).not.toMatch(/navigator\.userAgent/)
      expect(source, rel).not.toMatch(/document\.referrer/)
      expect(source, rel).not.toMatch(/auth\(\)/)
      if (!rel.endsWith("posthog-user-identity.tsx")) {
        expect(source, rel).not.toMatch(/useUser/)
      }
    }
  })

  it("uses useSyncExternalStore with an undecided server snapshot", () => {
    const source = read("lib/analytics-consent.ts")
    expect(source).toMatch(/useSyncExternalStore/)
    expect(source).toMatch(/getServerSnapshot/)
    expect(source).toMatch(/return "undecided"/)
  })

  it("uses truthful usage-analytics consent copy and never claims anonymity", () => {
    const banner = read("components/privacy/consent-banner.tsx")
    const bannerTest = read("components/privacy/consent-banner.test.ts")

    expect(banner).toMatch(/Usage analytics/)
    expect(banner).toMatch(/nonessential usage analytics/)
    expect(banner).toMatch(/PostHog/)
    expect(banner).toMatch(/Google/)
    expect(banner).toMatch(/Microsoft Clarity/)
    expect(banner).toMatch(/Vercel Speed Insights/)
    expect(banner).not.toMatch(/anonymous/i)
    expect(banner).not.toMatch(/anonymized/i)
    expect(banner).not.toMatch(/cookieless/i)
    expect(banner).not.toMatch(/no identifiers/i)
    expect(banner).not.toMatch(/personalization/i)
    expect(banner).not.toMatch(/advertising/i)
    expect(bannerTest).toMatch(/not\.toMatch\(\s*\/anonymous/i)
    expect(bannerTest).not.toMatch(/expect\([^)]*\)\.toMatch\(\s*\/anonymous/)
  })

  it("does not add skip, fixme, only, retries, waitForTimeout, or force in Packet A tests", () => {
    const tests = [
      "lib/analytics-consent.test.ts",
      "lib/analytics-events.test.ts",
      "lib/analytics-lifecycle.test.ts",
      "lib/analytics-source-contract.test.ts",
      "lib/analytics-vendors.test.ts",
      "components/privacy/consent-banner.test.ts"
    ]
    for (const rel of tests) {
      const source = read(rel)
      expect(source, rel).not.toMatch(/\.(only|skip|fixme)\s*\(/)
      expect(source, rel).not.toMatch(/waitForTimeout\s*\(/)
      expect(source, rel).not.toMatch(/retries\s*:/)
      expect(source, rel).not.toMatch(/force\s*:\s*true/)
    }
  })
})
