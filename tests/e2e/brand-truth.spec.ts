import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { brand } from "@/config/brand"

const root = process.cwd()

function readSource(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
}

function stringLiterals(source: string): string[] {
  const matches = stripComments(source).match(/["'`](?:\\.|[^\\"'`])*["'`]/g) ?? []
  return matches.map(literal => literal.slice(1, -1))
}

const primaryChromeFiles = [
  "config/brand.ts",
  "app/layout.tsx",
  "app/(marketing)/layout.tsx",
  "app/not-found.tsx",
  "components/header.tsx"
] as const

const metadataFiles = ["app/layout.tsx", "app/(marketing)/page.tsx"] as const

const fiveSeriesPatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: "Formula 1", pattern: /Formula 1|\bF1\b/ },
  { label: "Formula E", pattern: /Formula E/ },
  { label: "MotoGP", pattern: /MotoGP/ },
  { label: "IndyCar", pattern: /IndyCar/ },
  { label: "WEC", pattern: /\bWEC\b/ }
]

const competingSpellings = ["Pit Lane Travel", "Pitlane Travel", "Pit-Lane Travel"]
const staleF1Companion = "Your F1 Travel Companion"

const legacyExceptionFiles = [
  "components/Footer.tsx",
  "logos/PitLaneTravelLogo.tsx",
  "emails/confirmation-email.tsx",
  "app/races/metadata.ts",
  "docs/product/day-70-contract.md",
  "SPEC.md"
] as const

describe("PLT-008 brand truth", () => {
  describe("config/brand.ts is the single temporary name source", () => {
    const brandSource = readSource("config/brand.ts")
    const brandCode = stripComments(brandSource)

    it("keeps exactly one temporary PitLane Travel name literal and no displayName alias", () => {
      const nameLiterals = stringLiterals(brandSource).filter(
        value => value === "PitLane Travel"
      )
      expect(nameLiterals).toHaveLength(1)
      expect(brandCode).toMatch(/\bconst\s+temporaryDisplayName\b/)
      expect(brandSource.indexOf("const temporaryDisplayName")).toBeLessThan(
        brandSource.indexOf("export const brand")
      )
      expect(brandCode).toMatch(/\bname\s*:\s*temporaryDisplayName\b/)
      expect(brandCode).not.toMatch(/\bdisplayName\s*:/)
      expect(brand).not.toHaveProperty("displayName")
      expect(Object.keys(brand).filter(key => /name/i.test(key))).toEqual(["name"])
      expect(brand.name).toBe("PitLane Travel")
      expect(brand.name).toBe(nameLiterals[0])
    })

    it("records that the styling choice is unresolved and the name is temporary", () => {
      expect(brandSource).toMatch(/unresolved/i)
      expect(brandSource).toMatch(/temporary/i)
    })

    it("centralizes five-series decision-layer positioning with supplier handoff", () => {
      expect(brand).toHaveProperty("positioningShort")
      expect(typeof brand.positioningShort).toBe("string")
      expect(brand.positioningShort.length).toBeGreaterThan(40)
      expect(brand.positioningShort).toMatch(/decision layer/i)
      expect(brand.positioningShort).toMatch(/hand\s*off/i)
      expect(brand.positioningShort).toMatch(/external suppliers?/i)
      expect(brand.positioningShort).not.toMatch(/expert|complete|booking|team/i)
      for (const series of fiveSeriesPatterns) {
        expect(
          brand.positioningShort,
          `${series.label} must remain in centralized positioning`
        ).toMatch(series.pattern)
      }
    })

    it("centralizes conditional, non-overclaiming affiliate disclosure copy", () => {
      expect(brand).toHaveProperty("affiliateDisclosureShort")
      expect(typeof brand.affiliateDisclosureShort).toBe("string")
      expect(brand.affiliateDisclosureShort).toMatch(/some external supplier links/i)
      expect(brand.affiliateDisclosureShort).toMatch(/may be affiliate links/i)
      expect(brand.affiliateDisclosureShort).toContain(brand.name)
      expect(brand.affiliateDisclosureShort).toContain(
        `may pay ${brand.name} a commission`
      )
      expect(brand.affiliateDisclosureShort).toMatch(/may pay/)
      expect(brand.affiliateDisclosureShort).toMatch(/commission/i)
      expect(brand.affiliateDisclosureShort).toMatch(/provider terms apply/i)
      expect(brand.affiliateDisclosureShort).not.toMatch(/all links/i)
      expect(brand.affiliateDisclosureShort).not.toMatch(/are monetized/i)
      expect(brand.affiliateDisclosureShort).not.toMatch(/already render/i)
      expect(brand.affiliateDisclosureShort).not.toMatch(
        /verified (rates|cookies)|savings|endorsement|booking responsibility/i
      )
    })
  })

  describe("primary metadata stays wired to brand", () => {
    const layout = readSource("app/layout.tsx")
    const home = readSource("app/(marketing)/page.tsx")

    it("sources root and homepage metadata from brand.name and brand descriptions", () => {
      expect(layout).toMatch(/from ["']@\/config\/brand["']/)
      expect(layout).toMatch(/title:\s*brand\.name/)
      expect(layout).toMatch(/description:\s*brand\.description/)
      expect(home).toMatch(/from ["']@\/config\/brand["']/)
      expect(home).toMatch(/brand\.name/)
      expect(home).toMatch(/brand\.description/)
      expect(home).toMatch(/brand\.shortDescription/)
    })

    it("does not hardcode a competing brand spelling in primary metadata files", () => {
      for (const relativePath of metadataFiles) {
        const literals = stringLiterals(readSource(relativePath))
        for (const spelling of competingSpellings) {
          expect(
            literals,
            `${relativePath} must not hardcode ${spelling}`
          ).not.toContain(spelling)
        }
        expect(literals, `${relativePath} must not hardcode PitLane Travel`).not.toContain(
          "PitLane Travel"
        )
      }
    })
  })

  describe("active header lockup is dynamic", () => {
    const header = readSource("components/header.tsx")
    const headerCode = stripComments(header)

    it("imports brand and renders brand.name plus centralized positioning or tagline", () => {
      expect(header).toMatch(/from ["']@\/config\/brand["']/)
      expect(headerCode).toContain("{brand.name}")
      expect(headerCode).toMatch(/\{brand\.(tagline|positioningShort)\}/)
    })

    it("does not keep the baked wordmark, next/router, or stale F1 companion copy", () => {
      expect(header).not.toMatch(/PitLaneTravelLogo/)
      expect(header).not.toMatch(/from ["']next\/router["']/)
      expect(header).not.toContain(staleF1Companion)
      expect(header).not.toMatch(/router\.push/)
    })

    it("does not hardcode a brand-name literal or competing spelling", () => {
      const literals = stringLiterals(header)
      expect(literals).not.toContain("PitLane Travel")
      for (const spelling of competingSpellings) {
        expect(literals).not.toContain(spelling)
      }
    })

    it("keeps navigation, Clerk controls, and the theme switcher", () => {
      expect(header).toContain("ThemeSwitcher")
      expect(header).toMatch(/SignedIn|SignedOut|SignInButton|UserButton/)
      expect(header).toContain("/races")
    })
  })

  describe("active marketing and 404 footers use centralized copy", () => {
    const footerFiles = ["app/(marketing)/layout.tsx", "app/not-found.tsx"] as const

    it("imports brand and renders About {brand.name}, positioningShort, and copyright brand.name", () => {
      for (const relativePath of footerFiles) {
        const source = stripComments(readSource(relativePath))
        expect(readSource(relativePath)).toMatch(/from ["']@\/config\/brand["']/)
        expect(source, `${relativePath} must render About {brand.name}`).toMatch(
          /About \{brand\.name\}/
        )
        expect(source, `${relativePath} must render brand.positioningShort`).toContain(
          "{brand.positioningShort}"
        )
        expect(source, `${relativePath} must render copyright brand.name`).toContain(
          "{brand.name}"
        )
      }
    })

    it("does not hardcode a brand variant or duplicate the positioning paragraph", () => {
      for (const relativePath of footerFiles) {
        const source = readSource(relativePath)
        const literals = stringLiterals(source)
        expect(literals, `${relativePath} must not hardcode PitLane Travel`).not.toContain(
          "PitLane Travel"
        )
        for (const spelling of competingSpellings) {
          expect(literals, `${relativePath} must not hardcode ${spelling}`).not.toContain(
            spelling
          )
        }
        expect(source).not.toMatch(/self-directed travellers/i)
        expect(source).not.toMatch(
          /Compare races\s+across Formula 1, Formula E, MotoGP, IndyCar and WEC/i
        )
      }
    })
  })

  describe("primary-chrome allowlist has no competing spelling literals", () => {
    it("scans only the primary chrome/metadata files named by PLT-008", () => {
      expect(primaryChromeFiles).toEqual([
        "config/brand.ts",
        "app/layout.tsx",
        "app/(marketing)/layout.tsx",
        "app/not-found.tsx",
        "components/header.tsx"
      ])
      for (const relativePath of legacyExceptionFiles) {
        expect(primaryChromeFiles).not.toContain(relativePath)
        expect(metadataFiles).not.toContain(relativePath)
      }
    })

    it("has no competing brand-spelling string literals in primary chrome", () => {
      for (const relativePath of primaryChromeFiles) {
        const literals = stringLiterals(readSource(relativePath))
        for (const spelling of competingSpellings) {
          expect(
            literals,
            `${relativePath} must not contain competing spelling ${spelling}`
          ).not.toContain(spelling)
        }
      }
    })
  })

  describe("public catalogue stays the five series", () => {
    it("keeps Formula 1, Formula E, MotoGP, IndyCar, and WEC in brand copy", () => {
      const surface = `${brand.positioningShort}\n${brand.description}\n${brand.shortDescription}\n${brand.seriesKeywords.join("\n")}`
      for (const series of fiveSeriesPatterns) {
        expect(surface, `${series.label} must remain in the public catalogue`).toMatch(
          series.pattern
        )
      }
    })
  })

  describe("legacy docs, emails, and route metadata stay out of this gate", () => {
    it("does not repo-walk or treat leftover emails, docs, or unused footer as chrome", () => {
      const thisSpec = readSource("tests/e2e/brand-truth.spec.ts")
      expect(thisSpec).not.toMatch(/from ["']node:fs\/promises["']/)
      expect(legacyExceptionFiles).toEqual([
        "components/Footer.tsx",
        "logos/PitLaneTravelLogo.tsx",
        "emails/confirmation-email.tsx",
        "app/races/metadata.ts",
        "docs/product/day-70-contract.md",
        "SPEC.md"
      ])
      for (const relativePath of legacyExceptionFiles) {
        expect(primaryChromeFiles).not.toContain(relativePath)
      }
    })
  })
})
