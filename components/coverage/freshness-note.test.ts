import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import { FreshnessNote } from "./freshness-note"

const AS_OF = new Date("2026-08-25T12:00:00.000Z")

function summary(
  overrides: Partial<PublicCoverageSummary>
): PublicCoverageSummary {
  return {
    raceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    tier: 0,
    liveOfferState: "missing",
    freshUntil: null,
    derivedAt: AS_OF.toISOString(),
    ...overrides
  }
}

describe("FreshnessNote", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(AS_OF)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders stable UTC chain freshness without local timezone conversion", () => {
    const html = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({
          tier: 2,
          liveOfferState: "missing",
          freshUntil: "2026-09-01T00:00:00.000Z"
        })
      })
    )

    expect(html).toContain("Coverage current until 2026-09-01 00:00 UTC")
    expect(html).not.toContain("2026-09-01T00:00:00.000Z")
    expect(html).not.toMatch(/toLocaleString|AM|PM/)
    expect(html).not.toContain("Current offers")
    expect(html).toMatch(/data-freshness-note/)
  })

  it("distinguishes chain freshness from expired offer availability", () => {
    const html = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({
          tier: 2,
          liveOfferState: "expired",
          freshUntil: "2026-09-01T00:00:00.000Z"
        })
      })
    )

    expect(html).toContain("Coverage current until 2026-09-01 00:00 UTC")
    expect(html).not.toMatch(/offer[\s\S]*current until/i)
    expect(html).not.toContain("Current offers")
  })

  it("renders nothing when there is no honest freshness claim", () => {
    const missing = renderToStaticMarkup(
      createElement(FreshnessNote, { summary: summary({ freshUntil: null }) })
    )
    const expired = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({ freshUntil: "2026-08-20T00:00:00.000Z" })
      })
    )
    const invalid = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({ freshUntil: "not-a-date" as never })
      })
    )

    expect(missing).toBe("")
    expect(expired).toBe("")
    expect(invalid).toBe("")
    expect(expired).not.toMatch(/current/i)
  })

  it("uses derivedAt rather than the wall clock so server and client cannot drift", () => {
    vi.setSystemTime(new Date("2026-10-01T00:00:00.000Z"))

    const stillCurrent = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({
          freshUntil: "2026-09-01T00:00:00.000Z",
          derivedAt: "2026-08-25T12:00:00.000Z"
        })
      })
    )
    const alreadyStaleAtDerivation = renderToStaticMarkup(
      createElement(FreshnessNote, {
        summary: summary({
          freshUntil: "2026-08-20T00:00:00.000Z",
          derivedAt: "2026-08-25T12:00:00.000Z"
        })
      })
    )

    expect(stillCurrent).toContain("Coverage current until 2026-09-01 00:00 UTC")
    expect(alreadyStaleAtDerivation).toBe("")
  })
})
