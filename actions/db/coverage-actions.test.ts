import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import type { CoverageEvidenceKind } from "@/lib/coverage"
import type { CoverageMatrixRow } from "@/actions/db/coverage-actions"

const ROOT = process.cwd()
const ACTION_PATH = path.join(ROOT, "actions/db/coverage-actions.ts")
const PAGE_PATH = path.join(ROOT, "app/admin/coverage/page.tsx")
const TABLE_PATH = path.join(
  ROOT,
  "app/admin/coverage/_components/coverage-table.tsx"
)
const SIDEBAR_PATH = path.join(ROOT, "app/admin/_components/admin-sidebar.tsx")
const LAYOUT_PATH = path.join(ROOT, "app/admin/layout.tsx")

function openingTag(source: string, tag: string): string {
  const open = source.search(new RegExp(`<${tag}\\b`))
  expect(open, `missing <${tag}`).toBeGreaterThan(-1)
  const close = source.indexOf(">", open)
  expect(close, `unclosed <${tag}`).toBeGreaterThan(open)
  return source.slice(open, close + 1)
}

const AS_OF = new Date("2026-08-25T12:00:00.000Z")
const VERIFIED_AT = new Date("2026-08-01T00:00:00.000Z")
const EXPIRES_AT = new Date("2026-09-01T00:00:00.000Z")
const OFFER_EXPIRED_AT = new Date("2026-08-20T00:00:00.000Z")

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

type EvidenceOverrides = {
  kind?: unknown
  reviewState?: unknown
  revokedAt?: unknown
  verifiedAt?: unknown
  expiresAt?: unknown
  sourceLabel?: unknown
  sourceUrl?: unknown
  attributes?: unknown
}

function read(filePath: string): string {
  expect(existsSync(filePath), `missing ${path.relative(ROOT, filePath)}`).toBe(
    true
  )
  return readFileSync(filePath, "utf8")
}

function evidence(
  raceId: string,
  kind: CoverageEvidenceKind,
  overrides: EvidenceOverrides = {}
) {
  return {
    raceId,
    kind,
    reviewState: "verified",
    revokedAt: null,
    verifiedAt: VERIFIED_AT,
    expiresAt: EXPIRES_AT,
    sourceLabel: `${kind} source`,
    sourceUrl: `https://secret.example/${kind}?token=super-secret`,
    attributes: { ...KIND_FLAGS[kind] },
    ...overrides
  }
}

function chain(
  raceId: string,
  kinds: readonly CoverageEvidenceKind[],
  overrides: Partial<Record<CoverageEvidenceKind, EvidenceOverrides>> = {}
) {
  return kinds.map(kind => evidence(raceId, kind, overrides[kind]))
}

function raceRecord(
  overrides: Partial<{
    id: string
    name: string
    slug: string | null
    date: Date
    seriesName: string | null
    seriesShortName: string | null
    circuitName: string | null
  }> = {}
) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Monaco Grand Prix",
    slug: "monaco-gp",
    date: new Date("2026-05-24T00:00:00.000Z"),
    seriesName: "Formula 1",
    seriesShortName: "F1",
    circuitName: "Circuit de Monaco",
    ...overrides
  }
}

function thenableQuery(result: unknown[] | Error) {
  const query: {
    from: ReturnType<typeof vi.fn>
    leftJoin: ReturnType<typeof vi.fn>
    orderBy: ReturnType<typeof vi.fn>
    then: (resolve: (value: unknown) => unknown, reject?: (error: unknown) => unknown) => Promise<unknown>
  } = {
    from: vi.fn(() => query),
    leftJoin: vi.fn(() => query),
    orderBy: vi.fn(() => query),
    then: (resolve, reject) => {
      if (result instanceof Error) {
        return Promise.reject(result).catch(reject ?? (() => undefined))
      }
      return Promise.resolve(result).then(resolve)
    }
  }
  return query
}

describe("coverage action / page / sidebar source contracts", () => {
  it("adds the action, page, and table files", () => {
    expect(existsSync(ACTION_PATH)).toBe(true)
    expect(existsSync(PAGE_PATH)).toBe(true)
    expect(existsSync(TABLE_PATH)).toBe(true)
  })

  it("calls requireAdmin before any db select and catches only AuthError", () => {
    const source = read(ACTION_PATH)
    const adminAt = source.indexOf("await requireAdmin()")
    const selectAt = source.search(/\bdb\s*\.\s*select\b/)

    expect(source).toMatch(/requireAdmin/)
    expect(source).toMatch(/AuthError/)
    expect(adminAt).toBeGreaterThan(-1)
    expect(selectAt).toBeGreaterThan(adminAt)
    expect(source).toMatch(/error\s+instanceof\s+AuthError/)
    expect(source).toMatch(/deriveCoverage\s*\(/)
    expect(source).toMatch(/const asOf = new Date\(\)/)
    expect(source).not.toMatch(/coverage_level|coverageLevel/)
  })

  it("keeps the page action-only and fail-closed, with Coverage nav", () => {
    const page = read(PAGE_PATH)
    const sidebar = read(SIDEBAR_PATH)

    expect(page).toMatch(/getCoverageMatrixAction/)
    expect(page).toMatch(/CoverageTable/)
    expect(page).toMatch(/isSuccess/)
    expect(page).toMatch(/Failed to load coverage matrix/)
    expect(page).not.toMatch(/from\s+["']@\/db\/db["']/)
    expect(page).not.toMatch(/\bdb\s*\.\s*select\b/)
    expect(page).not.toMatch(/sourceUrl|source_url|DATABASE_URL|CLERK_|token/)
    expect(page).not.toMatch(/upgrade|Upgrade/)

    expect(sidebar).toMatch(/title:\s*["']Coverage["']/)
    expect(sidebar).toMatch(/href:\s*["']\/admin\/coverage["']/)
    expect(sidebar).toMatch(/title:\s*["']Races["']/)
    expect(sidebar).toMatch(/title:\s*["']Championships["']/)
  })
})

describe("getCoverageMatrixAction authorization and envelopes", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    process.env.DATABASE_URL = "postgres://present.invalid/db"
    delete (globalThis as { _db?: unknown })._db
    delete (globalThis as { _client?: unknown })._client
  })

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
    delete (globalThis as { _db?: unknown })._db
    delete (globalThis as { _client?: unknown })._client
  })

  async function loadAction(options: {
    requireAdmin: () => Promise<unknown>
    select?: ReturnType<typeof vi.fn>
  }) {
    class AuthError extends Error {
      status: 401 | 403
      constructor(message: string, status: 401 | 403 = 401) {
        super(message)
        this.name = "AuthError"
        this.status = status
      }
    }

    const select = options.select ?? vi.fn()
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)

    vi.doMock("@/lib/auth", () => ({
      AuthError,
      requireAdmin: options.requireAdmin
    }))
    vi.doMock("@/db/db", () => ({
      db: { select }
    }))

    const mod = await import("./coverage-actions")
    return { ...mod, AuthError, select, error }
  }

  it("rejects signed-out callers before any DB select", async () => {
    const requireAdmin = vi.fn(async () => {
      const { AuthError } = await import("@/lib/auth")
      throw new AuthError("Authentication required", 401)
    })
    const { getCoverageMatrixAction, select } = await loadAction({
      requireAdmin
    })

    const result = await getCoverageMatrixAction()

    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(select).not.toHaveBeenCalled()
    expect(result).toEqual({
      isSuccess: false,
      message: "Authentication required"
    })
  })

  it("rejects non-admin callers before any DB select", async () => {
    const requireAdmin = vi.fn(async () => {
      const { AuthError } = await import("@/lib/auth")
      throw new AuthError("Administrator access required", 403)
    })
    const { getCoverageMatrixAction, select } = await loadAction({
      requireAdmin
    })

    const result = await getCoverageMatrixAction()

    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(select).not.toHaveBeenCalled()
    expect(result).toEqual({
      isSuccess: false,
      message: "Administrator access required"
    })
  })

  it("logs genuine DB failures and returns an honest envelope without raw errors", async () => {
    const dbError = new Error('column coverage_evidence.missing does not exist')
    const select = vi.fn(() => {
      throw dbError
    })
    const { getCoverageMatrixAction, error } = await loadAction({
      requireAdmin: vi.fn(async () => ({ userId: "admin", isAdmin: true })),
      select
    })

    const result = await getCoverageMatrixAction()

    expect(result.isSuccess).toBe(false)
    if (!result.isSuccess) {
      expect(result.message).toBe("Failed to get coverage matrix")
      expect(result.message).not.toMatch(/does not exist|coverage_evidence|column/i)
    }
    expect(error.mock.calls.flat().join("\n")).toContain(dbError.message)
  })
})

describe("buildCoverageMatrixRows derivation contract", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.doMock("@/lib/auth", () => ({
      AuthError: class AuthError extends Error {
        status: 401 | 403 = 401
        constructor(message: string) {
          super(message)
          this.name = "AuthError"
        }
      },
      requireAdmin: vi.fn()
    }))
    vi.doMock("@/db/db", () => ({
      db: { select: vi.fn() }
    }))
  })

  async function loadBuilder() {
    return import("./coverage-actions")
  }

  it("uses one explicit asOf and derives Tier null/0/2/3/4 from seeded offer scenarios", async () => {
    const { buildCoverageMatrixRows } = await loadBuilder()

    const missing = raceRecord({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Missing Calendar GP",
      slug: "missing-calendar",
      date: new Date("2026-03-01T00:00:00.000Z")
    })
    const calendarOnly = raceRecord({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Calendar Only GP",
      slug: "calendar-only",
      date: new Date("2026-04-01T00:00:00.000Z")
    })
    const noOffers = raceRecord({
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      name: "Decision Grade GP",
      slug: "decision-grade",
      date: new Date("2026-06-01T00:00:00.000Z")
    })
    const expiredOffers = raceRecord({
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      name: "Expired Offers GP",
      slug: "expired-offers",
      date: new Date("2026-07-01T00:00:00.000Z")
    })
    const currentOffers = raceRecord({
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      name: "Live Offers GP",
      slug: "live-offers",
      date: new Date("2026-08-01T00:00:00.000Z")
    })
    const complete = raceRecord({
      id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      name: "Personalised GP",
      slug: "personalised",
      date: new Date("2026-09-01T00:00:00.000Z")
    })

    const races = [
      missing,
      calendarOnly,
      noOffers,
      expiredOffers,
      currentOffers,
      complete
    ]
    const evidenceRows = [
      ...chain(calendarOnly.id, ["calendar"]),
      ...chain(noOffers.id, ["calendar", "logistics", "decision_guide"]),
      ...chain(expiredOffers.id, [
        "calendar",
        "logistics",
        "decision_guide",
        "live_offer"
      ], {
        live_offer: { expiresAt: OFFER_EXPIRED_AT }
      }),
      ...chain(currentOffers.id, [
        "calendar",
        "logistics",
        "decision_guide",
        "live_offer"
      ]),
      ...chain(complete.id, [
        "calendar",
        "logistics",
        "decision_guide",
        "live_offer",
        "personalized_plan"
      ])
    ]

    const rows = buildCoverageMatrixRows(races, evidenceRows, AS_OF)
    const laterRows = buildCoverageMatrixRows(
      races,
      evidenceRows,
      new Date("2026-09-01T00:00:00.000Z")
    )

    const byId = Object.fromEntries(rows.map(row => [row.raceId, row]))
    expect(byId[missing.id].tier).toBeNull()
    expect(byId[calendarOnly.id].tier).toBe(0)
    expect(byId[noOffers.id].tier).toBe(2)
    expect(byId[expiredOffers.id].tier).toBe(2)
    expect(byId[currentOffers.id].tier).toBe(3)
    expect(byId[complete.id].tier).toBe(4)

    expect(laterRows.every(row => row.tier == null)).toBe(true)
    expect(
      laterRows.every(row => row.kinds.calendar !== "current")
    ).toBe(true)

    expect(byId[missing.id].raceDate).toBe(missing.date.toISOString())
    expect(byId[missing.id].seriesName).toBe("Formula 1")
    expect(byId[missing.id].circuitName).toBe("Circuit de Monaco")
    expect(byId[missing.id].freshUntil).toBeNull()
    expect(byId[missing.id].firstLimitingKind).toBe("calendar")
  })

  it("caps an expired live_offer at Tier 2, labels offers expired, and refreshes live-offer evidence", async () => {
    const { buildCoverageMatrixRows } = await loadBuilder()
    const race = raceRecord()
    const rows = buildCoverageMatrixRows(
      [race],
      chain(race.id, ["calendar", "logistics", "decision_guide", "live_offer"], {
        live_offer: { expiresAt: OFFER_EXPIRED_AT }
      }),
      AS_OF
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].tier).toBe(2)
    expect(rows[0].kinds.live_offer).toBe("expired")
    expect(rows[0].firstLimitingKind).toBe("live_offer")
    expect(rows[0].inventoryState).toBe("expired")
    expect(rows[0].inventoryLabel).toBe("Offers expired")
    expect(rows[0].nextAction).toBe("Refresh expired live-offer evidence")
  })

  it("maps missing/unverified/incomplete/revoked/not-yet-valid live_offer diagnostics deterministically", async () => {
    const { buildCoverageMatrixRows } = await loadBuilder()
    const baseKinds = ["calendar", "logistics", "decision_guide"] as const

    const missingRace = raceRecord({ id: "r-missing", name: "Missing Offers" })
    const unverifiedRace = raceRecord({
      id: "r-unverified",
      name: "Unverified Offers"
    })
    const incompleteRace = raceRecord({
      id: "r-incomplete",
      name: "Incomplete Offers"
    })
    const revokedRace = raceRecord({ id: "r-revoked", name: "Revoked Offers" })
    const futureRace = raceRecord({ id: "r-future", name: "Future Offers" })

    const rows = buildCoverageMatrixRows(
      [missingRace, unverifiedRace, incompleteRace, revokedRace, futureRace],
      [
        ...chain(missingRace.id, baseKinds),
        ...chain(unverifiedRace.id, [...baseKinds, "live_offer"], {
          live_offer: { reviewState: "pending" }
        }),
        ...chain(incompleteRace.id, [...baseKinds, "live_offer"], {
          live_offer: {
            attributes: { inventoryAvailable: true, taggedLink: true }
          }
        }),
        ...chain(revokedRace.id, [...baseKinds, "live_offer"], {
          live_offer: { revokedAt: new Date("2026-08-10T00:00:00.000Z") }
        }),
        ...chain(futureRace.id, [...baseKinds, "live_offer"], {
          live_offer: { verifiedAt: new Date("2026-08-30T00:00:00.000Z") }
        })
      ],
      AS_OF
    )

    const byId = Object.fromEntries(rows.map(row => [row.raceId, row]))

    expect(byId[missingRace.id]).toMatchObject({
      tier: 2,
      inventoryState: "missing",
      inventoryLabel: "No current offers",
      firstLimitingKind: "live_offer",
      nextAction: "Add missing live-offer evidence"
    })
    expect(byId[unverifiedRace.id]).toMatchObject({
      inventoryState: "unverified",
      inventoryLabel: "Unverified live-offer evidence",
      nextAction: "Review unverified live-offer evidence"
    })
    expect(byId[incompleteRace.id]).toMatchObject({
      inventoryState: "incomplete",
      inventoryLabel: "Incomplete live-offer evidence",
      nextAction: "Complete incomplete live-offer evidence"
    })
    expect(byId[revokedRace.id]).toMatchObject({
      inventoryState: "revoked",
      inventoryLabel: "Revoked live-offer evidence",
      nextAction: "Replace revoked live-offer evidence"
    })
    expect(byId[futureRace.id]).toMatchObject({
      inventoryState: "not_yet_valid",
      inventoryLabel: "Not-yet-valid live-offer evidence",
      nextAction: "Wait for not-yet-valid live-offer evidence"
    })
  })

  it("uses the qualifying-chain minimum for Tier 4 freshUntil and a maintain/refresh next action", async () => {
    const { buildCoverageMatrixRows } = await loadBuilder()
    const race = raceRecord({
      slug: null,
      seriesName: null,
      seriesShortName: null,
      circuitName: null
    })
    const calendarExpiry = new Date("2026-10-01T00:00:00.000Z")
    const logisticsExpiry = new Date("2026-09-15T00:00:00.000Z")
    const guideExpiry = new Date("2026-12-01T00:00:00.000Z")
    const offerExpiry = new Date("2026-09-20T00:00:00.000Z")
    const planExpiry = new Date("2026-11-01T00:00:00.000Z")

    const rows = buildCoverageMatrixRows(
      [race],
      [
        evidence(race.id, "calendar", { expiresAt: calendarExpiry }),
        evidence(race.id, "logistics", { expiresAt: logisticsExpiry }),
        evidence(race.id, "decision_guide", { expiresAt: guideExpiry }),
        evidence(race.id, "live_offer", { expiresAt: offerExpiry }),
        evidence(race.id, "personalized_plan", { expiresAt: planExpiry })
      ],
      AS_OF
    )

    expect(rows[0].tier).toBe(4)
    expect(rows[0].firstLimitingKind).toBeNull()
    expect(rows[0].freshUntil).toBe(logisticsExpiry.toISOString())
    expect(rows[0].inventoryState).toBe("current")
    expect(rows[0].inventoryLabel).toBe("Current inventory")
    expect(rows[0].nextAction).toMatch(/maintain\/refresh/i)
    expect(rows[0].raceSlug).toBeNull()
    expect(rows[0].seriesName).toBeNull()
    expect(rows[0].circuitName).toBeNull()
  })

  it("orders rows deterministically and does not mutate input races or evidence", async () => {
    const { buildCoverageMatrixRows } = await loadBuilder()
    const later = raceRecord({
      id: "zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz",
      name: "Zandvoort GP",
      date: new Date("2026-08-30T00:00:00.000Z")
    })
    const earlier = raceRecord({
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Australian GP",
      date: new Date("2026-03-15T00:00:00.000Z")
    })
    const sameDayB = raceRecord({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Bahrain GP",
      date: new Date("2026-03-15T00:00:00.000Z")
    })

    const races = [later, sameDayB, earlier].map(row =>
      Object.freeze({ ...row })
    )
    const evidenceRows = [
      Object.freeze(evidence(later.id, "calendar")),
      Object.freeze(evidence(earlier.id, "calendar"))
    ]
    Object.freeze(races)
    Object.freeze(evidenceRows)
    const raceSnapshot = JSON.stringify(races)
    const evidenceSnapshot = JSON.stringify(evidenceRows)

    const rows = buildCoverageMatrixRows(races, evidenceRows, AS_OF)

    expect(JSON.stringify(races)).toBe(raceSnapshot)
    expect(JSON.stringify(evidenceRows)).toBe(evidenceSnapshot)
    expect(rows.map(row => row.raceId)).toEqual([
      earlier.id,
      sameDayB.id,
      later.id
    ])
    expect(rows[0].raceName).toBe("Australian GP")
    expect(rows[1].raceName).toBe("Bahrain GP")
  })
})

describe("CoverageTable static markup", () => {
  it("renders event identity, tier wording, diagnostics, freshness, inventory, next action, and all summary buckets", async () => {
    const { CoverageTable } = await import(
      "../../app/admin/coverage/_components/coverage-table"
    )

    const rows: CoverageMatrixRow[] = [
      {
        raceId: "r-none",
        raceName: "Unknown Night Race",
        raceSlug: "unknown-night",
        raceDate: "2026-03-01T00:00:00.000Z",
        seriesName: "Formula 1",
        seriesShortName: "F1",
        circuitName: "Marina Bay",
        tier: null,
        kinds: {
          calendar: "missing",
          logistics: "missing",
          decision_guide: "missing",
          live_offer: "missing",
          personalized_plan: "missing"
        },
        firstLimitingKind: "calendar",
        freshUntil: null,
        inventoryState: "missing",
        inventoryLabel: "No current offers",
        nextAction: "Add missing calendar evidence"
      },
      {
        raceId: "r-cal",
        raceName: "Calendar Only GP",
        raceSlug: "calendar-only",
        raceDate: "2026-04-01T00:00:00.000Z",
        seriesName: "MotoGP",
        seriesShortName: "MotoGP",
        circuitName: "Assen",
        tier: 0,
        kinds: {
          calendar: "current",
          logistics: "missing",
          decision_guide: "unverified",
          live_offer: "incomplete",
          personalized_plan: "revoked"
        },
        firstLimitingKind: "logistics",
        freshUntil: "2026-09-01T00:00:00.000Z",
        inventoryState: "incomplete",
        inventoryLabel: "Incomplete live-offer evidence",
        nextAction: "Add missing logistics evidence"
      },
      {
        raceId: "r-t1",
        raceName: "Logistics GP",
        raceSlug: null,
        raceDate: "2026-05-01T00:00:00.000Z",
        seriesName: null,
        seriesShortName: null,
        circuitName: null,
        tier: 1,
        kinds: {
          calendar: "current",
          logistics: "current",
          decision_guide: "not_yet_valid",
          live_offer: "expired",
          personalized_plan: "missing"
        },
        firstLimitingKind: "decision_guide",
        freshUntil: "2026-08-28T00:00:00.000Z",
        inventoryState: "expired",
        inventoryLabel: "Offers expired",
        nextAction: "Wait for not-yet-valid decision-guide evidence"
      }
    ]

    const html = renderToStaticMarkup(createElement(CoverageTable, { rows }))

    expect(html).toMatch(/<table/)
    expect(html).toMatch(/<th[^>]*>Event<\/th>/)
    expect(html).toMatch(/<th[^>]*>Series<\/th>/)
    expect(html).toMatch(/<th[^>]*>Circuit<\/th>/)
    expect(html).toMatch(/<th[^>]*>Date<\/th>/)
    expect(html).toMatch(/<th[^>]*>Tier<\/th>/)
    expect(html).toMatch(/<th[^>]*>Calendar<\/th>/)
    expect(html).toMatch(/<th[^>]*>Logistics<\/th>/)
    expect(html).toMatch(/<th[^>]*>Decision guide<\/th>/)
    expect(html).toMatch(/<th[^>]*>Live offer<\/th>/)
    expect(html).toMatch(/<th[^>]*>Personalized plan<\/th>/)
    expect(html).toMatch(/<th[^>]*>Fresh until<\/th>/)
    expect(html).toMatch(/<th[^>]*>Inventory<\/th>/)
    expect(html).toMatch(/<th[^>]*>Next action<\/th>/)
    expect(html).toMatch(/scope="col"/)

    expect(html).toContain("Unknown Night Race")
    expect(html).toContain("Calendar Only GP")
    expect(html).toContain("Logistics GP")
    expect(html).toContain("Formula 1")
    expect(html).toContain("Marina Bay")
    expect(html).toContain("MotoGP")
    expect(html).toContain("Assen")

    expect(html).toContain("No verified coverage")
    expect(html).toContain("Calendar only")
    expect(html).toContain("No current offers")
    expect(html).toContain("Offers expired")
    expect(html).toContain("Incomplete live-offer evidence")
    expect(html).toContain("Add missing calendar evidence")
    expect(html).toContain("Add missing logistics evidence")
    expect(html).toContain("Wait for not-yet-valid decision-guide evidence")
    expect(html).toContain("2026-03-01 00:00 UTC")
    expect(html).toContain("2026-09-01 00:00 UTC")
    expect(html).toContain("2026-08-28 00:00 UTC")
    expect(html).not.toContain("2026-03-01T00:00:00.000Z")
    expect(html).not.toContain("2026-09-01T00:00:00.000Z")
    expect(html).not.toContain("2026-08-28T00:00:00.000Z")

    expect(html).toMatch(/missing/i)
    expect(html).toMatch(/current/i)
    expect(html).toMatch(/unverified/i)
    expect(html).toMatch(/incomplete/i)
    expect(html).toMatch(/revoked/i)
    expect(html).toContain("not yet valid")
    expect(html).not.toContain("not_yet_valid")
    expect(html).toContain("Limited by not yet valid decision guide")
    expect(html).not.toContain("decision_guide")
    expect(html).not.toContain("live_offer")
    expect(html).not.toContain("personalized_plan")
    expect(html).toMatch(/expired/i)
    expect(html).toMatch(/aria-label="Coverage matrix"/)
    expect(html).toMatch(/overflow-x-auto/)

    expect(html).toMatch(/Total/)
    expect(html).toMatch(/No verified coverage/)
    expect(html).toMatch(/Tier 0/)
    expect(html).toMatch(/Tier 1/)
    expect(html).toMatch(/Tier 2/)
    expect(html).toMatch(/Tier 3/)
    expect(html).toMatch(/Tier 4/)
    expect(html).toMatch(/Tier 2[^0-9]*0|0[^0-9]*Tier 2/)
    expect(html).toMatch(/Tier 3[^0-9]*0|0[^0-9]*Tier 3/)
    expect(html).toMatch(/Tier 4[^0-9]*0|0[^0-9]*Tier 4/)

    expect(html).not.toMatch(/https:\/\//)
    expect(html).not.toMatch(/super-secret|token=/)
    expect(html).not.toMatch(/<button/i)
    expect(html).not.toMatch(/upgrade/i)
  })

  it("formats UTC timestamps and diagnostic tokens without changing product truth", async () => {
    const table = await import(
      "../../app/admin/coverage/_components/coverage-table"
    )

    expect(table.formatUtcTimestamp("2026-09-01T00:00:00.000Z")).toBe(
      "2026-09-01 00:00 UTC"
    )
    expect(table.formatUtcTimestamp("1999-06-12T12:00:00.000Z")).toBe(
      "1999-06-12 12:00 UTC"
    )
    expect(table.formatDiagnostic("not_yet_valid")).toBe("not yet valid")
    expect(table.formatDiagnostic("live_offer")).toBe("live offer")
    expect(table.formatDiagnostic("personalized_plan")).toBe("personalized plan")
    expect(table.formatDiagnostic("missing")).toBe("missing")
  })
})

describe("admin shell responsive source contract", () => {
  it("gives main min-w-0 so the table wrapper owns overflow, without body clipping hacks", () => {
    const layout = read(LAYOUT_PATH)
    const sidebar = read(SIDEBAR_PATH)
    const page = read(PAGE_PATH)
    const table = read(TABLE_PATH)
    const main = openingTag(layout, "main")

    expect(main).toMatch(/\bmin-w-0\b/)
    expect(main).toMatch(/\bflex-1\b/)
    expect(main).toMatch(/\bmd:pl-64\b/)
    expect(main).not.toMatch(/\bml-64\b/)

    expect(layout).not.toMatch(/overflow-x-hidden/)
    expect(layout).not.toMatch(/\boverflow-hidden\b/)
    expect(sidebar).not.toMatch(/overflow-x-hidden/)
    expect(page).not.toMatch(/overflow-x-hidden/)
    expect(page).not.toMatch(/\boverflow-hidden\b/)
    expect(table).not.toMatch(/overflow-x-hidden/)
    expect(table).not.toMatch(/\boverflow-hidden\b/)
    expect(table).toMatch(/overflow-x-auto/)
    expect(table).toMatch(/aria-label=["']Coverage matrix["']/)
  })

  it("keeps a desktop fixed sidebar and a named mobile admin menu without dropping Coverage nav", () => {
    const sidebar = read(SIDEBAR_PATH)
    const details = openingTag(sidebar, "details")
    const summary = openingTag(sidebar, "summary")
    const aside = openingTag(sidebar, "aside")

    expect(details).toMatch(/\bmd:hidden\b/)
    expect(summary).toMatch(/Admin menu/)
    expect(sidebar).toMatch(/<summary[^>]*>\s*Admin menu\s*<\/summary>/)
    expect(aside).toMatch(/\bfixed\b/)
    expect(aside).toMatch(/\bw-64\b/)
    expect(aside).toMatch(/\bhidden\b/)
    expect(aside).toMatch(/\bmd:block\b/)
    expect(sidebar).toMatch(/<nav[^>]*aria-label=["']Admin["']/)
    expect(sidebar).toMatch(/title:\s*["']Coverage["']/)
    expect(sidebar).toMatch(/href:\s*["']\/admin\/coverage["']/)
    expect(sidebar).toMatch(/title:\s*["']Races["']/)
    expect(sidebar).toMatch(/title:\s*["']Championships["']/)
  })
})
