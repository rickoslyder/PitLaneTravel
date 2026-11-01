import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { brand, brandCopy } from "@/config/brand"
import { siteCopy } from "@/config/site-copy"

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

    it("centralizes positioning copy and keeps the five series in it", () => {
      expect(brand).toHaveProperty("positioningShort")
      expect(typeof brand.positioningShort).toBe("string")
      expect(brand.positioningShort.length).toBeGreaterThan(40)
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

    it("sources root and homepage metadata from generateMetadata and brandCopy", () => {
      expect(layout).toMatch(/from ["']@\/config\/brand["']/)
      expect(layout).toMatch(/generateMetadata/)
      expect(layout).toMatch(/brandCopy\(/)
      expect(layout).toMatch(/title:\s*brand\.name/)
      expect(layout).toMatch(/description:\s*copy\.description/)
      expect(home).toMatch(/from ["']@\/config\/brand["']/)
      expect(home).toMatch(/generateMetadata/)
      expect(home).toMatch(/brandCopy\(/)
      expect(home).toMatch(/\$\{copy\.homeTitleTerms\} \| \$\{brand\.name\}/)
      expect(home).not.toContain("${brand.name} | ${brand.tagline}")
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

    it("does not configure the brand tagline as a one-line truncation/ellipsis", () => {
      const taglineRender = headerCode.match(
        /<([A-Za-z][\w.]*)([^>]*)>\s*\{brand\.tagline\}\s*<\/\1>/
      )
      expect(
        taglineRender,
        "active header must render {brand.tagline} in an element"
      ).toBeTruthy()

      const taglineAttrs = taglineRender![2]
      expect(taglineAttrs).not.toMatch(/\btruncate\b/)
      expect(taglineAttrs).not.toMatch(/\btext-ellipsis\b/)
      expect(taglineAttrs).not.toMatch(/\bwhitespace-nowrap\b/)
      expect(taglineAttrs).not.toMatch(/\bline-clamp-1\b/)
      expect(taglineAttrs).not.toMatch(/text-overflow\s*:\s*ellipsis/i)
      expect(taglineAttrs).not.toMatch(/white-space\s*:\s*nowrap/i)
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
        expect(source, `${relativePath} must render positioningShort via brandCopy`).toMatch(
          /brandCopy\([\s\S]*positioningShort/
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
        "SPEC.md"
      ])
      for (const relativePath of legacyExceptionFiles) {
        expect(primaryChromeFiles).not.toContain(relativePath)
      }
    })
  })
})

describe("#23 Go like you've been before copy", () => {
  it("sets the shipped tagline", () => {
    expect(brand.tagline).toBe("Go like you've been before.")
  })

  it("renders the tagline from the legacy footer", () => {
    const footer = readSource("components/Footer.tsx")
    expect(footer).toContain("{brand.tagline}")
    expect(footer).not.toContain("Your ultimate motorsport travel companion")
  })

  it("ships the hero headline, calendar label, and the first two strips", () => {
    const hero = readSource("components/landing/hero.tsx")
    expect(hero).toContain("Monaco. Le Mans. The Indy 500.")
    expect(hero).toContain("Find your race")
    expect(hero).toContain("Every race, one calendar")
    expect(hero).toContain("Five series, this season and next.")
    expect(hero).toContain("Know your seat")
    expect(hero).toContain("What each grandstand looks onto, before you buy.")
  })

  it("ships the features heading and Find tickets cards", () => {
    const features = readSource("components/landing/features.tsx")
    const none = siteCopy(false)
    expect(features).toContain("Know before you go")
    expect(features).toContain("been would tell you, before you book.")
    expect(features).not.toContain("Honest limits")
    expect(none.featureCards.map(card => card.title)).toContain("Find tickets")
    expect(none.featureCards.map(card => card.title)).not.toContain("Get tickets")
    expect(none.featureCards[4]?.description).toBe(
      "Straight to tickets for your race and your stand."
    )
  })

  it("ships the 404 copy and keeps the 404 heading", () => {
    const notFound = readSource("app/_components/not-found-content.tsx")
    expect(notFound).toContain(">404<")
    expect(notFound).toContain("Page not found")
    expect(notFound).toContain("That page has moved or doesn")
    expect(notFound).toContain("the racing.")
    expect(notFound).toContain("Back to home")
    expect(notFound).not.toContain("Page Not Found")
    expect(notFound).not.toContain("Return Home")
  })

  it("ships the non-hold about headings, cards, and call to action", () => {
    const about = readSource("app/(marketing)/about/page.tsx")
    expect(about).toContain("About PitLane Travel")
    expect(about).toContain("Find your race")
    expect(about).toContain("What we do")
    expect(about).toContain("What we care about")
    expect(about).toContain("Fans first")
    expect(about).toContain(
      "Written for the person in the grandstand, not the brochure."
    )
    expect(about).toContain("Five series")
    expect(about).toContain("F1, MotoGP, IndyCar, WEC and Formula E, side by side.")
    expect(about).toContain("Dated, sourced detail on seats, rules and getting home.")
    expect(about).toContain("What you can do here")
    expect(about).toContain("Find tickets")
    expect(about).not.toContain("Get tickets")
    expect(about).toContain("Ready to go?")
    expect(about).toContain("Contact Us")
    expect(about).not.toContain("Open the five-series calendar and plan the trip yourself.")
  })

  it("ships the home FAQ heading and the non-hold answers", () => {
    const faq = readSource("components/FaqSection.tsx")
    const none = siteCopy(false)
    expect(faq).toContain("Frequently asked questions")
    expect(faq).toContain("What fans ask before a race weekend.")
    expect(none.homeFaqs.map(item => item.question)).toEqual(
      expect.arrayContaining([
        "Can I see what a grandstand is like before I buy?",
        "Is my ticket real?",
        "What if the race is moved or cancelled?",
        "How do I sort flights and a hotel?"
      ])
    )
    expect(none.homeFaqs.map(item => item.question)).not.toContain(
      "Can I book a race package or VIP hospitality?"
    )
  })

  it("ships the /faq heading and drops the worldwide question", () => {
    const faq = readSource("app/(marketing)/faq/page.tsx")
    expect(faq).toContain("Frequently Asked Questions")
    expect(siteCopy(false).faqSubtitle).toBe("Common questions before a race weekend.")
    expect(faq).not.toContain("Do you cover every circuit or series worldwide?")
  })

  it("ships the non-hold help copy", () => {
    const help = readSource("app/(marketing)/help/page.tsx")
    const none = siteCopy(false)
    expect(none.helpSubtitle).toBe(
      "How to find your race and plan the weekend with PitLane Travel."
    )
    expect(help).toContain("Plan your weekend")
    expect(none.helpRoutes.map(route => route.title)).toEqual([
      "Race calendar",
      "Compare races",
      "Hotels"
    ])
    expect(help).toContain("Open contact form")
    expect(help).toContain("Race calendar")
    expect(help).toContain("Flight search")
    expect(help).toContain("Hotel search")
  })

  it("ships the circuit explorer line and grandstand metadata", () => {
    const explorer = readSource("components/_components/circuit-explorer-header.tsx")
    const grandstands = readSource("app/circuits/grandstands/page.tsx")
    expect(explorer).toContain("Explore Iconic Circuits")
    expect(explorer).toContain(
      "Open a circuit to see the track, the grandstands and how to get there."
    )
    expect(grandstands).toContain("Grandstand Guides | PitLane Travel")
    expect(grandstands).toContain(">Grandstand Guides<")
    expect(grandstands).toContain(
      "Grandstand guides for F1, MotoGP, IndyCar, WEC and Formula E circuits: the view, the shade, the price and what fans who sat there say."
    )
    expect(grandstands).toContain("Seat guides for this circuit are on the way.")
    expect(grandstands).toContain("browse the race calendar")
    expect(grandstands).toContain('href="/races"')
  })

  it("hides the testimonial section and keeps Why Choose", () => {
    const home = readSource("app/(marketing)/page.tsx")
    expect(home).not.toMatch(/TestimonialSection/)
    expect(home).not.toContain("[REAL REVIEW SLOT]")
    expect(home).toContain("<WhyChooseFeaturesSection")
  })

  it("keeps old positioning and protection wording out of the shipped copy files", () => {
    const copyFiles = [
      "config/brand.ts",
      "config/site-copy.ts",
      "app/(marketing)/page.tsx",
      "app/layout.tsx",
      "components/header.tsx",
      "app/(marketing)/layout.tsx",
      "app/not-found.tsx",
      "components/Footer.tsx",
      "app/_components/not-found-content.tsx",
      "components/landing/hero.tsx",
      "components/landing/features.tsx",
      "app/(marketing)/about/page.tsx",
      "components/WhyChooseFeaturesSection.tsx",
      "components/FaqSection.tsx",
      "app/(marketing)/faq/page.tsx",
      "app/(marketing)/help/page.tsx",
      "app/packages/page.tsx",
      "components/_components/circuit-explorer-header.tsx",
      "app/circuits/grandstands/page.tsx"
    ]
    const banned = [
      /decision layer/i,
      /self-directed/i,
      /hand off/i,
      /handoff/i,
      /where coverage exists/i,
      /Honest limits/i,
      /paddock tour/i,
      /Paddock Club/i,
      /Go racing/i,
      /Your F1 Travel Companion/i,
      /ultimate/i,
      /\(Ad\)/,
      /ATOL/i,
      /ABTOT/i,
      /Grand Prix Grand Tours/i
    ]

    for (const relativePath of copyFiles) {
      const source = stripComments(readSource(relativePath))
      for (const pattern of banned) {
        expect(source, `${relativePath} matches ${pattern}`).not.toMatch(pattern)
      }
      expect(source, `${relativePath} card title`).not.toMatch(
        /title:\s*["']Get tickets["']/
      )
    }

    const hero = readSource("components/landing/hero.tsx")
    expect(hero).not.toContain("The right airport")
  })
})
