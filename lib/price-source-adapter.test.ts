import { describe, expect, it, vi } from "vitest"
import type { ObservationAttempt } from "@/lib/ticket-price-observation"
import {
  AdapterCollectionError,
  priceSourceDescriptorSchema,
  runPriceSourceCollection,
  type PriceSourceAdapter,
  type PriceSourceCollectContext
} from "./price-source-adapter"

const REQUEST: PriceSourceCollectContext = Object.freeze({
  raceIds: ["f1-2026-italy"]
})
const CONTROLLER = new AbortController()
const SIGNAL = CONTROLLER.signal
const FIXED_NOW = new Date("2026-08-28T12:30:00.000Z")

function validDescriptor(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    providerId: "p1-travel",
    sourceUrl: "https://feeds.p1travel.com/f1/current.xml",
    allowedHostnames: ["feeds.p1travel.com", "www.p1travel.com"],
    sourceMethod: "feed",
    authorisationTier: "authorised_reseller",
    admission: {
      state: "admitted",
      evidenceUrl: "https://docs.partnerize.com/p1-feed-permission",
      checkedAt: "2026-08-28T10:00:00.000Z"
    },
    ...overrides
  }
}

function validCandidate(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    provider: "p1-travel",
    sourceUrl: "https://www.p1travel.com/f1/monza",
    sourceMethod: "feed",
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

function makeSink() {
  const persisted: ObservationAttempt[] = []
  const persist = vi.fn(async (attempt: ObservationAttempt) => {
    persisted.push(attempt)
    return { attemptId: "attempt-id", observationId: null }
  })
  return { persisted, persist }
}

function makeAdapter(
  descriptor: unknown,
  collect: PriceSourceAdapter["collect"]
): PriceSourceAdapter {
  return { descriptor, collect }
}

function staticAdapter(
  descriptor: unknown,
  candidates: unknown[]
): { adapter: PriceSourceAdapter; collect: ReturnType<typeof vi.fn> } {
  const collect = vi.fn(async () => candidates)
  return { adapter: makeAdapter(descriptor, collect), collect }
}

function expectDescriptorRejected(overrides: Record<string, unknown>): void {
  const result = priceSourceDescriptorSchema.safeParse(
    validDescriptor(overrides)
  )
  expect(result.success).toBe(false)
}

describe("priceSourceDescriptorSchema", () => {
  it("parses a valid admitted descriptor and normalizes checkedAt to a Date", () => {
    const parsed = priceSourceDescriptorSchema.parse(validDescriptor())

    expect(parsed.providerId).toBe("p1-travel")
    expect(parsed.sourceUrl).toBe("https://feeds.p1travel.com/f1/current.xml")
    expect(parsed.allowedHostnames).toEqual([
      "feeds.p1travel.com",
      "www.p1travel.com"
    ])
    expect(parsed.sourceMethod).toBe("feed")
    expect(parsed.authorisationTier).toBe("authorised_reseller")
    expect(parsed.admission.state).toBe("admitted")
    expect(parsed.admission.evidenceUrl).toBe(
      "https://docs.partnerize.com/p1-feed-permission"
    )
    expect(parsed.admission.checkedAt).toBeInstanceOf(Date)
    expect(parsed.admission.checkedAt.toISOString()).toBe(
      "2026-08-28T10:00:00.000Z"
    )
  })

  it("rejects wildcard hostnames", () => {
    expectDescriptorRejected({ allowedHostnames: ["*.p1travel.com"] })
    expectDescriptorRejected({ allowedHostnames: ["*"] })
    expectDescriptorRejected({
      allowedHostnames: ["feeds.p1travel.com", "*.p1travel.com"]
    })
  })

  it("rejects hostnames carrying protocol, path, port, or credentials", () => {
    expectDescriptorRejected({
      allowedHostnames: ["https://feeds.p1travel.com"]
    })
    expectDescriptorRejected({
      allowedHostnames: ["feeds.p1travel.com/f1"]
    })
    expectDescriptorRejected({
      allowedHostnames: ["feeds.p1travel.com:8443"]
    })
    expectDescriptorRejected({
      allowedHostnames: ["user@feeds.p1travel.com"]
    })
  })

  it("rejects empty, whitespace-padded, and non-hostname entries", () => {
    expectDescriptorRejected({ allowedHostnames: [] })
    expectDescriptorRejected({ allowedHostnames: [" feeds.p1travel.com"] })
    expectDescriptorRejected({ allowedHostnames: ["feeds.p1travel.com "] })
    expectDescriptorRejected({ allowedHostnames: ["not a host"] })
  })

  it("rejects duplicate hostnames", () => {
    expectDescriptorRejected({
      allowedHostnames: ["feeds.p1travel.com", "feeds.p1travel.com"]
    })
  })

  it("rejects a sourceUrl whose hostname is not in the allowlist", () => {
    expectDescriptorRejected({
      allowedHostnames: ["www.p1travel.com"]
    })
    expectDescriptorRejected({
      sourceUrl: "https://other.example.com/feed.xml"
    })
  })

  it("rejects non-HTTPS source and evidence URLs", () => {
    expectDescriptorRejected({
      sourceUrl: "http://feeds.p1travel.com/f1/current.xml"
    })
    expectDescriptorRejected({
      admission: {
        state: "admitted",
        evidenceUrl: "http://docs.partnerize.com/p1-feed-permission",
        checkedAt: "2026-08-28T10:00:00.000Z"
      }
    })
  })

  it("rejects non-canonical sourceUrl forms that the WHATWG parser would normalize", () => {
    // Canonical means exact: new URL(value).href === value. Mixed-case
    // scheme/host, explicit default ports, dot-segments, and trailing empty
    // ?/# are all silently rewritten by the parser, so they must be rejected
    // outright — never normalized or stripped — before anything persists.
    expectDescriptorRejected({
      sourceUrl: "HTTPS://feeds.p1travel.com/f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://FEEDS.p1travel.com/f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com:443/f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/f1/../current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/./f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/f1/current.xml?"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/f1/current.xml#"
    })

    // The canonical fixture URL remains valid and is persisted verbatim.
    const parsed = priceSourceDescriptorSchema.parse(validDescriptor())
    expect(parsed.sourceUrl).toBe("https://feeds.p1travel.com/f1/current.xml")
    expect(new URL(parsed.sourceUrl).href).toBe(parsed.sourceUrl)
  })

  it("rejects userinfo, query strings, and fragments in the descriptor sourceUrl", () => {
    // Persisted source references must be public canonical URLs. A concrete
    // adapter may privately fetch a credentialed URL inside its own closure,
    // but the descriptor that reaches the sink never carries credentials or
    // non-canonical components. Reject outright — never strip.
    expectDescriptorRejected({
      sourceUrl: "https://user:pass@feeds.p1travel.com/f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://user@feeds.p1travel.com/f1/current.xml"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/f1/current.xml?token=abc"
    })
    expectDescriptorRejected({
      sourceUrl: "https://feeds.p1travel.com/f1/current.xml#section"
    })
  })

  it("rejects userinfo in evidence URLs but allows query and fragment deep links", () => {
    // Documentary evidence may legitimately need a deep link; credentials
    // may never appear because failed attempts persist URLs verbatim.
    expectDescriptorRejected({
      admission: {
        state: "admitted",
        evidenceUrl: "https://user:pass@docs.partnerize.com/p1-feed-permission",
        checkedAt: "2026-08-28T10:00:00.000Z"
      }
    })
    expectDescriptorRejected({
      admission: {
        state: "admitted",
        evidenceUrl: "https://user@docs.partnerize.com/p1-feed-permission",
        checkedAt: "2026-08-28T10:00:00.000Z"
      }
    })

    const parsed = priceSourceDescriptorSchema.parse(
      validDescriptor({
        admission: {
          state: "admitted",
          evidenceUrl:
            "https://docs.partnerize.com/p1-feed-permission?section=access#v2",
          checkedAt: "2026-08-28T10:00:00.000Z"
        }
      })
    )
    expect(parsed.admission.evidenceUrl).toBe(
      "https://docs.partnerize.com/p1-feed-permission?section=access#v2"
    )
  })

  it("rejects edge URL strings through safeParse without ever throwing", () => {
    // A URL that zod's .url() rejects must not let a later refine's new URL
    // throw out of safeParse: descriptor errors stay closed and structured.
    const nulSource = validDescriptor({
      sourceUrl: "https://feeds.p1travel.com/f1/curre\0nt.xml"
    })
    let sourceResult: ReturnType<typeof priceSourceDescriptorSchema.safeParse>
    expect(() => {
      sourceResult = priceSourceDescriptorSchema.safeParse(nulSource)
    }).not.toThrow()
    expect(sourceResult!.success).toBe(false)

    const nulEvidence = validDescriptor({
      admission: {
        state: "admitted",
        evidenceUrl: "https://docs.partnerize.com/p1-feed-perm\0ission",
        checkedAt: "2026-08-28T10:00:00.000Z"
      }
    })
    let evidenceResult: ReturnType<typeof priceSourceDescriptorSchema.safeParse>
    expect(() => {
      evidenceResult = priceSourceDescriptorSchema.safeParse(nulEvidence)
    }).not.toThrow()
    expect(evidenceResult!.success).toBe(false)
  })

  it("rejects unstable provider ids and timestamps without an offset", () => {
    expectDescriptorRejected({ providerId: "" })
    expectDescriptorRejected({ providerId: " p1-travel" })
    expectDescriptorRejected({ providerId: "p1-travel " })
    expectDescriptorRejected({
      admission: {
        state: "admitted",
        evidenceUrl: "https://docs.partnerize.com/p1-feed-permission",
        checkedAt: "2026-08-28T10:00:00"
      }
    })
  })

  it("rejects admission of an unverified-secondary source", () => {
    expectDescriptorRejected({
      authorisationTier: "unverified_secondary"
    })
  })

  it("allows an unverified-secondary source that is explicitly not admitted", () => {
    const parsed = priceSourceDescriptorSchema.parse(
      validDescriptor({
        authorisationTier: "unverified_secondary",
        admission: {
          state: "not_admitted",
          evidenceUrl: "https://docs.partnerize.com/secondary-review",
          checkedAt: "2026-08-28T10:00:00.000Z"
        }
      })
    )

    expect(parsed.authorisationTier).toBe("unverified_secondary")
    expect(parsed.admission.state).toBe("not_admitted")
  })
})

describe("runPriceSourceCollection", () => {
  it("rejects an invalid descriptor before calling collect or the sink", async () => {
    const collect = vi.fn(async () => [validCandidate()])
    const sink = makeSink()

    await expect(
      runPriceSourceCollection(
        makeAdapter(validDescriptor({ allowedHostnames: ["*"] }), collect),
        { request: REQUEST, sink, signal: SIGNAL, now: () => FIXED_NOW }
      )
    ).rejects.toThrow()

    expect(collect).not.toHaveBeenCalled()
    expect(sink.persist).not.toHaveBeenCalled()
  })

  it("refuses a not-admitted source without calling collect or the sink", async () => {
    const collect = vi.fn(async () => [validCandidate()])
    const sink = makeSink()
    const descriptor = validDescriptor({
      admission: {
        state: "not_admitted",
        evidenceUrl: "https://docs.partnerize.com/pending-permission",
        checkedAt: "2026-08-28T10:00:00.000Z"
      }
    })

    const result = await runPriceSourceCollection(
      makeAdapter(descriptor, collect),
      { request: REQUEST, sink, signal: SIGNAL, now: () => FIXED_NOW }
    )

    expect(result).toEqual({
      status: "refused",
      providerId: "p1-travel",
      candidates: 0,
      persisted: 0,
      failed: 0,
      attempts: []
    })
    expect(collect).not.toHaveBeenCalled()
    expect(sink.persist).not.toHaveBeenCalled()
  })

  it("invokes collect exactly once with the immutable request and the abort signal", async () => {
    const { adapter, collect } = staticAdapter(validDescriptor(), [
      validCandidate()
    ])
    const sink = makeSink()

    await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(collect).toHaveBeenCalledTimes(1)
    expect(collect).toHaveBeenCalledWith(REQUEST, SIGNAL)
  })

  it("provides an AbortSignal when the caller does not pass one", async () => {
    const { adapter, collect } = staticAdapter(validDescriptor(), [])
    const sink = makeSink()

    await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      now: () => FIXED_NOW
    })

    expect(collect).toHaveBeenCalledTimes(1)
    expect(collect.mock.calls[0]?.[1]).toBeInstanceOf(AbortSignal)
  })

  it("persists every valid candidate as an observed attempt with deterministic counts", async () => {
    const second = validCandidate({
      sourceUrl: "https://feeds.p1travel.com/f1/monza-hospitality.xml",
      sessionScope: "hospitality",
      grandstandId: null,
      zone: null,
      ticketClass: "hospitality-suite",
      basePriceMinor: 90000,
      mandatoryFeesMinor: 10000,
      allInTotalMinor: 100000
    })
    const { adapter, collect } = staticAdapter(validDescriptor(), [
      validCandidate(),
      second
    ])
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(collect).toHaveBeenCalledTimes(1)
    expect(sink.persist).toHaveBeenCalledTimes(2)
    expect(result.status).toBe("collected")
    expect(result.candidates).toBe(2)
    expect(result.persisted).toBe(2)
    expect(result.failed).toBe(0)
    expect(result.attempts.map(attempt => attempt.status)).toEqual([
      "observed",
      "observed"
    ])

    const first = sink.persisted[0]
    expect(first.status).toBe("observed")
    if (first.status === "observed") {
      expect(first.observation.provider).toBe("p1-travel")
      expect(first.observation.observedAt).toBeInstanceOf(Date)
      expect(first.observation.allInTotalMinor).toBe(50000)
    }
    expect(result.attempts).toEqual(sink.persisted)
  })

  it("fails provider, method, tier, and hostname mismatches as invalid_payload without persisting observations", async () => {
    const candidates = [
      validCandidate({ provider: "sportsbreaks" }),
      validCandidate({ sourceMethod: "api" }),
      validCandidate({ authorisationTier: "official" }),
      validCandidate({ sourceUrl: "https://tickets.example.com/f1/monza" })
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.status).toBe("collected")
    expect(result.candidates).toBe(4)
    expect(result.persisted).toBe(0)
    expect(result.failed).toBe(4)
    expect(sink.persist).toHaveBeenCalledTimes(4)
    for (const attempt of sink.persisted) {
      expect(attempt.status).toBe("failed")
      if (attempt.status === "failed") {
        expect(attempt.provider).toBe("p1-travel")
        expect(attempt.sourceUrl).toBe(
          "https://feeds.p1travel.com/f1/current.xml"
        )
        expect(attempt.attemptedAt).toEqual(FIXED_NOW)
        expect(attempt.failureReason).toBe("invalid_payload")
      }
    }
  })

  it("fails schema-invalid candidates as invalid_payload and keeps valid ones observed", async () => {
    const candidates = [
      validCandidate(),
      { provider: "p1-travel", note: "SECRET-RAW-PAYLOAD" },
      validCandidate({ mandatoryFeesMinor: 5000, allInTotalMinor: 49999 })
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.candidates).toBe(3)
    expect(result.persisted).toBe(1)
    expect(result.failed).toBe(2)
    expect(result.attempts.map(attempt => attempt.status)).toEqual([
      "observed",
      "failed",
      "failed"
    ])
    expect(sink.persist).toHaveBeenCalledTimes(3)
    expect(
      sink.persisted
        .filter(attempt => attempt.status === "failed")
        .map(attempt => attempt.failureReason)
    ).toEqual(["invalid_payload", "invalid_payload"])
  })

  it("does not leak raw candidate payloads into results or persisted attempts", async () => {
    const candidates = [
      { garbage: "SECRET-RAW-PAYLOAD", nested: { marker: "SECRET-NESTED" } }
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.failed).toBe(1)
    expect(JSON.stringify(result)).not.toContain("SECRET-RAW-PAYLOAD")
    expect(JSON.stringify(result)).not.toContain("SECRET-NESTED")
    expect(JSON.stringify(sink.persisted)).not.toContain("SECRET-RAW-PAYLOAD")
    expect(JSON.stringify(sink.persisted)).not.toContain("SECRET-NESTED")
  })

  it("maps a thrown AdapterCollectionError to exactly one failed attempt with its reason", async () => {
    const collect = vi.fn(async () => {
      throw new AdapterCollectionError("rate_limited", "source throttled us")
    })
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      { request: REQUEST, sink, signal: SIGNAL, now: () => FIXED_NOW }
    )

    expect(result.status).toBe("failed")
    expect(result.candidates).toBe(0)
    expect(result.persisted).toBe(0)
    expect(result.failed).toBe(1)
    expect(result.attempts).toHaveLength(1)
    expect(sink.persist).toHaveBeenCalledTimes(1)

    const attempt = result.attempts[0]
    expect(attempt.status).toBe("failed")
    if (attempt.status === "failed") {
      expect(attempt.provider).toBe("p1-travel")
      expect(attempt.sourceUrl).toBe(
        "https://feeds.p1travel.com/f1/current.xml"
      )
      expect(attempt.attemptedAt).toEqual(FIXED_NOW)
      expect(attempt.failureReason).toBe("rate_limited")
    }
    expect(sink.persisted).toEqual(result.attempts)
  })

  it("maps an unknown thrown error to reason unknown without leaking its message", async () => {
    const collect = vi.fn(async () => {
      throw new Error("SECRET-ERROR-DETAIL connection reset by 10.0.0.8")
    })
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      { request: REQUEST, sink, signal: SIGNAL, now: () => FIXED_NOW }
    )

    expect(result.status).toBe("failed")
    expect(result.failed).toBe(1)
    const attempt = result.attempts[0]
    expect(attempt.status).toBe("failed")
    if (attempt.status === "failed") {
      expect(attempt.failureReason).toBe("unknown")
    }
    expect(JSON.stringify(result)).not.toContain("SECRET-ERROR-DETAIL")
    expect(JSON.stringify(sink.persisted)).not.toContain("SECRET-ERROR-DETAIL")
  })

  it("treats a non-array collect return as a failed run, never collected", async () => {
    const collect = vi.fn(
      async () =>
        ({
          candidates: [
            validCandidate({ raceId: "SECRET-NON-ARRAY-RACE-ID" }),
            "SECRET-NON-ARRAY-SENTINEL"
          ]
        }) as unknown as unknown[]
    )
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      { request: REQUEST, sink, signal: SIGNAL, now: () => FIXED_NOW }
    )

    expect(result.status).toBe("failed")
    // The candidates metric stays: a non-array return reports zero
    // candidates processed, and exactly one failed attempt was persisted.
    expect(result.candidates).toBe(0)
    expect(result.persisted).toBe(0)
    expect(result.failed).toBe(1)
    expect(sink.persist).toHaveBeenCalledTimes(1)
    const attempt = result.attempts[0]
    expect(attempt.status).toBe("failed")
    if (attempt.status === "failed") {
      expect(attempt.failureReason).toBe("unknown")
      expect(attempt.provider).toBe("p1-travel")
      expect(attempt.sourceUrl).toBe(
        "https://feeds.p1travel.com/f1/current.xml"
      )
    }
    // The raw non-array payload's fields and values must not reach the
    // result or the sink.
    for (const marker of [
      "raceId",
      "SECRET-NON-ARRAY-RACE-ID",
      "SECRET-NON-ARRAY-SENTINEL",
      "basePriceMinor",
      "allInTotalMinor"
    ]) {
      expect(JSON.stringify(result)).not.toContain(marker)
      expect(JSON.stringify(sink.persisted)).not.toContain(marker)
    }
  })

  it("converts credentialed or non-canonical candidate sourceUrls to invalid_payload and continues", async () => {
    // These URLs pass the observation schema's generic HTTPS check, so the
    // adapter layer must reject userinfo/query/fragment itself and persist
    // only descriptor identity for the failed attempt — never the raw URL.
    const candidates = [
      validCandidate(),
      validCandidate({
        sourceUrl:
          "https://user:SECRET-PASSWORD@www.p1travel.com/f1/monza?token=SECRET-TOKEN#frag"
      }),
      validCandidate({
        sourceUrl: "https://www.p1travel.com/f1/monza?ref=SECRET-QUERY"
      }),
      validCandidate({
        sourceUrl: "https://www.p1travel.com/f1/monza#SECRET-FRAGMENT"
      }),
      validCandidate({ raceId: "f1-2026-monaco" })
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.status).toBe("collected")
    expect(result.candidates).toBe(5)
    expect(result.persisted).toBe(2)
    expect(result.failed).toBe(3)
    expect(result.attempts.map(attempt => attempt.status)).toEqual([
      "observed",
      "failed",
      "failed",
      "failed",
      "observed"
    ])
    expect(
      sink.persisted
        .filter(attempt => attempt.status === "failed")
        .map(attempt => attempt.failureReason)
    ).toEqual(["invalid_payload", "invalid_payload", "invalid_payload"])
    for (const marker of [
      "SECRET-PASSWORD",
      "SECRET-TOKEN",
      "SECRET-QUERY",
      "SECRET-FRAGMENT"
    ]) {
      expect(JSON.stringify(result)).not.toContain(marker)
      expect(JSON.stringify(sink.persisted)).not.toContain(marker)
    }
  })

  it("converts non-canonical candidate sourceUrls that the parser would normalize to invalid_payload", async () => {
    // The same exact-canonical rule applies to candidate URLs: any form the
    // WHATWG parser would rewrite (case, default port, dot-segments, empty
    // ?/#) is rejected as invalid_payload, never normalized or persisted.
    const candidates = [
      validCandidate(),
      validCandidate({ sourceUrl: "https://WWW.p1travel.com/f1/monza" }),
      validCandidate({ sourceUrl: "https://www.p1travel.com:443/f1/monza" }),
      validCandidate({ sourceUrl: "https://www.p1travel.com/f1/./monza" }),
      validCandidate({ sourceUrl: "https://www.p1travel.com/f1/x/../monza" }),
      validCandidate({ sourceUrl: "https://www.p1travel.com/f1/monza?" }),
      validCandidate({ sourceUrl: "https://www.p1travel.com/f1/monza#" })
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.status).toBe("collected")
    expect(result.candidates).toBe(7)
    expect(result.persisted).toBe(1)
    expect(result.failed).toBe(6)
    expect(
      sink.persisted
        .filter(attempt => attempt.status === "failed")
        .map(attempt => attempt.failureReason)
    ).toEqual([
      "invalid_payload",
      "invalid_payload",
      "invalid_payload",
      "invalid_payload",
      "invalid_payload",
      "invalid_payload"
    ])
  })

  it("never lets candidate URL parsing throw past the invalid_payload path", async () => {
    // An edge string (embedded NUL) makes the observation schema's URL
    // refinement throw rather than return invalid. The runner must convert
    // that to invalid_payload and keep later candidates flowing instead of
    // crashing mid-run after earlier attempts were already persisted.
    const candidates = [
      validCandidate(),
      validCandidate({ sourceUrl: "https://www.p1travel.com/f1/mo\0nza" }),
      validCandidate({ raceId: "f1-2026-monaco" })
    ]
    const { adapter } = staticAdapter(validDescriptor(), candidates)
    const sink = makeSink()

    const result = await runPriceSourceCollection(adapter, {
      request: REQUEST,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(result.status).toBe("collected")
    expect(result.candidates).toBe(3)
    expect(result.persisted).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.attempts.map(attempt => attempt.status)).toEqual([
      "observed",
      "failed",
      "observed"
    ])
    const failedAttempt = result.attempts[1]
    expect(failedAttempt.status).toBe("failed")
    if (failedAttempt.status === "failed") {
      expect(failedAttempt.failureReason).toBe("invalid_payload")
      expect(failedAttempt.sourceUrl).toBe(
        "https://feeds.p1travel.com/f1/current.xml"
      )
    }
    expect(JSON.stringify(result)).not.toContain("mo\0nza")
    expect(JSON.stringify(sink.persisted)).not.toContain("mo\0nza")
  })

  it("passes collect a deep-frozen structured clone, not the caller-owned request", async () => {
    let seenRequest: PriceSourceCollectContext | undefined
    const collect = vi.fn(async (request: PriceSourceCollectContext) => {
      seenRequest = request
      return []
    })
    const sink = makeSink()
    const request = { raceIds: ["f1-2026-italy"], nested: { region: "eu" } }

    await runPriceSourceCollection(makeAdapter(validDescriptor(), collect), {
      request,
      sink,
      signal: SIGNAL,
      now: () => FIXED_NOW
    })

    expect(collect).toHaveBeenCalledTimes(1)
    expect(seenRequest).toBeDefined()
    expect(seenRequest).not.toBe(request)
    expect(seenRequest).toEqual(request)
    expect(Object.isFrozen(seenRequest)).toBe(true)
    expect(Object.isFrozen(seenRequest!.raceIds)).toBe(true)
    expect(Object.isFrozen(seenRequest!.nested)).toBe(true)
  })

  it("makes nested request mutation inside collect fail and leaves the original unchanged", async () => {
    const request = { raceIds: ["f1-2026-italy"], nested: { region: "eu" } }
    let mutationError: unknown
    const collect = vi.fn(async (frozen: PriceSourceCollectContext) => {
      try {
        ;(frozen.raceIds as string[]).push("f1-2026-monaco")
      } catch (error) {
        mutationError = error
      }
      try {
        ;(frozen.nested as { region: string }).region = "us"
      } catch (error) {
        mutationError = mutationError ?? error
      }
      return [validCandidate()]
    })
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      { request, sink, signal: SIGNAL, now: () => FIXED_NOW }
    )

    expect(mutationError).toBeInstanceOf(TypeError)
    expect(request).toEqual({
      raceIds: ["f1-2026-italy"],
      nested: { region: "eu" }
    })
    expect(result.status).toBe("collected")
    expect(result.persisted).toBe(1)
  })

  it("fails before collect or sink when the request is not structured-cloneable", async () => {
    const collect = vi.fn(async () => [validCandidate()])
    const sink = makeSink()
    const request = {
      raceIds: ["f1-2026-italy"],
      onProgress: () => "SECRET-CALLBACK"
    }

    await expect(
      runPriceSourceCollection(makeAdapter(validDescriptor(), collect), {
        request,
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      })
    ).rejects.toThrow()

    expect(collect).not.toHaveBeenCalled()
    expect(sink.persist).not.toHaveBeenCalled()
  })

  it("propagates sink failures instead of falsely reporting persisted observations", async () => {
    const { adapter } = staticAdapter(validDescriptor(), [
      validCandidate(),
      validCandidate({ raceId: "f1-2026-monaco" })
    ])
    let calls = 0
    const sink = {
      persist: vi.fn(async (_attempt: ObservationAttempt) => {
        calls += 1
        if (calls === 2) {
          throw new Error("sink down")
        }
        return { attemptId: "attempt-id", observationId: null }
      })
    }

    await expect(
      runPriceSourceCollection(adapter, {
        request: REQUEST,
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      })
    ).rejects.toThrow("sink down")
    expect(sink.persist).toHaveBeenCalledTimes(2)
  })

  it("propagates sink failures when persisting a collection error attempt", async () => {
    const collect = vi.fn(async () => {
      throw new AdapterCollectionError("network", "unreachable")
    })
    const sink = {
      persist: vi.fn(async (_attempt: ObservationAttempt) => {
        throw new Error("sink down")
      })
    }

    await expect(
      runPriceSourceCollection(makeAdapter(validDescriptor(), collect), {
        request: REQUEST,
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      })
    ).rejects.toThrow("sink down")
  })
})

describe("runPriceSourceCollection request validation", () => {
  const REQUEST_VALIDATION_MESSAGE =
    "Price source collection request must be a plain JSON-like object"

  async function expectRequestRejected(request: unknown): Promise<void> {
    const collect = vi.fn(async () => [validCandidate()])
    const sink = makeSink()
    let error: unknown
    try {
      await runPriceSourceCollection(makeAdapter(validDescriptor(), collect), {
        request: request as PriceSourceCollectContext,
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      })
    } catch (caught) {
      error = caught
    }
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(REQUEST_VALIDATION_MESSAGE)
    expect(collect).not.toHaveBeenCalled()
    expect(sink.persist).not.toHaveBeenCalled()
  }

  it("accepts a plain JSON-like request including arrays and null-prototype objects", async () => {
    const nullProto: Record<string, unknown> = Object.create(null)
    nullProto.region = "eu"
    const collect = vi.fn(async (request: PriceSourceCollectContext) => {
      expect(Object.isFrozen(request)).toBe(true)
      expect(Object.isFrozen(request.raceIds)).toBe(true)
      expect(Object.isFrozen(request.nested)).toBe(true)
      return [validCandidate()]
    })
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      {
        request: {
          raceIds: ["f1-2026-italy"],
          nested: nullProto,
          flag: true,
          seats: 2,
          note: null
        },
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      }
    )

    expect(collect).toHaveBeenCalledTimes(1)
    expect(result.status).toBe("collected")
    expect(result.persisted).toBe(1)
  })

  it("allows a shared acyclic reference (diamond) as structuredClone does", async () => {
    const shared = { region: "eu" }
    const collect = vi.fn(async () => [])
    const sink = makeSink()

    const result = await runPriceSourceCollection(
      makeAdapter(validDescriptor(), collect),
      {
        request: { a: shared, b: shared },
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      }
    )

    expect(result.status).toBe("collected")
    expect(collect).toHaveBeenCalledTimes(1)
  })

  it("rejects non-record roots before collect or sink", async () => {
    await expectRequestRejected(["f1-2026-italy"])
    await expectRequestRejected("f1-2026-italy")
    await expectRequestRejected(42)
    await expectRequestRejected(null)
    await expectRequestRejected(undefined)
  })

  it("rejects custom prototypes at the root and nested", async () => {
    class Query {
      raceIds = ["f1-2026-italy"]
    }
    await expectRequestRejected(new Query())
    await expectRequestRejected({ nested: new Query() })
    const customProto = { marker: true }
    await expectRequestRejected(Object.create(customProto))
    await expectRequestRejected({ nested: Object.create(customProto) })
  })

  it("rejects built-in exotic objects at any depth", async () => {
    await expectRequestRejected({ when: new Date("2026-08-28T00:00:00Z") })
    await expectRequestRejected({ lookup: new Map([["a", 1]]) })
    await expectRequestRejected({ lookup: new Set([1]) })
    await expectRequestRejected({ pattern: /monza/ })
    await expectRequestRejected({ bytes: new Uint8Array([1, 2]) })
    await expectRequestRejected({ buffer: new ArrayBuffer(4) })
    await expectRequestRejected({ nested: { deep: [new Date()] } })
  })

  it("rejects leaves outside the JSON-like scalar set", async () => {
    await expectRequestRejected({ count: BigInt(10) })
    await expectRequestRejected({ missing: undefined })
    await expectRequestRejected({ onProgress: () => "SECRET-CALLBACK" })
    await expectRequestRejected({ key: Symbol("SECRET-SYMBOL") })
    await expectRequestRejected({ price: Number.NaN })
    await expectRequestRejected({ price: Number.POSITIVE_INFINITY })
    await expectRequestRejected({ price: Number.NEGATIVE_INFINITY })
    await expectRequestRejected({ nested: { prices: [Number.NaN] } })
  })

  it("rejects cyclic requests at the root and nested", async () => {
    const root: Record<string, unknown> = { raceIds: ["f1-2026-italy"] }
    root.self = root
    await expectRequestRejected(root)

    const inner: Record<string, unknown> = { raceIds: ["f1-2026-italy"] }
    inner.loop = { inner }
    await expectRequestRejected({ inner })
  })

  it("rejects accessor properties at the root and nested without ever invoking them", async () => {
    let accessorCalls = 0
    const root: Record<string, unknown> = {}
    Object.defineProperty(root, "raceIds", {
      enumerable: true,
      get() {
        accessorCalls += 1
        return ["f1-2026-italy"]
      }
    })
    await expectRequestRejected(root)

    const nested: Record<string, unknown> = {}
    Object.defineProperty(nested, "region", {
      enumerable: true,
      get() {
        accessorCalls += 1
        return "eu"
      }
    })
    await expectRequestRejected({ nested })

    const setterOnly: Record<string, unknown> = {}
    Object.defineProperty(setterOnly, "region", {
      enumerable: true,
      set(_value: unknown) {
        accessorCalls += 1
      }
    })
    await expectRequestRejected({ nested: setterOnly })

    expect(accessorCalls).toBe(0)
  })

  it("rejects symbol-keyed properties", async () => {
    const keyed: Record<string | symbol, unknown> = {
      raceIds: ["f1-2026-italy"]
    }
    keyed[Symbol("SECRET-SYMBOL-KEY")] = "SECRET-SYMBOL-VALUE"
    await expectRequestRejected(keyed)

    const nested: Record<string | symbol, unknown> = {}
    nested[Symbol("SECRET-NESTED-SYMBOL")] = "SECRET-NESTED-VALUE"
    await expectRequestRejected({ nested })
  })

  it("rejects sparse arrays and arrays with non-index properties", async () => {
    const sparse = new Array<string>(3)
    sparse[0] = "f1-2026-italy"
    sparse[2] = "f1-2026-monaco"
    await expectRequestRejected({ raceIds: sparse })

    const extraProp = ["f1-2026-italy"] as unknown as Record<string, unknown>
    extraProp.note = "SECRET-ARRAY-PROP"
    await expectRequestRejected({ raceIds: extraProp })
  })

  it("throws one static non-leaking error for rejected requests", async () => {
    const collect = vi.fn(async () => [validCandidate()])
    const sink = makeSink()
    const request = { note: "SECRET-REQUEST-MARKER", when: new Date() }
    let error: unknown
    try {
      await runPriceSourceCollection(makeAdapter(validDescriptor(), collect), {
        request,
        sink,
        signal: SIGNAL,
        now: () => FIXED_NOW
      })
    } catch (caught) {
      error = caught
    }
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(REQUEST_VALIDATION_MESSAGE)
    expect(JSON.stringify(error)).not.toContain("SECRET-REQUEST-MARKER")
    expect(collect).not.toHaveBeenCalled()
    expect(sink.persist).not.toHaveBeenCalled()
  })
})

describe("AdapterCollectionError", () => {
  it("carries an explicit safe failure reason", () => {
    const error = new AdapterCollectionError("auth", "token rejected")

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("AdapterCollectionError")
    expect(error.reason).toBe("auth")
    expect(error.message).toBe("token rejected")
  })

  it("accepts every reason in the safe taxonomy", () => {
    for (const reason of [
      "auth",
      "rate_limited",
      "unavailable",
      "invalid_payload",
      "network",
      "unknown"
    ] as const) {
      expect(new AdapterCollectionError(reason).reason).toBe(reason)
    }
  })

  it("rejects a reason outside the safe taxonomy at construction", () => {
    // An arbitrary cast or runtime string must never reach the sink as a
    // failureReason; the constructor throws a structured validation error
    // instead of carrying the bogus value.
    const bogus = `garbage-${"SECRET-RUNTIME-STRING"}` as never
    let thrown: unknown
    try {
      // eslint-disable-next-line no-new
      new AdapterCollectionError(bogus)
    } catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).not.toContain("SECRET-RUNTIME-STRING")
    expect(() => new AdapterCollectionError(42 as never)).toThrow()
    expect(() => new AdapterCollectionError(undefined as never)).toThrow()
  })
})
