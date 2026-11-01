import { describe, expect, it } from "vitest"
import { isHotelAffiliateConfigured } from "./affiliate"

describe("isHotelAffiliateConfigured", () => {
  it("is true only when the hotel affiliate id is non-empty", () => {
    expect(isHotelAffiliateConfigured("1100")).toBe(true)
    expect(isHotelAffiliateConfigured("  ")).toBe(false)
    expect(isHotelAffiliateConfigured(undefined)).toBe(false)
    expect(isHotelAffiliateConfigured("")).toBe(false)
  })
})
