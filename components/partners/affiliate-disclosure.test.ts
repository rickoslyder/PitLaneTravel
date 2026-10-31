import { describe, expect, it } from "vitest"
import { affiliateDisclosureCopy } from "./affiliate-disclosure"

describe("affiliateDisclosureCopy", () => {
  it("states that a shown P1 Travel link is an affiliate link", () => {
    const copy = affiliateDisclosureCopy(["P1 Travel"])
    expect(copy.lead).toBe("Links to P1 Travel are affiliate links.")
    expect(copy.lead).not.toMatch(/may be/)
  })

  it("keeps the conditional sentence when no partner is on the page", () => {
    const copy = affiliateDisclosureCopy([])
    expect(copy.lead).toMatch(/may be affiliate links/i)
    expect(copy.detail).toBeNull()
  })
})
