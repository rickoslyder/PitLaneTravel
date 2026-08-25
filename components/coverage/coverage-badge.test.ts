import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE } from "@/lib/coverage"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import { CoverageBadge } from "./coverage-badge"

const RACE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"

function summary(
  overrides: Partial<PublicCoverageSummary>
): PublicCoverageSummary {
  return {
    raceId: RACE_ID,
    tier: null,
    liveOfferState: "missing",
    freshUntil: null,
    derivedAt: "2026-08-25T12:00:00.000Z",
    ...overrides
  }
}

function render(props: {
  summary: PublicCoverageSummary
  compact?: boolean
}) {
  return renderToStaticMarkup(createElement(CoverageBadge, props))
}

describe("CoverageBadge truthful copy", () => {
  it("labels every derived tier without calling any of them a full guide", () => {
    const cases: Array<[PublicCoverageSummary["tier"], string]> = [
      [null, "No verified coverage"],
      [0, "Calendar only"],
      [1, "Logistics"],
      [2, "Decision guide"],
      [3, "Live offers"],
      [4, "Personalized plan"]
    ]

    for (const [tier, label] of cases) {
      const html = render({
        summary: summary({ tier, liveOfferState: "missing" })
      })
      expect(html).toContain(label)
      expect(html).not.toMatch(/full guide/i)
      expect(html).toMatch(/data-coverage-badge/)
    }
  })

  it("says Current offers only for an exactly current live_offer diagnostic", () => {
    const current = render({
      summary: summary({ tier: 3, liveOfferState: "current" })
    })
    expect(current).toContain("Current offers")
    expect(current).not.toContain("No current offers")

    for (const state of COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE) {
      if (state === "current") continue
      const html = render({
        summary: summary({
          tier: 2,
          liveOfferState: state
        })
      })
      expect(html, state).toContain("No current offers")
      expect(html, state).not.toContain("Current offers")
      expect(html, state).not.toMatch(/available/i)
    }
  })

  it("keeps Tier 0 visually restrained compared with a decision-grade badge", () => {
    const calendar = render({
      summary: summary({ tier: 0, liveOfferState: "missing" })
    })
    const guide = render({
      summary: summary({ tier: 2, liveOfferState: "missing" })
    })

    expect(calendar).toContain("Calendar only")
    expect(calendar).toMatch(/data-coverage-tier="0"/)
    expect(guide).toMatch(/data-coverage-tier="2"/)
    expect(calendar).toMatch(/outline|muted|secondary/)
    expect(calendar).not.toMatch(/data-coverage-tone="emphasis"/)
    expect(guide).toMatch(/data-coverage-tone="emphasis"/)
  })

  it("still exposes no-current-offers in compact card composition", () => {
    const html = render({
      compact: true,
      summary: summary({
        tier: 2,
        liveOfferState: "expired",
        freshUntil: "2026-09-01T00:00:00.000Z"
      })
    })
    expect(html).toContain("Decision guide")
    expect(html).toContain("No current offers")
    expect(html).not.toContain("Current offers")
  })
})
