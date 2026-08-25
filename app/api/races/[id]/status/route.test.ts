import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"

const DATABASE_URL = "postgres://present.invalid/db"
const RACE_ID = "550e8400-e29b-41d4-a716-446655440000"
const weekendStart = new Date("2026-07-04T12:00:00.000Z")
const weekendEnd = new Date("2026-07-05T18:00:00.000Z")

type SelectChain = {
  select: ReturnType<typeof vi.fn>
  from: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function createSelectChain(result: unknown[] | Error): SelectChain {
  const limit = vi.fn(() => {
    const promise = result instanceof Error ? Promise.reject(result) : Promise.resolve(result)
    return Object.assign(promise, { then: promise.then.bind(promise) })
  })
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))
  return { select, from, where, limit }
}

describe("GET /api/races/[id]/status source contract", () => {
  const source = readFileSync(
    path.join(process.cwd(), "app/api/races/[id]/status/route.ts"),
    "utf8"
  )

  it("selects date/weekend bounds and derives status instead of returning stored status", () => {
    expect(source).toMatch(
      /import\s*\{[^}]*deriveRaceStatus[^}]*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect(source).toMatch(/date:\s*racesTable\.date/)
    expect(source).toMatch(/weekendStart:\s*racesTable\.weekendStart/)
    expect(source).toMatch(/weekendEnd:\s*racesTable\.weekendEnd/)
    expect(source).toMatch(/deriveRaceStatus\s*\(/)
    expect(source).not.toMatch(/status:\s*race\.status/)
  })
})

describe("GET /api/races/[id]/status read projection", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(weekendStart)
    process.env.DATABASE_URL = DATABASE_URL
    delete (globalThis as { _db?: unknown })._db
    delete (globalThis as { _client?: unknown })._client
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

  async function loadRoute(result: unknown[] | Error) {
    const chain = createSelectChain(result)
    vi.doMock("@/db/db", () => ({ db: { select: chain.select } }))
    vi.doMock("@/services/openf1/race-mapper", () => ({
      RaceMapper: class RaceMapper {
        getOpenF1Session() {
          return Promise.resolve(null)
        }
      }
    }))
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const { GET } = await import("./route")
    return { GET, chain, error }
  }

  it("recomputes a stale stored upcoming status at the injected clock", async () => {
    const { GET } = await loadRoute([
      {
        id: RACE_ID,
        status: "upcoming",
        date: weekendStart,
        weekendStart,
        weekendEnd,
        openf1SessionKey: null
      }
    ])

    const res = await GET(new Request(`http://localhost/api/races/${RACE_ID}/status`), {
      params: Promise.resolve({ id: RACE_ID })
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      status: "in_progress",
      openf1Data: null
    })
  })

  it("preserves explicit cancellation", async () => {
    const { GET } = await loadRoute([
      {
        id: RACE_ID,
        status: "cancelled",
        date: weekendStart,
        weekendStart,
        weekendEnd,
        openf1SessionKey: null
      }
    ])

    const res = await GET(new Request(`http://localhost/api/races/${RACE_ID}/status`), {
      params: Promise.resolve({ id: RACE_ID })
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      status: "cancelled",
      openf1Data: null
    })
  })

  it("keeps malformed timestamps observable through the existing 500 path", async () => {
    const { GET, error } = await loadRoute([
      {
        id: RACE_ID,
        status: "upcoming",
        date: new Date(Number.NaN),
        weekendStart,
        weekendEnd,
        openf1SessionKey: null
      }
    ])

    const res = await GET(new Request(`http://localhost/api/races/${RACE_ID}/status`), {
      params: Promise.resolve({ id: RACE_ID })
    })

    expect(res.status).toBe(500)
    expect(await res.text()).toBe("Internal Server Error")
    expect(error.mock.calls.flat().join("\n")).toContain("Invalid race status timestamps")
  })
})
