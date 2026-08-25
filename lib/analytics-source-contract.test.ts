import { existsSync, readdirSync, readFileSync } from "node:fs"
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
      "components/utilities/posthog/posthog-user-identity.tsx",
      "lib/analytics/events.ts",
      "lib/analytics/capture.ts"
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

  it("opts into PostHog from the public loaded callback during a single consent-gated init", () => {
    const vendors = read("lib/analytics-vendors.ts")
    const lifecycle = read("lib/analytics-lifecycle.ts")

    expect(vendors).toMatch(
      /loaded\s*\(\s*\w+\s*\)\s*\{[\s\S]*?\b\w+\.opt_in_capturing\(\)/
    )
    expect(vendors).toMatch(/opt_out_capturing_by_default:\s*true/)
    expect(vendors).toMatch(/opt_out_persistence_by_default:\s*true/)
    expect(vendors).toMatch(/initPostHogAfterConsent\s*\(/)
    expect(vendors).not.toMatch(/optInPostHog/)
    expect(vendors).not.toMatch(/initPostHog\s*\(/)
    expect(lifecycle).toMatch(/initPostHogAfterConsent/)
    expect(lifecycle).not.toMatch(/optInPostHog/)
    expect(lifecycle).not.toMatch(/adapters\.initPostHog\(\)/)
    expect(lifecycle).not.toMatch(/adapters\.optInPostHog\(\)/)
    expect(lifecycle).not.toMatch(/opt_in_capturing/)
  })

  it("does not enable the PostHog queue via private internals, batching disable, or flush hacks", () => {
    const files = [
      "lib/analytics-consent.ts",
      "lib/analytics-events.ts",
      "lib/analytics-lifecycle.ts",
      "lib/analytics-vendors.ts",
      "lib/analytics/capture.ts",
      "lib/analytics/events.ts",
      "components/privacy/analytics-controller.tsx",
      "components/privacy/consent-banner.tsx",
      "components/utilities/posthog/posthog-provider.tsx",
      "components/utilities/posthog/posthog-pageview.tsx",
      "components/utilities/posthog/posthog-user-identity.tsx"
    ]
    for (const rel of files) {
      const source = read(rel)
      expect(source, rel).not.toMatch(/_requestQueue/)
      expect(source, rel).not.toMatch(/_start_queue_if_opted_in/)
      expect(source, rel).not.toMatch(/request_batching\s*:\s*false/)
      expect(source, rel).not.toMatch(/send_instantly/)
      expect(source, rel).not.toMatch(/\.flush\s*\(/)
      expect(source, rel).not.toMatch(/opt_out_capturing_by_default\s*:\s*false/)
      expect(source, rel).not.toMatch(/opt_out_persistence_by_default\s*:\s*false/)
    }
  })

  it("does not add skip, fixme, only, retries, waitForTimeout, or force in Packet A tests", () => {
    const tests = [
      "lib/analytics-consent.test.ts",
      "lib/analytics-events.test.ts",
      "lib/analytics-lifecycle.test.ts",
      "lib/analytics-source-contract.test.ts",
      "lib/analytics-vendors.test.ts",
      "components/privacy/consent-banner.test.ts",
      "lib/analytics/events.test.ts",
      "lib/analytics/capture.test.ts",
      "lib/analytics/capture.types.test.ts",
      "tests/e2e/typed-analytics.spec.ts"
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

describe("PLT-017 typed analytics source contract", () => {
  it("pageview has exactly one mounted owner and no duplicate GTM tracker", () => {
    const layout = read("app/layout.tsx")
    const pageview = read("components/utilities/posthog/posthog-pageview.tsx")

    expect(layout).toMatch(/<PostHogPageview\s*\/>/)
    expect(layout.match(/<PostHogPageview\s*\/>/g)?.length).toBe(1)
    expect(layout).not.toMatch(/PageViewTracker/)
    expect(layout).not.toMatch(/from\s+["']\.\/components\/gtm\/page-view-tracker["']/)
    expect(existsSync(path.join(root, "app/components/gtm/page-view-tracker.tsx"))).toBe(
      false
    )

    expect(pageview).toMatch(/from\s+["']@\/lib\/analytics\/capture["']/)
    expect(pageview).toMatch(/captureAnalyticsEvent\s*\(/)
    expect(pageview).toMatch(/event:\s*["']page viewed["']/)
    expect(pageview).not.toMatch(/capturePostHog/)
    expect(pageview).not.toMatch(/sendGTMEvent/)
    expect(pageview).not.toMatch(/userId/)
    expect(pageview).not.toMatch(/external_id/)
    expect(pageview).toMatch(/useEffect/)
  })

  it("migrated Packet A callers import only the typed capture API", () => {
    const hero = read("components/landing/hero.tsx")
    const pageview = read("components/utilities/posthog/posthog-pageview.tsx")

    for (const [rel, source] of [
      ["components/landing/hero.tsx", hero],
      ["components/utilities/posthog/posthog-pageview.tsx", pageview]
    ] as const) {
      expect(source, rel).toMatch(/from\s+["']@\/lib\/analytics\/capture["']/)
      expect(source, rel).not.toMatch(/from\s+["']@\/lib\/analytics-events["']/)
      expect(source, rel).not.toMatch(/capturePostHog/)
      expect(source, rel).not.toMatch(/sendGTMEvent/)
      expect(source, rel).not.toMatch(/from\s+["']posthog-js["']/)
      expect(source, rel).not.toMatch(/@next\/third-parties\/google/)
    }

    expect(hero).toMatch(/hero calendar CTA clicked/)
    expect(hero).toMatch(/hero compare CTA clicked/)
  })

  it("keeps vendor capture centralized behind the PLT-016 seam", () => {
    const capture = read("lib/analytics/capture.ts")
    const events = read("lib/analytics/events.ts")

    expect(capture).toMatch(/from\s+["']@\/lib\/analytics-events["']/)
    expect(capture).not.toMatch(/from\s+["']posthog-js["']/)
    expect(capture).not.toMatch(/from\s+["']@next\/third-parties\/google["']/)
    expect(capture).not.toMatch(/posthog\.capture\s*\(/)
    expect(events).not.toMatch(/from\s+["']posthog-js["']/)
    expect(events).not.toMatch(/from\s+["']@next\/third-parties\/google["']/)
  })

  it("exports a compile-time AnalyticsEventInput union and types capture to it", () => {
    const events = read("lib/analytics/events.ts")
    const capture = read("lib/analytics/capture.ts")
    const compile = read("lib/analytics/capture-compile-contract.ts")
    const types = read("lib/analytics/capture.types.test.ts")

    expect(events).toMatch(/export type AnalyticsEventInput/)
    expect(events).toMatch(/hero calendar CTA clicked/)
    expect(events).toMatch(/hero compare CTA clicked/)
    expect(events).toMatch(/race viewed/)
    expect(events).toMatch(/trip created/)
    expect(events).toMatch(/trip viewed/)
    expect(events).toMatch(/flight offer selected/)
    expect(events).toMatch(/flight checkout begun/)
    expect(events).toMatch(/flight payment info submitted/)
    expect(events).toMatch(/flight purchase completed/)
    expect(capture).toMatch(/input:\s*AnalyticsEventInput/)
    expect(capture).not.toMatch(
      /export function captureAnalyticsEvent\(input: unknown\)/
    )
    expect(capture).not.toMatch(
      /return function captureAnalyticsEvent\(input: unknown\)/
    )
    expect(compile).toMatch(/@ts-expect-error invalid event name/)
    expect(compile).toMatch(/@ts-expect-error unknown free-form property/)
    expect(types).toMatch(/expectTypeOf\(captureAnalyticsEvent\)/)
  })

  it("migrates every product emitter onto typed capture with no dead hero handler", () => {
    const callers: Array<[string, string]> = [
      [
        "components/landing/hero.tsx",
        "hero calendar CTA clicked|hero compare CTA clicked"
      ],
      ["components/utilities/posthog/posthog-pageview.tsx", "page viewed"],
      ["components/races/RaceDetailsPage.tsx", "race viewed"],
      ["components/trip-planner-button.tsx", "trip created"],
      ["app/trips/[id]/_components/trip-details.tsx", "trip viewed"],
      ["components/races/travel/FlightOffers.tsx", "flight offer selected"],
      [
        "components/races/travel/FlightBookingForm.tsx",
        "flight checkout begun|flight payment info submitted|flight purchase completed"
      ]
    ]

    for (const [rel, eventPattern] of callers) {
      const source = read(rel)
      expect(source, rel).toMatch(/from\s+["']@\/lib\/analytics\/capture["']/)
      expect(source, rel).toMatch(/captureAnalyticsEvent\s*\(/)
      expect(source, rel).toMatch(new RegExp(eventPattern))
      expect(source, rel).not.toMatch(/from\s+["']@\/lib\/analytics-events["']/)
      expect(source, rel).not.toMatch(/capturePostHog/)
      expect(source, rel).not.toMatch(/sendGTMEvent/)
      expect(source, rel).not.toMatch(/from\s+["']posthog-js["']/)
      expect(source, rel).not.toMatch(/@next\/third-parties\/google/)
    }

    const hero = read("components/landing/hero.tsx")
    expect(hero).not.toMatch(/handleGetStartedClick/)
    expect(hero).not.toMatch(/hero get started clicked/)
    expect(hero).toMatch(/href=["']\/races["']/)
    expect(hero).toMatch(/href=["']\/races\/compare["']/)
    expect(hero).toMatch(/hero calendar CTA clicked/)
    expect(hero).toMatch(/hero compare CTA clicked/)
  })

  it("moves TripDetails analytics into a single consent-safe effect", () => {
    const source = read("app/trips/[id]/_components/trip-details.tsx")
    expect(source).toMatch(/useEffect/)
    expect(source).toMatch(
      /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*captureAnalyticsEvent\(\{\s*event:\s*["']trip viewed["']\s*\}\)[\s\S]*\}\s*,/
    )
    const renderBody = source.replace(
      /useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[[^\]]*\]\s*\)/g,
      ""
    )
    expect(renderBody).not.toMatch(/captureAnalyticsEvent\s*\(/)
    expect(renderBody).not.toMatch(/sendGTMEvent\s*\(/)
  })

  it("forbids product files from importing low-level vendor capture or sending PII analytics fields", () => {
    const files = walk(root)
    const adapter = path.join(root, "lib/analytics-events.ts")
    const typedCapture = path.join(root, "lib/analytics/capture.ts")
    const forbiddenImport =
      /import\s*\{[^}]*(?:sendGTMEvent|capturePostHog)[^}]*\}\s*from\s*["']@\/lib\/analytics-events["']/
    const piiInCall =
      /(?:captureAnalyticsEvent|sendGTMEvent)\s*\(\s*\{[^}]*\b(?:email|email_address|notes|passenger|passengers|passenger_type|phone|phone_number|dob|born_on|gender|external_id|user_id|userId|item_name|first_name|last_name|given_name|family_name)\b/

    for (const file of files) {
      if (file.endsWith(".test.ts") || file.endsWith(".spec.ts")) {
        continue
      }
      if (
        file.endsWith("capture-compile-contract.ts") ||
        file.endsWith("capture.types.test.ts")
      ) {
        continue
      }
      const source = readFileSync(file, "utf8")
      if (file !== adapter && file !== typedCapture) {
        expect(source, file).not.toMatch(forbiddenImport)
      }
      if (file !== adapter && file !== typedCapture) {
        expect(source, file).not.toMatch(piiInCall)
      }
    }

    const gtmHelper = read("lib/google-tag-manager.ts")
    expect(gtmHelper).not.toMatch(/sendGTMEvent/)
    expect(gtmHelper).not.toMatch(/RacePageViewEvent/)
    expect(gtmHelper).toMatch(/export const gtmPixelID/)
    expect(gtmHelper).toMatch(/export const gtmServerID/)

    const booking = read("components/races/travel/FlightBookingForm.tsx")
    expect(booking).toMatch(/fetch\(\s*["']\/api\/flights\/book["']/)
    expect(booking).toMatch(/passengers:\s*formattedPassengers/)
    expect(booking).toMatch(/offerId:\s*offer\.id/)
    expect(booking).toMatch(/raceId/)
  })

  it("models consent-preserving reset in the injected guard, not an untestable default callback", () => {
    const source = read("lib/analytics-events.ts")
    const factoryStart = source.indexOf("export function createAnalyticsEventGuards")
    const defaultStart = source.indexOf("const defaultGuards")
    expect(factoryStart).toBeGreaterThanOrEqual(0)
    expect(defaultStart).toBeGreaterThan(factoryStart)
    const factory = source.slice(factoryStart, defaultStart)

    expect(factory).toMatch(/deps\.reset\(\)/)
    expect(factory).toMatch(
      /deps\.optInCapturing\(\{\s*captureEventName:\s*false\s*\}\)/
    )
    expect(factory).not.toMatch(/posthog\.reset/)
    expect(factory).not.toMatch(/posthog\.opt_in_capturing/)

    const defaults = source.slice(defaultStart)
    const resetCallback = defaults.match(/reset\s*\(\s*\)\s*\{[^}]*\}/)?.[0]
    expect(resetCallback).toMatch(/posthog\.reset\(\)/)
    expect(resetCallback).not.toMatch(/opt_in_capturing/)
    expect(defaults).toMatch(/posthog\.opt_in_capturing\(\s*options\s*\)/)
  })

  it("PostHogUserIdentify waits for Clerk isLoaded before identify or reset", () => {
    const source = read(
      "components/utilities/posthog/posthog-user-identity.tsx"
    )

    expect(source).not.toMatch(/from\s+["']posthog-js["']/)
    expect(source).not.toMatch(/posthog\./)
    expect(source).toMatch(
      /from\s+["']@\/lib\/analytics-events["']/
    )
    expect(source).toMatch(/const \{\s*user,\s*isLoaded\s*\} = useUser\(\)/)

    const consentGuard = source.search(
      /if\s*\(\s*consent\s*!==\s*["']granted["']\s*\)\s*\{\s*return\s*\}/
    )
    const loadedGuard = source.search(
      /if\s*\(\s*!isLoaded\s*\)\s*\{\s*return\s*\}/
    )
    const identifyCall = source.search(/identifyPostHog\(\s*user\.id\s*\)/)
    const resetCall = source.search(/resetPostHog\(\s*\)/)

    expect(consentGuard, "granted consent guard").toBeGreaterThanOrEqual(0)
    expect(loadedGuard, "isLoaded guard").toBeGreaterThan(consentGuard)
    expect(identifyCall, "identify signed-in").toBeGreaterThan(loadedGuard)
    expect(resetCall, "reset signed-out").toBeGreaterThan(loadedGuard)
    expect(source).toMatch(/user\?\.id/)
    expect(source).toMatch(/\[consent,\s*isLoaded,\s*user\?\.id\]/)
  })

  it("does not use private PostHog consent internals, storage mutation, or capture bypasses", () => {
    const files = [
      "lib/analytics-events.ts",
      "components/utilities/posthog/posthog-user-identity.tsx"
    ]
    for (const rel of files) {
      const source = read(rel)
      expect(source, rel).not.toMatch(/consent\.reset/)
      expect(source, rel).not.toMatch(/consent\.optInOut/)
      expect(source, rel).not.toMatch(/_sync_opt_out_with_persistence/)
      expect(source, rel).not.toMatch(/_requestQueue/)
      expect(source, rel).not.toMatch(/_start_queue_if_opted_in/)
      expect(source, rel).not.toMatch(/localStorage/)
      expect(source, rel).not.toMatch(/sessionStorage/)
      expect(source, rel).not.toMatch(/document\.cookie/)
      expect(source, rel).not.toMatch(
        /opt_out_capturing_by_default\s*:\s*false/
      )
      expect(source, rel).not.toMatch(
        /opt_out_persistence_by_default\s*:\s*false/
      )
      expect(source, rel).not.toMatch(/opt_out_useragent_filter/)
      expect(source, rel).not.toMatch(/custom_blocked_useragents/)
      expect(source, rel).not.toMatch(/request_batching\s*:\s*false/)
      expect(source, rel).not.toMatch(/send_instantly/)
      expect(source, rel).not.toMatch(/\.flush\s*\(/)
      expect(source, rel).not.toMatch(
        /process\.env\.(NODE_ENV|VERCEL_ENV|CI|PLAYWRIGHT)/
      )
      expect(source, rel).not.toMatch(/navigator\.userAgent/)
    }

    const events = read("lib/analytics-events.ts")
    expect(events).toMatch(
      /optInCapturing\(\{\s*captureEventName:\s*false\s*\}\)/
    )
    expect(events).not.toMatch(/opt_in_capturing\(\s*\)/)
  })
})
