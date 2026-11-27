import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import rateLimit from "@/lib/rate-limit"

const INTERVAL = 60_000

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows exactly limit calls in a window, then rejects", async () => {
    const limiter = rateLimit()

    await expect(limiter.check(3, "a")).resolves.toBeUndefined()
    await expect(limiter.check(3, "a")).resolves.toBeUndefined()
    await expect(limiter.check(3, "a")).resolves.toBeUndefined()
    await expect(limiter.check(3, "a")).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check(3, "a")).rejects.toThrow("Rate limit exceeded")
  })

  it("tracks each token independently", async () => {
    const limiter = rateLimit({ interval: INTERVAL })

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")

    await expect(limiter.check(1, "b")).resolves.toBeUndefined()
    await expect(limiter.check(1, "b")).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")
  })

  it("starts a fresh window once the interval has passed", async () => {
    const limiter = rateLimit({ interval: INTERVAL })

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(INTERVAL - 1)
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1)
    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "a")).rejects.toThrow("Rate limit exceeded")
  })

  it("does not extend the window for calls made during it", async () => {
    const limiter = rateLimit({ interval: INTERVAL })

    await expect(limiter.check(2, "a")).resolves.toBeUndefined()

    vi.advanceTimersByTime(INTERVAL / 2)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
    await expect(limiter.check(2, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(INTERVAL / 2 - 1)
    await expect(limiter.check(2, "a")).rejects.toThrow("Rate limit exceeded")

    vi.advanceTimersByTime(1)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
  })

  it("tracks no more than uniqueTokenPerInterval tokens", async () => {
    const limiter = rateLimit({ interval: INTERVAL, uniqueTokenPerInterval: 2 })

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "b")).resolves.toBeUndefined()
    await expect(limiter.check(1, "c")).resolves.toBeUndefined()

    await expect(limiter.check(1, "b")).rejects.toThrow("Rate limit exceeded")
    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
  })
})
