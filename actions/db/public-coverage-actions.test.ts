import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { CoverageEvidenceKind } from "@/lib/coverage"

const ROOT = process.cwd()
const ACTION_PATH = path.join(ROOT, "actions/db/public-coverage-actions.ts")
const ADMIN_ACTION_PATH = path.join(ROOT, "actions/db/coverage-actions.ts")

const AS_OF = new Date("2026-08-25T12:00:00.000Z")
const VERIFIED_AT = new Date("2026-08-01T00:00:00.000Z")
const EXPIRES_AT = new Date("2026-09-01T00:00:00.000Z")

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

function evidence(raceId: string, kind: CoverageEvidenceKind) {
  return {
    raceId,
    kind,
    reviewState: "verified",
    revokedAt: null,
    verifiedAt: VERIFIED_AT,
    expiresAt: EXPIRES_AT,
    sourceLabel: `${kind} secret source`,
    sourceUrl: `https://secret.example/${kind}?token=super-secret`,
    attributes: { ...KIND_FLAGS[kind] }
  }
}

function thenableQuery(result: unknown[] | Error) {
  const query: {
    from: ReturnType<typeof vi.fn>
    where: ReturnType<typeof vi.fn>
    then: (
      resolve: (value: unknown) => unknown,
      reject?: (error: unknown) => unknown
    ) => Promise<unknown>
  } = {
    from: vi.fn(() => query),
    where: vi.fn(() => query),
    then: (resolve, reject) => {
      if (result instanceof Error) {
        return Promise.reject(result).catch(reject ?? (() => undefined))
      }
      return Promise.resolve(result).then(resolve)
    }
  }
  return query
}

describe("public coverage action source contract", () => {
  it("keeps the public read model separate from the admin matrix and requireAdmin", () => {
    expect(existsSync(ACTION_PATH)).toBe(true)
    const source = readFileSync(ACTION_PATH, "utf8")
    const admin = readFileSync(ADMIN_ACTION_PATH, "utf8")

    expect(source).toMatch(/getPublicCoverageSummariesAction/)
    expect(source).toMatch(/deriveCoverage|buildPublicCoverageSummaries|toPublicCoverageSummary/)
    expect(source).toMatch(/inArray\s*\(/)
    expect(source).toMatch(/coverageEvidenceTable/)
    expect(source).toMatch(/const asOf = new Date\(/)
    expect(source).toMatch(/PUBLIC_COVERAGE_RACE_ID_MAX\s*=\s*500/)
    expect(source).toMatch(/ids\.length\s*>\s*PUBLIC_COVERAGE_RACE_ID_MAX/)
    expect(source).not.toMatch(/\.slice\s*\(\s*0\s*,\s*PUBLIC_COVERAGE_RACE_ID_MAX/)
    expect(source).not.toMatch(/requireAdmin/)
    expect(source).not.toMatch(/getCoverageMatrixAction/)
    expect(source).not.toMatch(/AuthError/)
    expect(source).not.toMatch(/coverage_level|coverageLevel/)

    expect(admin).toMatch(/await requireAdmin\(\)/)
    expect(admin).toMatch(/getCoverageMatrixAction/)
    const adminAt = admin.indexOf("await requireAdmin()")
    const selectAt = admin.search(/\bdb\s*\.\s*select\b/)
    expect(adminAt).toBeGreaterThan(-1)
    expect(selectAt).toBeGreaterThan(adminAt)
  })
})

describe("getPublicCoverageSummariesAction", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    process.env.DATABASE_URL = "postgres://present.invalid/db"
    delete (globalThis as { _db?: unknown })._db
    delete (globalThis as { _client?: unknown })._client
    vi.useFakeTimers()
    vi.setSystemTime(AS_OF)
  })

  afterEach(() => {
    vi.useRealTimers()
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
    delete (globalThis as { _db?: unknown })._db
    delete (globalThis as { _client?: unknown })._client
  })

  async function loadAction(select: ReturnType<typeof vi.fn>) {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    vi.doMock("@/db/db", () => ({
      db: { select }
    }))
    const mod = await import("./public-coverage-actions")
    return { ...mod, error }
  }

  it("returns an empty success envelope without touching the database", async () => {
    const select = vi.fn()
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const empty = await getPublicCoverageSummariesAction([])
    const ignored = await getPublicCoverageSummariesAction([
      "not-a-uuid",
      "",
      "123",
      null as never,
      undefined as never
    ])

    expect(select).not.toHaveBeenCalled()
    expect(empty).toEqual({
      isSuccess: true,
      message: "Coverage summaries retrieved successfully",
      data: []
    })
    expect(ignored).toEqual({
      isSuccess: true,
      message: "Coverage summaries retrieved successfully",
      data: []
    })
  })

  it("deduplicates valid IDs, ignores malformed IDs, queries once, and returns a safe projection", async () => {
    const rows = [
      evidence(RACE_A, "calendar"),
      evidence(RACE_B, "calendar"),
      evidence(RACE_B, "logistics")
    ]
    const query = thenableQuery(rows)
    const select = vi.fn(() => query)
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction([
      RACE_B,
      "nope",
      RACE_A,
      RACE_B,
      "also-bad"
    ])

    expect(select).toHaveBeenCalledTimes(1)
    expect(query.from).toHaveBeenCalledTimes(1)
    expect(query.where).toHaveBeenCalledTimes(1)
    expect(result.isSuccess).toBe(true)
    if (!result.isSuccess) throw new Error("expected success")
    expect(result.data.map(row => row.raceId)).toEqual([RACE_B, RACE_A])
    expect(result.data[0]).toMatchObject({
      raceId: RACE_B,
      tier: 1,
      liveOfferState: "missing",
      freshUntil: EXPIRES_AT.toISOString()
    })
    expect(result.data[1]).toMatchObject({
      raceId: RACE_A,
      tier: 0,
      liveOfferState: "missing"
    })
    const serialized = JSON.stringify(result)
    expect(serialized).not.toMatch(/https:\/\//)
    expect(serialized).not.toMatch(/super-secret|token=/)
    expect(serialized).not.toMatch(/sourceUrl|sourceLabel|attributes/)
  })

  it("returns a summary with null tier when a requested race has no evidence", async () => {
    const query = thenableQuery([])
    const select = vi.fn(() => query)
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction([RACE_A])
    expect(result.isSuccess).toBe(true)
    if (!result.isSuccess) throw new Error("expected success")
    expect(result.data).toEqual([
      {
        raceId: RACE_A,
        tier: null,
        liveOfferState: "missing",
        freshUntil: null,
        derivedAt: AS_OF.toISOString()
      }
    ])
  })

  it("logs genuine DB failures and returns a generic envelope without raw errors", async () => {
    const dbError = new Error("column coverage_evidence.source_url does not exist")
    const select = vi.fn(() => {
      throw dbError
    })
    const { getPublicCoverageSummariesAction, error } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction([RACE_A])

    expect(result.isSuccess).toBe(false)
    if (result.isSuccess) throw new Error("expected failure")
    expect(result.message).toBe("Failed to load coverage")
    expect(result.message).not.toMatch(/does not exist|coverage_evidence|source_url|column/i)
    expect(JSON.stringify(result)).not.toMatch(/source_url|super-secret/)
    expect(error.mock.calls.flat().join("\n")).toContain(dbError.message)
  })

  function uuidAt(index: number): string {
    return `aaaaaaaa-aaaa-4aaa-8aaa-${index.toString(16).padStart(12, "0")}`
  }

  it("accepts exactly 500 unique IDs with one inArray query and one derivedAt", async () => {
    const ids = Array.from({ length: 500 }, (_, i) => uuidAt(i + 1))
    const query = thenableQuery([])
    const select = vi.fn(() => query)
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction(ids)

    expect(select).toHaveBeenCalledTimes(1)
    expect(query.from).toHaveBeenCalledTimes(1)
    expect(query.where).toHaveBeenCalledTimes(1)
    expect(result.isSuccess).toBe(true)
    if (!result.isSuccess) throw new Error("expected success")
    expect(result.data).toHaveLength(500)
    expect(new Set(result.data.map(row => row.derivedAt))).toEqual(
      new Set([AS_OF.toISOString()])
    )
  })

  it("rejects 501 unique IDs before any database access", async () => {
    const ids = Array.from({ length: 501 }, (_, i) => uuidAt(i + 1))
    const select = vi.fn()
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction(ids)

    expect(select).not.toHaveBeenCalled()
    expect(result.isSuccess).toBe(false)
    if (result.isSuccess) throw new Error("expected failure")
    expect(result.message).toMatch(/too many race ids/i)
    expect(JSON.stringify(result)).not.toMatch(/source_url|super-secret|DATABASE/)
  })

  it("deduplicates before the bound so 501 entries of 500 unique IDs are accepted", async () => {
    const unique = Array.from({ length: 500 }, (_, i) => uuidAt(i + 1))
    const query = thenableQuery([])
    const select = vi.fn(() => query)
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction([...unique, unique[0]])

    expect(select).toHaveBeenCalledTimes(1)
    expect(result.isSuccess).toBe(true)
    if (!result.isSuccess) throw new Error("expected success")
    expect(result.data).toHaveLength(500)
  })

  it("rejects after deduplication when unique valid IDs still exceed the max", async () => {
    const unique = Array.from({ length: 501 }, (_, i) => uuidAt(i + 1))
    const select = vi.fn()
    const { getPublicCoverageSummariesAction } = await loadAction(select)

    const result = await getPublicCoverageSummariesAction([
      ...unique,
      unique[0],
      unique[1]
    ])

    expect(select).not.toHaveBeenCalled()
    expect(result.isSuccess).toBe(false)
    if (result.isSuccess) throw new Error("expected failure")
    expect(result.message).toMatch(/too many race ids/i)
  })
})
