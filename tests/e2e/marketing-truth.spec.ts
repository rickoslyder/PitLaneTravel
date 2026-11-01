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
  describe("homepage call to action", () => {
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
  })

  describe("route limitations are explicit", () => {
    it("presents flights as a search you book with the airline or a travel site", () => {
      const flights = readPublicSource("app/flights/page.tsx")
      expect(flights).toContain(
        "Search flights for a race weekend. These prices are here to help you plan. PitLane doesn't sell flights, so you book with the airline or a travel site."
      )
      expect(flights).toContain("Flight search | PitLane Travel")
    })

    it("labels hotels as a generic external Booking.com city search", () => {
      const hotels = readPublicSource("app/hotels/page.tsx")
      expect(hotels).toMatch(/Booking\.com/)
      expect(hotels).toMatch(/external/i)
      expect(hotels).toMatch(/generic/)
      expect(hotels).toMatch(/distance/)
      expect(hotels).toMatch(/terms/)
    })

    it("keeps the five series in public brand metadata", () => {
      const brand = readPublicSource("config/brand.ts")
      for (const series of fiveSeriesPatterns) {
        expect(brand, `${series.label} must remain in public metadata`).toMatch(series.pattern)
      }
    })

    it("names the five series on the about page", () => {
      const about = readPublicSource("app/(marketing)/about/page.tsx")
      expect(about).toMatch(/Formula 1/)
      expect(about).toMatch(/Formula E/)
      expect(about).toMatch(/MotoGP/)
      expect(about).toMatch(/IndyCar/)
      expect(about).toMatch(/WEC/)
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
      expect(packages).not.toMatch(/getAllTicketPackagesAction/)
      expect(packages).not.toMatch(/basePrice/)
      expect(packages).not.toMatch(/isFeatured/)
      expect(packages).not.toMatch(/Intl\.NumberFormat/)
      expect(packages).not.toMatch(/\bmoney\s*\(/)
      expect(packages).toMatch(/\/races/)
    })

    it("keeps the five series on the grandstand catalogue surface", () => {
      const grandstands = readPublicSource("app/circuits/grandstands/page.tsx")
      for (const series of fiveSeriesPatterns) {
        expect(
          grandstands,
          `${series.label} must remain on the grandstand catalogue surface`
        ).toMatch(series.pattern)
      }
    })

    it("keeps flight search wired to a provider and the race organizer", () => {
      const flightSearch = readPublicSource(
        "components/races/travel/FlightSearch.tsx"
      )
      const flightSearchForm = readPublicSource(
        "components/races/travel/FlightSearchForm.tsx"
      )

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
