import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  GrandstandRaceGuideLink,
  GrandstandTicketsCta
} from "./grandstand-race-links"

const RACE = {
  name: "Abu Dhabi Grand Prix 2026",
  href: "/races/abu-dhabi-grand-prix-2026-f1-2026",
  ticketsHref: "/races/abu-dhabi-grand-prix-2026-f1-2026?tab=tickets"
}

describe("grandstand race links", () => {
  it("links the guide and the tickets tab on internal paths", () => {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(GrandstandRaceGuideLink, { race: RACE }),
        createElement(GrandstandTicketsCta, { race: RACE })
      )
    )

    expect(html).toContain("Part of the Abu Dhabi Grand Prix 2026 guide")
    expect(html).toContain(`href="${RACE.href}"`)
    expect(html).toContain("Tickets for this race")
    expect(html).toContain(`href="${RACE.ticketsHref}"`)
    expect(html).toContain("bg-brand")
    expect(html).toContain("PitLane Travel does not sell tickets.")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
  })

  it("renders nothing when the circuit has no open race", () => {
    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(GrandstandRaceGuideLink, { race: null }),
        createElement(GrandstandTicketsCta, { race: null })
      )
    )

    expect(html).toBe("<div></div>")
  })
})
