import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ticketOutboundRel } from "@/lib/ticket-affiliate"
import { TicketCard } from "./TicketCard"

vi.mock("server-only", () => ({}))
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: null })
}))

const FUTURE = "2026-12-06T13:00:00.000Z"

function ticket(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    raceId: "00000000-0000-4000-8000-000000000007",
    title: "North grandstand",
    description: "Official seller has not opened this stand.",
    ticketType: "grandstand",
    seatingDetails: null,
    availability: "not_on_sale",
    daysIncluded: { sunday: true },
    isChildTicket: false,
    resellerUrl: "https://tickets.example.com/abu-dhabi/waitlist",
    updatedBy: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    features: [],
    currentPrice: null,
    ...overrides
  }
}

function renderCard(
  overrides: Record<string, unknown> = {},
  raceDate: string | null = FUTURE
) {
  return renderToStaticMarkup(
    createElement(TicketCard, {
      ticket: ticket(overrides) as never,
      index: 0,
      raceDate
    })
  )
}

function anchors(html: string): string[] {
  return html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []
}

describe("not_on_sale ticket card", () => {
  it("adds a secondary official waitlist link through the same seller hop", () => {
    const html = renderCard()
    const links = anchors(html)

    expect(links).toHaveLength(1)
    expect(links[0]).toContain('href="/go/7"')
    expect(links[0]).toContain('target="_blank"')
    expect(links[0]).toContain('rel="noopener noreferrer"')
    expect(links[0]).toContain("bg-secondary")
    expect(links[0]).not.toContain("bg-brand")
    expect(links[0]).toContain("Join official waitlist")
    expect(html).toContain("Not on sale yet.")
    expect(html).toContain("Opens tickets.example.com")
    expect(html).not.toContain("Join Waitlist")
    expect(html).not.toContain("https://tickets.example.com/abu-dhabi/waitlist")
    expect(html).not.toContain("/api/redirect")
  })

  it("names a non-waitlist seller URL as the official ticket page", () => {
    const html = renderCard({
      resellerUrl: "https://tickets.formula1.com/en/f1-3325-brazil"
    })
    const links = anchors(html)

    expect(links).toHaveLength(1)
    expect(links[0]).toContain('href="/go/7"')
    expect(links[0]).toContain('rel="noopener noreferrer"')
    expect(links[0]).toContain("Official ticket page")
    expect(html).not.toContain("Join official waitlist")
    expect(html).not.toContain("Join Waitlist")
  })

  it("hides the button when the stored URL is empty and keeps the site waitlist hidden", () => {
    const html = renderCard({ resellerUrl: "   " })

    expect(anchors(html)).toEqual([])
    expect(html).toContain("Not on sale yet.")
    expect(html).not.toContain("Join official waitlist")
    expect(html).not.toContain("Official ticket page")
    expect(html).not.toContain("Join Waitlist")
    expect(html).not.toContain("/go/")
  })

  it("keeps affiliate disclosure on a not_on_sale seller hop", () => {
    const resellerUrl =
      "https://p1travel.prf.hn/click/camref:abc/destination:https%3A%2F%2Fwww.p1travel.com%2Ff1"
    const html = renderCard({ resellerUrl })
    const links = anchors(html)

    expect(links).toHaveLength(1)
    expect(links[0]).toContain(`rel="${ticketOutboundRel("P1 Travel")}"`)
    expect(links[0]).toContain('href="/go/7"')
    expect(html).toContain(">Ad")
    expect(html).not.toContain(resellerUrl)
    expect(html).not.toContain("Join Waitlist")
  })

  it("leaves the available buy link on the same hop and does not add the secondary link", () => {
    const html = renderCard({
      availability: "available",
      resellerUrl: "https://tickets.example.com/abu-dhabi"
    })
    const links = anchors(html)

    expect(links).toHaveLength(1)
    expect(links[0]).toContain('href="/go/7"')
    expect(links[0]).toContain("bg-brand")
    expect(links[0]).toContain("Buy from official seller")
    expect(html).not.toContain("Join official waitlist")
    expect(html).not.toContain("Official ticket page")
    expect(html).not.toContain("Join Waitlist")
  })

  it("does not offer a seller hop after the race date", () => {
    const html = renderCard({}, "2025-03-16T00:00:00.000Z")

    expect(anchors(html)).toEqual([])
    expect(html).toContain("This race date has passed.")
    expect(html).not.toContain("Join Waitlist")
  })
})
