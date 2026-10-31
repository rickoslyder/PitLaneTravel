import { describe, expect, it } from "vitest"
import { affiliateDisclosurePartner, brand } from "@/config/brand"
import { affiliateDisclosureCopy } from "./affiliate-disclosure"

describe("affiliateDisclosureCopy", () => {
  it("states that a shown P1 Travel link is an affiliate link", () => {
    const copy = affiliateDisclosureCopy(["P1 Travel"])
    const partner = affiliateDisclosurePartner("P1 Travel")
    expect(copy.lead).toBe(partner.lead)
    expect(copy.detail).toBe(partner.detail)
    expect(copy.lead).toBe("Links to P1 Travel are affiliate links.")
    expect(copy.detail).toBe(
      `If you book or buy through them, ${brand.name} may earn a commission at no extra cost to you. It never changes what we recommend.`
    )
    expect(copy.lead).not.toMatch(/may be/)
  })

  it("keeps the conditional sentence when no partner is on the page", () => {
    const copy = affiliateDisclosureCopy([])
    expect(copy.lead).toMatch(/may be affiliate links/i)
    expect(copy.detail).toBeNull()
  })
})
