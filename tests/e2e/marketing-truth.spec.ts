import { readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { subscribeToNewsletter } from "@/actions/newsletter-actions"

const root = process.cwd()

function readPublicSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

function combinedSource(relativePaths: string[]): string {
  return relativePaths
    .map(relativePath => `/* ${relativePath} */\n${readPublicSource(relativePath)}`)
    .join("\n")
}

const homepageCopyFiles = [
  "app/(marketing)/page.tsx",
  "app/(marketing)/layout.tsx",
  "components/landing/hero.tsx",
  "components/landing/features.tsx",
  "components/landing/upcoming-races.tsx",
  "components/WhyChooseFeaturesSection.tsx",
  "components/TestimonialSection.tsx",
  "components/FaqSection.tsx",
  "components/CtaSection.tsx",
  "components/_components/circuit-explorer-header.tsx",
  "config/brand.ts"
]

const publicMarketingFiles = [
  ...homepageCopyFiles,
  "app/(marketing)/about/page.tsx",
  "app/(marketing)/faq/page.tsx",
  "app/(marketing)/help/page.tsx"
]

const publicChromeFiles = [
  "app/(marketing)/layout.tsx",
  "app/not-found.tsx",
  "components/header.tsx"
]

const remainingPublicSurfaceFiles = [
  "app/packages/page.tsx",
  "app/circuits/grandstands/page.tsx",
  "components/races/travel/FlightSearch.tsx",
  "components/races/travel/FlightSearchForm.tsx"
]

const fiveSeriesPatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: "F1", pattern: /\bF1\b|Formula 1/ },
  { label: "Formula E", pattern: /Formula E/ },
  { label: "MotoGP", pattern: /MotoGP/ },
  { label: "IndyCar", pattern: /IndyCar/ },
  { label: "WEC", pattern: /\bWEC\b/ }
]

describe("PLT-006 public marketing truth", () => {
  describe("homepage copy forbids known unsupported claims", () => {
    const homepage = combinedSource(homepageCopyFiles)
    const marketing = combinedSource(publicMarketingFiles)

    it("does not claim completeness at any circuit or in any series", () => {
      expect(marketing).not.toMatch(/at any circuit,\s*in any series/i)
      expect(marketing).not.toMatch(/every series worldwide/i)
      expect(homepage).not.toMatch(/Hotels Near Every Circuit/i)
    })

    it("does not advertise VIP paddock or garage access as a PitLane product", () => {
      expect(homepage).not.toMatch(/VIP Experiences/)
      expect(marketing).not.toMatch(/paddock club/i)
      expect(marketing).not.toMatch(/team garage tours/i)
    })

    it("does not invent staff expertise, constant updates, reviews, or best value", () => {
      expect(marketing).not.toMatch(/motorsport experts constantly/i)
      expect(marketing).not.toMatch(/constantly updates? our/i)
      expect(marketing).not.toMatch(/user reviews/i)
      expect(homepage).not.toMatch(/Community Reviews/)
      expect(marketing).not.toMatch(/best value/i)
      expect(marketing).not.toMatch(/expert circuit guides/i)
      expect(marketing).not.toMatch(/Regular Updates/)
    })

    it("does not publish placeholder users, testimonials, or fake scale", () => {
      expect(homepage).not.toContain("Sarah L.")
      expect(homepage).not.toContain("Mike R.")
      expect(homepage).not.toContain("Emma T.")
      expect(homepage).not.toMatch(/Join thousands of race fans/i)
      expect(homepage).not.toMatch(/What Our Users Say/)
    })

    it("does not claim package partners or that PitLane is assembling bundles", () => {
      expect(marketing).not.toMatch(/ticketing partners/i)
      expect(marketing).not.toMatch(/trusted partners who offer various race travel packages/i)
      expect(marketing).not.toMatch(/insider knowledge/i)
      expect(marketing).not.toMatch(/local secrets/i)
      expect(marketing).not.toMatch(/Our race weekend packages typically include/i)
    })

    it("does not present a live newsletter form or success implication", () => {
      const cta = readPublicSource("components/CtaSection.tsx")
      expect(cta).not.toMatch(/type=["']email["']/)
      expect(cta).not.toMatch(/subscribeToNewsletter/)
      expect(cta).not.toMatch(/Enter your email/)
      expect(cta).not.toMatch(/Get Started Now/)
      expect(cta).toMatch(/\/races/)
    })
  })

  describe("five-series public catalogue remains", () => {
    it("keeps F1, Formula E, MotoGP, IndyCar and WEC on the public homepage surface", () => {
      const surface = combinedSource([
        "components/landing/hero.tsx",
        "config/brand.ts",
        "app/(marketing)/layout.tsx"
      ])

      for (const series of fiveSeriesPatterns) {
        expect(surface, `${series.label} must remain on the public catalogue surface`).toMatch(
          series.pattern
        )
      }
    })

    it("does not shrink public chrome to an F1-only product", () => {
      const chrome = combinedSource(publicChromeFiles)
      expect(chrome).not.toMatch(/trusted platform for Formula 1 travel planning/i)
    })
  })

  describe("route limitations are explicit", () => {
    it("states that PitLane does not currently sell race-weekend packages and names no partners", () => {
      const packages = readPublicSource("app/packages/page.tsx")
      expect(packages).toContain(
        "PitLane Travel does not currently sell race-weekend packages"
      )
      expect(packages).not.toMatch(/ticketing partners/i)
      expect(packages).not.toMatch(/Curated race weekend packages/i)
      expect(packages).not.toMatch(/Curated bundles that combine tickets/i)
    })

    it("presents flights as a search affordance with an external handoff, not PitLane booking", () => {
      const flights = readPublicSource("app/flights/page.tsx")
      expect(flights).toMatch(/Search flight options/)
      expect(flights).toMatch(/external|provider/i)
      expect(flights).not.toMatch(/Search and book flights/i)
      expect(flights).not.toMatch(/book flights for your F1 race weekend/i)
    })

    it("labels hotels as a generic external Booking.com city search, not verified stays", () => {
      const hotels = readPublicSource("app/hotels/page.tsx")
      expect(hotels).toMatch(/Booking\.com/)
      expect(hotels).toMatch(/external/i)
      expect(hotels).toMatch(/generic/)
      expect(hotels).toMatch(/distance/)
      expect(hotels).toMatch(/terms/)
      expect(hotels).not.toMatch(/verified stays/i)
      expect(hotels).not.toMatch(/Hotels Near Every Circuit/i)
      expect(hotels).not.toMatch(/\bnearby\b/i)
      expect(hotels).not.toMatch(/sponsored/i)
    })

    it("keeps public brand metadata free of expert-guide, ticket, and package sales claims", () => {
      const brand = readPublicSource("config/brand.ts")
      expect(brand).not.toMatch(/expert circuit guides/i)
      expect(brand).not.toMatch(/grand prix packages/i)
      expect(brand).not.toMatch(/Formula 1 tickets/)
      expect(brand).not.toMatch(/MotoGP tickets/)
      for (const series of fiveSeriesPatterns) {
        expect(brand, `${series.label} must remain in public metadata`).toMatch(series.pattern)
      }
    })

    it("states public about and FAQ limits without ticket-delivery or community-review claims", () => {
      const about = readPublicSource("app/(marketing)/about/page.tsx")
      const faq = readPublicSource("app/(marketing)/faq/page.tsx")
      expect(about).toMatch(/Formula 1/)
      expect(about).toMatch(/Formula E/)
      expect(about).toMatch(/MotoGP/)
      expect(about).toMatch(/IndyCar/)
      expect(about).toMatch(/WEC/)
      expect(about).not.toMatch(/community insights/i)
      expect(about).not.toMatch(/Read reviews, tips, and recommendations from the community/i)
      expect(faq).toContain("PitLane Travel does not currently sell race-weekend packages")
      expect(faq).not.toMatch(/Most tickets are delivered digitally through our secure platform/i)
      expect(faq).not.toMatch(/we can arrange private or shared airport transfers/i)
      expect(faq).not.toMatch(/or live chat/i)
      expect(faq).not.toMatch(/extended support hours/i)
    })
  })

  describe("remaining public-surface class defects", () => {
    const remaining = combinedSource(remainingPublicSurfaceFiles)

    it("reads the package, grandstand, and both flight-search sources", () => {
      expect(remainingPublicSurfaceFiles).toEqual([
        "app/packages/page.tsx",
        "app/circuits/grandstands/page.tsx",
        "components/races/travel/FlightSearch.tsx",
        "components/races/travel/FlightSearchForm.tsx"
      ])
      expect(remaining).toContain("/* app/packages/page.tsx */")
      expect(remaining).toContain("/* app/circuits/grandstands/page.tsx */")
      expect(remaining).toContain("/* components/races/travel/FlightSearch.tsx */")
      expect(remaining).toContain("/* components/races/travel/FlightSearchForm.tsx */")
    })

    it("packages cannot fetch or render inventory or prices", () => {
      const packages = readPublicSource("app/packages/page.tsx")
      expect(packages).toContain(
        "PitLane Travel does not currently sell race-weekend packages"
      )
      expect(packages).not.toMatch(/getAllTicketPackagesAction/)
      expect(packages).not.toMatch(/basePrice/)
      expect(packages).not.toMatch(/isFeatured/)
      expect(packages).not.toMatch(/Intl\.NumberFormat/)
      expect(packages).not.toMatch(/\bmoney\s*\(/)
      expect(packages).not.toMatch(/Featured/)
      expect(packages).not.toMatch(/ticketing partners/i)
      expect(packages).toMatch(/\/races/)
    })

    it("grandstands cannot claim best, every, worldwide, perfect, or top-pick completeness", () => {
      const grandstands = readPublicSource("app/circuits/grandstands/page.tsx")
      expect(grandstands).not.toMatch(/Best Seats at Every Circuit/i)
      expect(grandstands).not.toMatch(/worldwide/i)
      expect(grandstands).not.toMatch(/perfect viewing spot/i)
      expect(grandstands).not.toMatch(/best seats/i)
      expect(grandstands).not.toMatch(/every stand/i)
      expect(grandstands).not.toMatch(/Top pick/i)
      expect(grandstands).not.toMatch(/book the right seat/i)
      expect(grandstands).toMatch(/coverage varies/i)
      for (const series of fiveSeriesPatterns) {
        expect(
          grandstands,
          `${series.label} must remain on the grandstand catalogue surface`
        ).toMatch(series.pattern)
      }
    })

    it("flight search cannot hard-code Paddock Club, VIP, or unsupported price timing", () => {
      const flightSearch = readPublicSource(
        "components/races/travel/FlightSearch.tsx"
      )
      const flightSearchForm = readPublicSource(
        "components/races/travel/FlightSearchForm.tsx"
      )
      const flights = combinedSource([
        "components/races/travel/FlightSearch.tsx",
        "components/races/travel/FlightSearchForm.tsx"
      ])

      expect(flights).not.toMatch(/Paddock Club/i)
      expect(flights).not.toMatch(/VIP Events/i)
      expect(flights).not.toMatch(/best rates/i)
      expect(flights).not.toMatch(/2-3\s+months/i)
      expect(flights).not.toMatch(/prices typically increase/i)
      expect(flightSearch).toMatch(/provider/i)
      expect(flightSearchForm).toMatch(/organizer/i)
    })
  })

  describe("newsletter action", () => {
    const spies: Array<ReturnType<typeof vi.spyOn>> = []

    afterEach(() => {
      for (const spy of spies) {
        spy.mockRestore()
      }
      spies.length = 0
    })

    it("cannot claim subscription success or log an email when invoked directly", async () => {
      const email = "plt006-probe@example.com"
      spies.push(
        vi.spyOn(console, "log").mockImplementation(() => {}),
        vi.spyOn(console, "info").mockImplementation(() => {}),
        vi.spyOn(console, "debug").mockImplementation(() => {}),
        vi.spyOn(console, "warn").mockImplementation(() => {}),
        vi.spyOn(console, "error").mockImplementation(() => {})
      )

      const formData = new FormData()
      formData.set("email", email)
      const result = await subscribeToNewsletter(null, formData)

      expect(result.success).not.toBe(true)
      expect(String(result.message ?? "")).not.toMatch(/thank you for subscribing/i)
      expect(String(result.message ?? "")).not.toMatch(/check your email/i)

      const logged = spies
        .flatMap(spy => spy.mock.calls)
        .flat()
        .map(value => String(value))
        .join(" ")
      expect(logged).not.toContain(email)
    })
  })
})
