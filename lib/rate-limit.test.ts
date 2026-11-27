import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import rateLimit from "./rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows exactly the configured limit then rejects", async () => {
    const limiter = rateLimit({ interval: 1000 })

    for (let call = 1; call <= 3; call += 1) {
      await expect(limiter.check(3, "a")).resolves.toBeUndefined()
    }

    await expect(limiter.check(3, "a")).rejects.toThrow("Rate limit exceeded")
  })

  it("tracks separate tokens independently", async () => {
    const limiter = rateLimit({ interval: 1000 })

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check(1, "b")).resolves.toBeUndefined()
  })

  it("starts a fresh window after the interval has elapsed", async () => {
    const limiter = rateLimit({ interval: 1000 })

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    vi.advanceTimersByTime(999)
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1)
    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
  })

  it("does not extend the window when calls happen during it", async () => {
    const limiter = rateLimit({ interval: 1000 })

    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
    vi.advanceTimersByTime(600)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
    await expect(limiter.check(2, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(399)
    await expect(limiter.check(2, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
  })
})
