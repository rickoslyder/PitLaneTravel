import { describe, expect, it } from "vitest"
import {
  affiliatePartnersOnPage,
  isAffiliateTicketUrl
} from "./ticket-affiliate"

const official = {
  resellerUrl: "https://tickets.formula1.com/en/f1-3325-brazil"
}
const affiliate = {
  resellerUrl:
    "https://p1travel.prf.hn/click/camref:abc/destination:https%3A%2F%2Fwww.p1travel.com%2Ff1"
}
const camref = {
  resellerUrl: "https://www.p1travel.com/en/formula-1?camref=1100l3x"
}

describe("affiliate ticket detection", () => {
  it("treats P1 Travel and Partnerize URLs as affiliate links", () => {
    expect(isAffiliateTicketUrl(affiliate.resellerUrl)).toBe(true)
    expect(isAffiliateTicketUrl(camref.resellerUrl)).toBe(true)
    expect(isAffiliateTicketUrl("https://partnerize.com/click?camref=1")).toBe(
      true
    )
  })

  it("leaves untagged official seller URLs alone", () => {
    expect(isAffiliateTicketUrl(official.resellerUrl)).toBe(false)
    expect(
      isAffiliateTicketUrl(
        "https://www.abudhabigp.com/en/formula1/tickets-2026"
      )
    ).toBe(false)
    expect(
      isAffiliateTicketUrl("https://tickets.motogp.com/en/53277-portugal/")
    ).toBe(false)
  })

  it("names P1 Travel when an affiliate row is on the page", () => {
    expect(affiliatePartnersOnPage([official])).toEqual([])
    expect(affiliatePartnersOnPage([official, affiliate])).toEqual([
      "P1 Travel"
    ])
  })
})

