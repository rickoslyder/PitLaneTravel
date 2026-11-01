import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { ticketOutboundRel } from "@/lib/ticket-affiliate"
import { sellerRedirectUrl, ticketGoHref } from "./ticket-go"

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

describe("ticket seller hop", () => {
  it("points a buy click at the same-origin route for that ticket", () => {
    expect(ticketGoHref(42)).toBe("/go/42")
  })

  it("accepts only absolute http(s) seller URLs", () => {
    expect(sellerRedirectUrl("https://tickets.example/race")).toBe(
      "https://tickets.example/race"
    )
    expect(sellerRedirectUrl("javascript:alert(1)")).toBeNull()
    expect(sellerRedirectUrl("/api/redirect/abc")).toBeNull()
    expect(sellerRedirectUrl("")).toBeNull()
  })

  it("opens the hop in a new tab from the click, without a client write", () => {
    const card = read("components/races/tickets/TicketCard.tsx")

    expect(card).toContain("ticketGoHref(ticket.id)")
    expect(card).toContain('target="_blank"')
    expect(card).toContain("rel={ticketOutboundRel(affiliatePartner)}")
    expect(ticketOutboundRel("P1 Travel")).toBe(
      "sponsored nofollow noopener noreferrer"
    )
    expect(card).toContain("Button asChild")
    expect(card).toContain("aria-describedby={")
    expect(card).toContain("AffiliateAdTag")
    expect(card).not.toMatch(/window\.open/)
    expect(card).not.toMatch(/generateMaskedUrlAction/)
    expect(card).not.toMatch(/useEffect/)
    expect(card).not.toMatch(/onClick=\{openBuyLink\}/)
  })

  it("writes the redirect row only inside the navigation route", () => {
    const route = read("app/go/[ticketId]/route.ts")
    const robots = read("public/robots.txt")

    expect(route).toMatch(/ticketRedirectsTable/)
    expect(route).toMatch(/\.insert\(/)
    expect(route).toMatch(/NextResponse\.redirect/)
    expect(route).toMatch(/X-Robots-Tag/)
    expect(route).toMatch(/noindex/)
    expect(robots).toMatch(/Disallow:\s*\/go\//)
    expect(read("components/races/tickets/TicketCard.tsx")).not.toMatch(
      /ticketRedirectsTable/
    )
  })
})
