import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HeroTicketCta } from "./HeroTicketCta"

function render(listingState: "unknown" | "listed" | "empty") {
  const tabs: string[] = []
  const html = renderToStaticMarkup(
    createElement(HeroTicketCta, {
      listingState,
      onTabChange: (tab: string) => {
        tabs.push(tab)
      }
    })
  )
  return html
}

describe("race hero ticket CTA when listings are missing", () => {
  it("hides the CTA until listings are known", () => {
    expect(render("unknown")).toBe("")
  })

  it("keeps Book Now when tickets or packages are listed", () => {
    const html = render("listed")
    expect(html).toContain("Book Now")
    expect(html).not.toContain("Find tickets")
    expect(html).not.toContain("See travel options")
  })

  it("demotes an empty race to a secondary travel button", () => {
    const html = render("empty")
    expect(html).toContain("See travel options")
    expect(html).not.toContain("Book Now")
    expect(html).not.toContain("Find tickets")
  })
})
