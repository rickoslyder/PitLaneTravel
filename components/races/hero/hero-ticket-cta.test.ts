import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HeroTicketCta } from "./HeroTicketCta"

const RACE_NAME = "Abu Dhabi Grand Prix 2026"

function render(listingState: "unknown" | "listed" | "empty") {
  return renderToStaticMarkup(
    createElement(HeroTicketCta, {
      listingState,
      raceName: RACE_NAME,
      onTabChange: () => undefined
    })
  )
}

function redCount(html: string): number {
  return html.match(/bg-\[#E10600\]/g)?.length ?? 0
}

describe("race hero ticket CTA", () => {
  it("hides the CTA until listings are known", () => {
    expect(render("unknown")).toBe("")
  })

  it("uses one red Find tickets button and a quiet Plan your trip button when tickets are listed", () => {
    const html = render("listed")
    expect(html).toContain("Find tickets")
    expect(html).toContain(`aria-label="Find tickets for ${RACE_NAME}"`)
    expect(html).toContain("Plan your trip")
    expect(html).toContain(`aria-label="Plan your trip to ${RACE_NAME}"`)
    expect(html).not.toMatch(/Book Now|Book now|Buy tickets|Get ticket alerts/)
    expect(redCount(html)).toBe(1)
    expect(html).toContain("bg-white/10")
  })

  it("uses one red Plan your trip button and no Find tickets button when nothing is listed", () => {
    const html = render("empty")
    expect(html).toContain("Plan your trip")
    expect(html).toContain(`aria-label="Plan your trip to ${RACE_NAME}"`)
    expect(html).not.toContain("Find tickets")
    expect(html).not.toMatch(/Book Now|Book now|Buy tickets|Get ticket alerts/)
    expect(redCount(html)).toBe(1)
  })
})
