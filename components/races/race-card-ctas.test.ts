import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { RaceCardCtas } from "./race-card-ctas"

const RACE_NAME = "Mexico City E-Prix 2027"
const HREF = "/races/mexico-city-e-prix-2027-formula-e-2027"

function brandButtonCount(html: string): number {
  return [...html.matchAll(/class="([^"]*)"/g)].filter(([, classes]) =>
    classes.split(/\s+/).includes("bg-brand")
  ).length
}

function render(listingState?: "unknown" | "listed" | "empty") {
  return renderToStaticMarkup(
    createElement(RaceCardCtas, {
      raceName: RACE_NAME,
      raceHref: HREF,
      listingState,
      onViewDetails: () => undefined
    })
  )
}

describe("race card CTAs", () => {
  it("links a ticketed card to the tickets tab and keeps Plan your trip quiet", () => {
    const html = render("listed")
    expect(html).toContain("Find tickets")
    expect(html).toContain(`aria-label="Find tickets for ${RACE_NAME}"`)
    expect(html).toContain(`href="${HREF}?tab=tickets"`)
    expect(html).toContain("Plan your trip")
    expect(html).toContain(`href="${HREF}?tab=travel"`)
    expect(brandButtonCount(html)).toBe(1)
    expect(html).not.toMatch(/Book Now|Book now|Buy tickets|Get ticket alerts/)
  })

  it("uses one red Plan your trip link and the empty note when nothing is listed", () => {
    const html = render("empty")
    expect(html).toContain("Plan your trip")
    expect(html).toContain(`aria-label="Plan your trip to ${RACE_NAME}"`)
    expect(html).toContain(`href="${HREF}?tab=travel"`)
    expect(html).not.toContain("Find tickets")
    expect(html.replace(/&#x27;/g, "'")).toContain(
      "Tickets aren't listed yet. Check back closer to race weekend."
    )
    expect(brandButtonCount(html)).toBe(1)
  })

  it("keeps View Details when listings are unknown", () => {
    expect(render("unknown")).toContain("View Details")
    expect(render()).toContain("View Details")
  })
})