import { captureAnalyticsEvent, createTypedCapture } from "./capture"
import type { AnalyticsEventInput } from "./events"

// Compile-time proof that the public capture API is a finite discriminated
// union. These @ts-expect-error lines must remain unused-directive-free:
// invalid names and fields have to be type errors, not runtime-only rejects.

const validPage: AnalyticsEventInput = {
  event: "page viewed",
  pathname: "/"
}
const validHeroCalendar: AnalyticsEventInput = {
  event: "hero calendar CTA clicked"
}
const validHeroCompare: AnalyticsEventInput = {
  event: "hero compare CTA clicked"
}
const validRace: AnalyticsEventInput = { event: "race viewed" }
const validTripCreated: AnalyticsEventInput = { event: "trip created" }
const validTripViewed: AnalyticsEventInput = { event: "trip viewed" }
const validOffer: AnalyticsEventInput = { event: "flight offer selected" }
const validCheckout: AnalyticsEventInput = { event: "flight checkout begun" }
const validPayment: AnalyticsEventInput = {
  event: "flight payment info submitted"
}
const validPurchase: AnalyticsEventInput = {
  event: "flight purchase completed"
}

export const VALID_TYPED_CAPTURE_INPUTS: AnalyticsEventInput[] = [
  validPage,
  validHeroCalendar,
  validHeroCompare,
  validRace,
  validTripCreated,
  validTripViewed,
  validOffer,
  validCheckout,
  validPayment,
  validPurchase
]

export function exerciseTypedCaptureApi(): void {
  for (const input of VALID_TYPED_CAPTURE_INPUTS) {
    captureAnalyticsEvent(input)
  }

  const capture = createTypedCapture({
    isGranted: () => false,
    sendGTMEvent: () => false,
    capturePostHog: () => false
  })
  capture({ event: "trip created" })

  // @ts-expect-error invalid event name is not assignable
  captureAnalyticsEvent({ event: "purchase completed" })

  // @ts-expect-error unknown free-form property is not assignable
  captureAnalyticsEvent({ event: "trip created", email: "a@b.c" })

  // @ts-expect-error notes are not an allowlisted field
  captureAnalyticsEvent({ event: "race viewed", notes: "window seat" })

  // @ts-expect-error schema_version is not caller-overridable
  captureAnalyticsEvent({ event: "trip viewed", schema_version: 2 })

  // @ts-expect-error page viewed requires pathname
  captureAnalyticsEvent({ event: "page viewed" })

  // @ts-expect-error raw IDs are not allowlisted
  captureAnalyticsEvent({ event: "flight offer selected", offerId: "off_123" })

  // @ts-expect-error passenger data is not an allowlisted field
  captureAnalyticsEvent({ event: "flight payment info submitted", passenger: { email: "a@b.c" } })
}
