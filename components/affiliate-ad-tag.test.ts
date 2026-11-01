import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AffiliateAdTag, affiliateAdColors } from "./affiliate-ad-tag"

function channel(hex: string, index: number): number {
  return parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16)
}

function linearize(channelValue: number): number {
  const value = channelValue / 255
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4)
}

function luminance(hex: string): number {
  return (
    0.2126 * linearize(channel(hex, 0)) +
    0.7152 * linearize(channel(hex, 1)) +
    0.0722 * linearize(channel(hex, 2))
  )
}

function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

describe("AffiliateAdTag", () => {
  it("renders a visible Ad label that screen readers can announce", () => {
    const html = renderToStaticMarkup(createElement(AffiliateAdTag))
    expect(html).toContain(">Ad<")
    expect(html).not.toContain("(Ad)")
    expect(html).not.toContain("aria-hidden")
  })

  it("meets 7:1 contrast on the light and dark card backgrounds", () => {
    expect(
      contrast(affiliateAdColors.light, affiliateAdColors.lightBackground)
    ).toBeGreaterThanOrEqual(7)
    expect(
      contrast(affiliateAdColors.dark, affiliateAdColors.darkBackground)
    ).toBeGreaterThanOrEqual(7)
  })
})

describe("affiliate Ad call sites", () => {
  it("tags the ticket buy link only when the reseller is an affiliate", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/races/tickets/TicketCard.tsx"),
      "utf8"
    )
    expect(source).toMatch(/affiliatePartner \? <AffiliateAdTag \/> : null/)
    expect(source).not.toMatch(/Find tickets/)
  })

  it("does not tag the official ticket-store fallback", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/races/tickets/TicketSection.tsx"),
      "utf8"
    )
    expect(source).not.toMatch(/AffiliateAdTag/)
  })

  it("tags the hotel search link only when the affiliate id is set", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/hotels/page.tsx"),
      "utf8"
    )
    expect(source).toMatch(/isHotelAffiliateConfigured\(\)/)
    expect(source).toMatch(/hotelAffiliate \? <AffiliateAdTag \/> : null/)
  })
})
