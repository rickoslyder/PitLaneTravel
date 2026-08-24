import { describe, it, expect, afterEach, vi } from "vitest"
import { MissingServerEnvError, requiredServerEnv } from "./server-env"

describe("requiredServerEnv", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  afterEach(() => {
    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl
    }
  })

  it("returns a named required value from a provided env object", () => {
    const env = { DATABASE_URL: "postgres://example.invalid/db" }
    expect(requiredServerEnv("DATABASE_URL", env)).toBe(
      "postgres://example.invalid/db"
    )
  })

  it("throws a named MissingServerEnvError when the key is absent", () => {
    expect(() => requiredServerEnv("DATABASE_URL", {})).toThrow(
      MissingServerEnvError
    )
  })

  it("throws a named MissingServerEnvError when the value is blank or whitespace", () => {
    expect(() =>
      requiredServerEnv("CLERK_WEBHOOK_SECRET", { CLERK_WEBHOOK_SECRET: "" })
    ).toThrow(MissingServerEnvError)
    expect(() =>
      requiredServerEnv("CLERK_WEBHOOK_SECRET", {
        CLERK_WEBHOOK_SECRET: "   "
      })
    ).toThrow(MissingServerEnvError)
  })

  it("trims surrounding whitespace from a present value", () => {
    expect(
      requiredServerEnv("DATABASE_URL", {
        DATABASE_URL: "  postgres://example.invalid/db  "
      })
    ).toBe("postgres://example.invalid/db")
  })

  it("exposes a stable non-secret error identity that names the key", () => {
    try {
      requiredServerEnv("CLERK_WEBHOOK_SECRET", {})
      throw new Error("expected MissingServerEnvError")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingServerEnvError)
      const named = error as MissingServerEnvError
      expect(named.name).toBe("MissingServerEnvError")
      expect(named.key).toBe("CLERK_WEBHOOK_SECRET")
      expect(named.message).toBe("CLERK_WEBHOOK_SECRET is required")
    }
  })

  it("does not include a supplied secret value in the thrown error", () => {
    const secret = "whsec_should_not_appear"
    try {
      requiredServerEnv("CLERK_WEBHOOK_SECRET", {
        CLERK_WEBHOOK_SECRET: "   "
      })
      throw new Error("expected MissingServerEnvError")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingServerEnvError)
      expect(String(error)).not.toContain(secret)
      expect((error as Error).message).not.toContain(secret)
    }
  })

  it("does not mutate process.env when a test env object is provided", () => {
    delete process.env.DATABASE_URL
    expect(
      requiredServerEnv("DATABASE_URL", {
        DATABASE_URL: "postgres://isolated.invalid/db"
      })
    ).toBe("postgres://isolated.invalid/db")
    expect(process.env.DATABASE_URL).toBeUndefined()
  })

  it("reads process.env when no env object is provided", () => {
    process.env.DATABASE_URL = "postgres://from-process.invalid/db"
    expect(requiredServerEnv("DATABASE_URL")).toBe(
      "postgres://from-process.invalid/db"
    )
  })

  it("does not log env values", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const secret = "postgres://logged.invalid/db"
    requiredServerEnv("DATABASE_URL", { DATABASE_URL: secret })
    const printed = [...log.mock.calls, ...warn.mock.calls, ...error.mock.calls]
      .flat()
      .map(String)
      .join(" ")
    expect(printed).not.toContain(secret)
    log.mockRestore()
    warn.mockRestore()
    error.mockRestore()
  })
})
