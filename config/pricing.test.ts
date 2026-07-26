import { describe, it, expect } from "vitest"
import { toStripeMinorUnits, flightServiceFee, flightChargeTotal } from "./pricing"

describe("toStripeMinorUnits", () => {
  it("converts decimal currencies to cents", () => {
    expect(toStripeMinorUnits("123.45", "GBP")).toBe(12345)
    expect(toStripeMinorUnits(10, "USD")).toBe(1000)
  })

  it("does not multiply zero-decimal currencies", () => {
    expect(toStripeMinorUnits("5000", "JPY")).toBe(5000)
    expect(toStripeMinorUnits("5000", "jpy")).toBe(5000)
  })

  it("avoids floating point drift", () => {
    // 19.99 * 100 is 1998.9999... in binary floating point.
    expect(toStripeMinorUnits("19.99", "EUR")).toBe(1999)
  })
})

describe("flightServiceFee", () => {
  it("is zero when unconfigured, so the customer pays exactly the offer total", () => {
    expect(flightServiceFee("500.00")).toBe("0.00")
    expect(flightChargeTotal("500.00")).toBe("500.00")
  })

  it("handles junk input without producing NaN", () => {
    expect(flightServiceFee("not-a-number")).toBe("0.00")
    expect(flightServiceFee(-5)).toBe("0.00")
  })
})
