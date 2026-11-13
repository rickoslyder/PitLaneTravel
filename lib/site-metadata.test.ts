import { describe, expect, it } from "vitest"
import {
  buildOrganizationJsonLd,
  buildSportsEventJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  canonicalUrl,
  DEFAULT_OG_IMAGE_URL,
  pageSeo,
  serializeJsonLd,
  SITE_ORIGIN
} from "./site-metadata"

describe("canonicalUrl", () => {
  it("builds an absolute production URL and strips query params and hashes", () => {
    expect(canonicalUrl("/")).toBe(`${SITE_ORIGIN}/`)
    expect(canonicalUrl("/races")).toBe(`${SITE_ORIGIN}/races`)
    expect(
      canonicalUrl("/races/las-vegas-grand-prix-2026-f1-2026?tab=info")
    ).toBe(`${SITE_ORIGIN}/races/las-vegas-grand-prix-2026-f1-2026`)
    expect(
      canonicalUrl(
        "/races/las-vegas-grand-prix-2026-f1-2026?tab=travel#tickets"
      )
    ).toBe(`${SITE_ORIGIN}/races/las-vegas-grand-prix-2026-f1-2026`)
    expect(canonicalUrl("/guides/which-race-first-2027/")).toBe(
      `${SITE_ORIGIN}/guides/which-race-first-2027`
    )
  })
})

describe("pageSeo", () => {
  it("sets a query-free canonical and the existing home hero as og:image", () => {
    const seo = pageSeo("/races/qatar-grand-prix-2026-f1-2026?tab=info")

    expect(seo.alternates.canonical).toBe(
      `${SITE_ORIGIN}/races/qatar-grand-prix-2026-f1-2026`
    )
    expect(seo.openGraph.url).toBe(seo.alternates.canonical)
    expect(seo.openGraph.images).toEqual([
      { url: DEFAULT_OG_IMAGE_URL, alt: "PitLane Travel" }
    ])
    expect(DEFAULT_OG_IMAGE_URL).toBe(`${SITE_ORIGIN}/images/home-hero.jpg`)
  })
})

describe("site JSON-LD", () => {
  it("describes the organization and website for the home page", () => {
    const description = "Tickets and race travel guides."
    const organization = buildOrganizationJsonLd(description)
    const website = buildWebSiteJsonLd(description)

    expect(organization["@type"]).toBe("Organization")
    expect(organization.name).toBe("PitLane Travel")
    expect(organization.url).toBe(SITE_ORIGIN)
    expect(organization.logo).toBe(`${SITE_ORIGIN}/android-chrome-512x512.png`)
    expect(organization.description).toBe(description)
    expect(website).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PitLane Travel",
      url: SITE_ORIGIN,
      description
    })
    expect(JSON.parse(serializeJsonLd(organization))).toEqual(organization)
  })

  it("describes the race calendar as a web page", () => {
    expect(
      buildWebPageJsonLd({
        name: "Motorsport Race Calendar | PitLane Travel",
        description: "The full race calendar.",
        pathname: "/races?tab=info"
      })
    ).toMatchObject({
      "@type": "WebPage",
      url: `${SITE_ORIGIN}/races`,
      isPartOf: { "@type": "WebSite", url: SITE_ORIGIN }
    })
  })

  it("describes a race as a SportsEvent and omits an empty event", () => {
    const event = buildSportsEventJsonLd({
      name: "Las Vegas Grand Prix 2026",
      startDate: "2026-11-22T04:00:00.000Z",
      endDate: "2026-11-22T08:00:00.000Z",
      status: "upcoming",
      url: "/races/las-vegas-grand-prix-2026-f1-2026?tab=info",
      sport: "Formula 1",
      locationName: "Las Vegas Strip Circuit",
      addressLocality: "Las Vegas",
      addressCountry: "USA"
    })

    expect(event).toMatchObject({
      "@type": "SportsEvent",
      name: "Las Vegas Grand Prix 2026",
      startDate: "2026-11-22T04:00:00.000Z",
      endDate: "2026-11-22T08:00:00.000Z",
      sport: "Formula 1",
      eventStatus: "https://schema.org/EventScheduled",
      url: `${SITE_ORIGIN}/races/las-vegas-grand-prix-2026-f1-2026`,
      image: DEFAULT_OG_IMAGE_URL,
      location: {
        "@type": "Place",
        name: "Las Vegas Strip Circuit",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Las Vegas",
          addressCountry: "USA"
        }
      }
    })
    expect(event?.url).not.toContain("tab=")
    expect(
      buildSportsEventJsonLd({
        name: " ",
        startDate: "2026-11-22T04:00:00.000Z",
        url: "/races/example"
      })
    ).toBeNull()
    expect(
      buildSportsEventJsonLd({
        name: "Cancelled Grand Prix",
        startDate: "2026-04-01T00:00:00.000Z",
        status: "cancelled",
        url: "/races/cancelled"
      })?.eventStatus
    ).toBe("https://schema.org/EventCancelled")
  })
})
