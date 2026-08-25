import { describe, expect, expectTypeOf, it } from "vitest"
import {
  captureAnalyticsEvent,
  createTypedCapture,
  type CaptureResult
} from "./capture"
import {
  DOMAIN_EVENT_NAMES,
  type AnalyticsEventInput,
  type DomainEventName
} from "./events"
import { VALID_TYPED_CAPTURE_INPUTS } from "./capture-compile-contract"

describe("PLT-017 compile-time capture API", () => {
  it("exports a discriminated AnalyticsEventInput union covering every domain event", () => {
    expect(DOMAIN_EVENT_NAMES).toEqual([
      "page viewed",
      "hero calendar CTA clicked",
      "hero compare CTA clicked",
      "race viewed",
      "trip created",
      "trip viewed",
      "flight offer selected",
      "flight checkout begun",
      "flight payment info submitted",
      "flight purchase completed"
    ])

    expectTypeOf<AnalyticsEventInput["event"]>().toEqualTypeOf<DomainEventName>()
    expectTypeOf<AnalyticsEventInput>().toMatchTypeOf<
      | { event: "page viewed"; pathname: string }
      | { event: Exclude<DomainEventName, "page viewed"> }
    >()
    expectTypeOf(VALID_TYPED_CAPTURE_INPUTS).toEqualTypeOf<
      AnalyticsEventInput[]
    >()
  })

  it("types the public capture functions to AnalyticsEventInput, not unknown", () => {
    expectTypeOf(captureAnalyticsEvent)
      .parameter(0)
      .toEqualTypeOf<AnalyticsEventInput>()
    expectTypeOf(captureAnalyticsEvent).returns.toEqualTypeOf<CaptureResult>()

    const capture = createTypedCapture({
      isGranted: () => true,
      sendGTMEvent: () => true,
      capturePostHog: () => true
    })
    expectTypeOf(capture).parameter(0).toEqualTypeOf<AnalyticsEventInput>()
    expectTypeOf(capture).returns.toEqualTypeOf<CaptureResult>()
  })
})
