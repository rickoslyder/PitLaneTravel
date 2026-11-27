import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import rateLimit from "./rate-limit"

const INTERVAL = 1000
const EXCEEDED = "Rate limit exceeded"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createLimiter(uniqueTokenPerInterval = 500) {
    return rateLimit({ interval: INTERVAL, uniqueTokenPerInterval })
  }

  it("allows exactly N calls per window, then rejects", async () => {
    const limiter = createLimiter()

    for (let i = 0; i < 3; i++) {
      await expect(limiter.check(3, "a")).resolves.toBeUndefined()
    }
    await expect(limiter.check(3, "a")).rejects.toThrow(EXCEEDED)
    await expect(limiter.check(3, "a")).rejects.toThrow(EXCEEDED)
  })

  it("rejects every call when the limit is 0", async () => {
    const limiter = createLimiter()

    await expect(limiter.check(0, "a")).rejects.toThrow(EXCEEDED)
  })

  it("tracks tokens independently", async () => {
    const limiter = createLimiter()

    await limiter.check(1, "a")
    await expect(limiter.check(1, "a")).rejects.toThrow(EXCEEDED)
    await expect(limiter.check(1, "b")).resolves.toBeUndefined()
    await expect(limiter.check(1, "b")).rejects.toThrow(EXCEEDED)
  })

  it("starts fresh once the interval has passed", async () => {
    const limiter = createLimiter()

    await limiter.check(2, "a")
    await limiter.check(2, "a")

    vi.advanceTimersByTime(INTERVAL - 1)
    await expect(limiter.check(2, "a")).rejects.toThrow(EXCEEDED)

    vi.advanceTimersByTime(1)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
    await expect(limiter.check(2, "a")).rejects.toThrow(EXCEEDED)
  })

  it("does not extend the window on allowed or rejected calls", async () => {
    const limiter = createLimiter()

    await limiter.check(2, "a")
    vi.advanceTimersByTime(600)
    await limiter.check(2, "a")
    vi.advanceTimersByTime(300)
    await expect(limiter.check(2, "a")).rejects.toThrow(EXCEEDED)

    // INTERVAL after the first call, only 100ms after the latest one.
    vi.advanceTimersByTime(100)
    await expect(limiter.check(2, "a")).resolves.toBeUndefined()
  })

  it("starts each token's window at its own first call", async () => {
    const limiter = createLimiter()

    await limiter.check(1, "a")
    vi.advanceTimersByTime(500)
    await limiter.check(1, "b")
    vi.advanceTimersByTime(500)

    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
    await expect(limiter.check(1, "b")).rejects.toThrow(EXCEEDED)
  })

  it("caps the number of tracked tokens at uniqueTokenPerInterval", async () => {
    const limiter = createLimiter(2)

    await limiter.check(1, "a")
    await limiter.check(1, "b")
    await limiter.check(1, "c") // evicts "a", the least recently used

    await expect(limiter.check(1, "c")).rejects.toThrow(EXCEEDED)
    await expect(limiter.check(1, "b")).rejects.toThrow(EXCEEDED)
    await expect(limiter.check(1, "a")).resolves.toBeUndefined()
  })
})
