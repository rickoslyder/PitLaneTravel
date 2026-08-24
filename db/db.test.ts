import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("db lazy DATABASE_URL boundary", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.resetModules()
    delete process.env.DATABASE_URL
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

  it("imports without throwing when DATABASE_URL is absent", async () => {
    await expect(import("./db")).resolves.toHaveProperty("db")
  })

  it("fails closed on first db API use when DATABASE_URL is absent, before network access", async () => {
    const postgres = vi.fn()
    vi.doMock("postgres", () => ({ default: postgres }))
    const { MissingServerEnvError } = await import("@/config/server-env")
    const { db } = await import("./db")
    try {
      db.select()
      throw new Error("expected MissingServerEnvError")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingServerEnvError)
      expect((error as { key: string }).key).toBe("DATABASE_URL")
      expect((error as Error).message).toBe("DATABASE_URL is required")
    }
    expect(postgres).not.toHaveBeenCalled()
  })

  it("initializes the real postgres client on first db API use when DATABASE_URL is present", async () => {
    const url = "postgres://present.invalid/db"
    process.env.DATABASE_URL = url
    const client = { end: vi.fn() }
    const postgres = vi.fn((..._args: unknown[]) => client)
    const drizzleDb = { select: vi.fn(() => "select-builder") }
    const drizzle = vi.fn((..._args: unknown[]) => drizzleDb)
    vi.doMock("postgres", () => ({ default: postgres }))
    vi.doMock("drizzle-orm/postgres-js", () => ({ drizzle }))
    const { db } = await import("./db")
    expect(postgres).not.toHaveBeenCalled()
    expect(db.select()).toBe("select-builder")
    expect(postgres).toHaveBeenCalledTimes(1)
    expect(postgres.mock.calls[0]?.[0]).toBe(url)
    expect(drizzle).toHaveBeenCalledTimes(1)
    expect(drizzle.mock.calls[0]?.[0]).toBe(client)
  })
})
