import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE,
  type CoverageEvidenceKind
} from "./coverage"
import {
  buildPublicCoverageSummaries,
  coverageDepthLabel,
  formatCoverageUtc,
  hasCurrentChainFreshness,
  offerAvailabilityLabel,
  toPublicCoverageSummary,
  type PublicCoverageSummary
} from "./public-coverage"

const AS_OF = new Date("2026-08-25T12:00:00.000Z")
const VERIFIED_AT = new Date("2026-08-01T00:00:00.000Z")
const EXPIRES_AT = new Date("2026-09-01T00:00:00.000Z")
const OFFER_EXPIRED_AT = new Date("2026-08-20T00:00:00.000Z")

const RACE_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
const RACE_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

const KIND_FLAGS: Record<CoverageEvidenceKind, Record<string, true>> = {
  calendar: {
    officialSource: true,
    datesVerified: true,
    statusVerified: true
  },
  logistics: {
    primaryOrLocalSources: true,
    accessVerified: true,
    stayGuidanceVerified: true
  },
  decision_guide: {
    structuredGuide: true,
    citationsPresent: true,
    confidenceAssessed: true,
    qaPassed: true
  },
  live_offer: {
    inventoryAvailable: true,
    taggedLink: true,
    attributionConfigured: true
  },
  personalized_plan: {
    completeInputs: true,
    sourceBackedRecommendations: true,
    handoffsTracked: true
  }
}

function evidence(
  raceId: string,
  kind: CoverageEvidenceKind,
  overrides: Record<string, unknown> = {}
) {
  return {
    raceId,
    kind,
    reviewState: "verified",
    revokedAt: null,
    verifiedAt: VERIFIED_AT,
    expiresAt: EXPIRES_AT,
    sourceLabel: `${kind} secret source`,
    sourceUrl: `https://secret.example/${kind}?token=super-secret`,
    attributes: { ...KIND_FLAGS[kind] },
    ...overrides
  }
}

function chain(raceId: string, kinds: readonly CoverageEvidenceKind[]) {
  return kinds.map(kind => evidence(raceId, kind))
}

function assertSafeProjection(value: unknown) {
  const serialized = JSON.stringify(value)
  expect(serialized).not.toMatch(/https:\/\//)
  expect(serialized).not.toMatch(/sourceUrl|source_url|sourceLabel|source_label/)
  expect(serialized).not.toMatch(/super-secret|token=/)
  expect(serialized).not.toMatch(/officialSource|inventoryAvailable|taggedLink/)
  expect(serialized).not.toMatch(/reviewState|revokedAt|attributes/)
  expect(serialized).not.toMatch(/firstLimitingKind|nextAction|inventoryLabel/)
}

describe("public coverage summary contract", () => {
  it("projects only raceId, derived tier, live-offer diagnostic, and freshUntil ISO", () => {
    const summary = toPublicCoverageSummary(RACE_A, chain(RACE_A, ["calendar"]), AS_OF)

    expect(summary).toEqual({
      raceId: RACE_A,
      tier: 0,
      liveOfferState: "missing",
      freshUntil: EXPIRES_AT.toISOString(),
      derivedAt: AS_OF.toISOString()
    } satisfies PublicCoverageSummary)
    expect(Object.keys(summary).sort()).toEqual(
      ["derivedAt", "freshUntil", "liveOfferState", "raceId", "tier"].sort()
    )
    assertSafeProjection(summary)
  })

  it("derives every tier from evidence via deriveCoverage, never a stored integer", () => {
    const none = toPublicCoverageSummary(RACE_A, [], AS_OF)
    const t0 = toPublicCoverageSummary(RACE_A, chain(RACE_A, ["calendar"]), AS_OF)
    const t1 = toPublicCoverageSummary(
      RACE_A,
      chain(RACE_A, ["calendar", "logistics"]),
      AS_OF
    )
    const t2 = toPublicCoverageSummary(
      RACE_A,
      chain(RACE_A, ["calendar", "logistics", "decision_guide"]),
      AS_OF
    )
    const t3 = toPublicCoverageSummary(
      RACE_A,
      chain(RACE_A, ["calendar", "logistics", "decision_guide", "live_offer"]),
      AS_OF
    )
    const t4 = toPublicCoverageSummary(
      RACE_A,
      chain(RACE_A, [
        "calendar",
        "logistics",
        "decision_guide",
        "live_offer",
        "personalized_plan"
      ]),
      AS_OF
    )

    expect(none.tier).toBeNull()
    expect(t0.tier).toBe(0)
    expect(t1.tier).toBe(1)
    expect(t2.tier).toBe(2)
    expect(t3.tier).toBe(3)
    expect(t4.tier).toBe(4)
  })

  it("maps every live_offer diagnostic and never treats expired evidence as current", () => {
    const base = ["calendar", "logistics", "decision_guide"] as const
    const cases: Array<[string, Record<string, unknown> | undefined, string]> = [
      ["current", undefined, "current"],
      ["expired", { expiresAt: OFFER_EXPIRED_AT }, "expired"],
      ["missing", undefined, "missing"],
      [
        "incomplete",
        { attributes: { inventoryAvailable: true, taggedLink: true } },
        "incomplete"
      ],
      ["unverified", { reviewState: "pending" }, "unverified"],
      [
        "not_yet_valid",
        { verifiedAt: new Date("2026-08-30T00:00:00.000Z") },
        "not_yet_valid"
      ],
      [
        "revoked",
        { revokedAt: new Date("2026-08-10T00:00:00.000Z") },
        "revoked"
      ]
    ]

    for (const [name, overrides, expected] of cases) {
      const rows =
        name === "missing"
          ? chain(RACE_A, base)
          : [
              ...chain(RACE_A, base),
              evidence(RACE_A, "live_offer", overrides)
            ]
      const summary = toPublicCoverageSummary(RACE_A, rows, AS_OF)
      expect(summary.liveOfferState, name).toBe(expected)
      if (expected === "current") {
        expect(summary.tier).toBe(3)
        expect(offerAvailabilityLabel(summary.liveOfferState)).toBe(
          "Current offers"
        )
      } else {
        expect(summary.tier).toBe(2)
        expect(offerAvailabilityLabel(summary.liveOfferState)).toBe(
          "No current offers"
        )
        expect(offerAvailabilityLabel(summary.liveOfferState)).not.toBe(
          "Current offers"
        )
        expect(offerAvailabilityLabel(summary.liveOfferState)).not.toMatch(
          /available/i
        )
      }
    }

    expect([...COVERAGE_KIND_DIAGNOSTIC_PRECEDENCE]).toEqual([
      "current",
      "expired",
      "not_yet_valid",
      "unverified",
      "revoked",
      "incomplete",
      "missing"
    ])
  })

  it("builds one summary per requested race against a single asOf and groups evidence without N+1 shape", () => {
    const summaries = buildPublicCoverageSummaries(
      [RACE_B, RACE_A, RACE_B],
      [
        ...chain(RACE_A, ["calendar"]),
        evidence(RACE_B, "calendar", { expiresAt: OFFER_EXPIRED_AT })
      ],
      AS_OF
    )

    expect(summaries.map(row => row.raceId)).toEqual([RACE_B, RACE_A])
    expect(summaries[0].tier).toBeNull()
    expect(summaries[0].liveOfferState).toBe("missing")
    expect(summaries[0].freshUntil).toBeNull()
    expect(summaries[1].tier).toBe(0)
    expect(summaries[1].freshUntil).toBe(EXPIRES_AT.toISOString())
    expect(new Set(summaries.map(row => row.derivedAt))).toEqual(
      new Set([AS_OF.toISOString()])
    )
    assertSafeProjection(summaries)
  })

  it("uses truthful depth labels that do not overclaim, especially for Tier 0", () => {
    expect(coverageDepthLabel(null)).toBe("No verified coverage")
    expect(coverageDepthLabel(0)).toBe("Calendar only")
    expect(coverageDepthLabel(1)).toBe("Logistics")
    expect(coverageDepthLabel(2)).toBe("Decision guide")
    expect(coverageDepthLabel(3)).toBe("Live offers")
    expect(coverageDepthLabel(4)).toBe("Personalized plan")

    for (const tier of [null, 0, 1, 2, 3, 4] as const) {
      expect(coverageDepthLabel(tier)).not.toMatch(/full guide/i)
    }
  })

  it("formats freshness as stable UTC and never labels an expired timestamp as current", () => {
    expect(formatCoverageUtc(EXPIRES_AT.toISOString())).toBe(
      "2026-09-01 00:00 UTC"
    )
    expect(formatCoverageUtc(null)).toBeNull()
    expect(formatCoverageUtc("not-a-date")).toBeNull()

    expect(
      hasCurrentChainFreshness(EXPIRES_AT.toISOString(), AS_OF.toISOString())
    ).toBe(true)
    expect(
      hasCurrentChainFreshness(
        OFFER_EXPIRED_AT.toISOString(),
        AS_OF.toISOString()
      )
    ).toBe(false)
    expect(hasCurrentChainFreshness(null, AS_OF.toISOString())).toBe(false)

    const wallClockAfterFreshUntil = "2026-10-01T00:00:00.000Z"
    expect(
      hasCurrentChainFreshness(
        EXPIRES_AT.toISOString(),
        AS_OF.toISOString()
      )
    ).toBe(true)
    expect(
      hasCurrentChainFreshness(
        EXPIRES_AT.toISOString(),
        wallClockAfterFreshUntil
      )
    ).toBe(false)
  })

  it("stamps derivedAt from the caller asOf and never reads the wall clock", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib/public-coverage.ts"),
      "utf8"
    )
    expect(source).not.toMatch(/Date\.now\s*\(/)

    const summary = toPublicCoverageSummary(
      RACE_A,
      chain(RACE_A, ["calendar"]),
      AS_OF
    )
    expect(summary.derivedAt).toBe(AS_OF.toISOString())
    expect(summary.derivedAt).not.toMatch(/[+-]\d{2}:\d{2}$/)
  })
})
