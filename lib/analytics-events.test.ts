import { describe, expect, it, vi } from "vitest"
import { createAnalyticsEventGuards } from "./analytics-events"

describe("analytics event wrapper guards", () => {
  it("does not call GTM or PostHog and does not queue when consent is denied", () => {
    const sendGTMEvent = vi.fn()
    const capture = vi.fn()
    const identify = vi.fn()
    const reset = vi.fn()
    let granted = false
    const guards = createAnalyticsEventGuards({
      isGranted: () => granted,
      sendGTMEvent,
      capture,
      identify,
      reset
    })

    expect(guards.sendGTMEvent({ event: "page_view" })).toBe(false)
    expect(guards.capturePostHog("clicked_get_started")).toBe(false)
    expect(guards.identifyPostHog("user_123")).toBe(false)
    expect(guards.resetPostHog()).toBe(false)

    granted = true
    expect(sendGTMEvent).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalled()
    expect(identify).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it("does not call vendors or queue when consent is undecided", () => {
    const sendGTMEvent = vi.fn()
    const capture = vi.fn()
    const identify = vi.fn()
    const reset = vi.fn()
    const guards = createAnalyticsEventGuards({
      isGranted: () => false,
      sendGTMEvent,
      capture,
      identify,
      reset
    })

    guards.sendGTMEvent({ event: "view_item" })
    guards.capturePostHog("$pageview", { path: "/" })
    guards.identifyPostHog("user_abc")
    guards.resetPostHog()

    expect(sendGTMEvent).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalled()
    expect(identify).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it("calls each granted vendor adapter exactly once", () => {
    const sendGTMEvent = vi.fn()
    const capture = vi.fn()
    const identify = vi.fn()
    const reset = vi.fn()
    const guards = createAnalyticsEventGuards({
      isGranted: () => true,
      sendGTMEvent,
      capture,
      identify,
      reset
    })

    const gtmEvent = { event: "page_view" }
    expect(guards.sendGTMEvent(gtmEvent)).toBe(true)
    expect(guards.capturePostHog("$pageview", { path: "/races" })).toBe(true)
    expect(guards.identifyPostHog("user_123")).toBe(true)
    expect(guards.resetPostHog()).toBe(true)

    expect(sendGTMEvent).toHaveBeenCalledTimes(1)
    expect(sendGTMEvent).toHaveBeenCalledWith(gtmEvent)
    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith("$pageview", { path: "/races" })
    expect(identify).toHaveBeenCalledTimes(1)
    expect(identify).toHaveBeenCalledWith("user_123")
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
