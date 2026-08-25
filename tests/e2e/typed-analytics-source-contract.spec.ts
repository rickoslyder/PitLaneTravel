import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

function read(rel: string): string {
  const filePath = path.join(ROOT, rel)
  expect(existsSync(filePath), `missing ${rel}`).toBe(true)
  return readFileSync(filePath, "utf8")
}

describe("PLT-017 typed analytics browser source contract", () => {
  it("keeps the Playwright receipt on a single imported payload decoder", () => {
    const helper = read("tests/e2e/typed-analytics-receipt.ts")
    const spec = read("tests/e2e/typed-analytics.spec.ts")

    expect(helper).toMatch(/export function vendorEventsFromPayload/)
    expect(helper).not.toMatch(/console\.(log|info|debug)\(/)
    expect(spec).toMatch(/from\s+["']\.\/typed-analytics-receipt["']/)
    expect(spec).toMatch(/vendorEventsFromPayload/)
    expect(spec).not.toMatch(/function\s+vendorEventsFromPayload/)
  })

  it("selects typed-analytics.spec.ts in Playwright and excludes it from Vitest", () => {
    const playwright = read("playwright.config.ts")
    const vitest = read("vitest.config.ts")

    expect(playwright).toMatch(/["']typed-analytics\.spec\.ts["']/)
    expect(playwright).toMatch(/retries:\s*0/)
    expect(playwright).toMatch(/workers:\s*process\.env\.CI \? 1/)
    expect(playwright).toMatch(/reuseExistingServer:\s*!process\.env\.CI/)
    expect(playwright).not.toMatch(/testIgnore/)

    expect(vitest).toMatch(/tests\/e2e\/typed-analytics\.spec\.ts/)
    expect(vitest).not.toMatch(
      /exclude:\s*\[[^\]]*["']tests\/e2e\/\*\.spec\.ts["']/
    )
  })

  it("keeps the typed analytics suite fail-closed on the PLT-016 consent plane", () => {
    const spec = read("tests/e2e/typed-analytics.spec.ts")

    expect(spec).toMatch(/from\s+["']\.\/fixtures["']/)
    expect(spec).toMatch(/from\s+["']\.\/analytics-consent-automation["']/)
    expect(spec).toMatch(/installAutomationMarkerNormalization/)
    expect(spec).toMatch(/classifyBrowserRequest/)
    expect(spec).toMatch(/isAppOriginConsoleError/)
    expect(spec).toMatch(/Accept analytics/)
    expect(spec).toMatch(/Usage analytics/)
    expect(spec).toMatch(/View Race Calendar/)
    expect(spec).toMatch(/page viewed|\$pageview/)
    expect(spec).toMatch(/hero calendar CTA clicked|hero_calendar_cta_clicked/)
    expect(spec).toMatch(/schema_version/)
    expect(spec).toMatch(/\/ingest/)
    expect(spec).toMatch(/dataLayer/)
    expect(spec).toMatch(/testInfo\.attach/)
    expect(spec).toMatch(/controlled production-browser PostHog receipt/)
    expect(spec).not.toMatch(/\.(only|skip|fixme)\s*\(/)
    expect(spec).not.toMatch(/waitForTimeout|test\.retry|force:\s*true/)
    expect(spec).not.toMatch(
      /process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)\b/
    )
    expect(spec).not.toMatch(/page\.request\.(post|fetch|get)\s*\(/)
    expect(spec).not.toMatch(/route\.continue\(\s*\{[^}]*postData/)
    expect(spec).not.toMatch(/sendBeacon/)
    expect(spec).not.toMatch(/applyEphemeralClerkSession/)
    expect(spec).not.toMatch(/BEGIN (RSA )?PRIVATE KEY/)
    expect(spec).not.toMatch(/console\.(log|info|debug)\(/)
  })

  it("does not require typed $pageview inside Playwright's default five-second poll or serialize two vendor batch waits", () => {
    const spec = read("tests/e2e/typed-analytics.spec.ts")

    const acceptClick = spec.indexOf(
      'await page.getByRole("button", { name: "Accept analytics", exact: true }).click()'
    )
    const ctaClick = spec.indexOf(
      '.getByRole("link", { name: "View Race Calendar" })'
    )
    expect(acceptClick, "Accept analytics click").toBeGreaterThanOrEqual(0)
    expect(ctaClick, "View Race Calendar click").toBeGreaterThan(acceptClick)
    expect(spec.slice(ctaClick, ctaClick + 140)).toMatch(/\.first\(\)[\s\S]*\.click\(\)/)

    const betweenGrantAndCta = spec.slice(acceptClick, ctaClick)
    expect(betweenGrantAndCta).not.toMatch(/decodedIngestEvents/)
    expect(betweenGrantAndCta).not.toMatch(/\$pageview/)
    expect(betweenGrantAndCta).toMatch(/page_view|toBeHidden|toBeVisible/)

    const ingestPolls: string[] = []
    for (
      let from = 0, pollAt = spec.indexOf(".poll(", from);
      pollAt >= 0;
      from = pollAt + 6, pollAt = spec.indexOf(".poll(", from)
    ) {
      const toBeAt = spec.indexOf(".toBe(", pollAt)
      const body = spec.slice(pollAt, toBeAt === -1 ? pollAt + 400 : toBeAt)
      if (body.includes("decodedIngestEvents")) {
        ingestPolls.push(body)
      }
    }
    expect(ingestPolls, "one PostHog batch poll").toHaveLength(1)

    const poll = ingestPolls[0]
    expect(poll).toMatch(/\$pageview/)
    expect(poll).toMatch(/hero calendar CTA clicked/)
    expect(poll).toMatch(/timeout:\s*(?:1[5-9]_?000|20_?000)\b/)
    expect(spec.indexOf(poll), "vendor poll after CTA").toBeGreaterThan(ctaClick)
    expect(poll).toMatch(/requestIndexBeforeGrant/)
    expect(poll).not.toMatch(/requestIndexBeforeCta/)
  })

  it("installs automation-marker normalization before first navigation on typed and consent paths", () => {
    const spec = read("tests/e2e/typed-analytics.spec.ts")
    const consent = read("tests/e2e/analytics-consent.spec.ts")
    const helper = read("tests/e2e/analytics-consent-automation.ts")

    expect(spec).toMatch(
      /test\.beforeEach\(\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{[\s\S]*installAutomationMarkerNormalization\(\s*page\s*\)/
    )
    expect(consent).toMatch(
      /test\.beforeEach\(\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{[\s\S]*installAutomationMarkerNormalization\(\s*page\s*\)/
    )
    expect(consent).toMatch(
      /async function openSecondPage[\s\S]*installAutomationMarkerNormalization\(\s*page\s*\)/
    )
    expect(helper).toMatch(
      /Object\.defineProperty\(\s*navigator\s*,\s*["']userAgent["']/
    )
  })

  it("does not synthesize ingest traffic or directly call PostHog from the typed receipt", () => {
    const spec = read("tests/e2e/typed-analytics.spec.ts")
    const helper = read("tests/e2e/analytics-consent-automation.ts")

    expect(spec).not.toMatch(/sendBeacon\s*\(/)
    expect(spec).not.toMatch(/new\s+XMLHttpRequest/)
    expect(spec).not.toMatch(/page\.request\.(post|get|fetch)\s*\(/)
    expect(spec).not.toMatch(/fetch\s*\(\s*["'`][^"'`]*\/ingest/)
    expect(spec).not.toMatch(
      /posthog\.(capture|init|opt_in_capturing|opt_out_capturing)\s*\(/
    )
    expect(helper).not.toMatch(/sendBeacon/)
    expect(helper).not.toMatch(/XMLHttpRequest/)
    expect(helper).not.toMatch(/posthog/)
    expect(helper).not.toMatch(/\/ingest/)
  })

  it("reviews app-defined custom properties instead of scanning the vendor transport envelope", () => {
    const helper = read("tests/e2e/typed-analytics-receipt.ts")
    const spec = read("tests/e2e/typed-analytics.spec.ts")

    expect(helper).toMatch(/export function isPostHogTransportEnvelopeKey/)
    expect(helper).toMatch(/export function appDefinedCustomPropertyReview/)
    expect(helper).toMatch(/startsWith\(\s*["']\$["']\s*\)/)
    expect(helper).toMatch(/===\s*["']token["']/)
    expect(helper).toMatch(/===\s*["']distinct_id["']/)
    expect(helper).toMatch(/===\s*["']title["']/)
    expect(helper).toMatch(/schema_version/)
    expect(helper).toMatch(/["']route["']/)
    expect(helper).toMatch(/hero calendar CTA clicked/)
    expect(helper).not.toMatch(/token_hint|distinct_id_backup|page_title/)
    expect(helper).not.toMatch(/FORBIDDEN_PII/)
    expect(helper).not.toMatch(/console\.(log|info|debug)\(/)

    expect(spec).toMatch(/appDefinedCustomPropertyReview/)
    expect(spec).toMatch(/unapprovedCustomKeys/)
    expect(spec).toMatch(/privacyScanMaterial/)
    expect(spec).toMatch(/approvedCustomProperties/)
    expect(spec).toMatch(/FORBIDDEN_PII/)
    expect(spec).not.toMatch(
      /assertNoForbiddenAnalyticsMaterial\(\s*vendorEvents\s*\)/
    )
    expect(spec).toMatch(
      /assertNoForbiddenAnalyticsMaterial\(\s*\[\s*gtmPage\s*,\s*gtmHero\s*\]\s*\)/
    )
    expect(spec).toMatch(/schema_version:\s*1/)
    expect(spec).toMatch(/route:\s*["']\/["']/)
    expect(spec).toMatch(/kind:\s*["']controlled production-browser PostHog receipt["']/)
    expect(spec).toMatch(/url_path:\s*sampleUrl\.pathname/)
    expect(spec).not.toMatch(/distinct_id/)
    const receiptStart = spec.indexOf("const receipt = {")
    expect(receiptStart, "redacted receipt object").toBeGreaterThanOrEqual(0)
    const receiptBlock = spec.slice(receiptStart, spec.indexOf("}", spec.lastIndexOf("assertions:")))
    expect(receiptBlock).not.toMatch(/token|distinct_id|bodyBuffer|postData|searchParams/)
  })
})
