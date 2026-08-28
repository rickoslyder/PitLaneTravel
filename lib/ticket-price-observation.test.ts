import { describe, expect, it } from "vitest"
import {
  buildComparableOfferKey,
  isEligibleForCheapestBadge,
  latestKnownGood,
  ticketPriceObservationSchema,
  type ObservationAttempt,
  type TicketPriceObservation
} from "./ticket-price-observation"

function validObservation(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    provider: "p1-travel",
    sourceUrl: "https://www.p1travel.com/f1/monza",
    sourceMethod: "api",
    observedAt: "2026-08-28T12:00:00.000Z",
    raceId: "f1-2026-italy",
    sessionScope: "race_day",
    grandstandId: "tifosi",
    zone: "upper",
    ticketClass: "adult-seated",
    quantity: 2,
    currency: "EUR",
    basePriceMinor: 45000,
    mandatoryFeesMinor: 5000,
    allInTotalMinor: 50000,
    availability: "available",
    fulfilmentRestrictions: ["photo-id"],
    refundTermsSummary: "Non-refundable",
    authorisationTier: "authorised_reseller",
    confidence: "high",
    ...overrides
  }
}

function parseObservation(
  overrides: Record<string, unknown> = {}
): TicketPriceObservation {
  return ticketPriceObservationSchema.parse(validObservation(overrides))
}

function expectRejected(overrides: Record<string, unknown>): void {
  const result = ticketPriceObservationSchema.safeParse(
    validObservation(overrides)
  )
  expect(result.success).toBe(false)
}

describe("ticketPriceObservationSchema", () => {
  it("parses a valid observation and normalizes observedAt to a Date", () => {
    const parsed = parseObservation()

    expect(parsed.provider).toBe("p1-travel")
    expect(parsed.sourceUrl).toBe("https://www.p1travel.com/f1/monza")
    expect(parsed.sourceMethod).toBe("api")
    expect(parsed.observedAt).toBeInstanceOf(Date)
    expect(parsed.observedAt.toISOString()).toBe("2026-08-28T12:00:00.000Z")
    expect(parsed.raceId).toBe("f1-2026-italy")
    expect(parsed.sessionScope).toBe("race_day")
    expect(parsed.grandstandId).toBe("tifosi")
    expect(parsed.zone).toBe("upper")
    expect(parsed.ticketClass).toBe("adult-seated")
    expect(parsed.quantity).toBe(2)
    expect(parsed.currency).toBe("EUR")
    expect(parsed.basePriceMinor).toBe(45000)
    expect(parsed.mandatoryFeesMinor).toBe(5000)
    expect(parsed.allInTotalMinor).toBe(50000)
    expect(parsed.availability).toBe("available")
    expect(parsed.fulfilmentRestrictions).toEqual(["photo-id"])
    expect(parsed.refundTermsSummary).toBe("Non-refundable")
    expect(parsed.authorisationTier).toBe("authorised_reseller")
    expect(parsed.confidence).toBe("high")
  })

  it("accepts offset timestamps and nullable optional identifiers", () => {
    const parsed = parseObservation({
      observedAt: "2026-08-28T13:00:00+01:00",
      grandstandId: null,
      zone: null,
      mandatoryFeesMinor: null,
      allInTotalMinor: null,
      refundTermsSummary: null,
      sourceMethod: "official_page",
      sessionScope: "hospitality",
      availability: "low_stock",
      authorisationTier: "official",
      confidence: "medium"
    })

    expect(parsed.observedAt).toBeInstanceOf(Date)
    expect(parsed.observedAt.toISOString()).toBe("2026-08-28T12:00:00.000Z")
    expect(parsed.grandstandId).toBeNull()
    expect(parsed.zone).toBeNull()
    expect(parsed.mandatoryFeesMinor).toBeNull()
    expect(parsed.allInTotalMinor).toBeNull()
    expect(parsed.refundTermsSummary).toBeNull()
  })

  it("rejects HTTP source URLs", () => {
    expectRejected({ sourceUrl: "http://www.p1travel.com/f1/monza" })
  })

  it("rejects timestamps that lack an explicit Z or numeric offset", () => {
    expectRejected({ observedAt: "2026-08-28T12:00:00" })
    expectRejected({ observedAt: "2026-08-28" })
  })

  it("rejects surrounding whitespace on stable identifiers", () => {
    expectRejected({ provider: " p1-travel" })
    expectRejected({ provider: "p1-travel " })
    expectRejected({ raceId: " f1-2026-italy" })
    expectRejected({ ticketClass: "adult-seated " })
    expectRejected({ grandstandId: " tifosi" })
    expectRejected({ zone: "upper " })
  })

  it("rejects invalid currency, zero quantity, and unsafe or negative money", () => {
    expectRejected({ currency: "eur" })
    expectRejected({ currency: "EURO" })
    expectRejected({ currency: "EU" })
    expectRejected({ quantity: 0 })
    expectRejected({ quantity: -1 })
    expectRejected({ quantity: 1.5 })
    expectRejected({ basePriceMinor: -1 })
    expectRejected({ mandatoryFeesMinor: -1 })
    expectRejected({ allInTotalMinor: -1 })
    expectRejected({ basePriceMinor: 10.5 })
    expectRejected({ basePriceMinor: Number.MAX_SAFE_INTEGER + 1 })
    expectRejected({
      mandatoryFeesMinor: Number.MAX_SAFE_INTEGER + 1,
      allInTotalMinor: Number.MAX_SAFE_INTEGER + 1
    })
  })

  it("enforces the fee and all-in invariant in both directions", () => {
    expect(
      ticketPriceObservationSchema.safeParse(
        validObservation({
          mandatoryFeesMinor: 5000,
          allInTotalMinor: 50000
        })
      ).success
    ).toBe(true)

    expectRejected({ mandatoryFeesMinor: 5000, allInTotalMinor: null })
    expectRejected({ mandatoryFeesMinor: 5000, allInTotalMinor: 49999 })
    expectRejected({ mandatoryFeesMinor: null, allInTotalMinor: 45000 })
    expectRejected({
      basePriceMinor: Number.MAX_SAFE_INTEGER,
      mandatoryFeesMinor: 1,
      allInTotalMinor: Number.MAX_SAFE_INTEGER
    })
  })
})

describe("buildComparableOfferKey", () => {
  it("is equal across different providers, prices, and non-identity fields", () => {
    const left = parseObservation({
      provider: "p1-travel",
      sourceUrl: "https://www.p1travel.com/f1/monza",
      sourceMethod: "api",
      observedAt: "2026-08-28T12:00:00.000Z",
      currency: "EUR",
      basePriceMinor: 45000,
      mandatoryFeesMinor: 5000,
      allInTotalMinor: 50000,
      availability: "available",
      authorisationTier: "authorised_reseller",
      confidence: "high"
    })
    const right = parseObservation({
      provider: "sportsbreaks",
      sourceUrl: "https://www.sportsbreaks.com/f1/monza",
      sourceMethod: "feed",
      observedAt: "2026-08-29T09:00:00.000Z",
      currency: "GBP",
      basePriceMinor: 40000,
      mandatoryFeesMinor: 2500,
      allInTotalMinor: 42500,
      availability: "low_stock",
      authorisationTier: "official",
      confidence: "low"
    })

    expect(buildComparableOfferKey(left)).toBe(buildComparableOfferKey(right))
  })

  it("differs for every comparable-offer identity dimension", () => {
    const base = parseObservation()
    const baseKey = buildComparableOfferKey(base)

    expect(
      buildComparableOfferKey(parseObservation({ raceId: "f1-2026-monaco" }))
    ).not.toBe(baseKey)
    expect(
      buildComparableOfferKey(parseObservation({ sessionScope: "weekend" }))
    ).not.toBe(baseKey)
    expect(
      buildComparableOfferKey(parseObservation({ grandstandId: "main" }))
    ).not.toBe(baseKey)
    expect(
      buildComparableOfferKey(parseObservation({ zone: "lower" }))
    ).not.toBe(baseKey)
    expect(
      buildComparableOfferKey(parseObservation({ ticketClass: "child-ga" }))
    ).not.toBe(baseKey)
    expect(buildComparableOfferKey(parseObservation({ quantity: 1 }))).not.toBe(
      baseKey
    )
  })

  it("does not collide when free-form identity values contain delimiters", () => {
    const left = parseObservation({
      raceId: "monza/ga",
      ticketClass: "adult"
    })
    const right = parseObservation({
      raceId: "monza",
      ticketClass: "ga/adult"
    })

    expect(buildComparableOfferKey(left)).not.toBe(
      buildComparableOfferKey(right)
    )
  })
})

describe("isEligibleForCheapestBadge", () => {
  it("is eligible only when fees are known, stock can be sold, and the seller is authorised", () => {
    expect(isEligibleForCheapestBadge(parseObservation())).toBe(true)
    expect(
      isEligibleForCheapestBadge(
        parseObservation({ availability: "low_stock" })
      )
    ).toBe(true)
  })

  it("excludes unknown fees, unsellable availability, and unverified secondary inventory", () => {
    expect(
      isEligibleForCheapestBadge(
        parseObservation({
          mandatoryFeesMinor: null,
          allInTotalMinor: null
        })
      )
    ).toBe(false)
    expect(
      isEligibleForCheapestBadge(parseObservation({ availability: "sold_out" }))
    ).toBe(false)
    expect(
      isEligibleForCheapestBadge(parseObservation({ availability: "unknown" }))
    ).toBe(false)
    expect(
      isEligibleForCheapestBadge(
        parseObservation({ authorisationTier: "unverified_secondary" })
      )
    ).toBe(false)
  })
})

describe("latestKnownGood", () => {
  it("replaces previous state with an observed attempt", () => {
    const previous = parseObservation()
    const observation = parseObservation({
      provider: "sportsbreaks",
      basePriceMinor: 1,
      mandatoryFeesMinor: 1,
      allInTotalMinor: 2
    })
    const attempt: ObservationAttempt = {
      status: "observed",
      observation
    }

    expect(latestKnownGood(previous, attempt)).toBe(observation)
    expect(latestKnownGood(null, attempt)).toBe(observation)
  })

  it("leaves previous unchanged, including null, when an attempt fails", () => {
    const previous = parseObservation()
    const failed: ObservationAttempt = {
      status: "failed",
      provider: "p1-travel",
      sourceUrl: "https://www.p1travel.com/f1/monza",
      attemptedAt: new Date("2026-08-28T13:00:00.000Z"),
      failureReason: "network"
    }

    expect(latestKnownGood(previous, failed)).toBe(previous)
    expect(latestKnownGood(null, failed)).toBeNull()
  })
})
