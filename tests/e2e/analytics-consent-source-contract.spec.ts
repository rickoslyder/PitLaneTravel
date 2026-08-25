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
  /testMatch:\s*\[\s*["']smoke\.spec\.ts["']\s*,\s*["']catalogue-matrix\.spec\.ts["']\s*,\s*["']admin-coverage\.spec\.ts["']\s*,\s*["']public-coverage\.spec\.ts["']\s*,\s*["']analytics-consent\.spec\.ts["']\s*\]/

describe("PLT-016 analytics consent browser source contract", () => {
  it("selects analytics-consent.spec.ts in Playwright and excludes it from Vitest", () => {
    const playwright = read("playwright.config.ts")
    const vitest = read("vitest.config.ts")

    expect(playwright).toMatch(PLAYWRIGHT_TEST_MATCH)
    expect(playwright).toMatch(/retries:\s*0/)
    expect(playwright).toMatch(/workers:\s*process\.env\.CI \? 1/)
    expect(playwright).toMatch(/reuseExistingServer:\s*!process\.env\.CI/)
    expect(playwright).toMatch(/npm run start/)
    expect(playwright).not.toMatch(/testIgnore/)
    expect(playwright).toMatch(/analytics-consent/)

    expect(vitest).toMatch(/tests\/e2e\/smoke\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/catalogue-matrix\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/admin-coverage\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/public-coverage\.spec\.ts/)
    expect(vitest).toMatch(/tests\/e2e\/analytics-consent\.spec\.ts/)
    expect(vitest).not.toMatch(
      /exclude:\s*\[[^\]]*["']tests\/e2e\/\*\.spec\.ts["']/
    )
  })

  it("keeps existing Playwright source contracts aligned to the five browser suites", () => {
    const smoke = read("tests/e2e/smoke-source-contract.spec.ts")
    const publicCoverage = read(
      "tests/e2e/public-coverage-source-contract.spec.ts"
    )
    const clerk = read("tests/e2e/clerk-e2e-auth-source-contract.spec.ts")
    const wiring = read("components/coverage/public-coverage-wiring.test.ts")

    expect(smoke).toMatch(/analytics-consent/)
    expect(publicCoverage).toMatch(/analytics-consent/)
    expect(clerk).toMatch(/analytics-consent/)
    expect(wiring).toMatch(/analytics-consent/)
    expect(clerk).toMatch(/exactly the five production Playwright suites/)
  })

  it("covers first-visit, reject, accept, withdraw, cross-tab, and damaged-storage scenarios", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")

    expect(spec).toMatch(/from\s+["']\.\/fixtures["']/)
    expect(spec).toMatch(/pitlane\.analytics-consent/)
    expect(spec).toMatch(/\{"v":1,"status":"denied"\}/)
    expect(spec).toMatch(/\{"v":1,"status":"granted"\}/)
    expect(spec).toMatch(/Usage analytics/)
    expect(spec).not.toMatch(/Anonymous analytics/)
    expect(spec).toMatch(/Accept analytics/)
    expect(spec).toMatch(/Reject non-essential/)
    expect(spec).toMatch(/Privacy settings/)
    expect(spec).toMatch(/Withdraw analytics consent/)
    expect(spec).toMatch(/1440/)
    expect(spec).toMatch(/1000/)
    expect(spec).toMatch(/390/)
    expect(spec).toMatch(/844/)
    expect(spec).toMatch(/scrollWidth/)
    expect(spec).toMatch(/innerWidth/)
    expect(spec).toMatch(/analytics-consent-first-visit-desktop\.png/)
    expect(spec).toMatch(/analytics-consent-first-visit-mobile\.png/)
    expect(spec).toMatch(/testInfo\.attach/)
    expect(spec).toMatch(/page\.on\(\s*["']request["']/)
    expect(spec).toMatch(/dataLayer/)
    expect(spec).toMatch(/analytics_storage/)
    expect(spec).toMatch(/ad_storage/)
    expect(spec).toMatch(/ad_user_data/)
    expect(spec).toMatch(/ad_personalization/)
    expect(spec).toMatch(/newPage\(/)
    expect(spec).toMatch(/storage/)
    expect(spec.match(/^\s*test\(/gm)?.length).toBeGreaterThanOrEqual(8)
  })

  it("keeps the analytics browser suite fail-closed with no bypass markers", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")
    const playwright = read("playwright.config.ts")
    const middleware = read("middleware.ts")

    expect(playwright).toMatch(/retries:\s*0/)
    expect(spec).not.toMatch(/\.(only|skip|fixme)\s*\(/)
    expect(spec).not.toMatch(/waitForTimeout|test\.retry|force:\s*true/)
    expect(spec).not.toMatch(
      /process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)\b/
    )
    expect(spec).not.toMatch(/applyEphemeralClerkSession/)
    expect(spec).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(spec).not.toMatch(/console\.(log|info|debug)\(/)
    expect(middleware).toMatch(/export default clerkMiddleware\s*\(/)
    expect(middleware).not.toMatch(/PLAYWRIGHT/)
  })

  it("keeps installed PostHog 1.201.0 filtering webdriver and HeadlessChrome brands", () => {
    const pkg = JSON.parse(read("node_modules/posthog-js/package.json")) as {
      version: string
    }
    expect(pkg.version).toBe("1.201.0")

    const blocked = read("node_modules/posthog-js/lib/src/utils/blocked-uas.js")
    const core = read("node_modules/posthog-js/lib/src/posthog-core.js")

    expect(blocked).toMatch(/headlesschrome/)
    expect(blocked).toMatch(/userAgentData/)
    expect(blocked).toMatch(/uaData\.brands/)
    expect(blocked).toMatch(/isBlockedUA\(brandObj/)
    expect(blocked).toMatch(/return !!navigator\.webdriver/)
    expect(core).toMatch(
      /if \(!this\.config\.opt_out_useragent_filter && this\._is_bot\(\)\)/
    )
  })

  it("installs narrowly scoped pre-navigation automation-marker normalization on every analytics page", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")
    const helperRel = "tests/e2e/analytics-consent-automation.ts"
    const helperPath = path.join(ROOT, helperRel)
    expect(existsSync(helperPath), `missing ${helperRel}`).toBe(true)
    const helper = read(helperRel)

    expect(spec).toMatch(
      /from\s+["']\.\/analytics-consent-automation["']/
    )
    expect(spec).toMatch(
      /test\.beforeEach\(\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{[\s\S]*installAutomationMarkerNormalization\(\s*page\s*\)/
    )
    expect(spec).toMatch(
      /async function openSecondPage[\s\S]*installAutomationMarkerNormalization\(\s*page\s*\)/
    )
    expect(spec.match(/installAutomationMarkerNormalization/g)?.length).toBeGreaterThanOrEqual(
      3
    )

    expect(helper).toMatch(/export async function installAutomationMarkerNormalization/)
    expect(helper).toMatch(/addInitScript/)
    expect(helper).toMatch(/Object\.defineProperty\(\s*navigator\s*,\s*["']webdriver["']/)
    expect(helper).toMatch(/return false/)
    expect(helper).toMatch(/userAgentData/)
    expect(helper).toMatch(/new Proxy\(/)
    expect(helper).toMatch(/["']brands["']|===\s*["']brands["']|===\s*'brands'/)
    expect(helper).toMatch(/HeadlessChrome/)
    expect(helper).toMatch(/Google Chrome/)
    expect(helper).toMatch(/\.bind\(\s*target\s*\)/)
    expect(helper).not.toMatch(/navigator\.userAgent\s*=/)
    expect(helper).not.toMatch(/userAgent\s*:/)
    expect(helper).not.toMatch(/extraHTTPHeaders/)
    expect(helper).not.toMatch(/localStorage|sessionStorage|cookie|consent/i)
    expect(helper).not.toMatch(/opt_out_useragent_filter/)
    expect(helper).not.toMatch(/opt_in_capturing|posthog/)
  })

  it("observes an always-available Node from the order probe init script", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")

    expect(spec).toMatch(/function installOrderProbe/)
    expect(spec).toMatch(/addInitScript/)
    expect(spec).toMatch(
      /observer\.observe\(\s*document\s*,\s*\{\s*childList:\s*true\s*,\s*subtree:\s*true\s*\}/
    )
    expect(spec).not.toMatch(
      /observer\.observe\(\s*document\.documentElement/
    )
  })

  it("does not mention navigator.webdriver or disable PostHog bot filtering in product analytics", () => {
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
      expect(source, rel).not.toMatch(/navigator\.webdriver/)
      expect(source, rel).not.toMatch(/opt_out_useragent_filter\s*:\s*true/)
    }
  })

  it("does not change global Playwright browser identity for all suites", () => {
    const playwright = read("playwright.config.ts")
    expect(playwright).toMatch(/devices\["Desktop Chrome"\]/)
    expect(playwright).not.toMatch(/userAgent\s*:/)
    expect(playwright).not.toMatch(/userAgentData/)
    expect(playwright).not.toMatch(/webdriver/)
    expect(playwright).not.toMatch(/HeadlessChrome/)
    expect(playwright).not.toMatch(/javaScriptEnabled/)
    expect(playwright).toMatch(PLAYWRIGHT_TEST_MATCH)
  })

  it("does not synthesize PostHog ingest requests in the analytics suite", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")
    expect(spec).not.toMatch(/sendBeacon\s*\(/)
    expect(spec).not.toMatch(
      /(?:page\.request|request)\.(?:post|get|fetch)\s*\(\s*["'`][^"'`]*\/ingest/
    )
    expect(spec).not.toMatch(/fetch\s*\(\s*["'`][^"'`]*\/ingest/)
    expect(spec).not.toMatch(/new\s+XMLHttpRequest[\s\S]{0,200}\/ingest/)
  })

  it("requires hasPostHogInit to prove a real product-originated POST to /ingest or /ingest/*", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")
    const fn = spec.match(/function hasPostHogInit\([\s\S]*?\n\}/)
    expect(fn?.[0], "hasPostHogInit source").toBeTruthy()
    expect(fn?.[0]).toMatch(/request\.method === ["']POST["']/)
    expect(fn?.[0]).toMatch(/(?:path|pathname) === ["']\/ingest["']/)
    expect(fn?.[0]).toMatch(/(?:path|pathname)\.startsWith\(["']\/ingest\//)
    expect(fn?.[0]).not.toMatch(/sendBeacon/)
    expect(fn?.[0]).not.toMatch(/page\.request/)
    expect(fn?.[0]).not.toMatch(/XMLHttpRequest/)
    expect(fn?.[0]).not.toMatch(/method === ["']GET["']/)
  })

  it("snapshots the live request index before withdraw and forbids a vacuous end slice", () => {
    const spec = read("tests/e2e/analytics-consent.spec.ts")
    const withdrawAt = spec.indexOf(
      'test("withdraw denies before reload and stays dark afterward"'
    )
    expect(withdrawAt).toBeGreaterThanOrEqual(0)
    expect(spec).not.toMatch(/requests\.slice\(\s*requests\.length\s*\)/)
    expect(spec).toMatch(/const requestIndexBeforeWithdraw = requests\.length/)
    expect(spec).toMatch(/vendorRequests\(\s*afterWithdraw\s*\)/)
    const snapshotAt = spec.indexOf(
      "const requestIndexBeforeWithdraw = requests.length",
      withdrawAt
    )
    const clickAt = spec.indexOf(
      'name: "Withdraw analytics consent"',
      withdrawAt
    )
    expect(snapshotAt).toBeGreaterThan(withdrawAt)
    expect(clickAt).toBeGreaterThan(snapshotAt)
  })

  it("keeps consent UI free of anonymous claims", () => {
    const banner = read("components/privacy/consent-banner.tsx")
    expect(banner).toMatch(/Usage analytics/)
    expect(banner).toMatch(/nonessential usage analytics/)
    expect(banner).not.toMatch(/anonymous/i)
    expect(banner).not.toMatch(/anonymized/i)
    expect(banner).not.toMatch(/cookieless/i)
  })
})
