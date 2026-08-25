import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"

const VALID_RACE_ID = "550e8400-e29b-41d4-a716-446655440000"
const DATABASE_URL = "postgres://present.invalid/db"

type SelectChain = {
  select: ReturnType<typeof vi.fn>
  from: ReturnType<typeof vi.fn>
  leftJoin: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
}

function createSelectChain(result: unknown[] | Error): SelectChain {
  const limit = vi.fn(async () => {
    if (result instanceof Error) {
      throw result
    }
    return result
  })
  const where = vi.fn(() => ({ limit }))
  const leftJoin = vi.fn(() => ({ where }))
  const from = vi.fn(() => ({ leftJoin }))
  const select = vi.fn(() => ({ from }))
  return { select, from, leftJoin, where, limit }
}

describe("getRaceByIdAction UUID fail-fast", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    process.env.DATABASE_URL = DATABASE_URL
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

  async function loadAction(result: unknown[] | Error) {
    const chain = createSelectChain(result)
    const postgres = vi.fn((..._args: unknown[]) => ({ end: vi.fn() }))
    const drizzle = vi.fn((..._args: unknown[]) => ({ select: chain.select }))
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined)

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
    vi.doMock("postgres", () => ({ default: postgres }))
    vi.doMock("drizzle-orm/postgres-js", () => ({ drizzle }))

    const { getRaceByIdAction } = await import("./races-actions")
    return { getRaceByIdAction, postgres, drizzle, chain, log, error }
  }

  it("returns unsuccessful ActionState for compare without initializing or querying the database", async () => {
    const { getRaceByIdAction, postgres, drizzle, chain, log, error } =
      await loadAction([])

    const result = await getRaceByIdAction("compare")

    expect(result).toEqual({
      isSuccess: false,
      message: "Invalid race id"
    })
    expect(postgres).not.toHaveBeenCalled()
    expect(drizzle).not.toHaveBeenCalled()
    expect(chain.select).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  it("follows the existing database path for valid UUID-shaped input", async () => {
    const { getRaceByIdAction, postgres, drizzle, chain, log } =
      await loadAction([])

    const result = await getRaceByIdAction(VALID_RACE_ID)

    expect(result).toEqual({
      isSuccess: false,
      message: "Race not found"
    })
    expect(postgres).toHaveBeenCalledTimes(1)
    expect(postgres.mock.calls[0]?.[0]).toBe(DATABASE_URL)
    expect(drizzle).toHaveBeenCalledTimes(1)
    expect(chain.select).toHaveBeenCalled()
    expect(log.mock.calls.flat().join(" ")).toContain("[Races] Getting race by ID:")
    expect(log.mock.calls.flat().join(" ")).toContain(VALID_RACE_ID)
  })

  it("keeps genuine database errors observable for valid UUID-shaped input", async () => {
    const dbError = Object.assign(new Error('column races.missing does not exist'), {
      code: "42703"
    })
    const { getRaceByIdAction, postgres, chain, error } = await loadAction(dbError)

    const result = await getRaceByIdAction(VALID_RACE_ID)

    expect(result).toEqual({
      isSuccess: false,
      message: "Failed to get race"
    })
    expect(postgres).toHaveBeenCalledTimes(1)
    expect(chain.select).toHaveBeenCalled()
    expect(error.mock.calls.flat().join("\n")).toContain("[Races] Error getting race:")
    expect(error.mock.calls.flat().join("\n")).toContain(dbError.message)
  })
})

describe("read-time race status projection", () => {
  it("derives list, detail, and slug status from Date bounds at one now snapshot", () => {
    const source = readFileSync(path.join(process.cwd(), "actions/db/races-actions.ts"), "utf8")

    expect(source).toMatch(
      /import\s*\{[^}]*deriveRaceStatus[^}]*\}\s*from\s*["']@\/lib\/race-status["']/
    )
    expect((source.match(/const now = new Date\(\)/g) ?? []).length).toBe(3)
    expect((source.match(/deriveRaceStatus\s*\(/g) ?? []).length).toBeGreaterThanOrEqual(1)
    expect(source).not.toMatch(
      /weekend_end:\s*race\.weekend_end\?\.toISOString\(\)\s*\|\|\s*null,\s*status:\s*race\.status/
    )
  })

  it("preserves cancelled through deriveRaceStatus and does not coerce malformed dates", () => {
    const source = readFileSync(path.join(process.cwd(), "actions/db/races-actions.ts"), "utf8")
    const helper = source.slice(
      source.indexOf("function projectRaceReadStatus"),
      source.indexOf("export async function getRacesAction")
    )

    expect(source).toMatch(/function projectRaceReadStatus/)
    expect(helper).toMatch(/deriveRaceStatus\s*\(/)
    expect(helper).toMatch(/weekendStart:\s*race\.weekend_start/)
    expect(helper).toMatch(/weekendEnd:\s*race\.weekend_end/)
    expect(helper).not.toMatch(/catch/)
    expect(source).toMatch(/Failed to get races/)
    expect(source).toMatch(/Failed to get race/)
  })
})
