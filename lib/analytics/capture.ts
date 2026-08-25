import {
  capturePostHog as defaultCapturePostHog,
  sendGTMEvent as defaultSendGTMEvent
} from "@/lib/analytics-events"
import { isAnalyticsGranted } from "@/lib/analytics-consent"
import {
  ANALYTICS_SCHEMA_VERSION,
  sanitizeAnalyticsEvent,
  type AnalyticsEventInput,
  type SanitizeSuccess
} from "./events"

export type { AnalyticsEventInput }

export type CaptureResult =
  | { status: "emitted" }
  | { status: "consent-denied" }
  | { status: "invalid-event" }
  | { status: "vendor-failure" }

export type TypedCaptureVendors = {
  isGranted: () => boolean
  sendGTMEvent: (event: Record<string, unknown>) => boolean
  capturePostHog: (
    event: string,
    properties?: Record<string, unknown>
  ) => boolean
}

export type TypedCapture = (input: AnalyticsEventInput) => CaptureResult

type VendorTranslation = {
  posthogEvent: string
  posthogProperties: Record<string, unknown>
  gtmEvent: Record<string, unknown>
}

function toGtmEventName(event: SanitizeSuccess["event"]): string {
  if (event === "page viewed") {
    return "page_view"
  }
  return event.replace(/ /g, "_").toLowerCase()
}

// PostHog custom capture is (event name, properties); docs recommend stable
// object+verb names. $pageview is the PostHog pageview event name.
// https://posthog.com/docs/product-analytics/capture-events
// https://posthog.com/docs/references/posthog-js#capture
function translate(sanitized: SanitizeSuccess): VendorTranslation {
  const schema_version = ANALYTICS_SCHEMA_VERSION
  if (sanitized.event === "page viewed") {
    const properties = {
      route: sanitized.properties.route,
      schema_version
    }
    return {
      posthogEvent: "$pageview",
      posthogProperties: properties,
      gtmEvent: {
        event: "page_view",
        ...properties
      }
    }
  }

  return {
    posthogEvent: sanitized.event,
    posthogProperties: { schema_version },
    gtmEvent: {
      event: toGtmEventName(sanitized.event),
      schema_version
    }
  }
}

function dispatch(
  deps: TypedCaptureVendors,
  translation: VendorTranslation
): CaptureResult {
  let posthogOk = false
  let gtmOk = false
  try {
    posthogOk = deps.capturePostHog(
      translation.posthogEvent,
      translation.posthogProperties
    )
  } catch {
    posthogOk = false
  }
  try {
    gtmOk = deps.sendGTMEvent(translation.gtmEvent)
  } catch {
    gtmOk = false
  }
  if (posthogOk && gtmOk) {
    return { status: "emitted" }
  }
  return { status: "vendor-failure" }
}

function captureUnknown(
  deps: TypedCaptureVendors,
  input: unknown
): CaptureResult {
  const sanitized = sanitizeAnalyticsEvent(input)
  if (!sanitized.ok) {
    return { status: "invalid-event" }
  }
  if (!deps.isGranted()) {
    return { status: "consent-denied" }
  }
  return dispatch(deps, translate(sanitized))
}

export function createTypedCapture(deps: TypedCaptureVendors): TypedCapture {
  return function captureAnalyticsEvent(
    input: AnalyticsEventInput
  ): CaptureResult {
    return captureUnknown(deps, input)
  }
}

const defaultCapture = createTypedCapture({
  isGranted: isAnalyticsGranted,
  sendGTMEvent: defaultSendGTMEvent,
  capturePostHog: defaultCapturePostHog
})

export function captureAnalyticsEvent(
  input: AnalyticsEventInput
): CaptureResult {
  return defaultCapture(input)
}
