import { describe, expect, it, vi } from "vitest"
import { createTypedCapture } from "./capture"

function recordingCapture(granted: boolean) {
  const sendGTMEvent = vi.fn(() => true)
  const capturePostHog = vi.fn(() => true)
  const capture = createTypedCapture({
    isGranted: () => granted,
    sendGTMEvent,
    capturePostHog
  })
  return { capture, sendGTMEvent, capturePostHog }
}

describe("typed analytics capture", () => {
  it("does not emit or queue when consent is denied or undecided", () => {
    const denied = recordingCapture(false)
    const first = denied.capture({
      event: "page viewed",
      pathname: "/"
    })
    expect(first).toEqual({ status: "consent-denied" })
    expect(denied.sendGTMEvent).not.toHaveBeenCalled()
    expect(denied.capturePostHog).not.toHaveBeenCalled()

    const later = recordingCapture(true)
    expect(later.sendGTMEvent).not.toHaveBeenCalled()
    expect(later.capturePostHog).not.toHaveBeenCalled()
  })

  it("dispatches granted page viewed and hero events to exact PostHog and GTM translations once each", () => {
    const { capture, sendGTMEvent, capturePostHog } = recordingCapture(true)

    expect(
      capture({ event: "page viewed", pathname: "/races/monaco?utm=1#hash" })
    ).toEqual({ status: "emitted" })
    expect(
      capture({
        event: "hero calendar CTA clicked",
        email: "nope@example.com"
      } as unknown as Parameters<typeof capture>[0])
    ).toEqual({ status: "emitted" })

    expect(capturePostHog).toHaveBeenCalledTimes(2)
    expect(capturePostHog).toHaveBeenNthCalledWith(1, "$pageview", {
      route: "/races/:slug",
      schema_version: 1
    })
    expect(capturePostHog).toHaveBeenNthCalledWith(2, "hero calendar CTA clicked", {
      schema_version: 1
    })

    expect(sendGTMEvent).toHaveBeenCalledTimes(2)
    expect(sendGTMEvent).toHaveBeenNthCalledWith(1, {
      event: "page_view",
      route: "/races/:slug",
      schema_version: 1
    })
    expect(sendGTMEvent).toHaveBeenNthCalledWith(2, {
      event: "hero_calendar_cta_clicked",
      schema_version: 1
    })

    const serialized = JSON.stringify([
      capturePostHog.mock.calls,
      sendGTMEvent.mock.calls
    ])
    expect(serialized).not.toContain("monaco")
    expect(serialized).not.toContain("utm=1")
    expect(serialized).not.toContain("nope@example.com")
    expect(serialized).not.toContain("email")
  })

  it("rejects unknown events without vendor calls or leaked payloads", () => {
    const { capture, sendGTMEvent, capturePostHog } = recordingCapture(true)
    const result = capture({
      event: "$pageview",
      pathname: "/trips/secret-id",
      email: "leak@example.com"
    } as unknown as Parameters<typeof capture>[0])

    expect(result).toEqual({ status: "invalid-event" })
    expect(sendGTMEvent).not.toHaveBeenCalled()
    expect(capturePostHog).not.toHaveBeenCalled()
    expect(JSON.stringify(result)).not.toContain("leak@example.com")
    expect(JSON.stringify(result)).not.toContain("secret-id")
    expect(JSON.stringify(result)).not.toContain("$pageview")
  })

  it("returns vendor-failure when either vendor throws or returns false and does not retry", () => {
    const sendGTMEvent = vi.fn(() => true)
    const capturePostHog = vi.fn(() => {
      throw new Error("posthog down: leak@example.com")
    })
    const capture = createTypedCapture({
      isGranted: () => true,
      sendGTMEvent,
      capturePostHog
    })

    const thrown = capture({ event: "page viewed", pathname: "/" })
    expect(thrown).toEqual({ status: "vendor-failure" })
    expect(capturePostHog).toHaveBeenCalledTimes(1)
    expect(sendGTMEvent).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(thrown)).not.toContain("leak@example.com")
    expect(JSON.stringify(thrown)).not.toContain("posthog down")

    const gtmFalse = createTypedCapture({
      isGranted: () => true,
      sendGTMEvent: vi.fn(() => false),
      capturePostHog: vi.fn(() => true)
    })
    expect(gtmFalse({ event: "hero calendar CTA clicked" })).toEqual({
      status: "vendor-failure"
    })

    const bothThrow = createTypedCapture({
      isGranted: () => true,
      sendGTMEvent: vi.fn(() => {
        throw new Error("gtm: passenger@example.com")
      }),
      capturePostHog: vi.fn(() => {
        throw new Error("ph")
      })
    })
    const complete = bothThrow({ event: "page viewed", pathname: "/races" })
    expect(complete).toEqual({ status: "vendor-failure" })
    expect(JSON.stringify(complete)).not.toContain("passenger@example.com")
  })

  it("translates every migrated product event to exact PostHog and GTM payloads", () => {
    const { capture, sendGTMEvent, capturePostHog } = recordingCapture(true)
    const cases = [
      {
        input: { event: "hero calendar CTA clicked" as const },
        posthogEvent: "hero calendar CTA clicked",
        gtmEvent: "hero_calendar_cta_clicked"
      },
      {
        input: { event: "hero compare CTA clicked" as const },
        posthogEvent: "hero compare CTA clicked",
        gtmEvent: "hero_compare_cta_clicked"
      },
      {
        input: { event: "race viewed" as const },
        posthogEvent: "race viewed",
        gtmEvent: "race_viewed"
      },
      {
        input: { event: "trip created" as const },
        posthogEvent: "trip created",
        gtmEvent: "trip_created"
      },
      {
        input: { event: "trip viewed" as const },
        posthogEvent: "trip viewed",
        gtmEvent: "trip_viewed"
      },
      {
        input: { event: "flight offer selected" as const },
        posthogEvent: "flight offer selected",
        gtmEvent: "flight_offer_selected"
      },
      {
        input: { event: "flight checkout begun" as const },
        posthogEvent: "flight checkout begun",
        gtmEvent: "flight_checkout_begun"
      },
      {
        input: { event: "flight payment info submitted" as const },
        posthogEvent: "flight payment info submitted",
        gtmEvent: "flight_payment_info_submitted"
      },
      {
        input: { event: "flight purchase completed" as const },
        posthogEvent: "flight purchase completed",
        gtmEvent: "flight_purchase_completed"
      }
    ]

    for (const [index, testCase] of cases.entries()) {
      expect(capture(testCase.input)).toEqual({ status: "emitted" })
      expect(capturePostHog).toHaveBeenNthCalledWith(
        index + 1,
        testCase.posthogEvent,
        { schema_version: 1 }
      )
      expect(sendGTMEvent).toHaveBeenNthCalledWith(index + 1, {
        event: testCase.gtmEvent,
        schema_version: 1
      })
    }
  })
})
