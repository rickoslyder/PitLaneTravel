import { describe, expect, it, vi } from "vitest"
import { createAnalyticsEventGuards } from "./analytics-events"

function createVendors(options?: {
  granted?: boolean
  resetImpl?: () => void
  optInImpl?: (opts: { captureEventName: false }) => void
}) {
  const sendGTMEvent = vi.fn()
  const capture = vi.fn()
  const identify = vi.fn()
  const reset = vi.fn(options?.resetImpl)
  const optInCapturing = vi.fn(options?.optInImpl)
  const vendors = {
    isGranted: () => options?.granted ?? false,
    sendGTMEvent,
    capture,
    identify,
    reset,
    optInCapturing
  }
  return {
    vendors,
    sendGTMEvent,
    capture,
    identify,
    reset,
    optInCapturing,
    guards: createAnalyticsEventGuards(vendors)
  }
}

describe("analytics event wrapper guards", () => {
  it("does not call GTM or PostHog and does not queue when consent is denied", () => {
    const sendGTMEvent = vi.fn()
    const capture = vi.fn()
    const identify = vi.fn()
    const reset = vi.fn()
    const optInCapturing = vi.fn()
    let granted = false
    const guards = createAnalyticsEventGuards({
      isGranted: () => granted,
      sendGTMEvent,
      capture,
      identify,
      reset,
      optInCapturing
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
    expect(optInCapturing).not.toHaveBeenCalled()
  })

  it("does not call vendors or queue when consent is undecided", () => {
    const { guards, sendGTMEvent, capture, identify, reset, optInCapturing } =
      createVendors({ granted: false })

    guards.sendGTMEvent({ event: "view_item" })
    guards.capturePostHog("$pageview", { path: "/" })
    guards.identifyPostHog("user_abc")
    guards.resetPostHog()

    expect(sendGTMEvent).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalled()
    expect(identify).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(optInCapturing).not.toHaveBeenCalled()
  })

  it("calls each granted vendor adapter exactly once", () => {
    const { guards, sendGTMEvent, capture, identify, reset, optInCapturing } =
      createVendors({ granted: true })

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
    expect(optInCapturing).toHaveBeenCalledTimes(1)
    expect(optInCapturing).toHaveBeenCalledWith({ captureEventName: false })
  })
})

describe("consent-preserving PostHog reset", () => {
  it("calls reset then public opt_in_capturing with captureEventName false", () => {
    const calls: string[] = []
    const { guards, reset, optInCapturing, capture } = createVendors({
      granted: true,
      resetImpl: () => {
        calls.push("reset")
      },
      optInImpl: options => {
        calls.push("optInCapturing")
        expect(options).toEqual({ captureEventName: false })
      }
    })

    expect(guards.resetPostHog()).toBe(true)
    expect(calls).toEqual(["reset", "optInCapturing"])
    expect(reset).toHaveBeenCalledTimes(1)
    expect(optInCapturing).toHaveBeenCalledTimes(1)
    expect(optInCapturing).toHaveBeenCalledWith({ captureEventName: false })
    expect(capture).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalledWith("$opt_in", expect.anything())
  })

  it("does not request a second $opt_in capture when restoring SDK consent", () => {
    const { guards, capture, optInCapturing } = createVendors({ granted: true })

    expect(guards.resetPostHog()).toBe(true)
    expect(optInCapturing).toHaveBeenCalledWith({ captureEventName: false })
    expect(capture).not.toHaveBeenCalled()
    expect(capture.mock.calls.some(call => call[0] === "$opt_in")).toBe(false)
  })

  it("does not reset or restore SDK consent when denied or undecided", () => {
    for (const granted of [false, false]) {
      const { guards, reset, optInCapturing, capture, identify } = createVendors({
        granted
      })
      expect(guards.resetPostHog()).toBe(false)
      expect(reset).not.toHaveBeenCalled()
      expect(optInCapturing).not.toHaveBeenCalled()
      expect(capture).not.toHaveBeenCalled()
      expect(identify).not.toHaveBeenCalled()
    }
  })

  it("does not restore SDK consent when reset throws and returns failure", () => {
    const { guards, reset, optInCapturing, capture } = createVendors({
      granted: true,
      resetImpl: () => {
        throw new Error("reset failed")
      }
    })

    expect(guards.resetPostHog()).toBe(false)
    expect(reset).toHaveBeenCalledTimes(1)
    expect(optInCapturing).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalled()
  })

  it("returns failure when reset succeeds but consent restore throws", () => {
    const { guards, reset, optInCapturing } = createVendors({
      granted: true,
      optInImpl: () => {
        throw new Error("opt in failed")
      }
    })

    expect(guards.resetPostHog()).toBe(false)
    expect(reset).toHaveBeenCalledTimes(1)
    expect(optInCapturing).toHaveBeenCalledTimes(1)
    expect(optInCapturing).toHaveBeenCalledWith({ captureEventName: false })
  })
})
